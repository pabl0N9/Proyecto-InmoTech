/**
 * Cliente API simplificado usando fetch con cookies httpOnly.
 */

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: 60000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

class ApiClient {
  constructor() {
    this.maxRetries = 2;
    this.accessToken = null;
    this.refreshToken = null;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Manejo simple de tokens para adjuntar Authorization en cada request
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken || null;
    this.refreshToken = refreshToken || null;
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  async request(endpoint, options = {}, retryCount = 0) {
    const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);

    if (options.params && Object.keys(options.params).length > 0) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const config = {
      ...options,
      headers: {
        ...API_CONFIG.HEADERS,
        ...(options.headers || {}),
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      },
      credentials: 'include',
      signal: controller.signal,
    };

    // No reenviar params en fetch
    delete config.params;

    try {
      const response = await fetch(url.toString(), config);
      clearTimeout(timeoutId);

      if (response.status === 429) {
        if (retryCount < API_CONFIG.RETRY_ATTEMPTS + 2) {
          const waitTime = API_CONFIG.RETRY_DELAY * (retryCount + 1);
          await this.delay(waitTime);
          return this.request(endpoint, options, retryCount + 1);
        }
        throw new Error('Demasiadas peticiones. Por favor, espera e intenta nuevamente.');
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

      if (data?.success && data?.data?.accessToken) {
        this.setTokens(data.data.accessToken, data.data.refreshToken);
      }

      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
          await this.delay(API_CONFIG.RETRY_DELAY);
          return this.request(endpoint, options, retryCount + 1);
        }
        const timeoutError = new Error('La peticion tardo demasiado tiempo.');
        timeoutError.code = 'TIMEOUT';
        throw timeoutError;
      }

      if (error.message === 'Failed to fetch') {
        const networkError = new Error('No se pudo conectar con el servidor.');
        networkError.code = 'NETWORK_ERROR';
        throw networkError;
      }

      throw error;
    }
  }

  async get(endpoint, params = {}) {
    return this.request(endpoint, { method: 'GET', params });
  }

  async post(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
  }

  async patch(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, headers = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      headers,
    });
  }
}

export const apiClient = new ApiClient();
export { API_CONFIG };
