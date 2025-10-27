/**
 * @fileoverview Configuración centralizada de la API y cliente HTTP reutilizable
 * @version 4.0.0 - Corregido loop infinito de refresh
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
    this.maxRetries = 1; // Máximo de reintentos después de refresh
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
    // Si ya se alcanzó el máximo de reintentos, fallar
    if (retryCount >= this.maxRetries) {
      console.error('❌ Máximo de reintentos alcanzado');
      this.clearTokens();
      throw new Error('No se pudo completar la petición después de refrescar el token');
    }

    // Si ya hay un refresh en progreso, esperar
    if (this.isRefreshing) {
      console.log('⏳ Esperando refresh en progreso...');
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        // Después del refresh, reintentar con el nuevo token
        console.log('♻️ Reintentando petición después de refresh...');
        return this.request(endpoint, options, retryCount + 1);
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshAccessToken();
      this.processQueue(null, newToken);
      
      // IMPORTANTE: Esperar un poco para asegurar que el token esté guardado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('♻️ Reintentando petición original con nuevo token...');
      
      // Reintentar la petición original
      const result = await this.request(endpoint, options, retryCount + 1);
      
      this.isRefreshing = false;
      return result;
      
    } catch (refreshError) {
      console.error('❌ Error en handleTokenRefresh:', refreshError.message);
      this.processQueue(refreshError, null);
      this.isRefreshing = false;
      this.clearTokens();
      
      // Redirigir al login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request(endpoint, options = {}, retryCount = 0) {
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Manejar parámetros de consulta
    if (options.params && Object.keys(options.params).length > 0) {
      const urlObj = new URL(url);
      Object.keys(options.params).forEach(key => {
        if (options.params[key] !== null && options.params[key] !== undefined) {
          urlObj.searchParams.append(key, options.params[key]);
        }
      });
      url = urlObj.toString();
    }

    // ✅ CRÍTICO: Obtener el token AHORA, no al inicio
    const accessToken = this.getAccessToken();
    const config = {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
    };
    
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log('🔑 Token incluido en petición:', accessToken.substring(0, 30) + '...');
    } else {
      console.log('⚠️ No hay token para incluir en la petición');
    }

    if (config.params) {
      delete config.params;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      console.log(`📤 ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`📥 Respuesta: ${response.status}`);

      // Manejar 401
      if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        console.warn('🔄 Token expirado (401), intentando refrescar...');
        return await this.handleTokenRefresh(endpoint, options, retryCount);
      }

      // Manejar 429
      if (response.status === 429) {
        throw new Error('Demasiadas peticiones. Por favor, espera un momento e intenta nuevamente.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText
        }));
        const error = new Error(errorData.message || `Error ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const data = await response.json();
      
      // Guardar tokens si vienen en la respuesta
      if (data.success && data.data && data.data.accessToken) {
        console.log('🔑 Tokens detectados en respuesta, guardando...');
        this.setTokens(data.data.accessToken, data.data.refreshToken);
      }
      
      return data;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error('La petición tardó demasiado tiempo.');
        timeoutError.code = 'TIMEOUT';
        
        if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
          console.warn(`⏳ Timeout. Reintentando... (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
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

      console.error(`❌ API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryParams = params.params || params;
    return this.request(endpoint, { method: 'GET', params: queryParams });
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
