/**
 * @fileoverview Configuración centralizada de la API y cliente HTTP reutilizable
 * @module shared/services/api.config
 * @description Maneja todas las peticiones HTTP al backend Node.js + Express
 * @author InmoTech Development Team
 * @version 3.1.0 - Agregado soporte para autenticación JWT
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

// Constantes para localStorage
const ACCESS_TOKEN_KEY = 'inmotech_access_token';
const REFRESH_TOKEN_KEY = 'inmotech_refresh_token';

class ApiClient {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  /**
   * Procesa la cola de peticiones fallidas después de refrescar token
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  /**
   * Obtiene el token de acceso actual
   */
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Obtiene el token de refresco actual
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Guarda nuevos tokens
   */
  setTokens(accessToken, refreshToken) {
    if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    }
  }

  /**
   * Limpia los tokens
   */
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async request(endpoint, options = {}, retryCount = 0) {
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;

    // ⭐ AGREGADO: Manejar parámetros de consulta para GET requests
    if (options.params && Object.keys(options.params).length > 0) {
      const urlObj = new URL(url);
      Object.keys(options.params).forEach(key => {
        if (options.params[key] !== null && options.params[key] !== undefined) {
          urlObj.searchParams.append(key, options.params[key]);
        }
      });
      url = urlObj.toString();
    }

    // ⭐ AGREGADO: Incluir token de autenticación si existe
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
    }

    // ⭐ AGREGADO: Remover params del config ya que se agregaron a la URL
    if (config.params) {
      delete config.params;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // ⭐ AGREGADO: Manejar respuesta 401 (token expirado)
      if (response.status === 401) {
        const refreshToken = this.getRefreshToken();

        if (refreshToken && !this.isRefreshing) {
          console.log('🔄 Token expirado, intentando refrescar...');
          return this.handleTokenRefresh(endpoint, options, retryCount);
        } else if (this.isRefreshing) {
          // Si ya está refrescando, agregar a la cola
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            return this.request(endpoint, options, retryCount);
          });
        } else {
          // No hay refresh token, limpiar y rechazar
          this.clearTokens();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
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
      return data;

    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutError = new Error(
          'La petición tardó demasiado tiempo. Por favor, verifica tu conexión e intenta de nuevo.'
        );
        timeoutError.code = 'TIMEOUT';

        if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
          console.warn(`⏳ Timeout en ${endpoint}. Reintentando... (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
          await this.delay(API_CONFIG.RETRY_DELAY);
          return this.request(endpoint, options, retryCount + 1);
        }

        throw timeoutError;
      }

      if (error.message === 'Failed to fetch') {
        const networkError = new Error(
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        );
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }

      console.error(`❌ API Error [${endpoint}]:`, {
        message: error.message,
        status: error.status,
        data: error.data,
      });

      throw error;
    }
  }

  /**
   * Maneja el refresco de token cuando expira
   */
  async handleTokenRefresh(originalEndpoint, originalOptions, retryCount) {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = this.getRefreshToken();

      const refreshResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();

        if (refreshData.success && refreshData.data) {
          const { accessToken, refreshToken: newRefreshToken } = refreshData.data;

          // Guardar nuevos tokens
          this.setTokens(accessToken, newRefreshToken);

          console.log('✅ Token refrescado exitosamente');

          // Procesar cola de peticiones fallidas
          this.processQueue(null, accessToken);

          // Reintentar la petición original
          return this.request(originalEndpoint, originalOptions, retryCount);
        }
      }

      // Falló el refresh
      throw new Error('No se pudo refrescar la sesión');

    } catch (error) {
      console.error('❌ Error refrescando token:', error);

      // Limpiar tokens y procesar cola con error
      this.clearTokens();
      this.processQueue(error, null);

      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    } finally {
      this.isRefreshing = false;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiClient = new ApiClient();
export default API_CONFIG;
