/**
 * @fileoverview Configuración centralizada de la API con cookies httpOnly
 * @version 5.0.0 - Usando cookies httpOnly para tokens JWT (más seguro)
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
    console.log('🛡️ Tokens ahora almacenados en cookies httpOnly - no accesibles desde frontend');
    return null; // Los tokens están en cookies httpOnly
  }

  getRefreshToken() {
    console.log('🛡️ Refresh token también en cookies httpOnly');
    return null; // Los tokens están en cookies httpOnly
  }

  setTokens(accessToken, refreshToken) {
    console.log('🛡️ Tokens enviados como cookies httpOnly por el backend');
    // Los tokens se envían como cookies httpOnly por el backend
  }

  clearTokens() {
    console.log('🛡️ Tokens limpiados mediante endpoint /auth/logout');
    // Los tokens se limpian via backend (cookies.clearCookie)
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

    const config = {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...options.headers,
      },
      // Habilitar envío de cookies automáticamente
      credentials: 'include',
    };

    // No necesitamos Authorization headers - el navegador envía cookies automáticamente
    console.log('🍪 Cookies httpOnly serán enviadas automáticamente por el navegador');

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

      // ⚠️ INTERCEPTOR DE SEGURIDAD: Verificar respuesta antes de procesar
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: response.statusText
        }));

        // 🚨 DETECTAR LOGOUT FORZADO
        if (errorData.forceLogout === true) {
          console.log('🚨 Respuesta con logout forzado detectado:', errorData);

          try {
            // Emitir evento SSE para logout forzado
            const sseService = (await import('./sseService.js')).default;
            sseService.emit('user_disabled', {
              message: errorData.message,
              action: 'logout',
              reason: errorData.reason || 'security_required',
              timestamp: new Date().toISOString()
            });

            // Esperar un poco para que el evento SSE sea procesado
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (sseError) {
            console.warn('⚠️ Error enviando evento SSE de logout forzado:', sseError.message);
          }

          // No lanzar error, el SSE se encargará del logout
          return errorData;
        }

        const error = new Error(errorData.message || `Error ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // ✅ Respuesta OK: continuar normalmente
      if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        console.warn('🔄 Token expirado (401), intentando refrescar...');
        return await this.handleTokenRefresh(endpoint, options, retryCount);
      }

      // Manejar 429
      if (response.status === 429) {
        throw new Error('Demasiadas peticiones. Por favor, espera un momento e intenta nuevamente.');
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
