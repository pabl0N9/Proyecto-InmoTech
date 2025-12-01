/**
 * @fileoverview Configuración centralizada de la API y cliente HTTP reutilizable
 * @version 4.2.0 - Corregido error "limit is not defined" y endpoints mal escritos
 */

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

const ACCESS_TOKEN_KEY = 'inmotech_access_token';
const REFRESH_TOKEN_KEY = 'inmotech_refresh_token';

class ApiClient {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.maxRetries = 1;
    this.pendingRequests = new Map();
    this.concurrentLimit = 1;
    this.activeRequests = 0;
    this.waitQueue = [];
    this.minIntervalMs = 400;
    this.nextRequestTime = 0;
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  getAccessToken() {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    console.log('📖 Leyendo Access Token:', token ? '✅ Existe' : '❌ No existe');
    return token;
  }

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken, refreshToken) {
    console.log('💾 Guardando tokens...');
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      console.log('   ✅ Access Token guardado');
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      console.log('   ✅ Refresh Token guardado');
    }
  }

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log('🗑️ Tokens eliminados del localStorage');
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    try {
      console.log('🔄 Intentando refrescar token...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('No se pudo refrescar el token');
      }

      const result = await response.json();
      console.log('📦 Respuesta de refresh:', result.success);
      
      if (result.success && result.data) {
        const { accessToken, refreshToken: newRefreshToken } = result.data;
        
        if (accessToken) {
          this.setTokens(accessToken, newRefreshToken);
          console.log('✅ Token refrescado y guardado exitosamente');
          return accessToken;
        }
      }

      throw new Error('Respuesta de refresh inválida');
      
    } catch (error) {
      console.error('❌ Error al refrescar token:', error.message);
      this.clearTokens();
      throw error;
    }
  }

  async handleTokenRefresh(endpoint, options, retryCount) {
    if (retryCount >= this.maxRetries) {
      console.error('❌ Máximo de reintentos alcanzado');
      this.clearTokens();
      throw new Error('No se pudo completar la petición después de refrescar el token');
    }

    if (this.isRefreshing) {
      console.log('⏳ Esperando refresh en progreso...');
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        console.log('♻️ Reintentando petición después de refresh...');
        return this.request(endpoint, options, retryCount + 1);
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshAccessToken();
      this.processQueue(null, newToken);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('♻️ Reintentando petición original con nuevo token...');
      
      const result = await this.request(endpoint, options, retryCount + 1);
      
      this.isRefreshing = false;
      return result;
      
    } catch (refreshError) {
      console.error('❌ Error en handleTokenRefresh:', refreshError.message);
      this.processQueue(refreshError, null);
      this.isRefreshing = false;
      this.clearTokens();
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async acquireSlot() {
    while (this.activeRequests >= this.concurrentLimit) {
      await new Promise((resolve) => {
        this.waitQueue.push(resolve);
      });
    }

    const now = Date.now();
    if (now < this.nextRequestTime) {
      await this.delay(this.nextRequestTime - now);
    }

    this.nextRequestTime = Date.now() + this.minIntervalMs;
    this.activeRequests += 1;
  }

  releaseSlot() {
    if (this.activeRequests > 0) {
      this.activeRequests -= 1;
    }

    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift();
      resolve();
    }
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const { skipAuth, ...restOptions } = options;
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const config = {
      ...restOptions,
      headers: {
        ...API_CONFIG.HEADERS,
        ...restOptions.headers,
      },
    };

    if (restOptions.params && typeof restOptions.params === 'object' && Object.keys(restOptions.params).length > 0) {
      const urlObj = new URL(url);
      Object.keys(restOptions.params).forEach((key) => {
        const value = restOptions.params[key];
        if (value !== null && value !== undefined && value !== '') {
          urlObj.searchParams.append(key, value.toString());
        }
      });
      url = urlObj.toString();
    }

    const accessToken = this.getAccessToken();

    if (accessToken && !skipAuth) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('Token incluido en peticion:', accessToken.substring(0, 30) + '...');
    } else {
      console.log('No hay token para incluir en la peticion');
    }

    if (config.params) {
      delete config.params;
    }

    const paramsKey = restOptions.params ? JSON.stringify(restOptions.params) : '';
    const bodyKey = config.body || '';
    const requestKey = `${restOptions.method || 'GET'}:${url}:${bodyKey}:${paramsKey}`;

    if (this.pendingRequests.has(requestKey)) {
      console.log('Peticion duplicada detectada, esperando resultado:', endpoint);
      return this.pendingRequests.get(requestKey);
    }

    const execution = (async () => {
      await this.acquireSlot();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        console.log(`${restOptions.method || 'GET'} ${url}`);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log(`Respuesta: ${response.status}`);

        if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
          console.warn('Token expirado (401), intentando refrescar...');
          return await this.handleTokenRefresh(endpoint, restOptions, retryCount);
        }

        if (response.status === 429) {
          console.warn('429 detectado, aplicando espera controlada...', retryCount);
          if (retryCount < API_CONFIG.RETRY_ATTEMPTS + 2) {
            const waitTime = API_CONFIG.RETRY_DELAY * (retryCount + 1);
            await this.delay(waitTime);
            return this.request(endpoint, options, retryCount + 1);
          }
          throw new Error('Demasiadas peticiones. Por favor, espera un momento e intenta nuevamente.');
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: response.statusText,
          }));
          const error = new Error(errorData.message || `Error ${response.status}`);
          error.status = response.status;
          error.data = errorData;
          throw error;
        }

        const data = await response.json();

        if (data.success && data.data && data.data.accessToken) {
          console.log('Tokens detectados en respuesta, guardando...');
          this.setTokens(data.data.accessToken, data.data.refreshToken);
        }

        return data;
      } catch (error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('La peticion tardo demasiado tiempo.');
          timeoutError.code = 'TIMEOUT';

          if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
            console.warn(`Timeout. Reintentando... (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
            await this.delay(API_CONFIG.RETRY_DELAY);
            return this.request(endpoint, options, retryCount + 1);
          }

          throw timeoutError;
        }

        if (error.message === 'Failed to fetch') {
          const networkError = new Error('No se pudo conectar con el servidor.');
          networkError.code = 'NETWORK_ERROR';
          throw networkError;
        }

        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
      } finally {
        this.releaseSlot();
      }
    })();

    this.pendingRequests.set(requestKey, execution);
    try {
      return await execution;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  async get(endpoint, params = {}) {
    // ✅ PARCHE TEMPORAL: Asegurar que limit esté siempre definido
    const safeParams = {
      page: 1,
      limit: 10,
      ...params
    };
    
    // ✅ Limpiar parámetros undefined
    Object.keys(safeParams).forEach(key => {
      if (safeParams[key] === undefined) {
        delete safeParams[key];
      }
    });
    
    console.log('🔍 Parámetros seguros enviados a GET:', safeParams);
    
    return this.request(endpoint, { 
      method: 'GET', 
      params: safeParams 
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export { API_CONFIG };
