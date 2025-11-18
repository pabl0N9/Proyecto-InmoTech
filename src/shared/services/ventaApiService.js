import { apiClient } from './api.config';

const PRIMARY_BASE = '/sales';
const LEGACY_BASE = '/ventas';
const PRIMARY_STATS = `${PRIMARY_BASE}/dashboard/statistics`;
const LEGACY_STATS = `${LEGACY_BASE}/estadisticas`;

class VentaApiService {
  shouldFallback(error) {
    const status = error?.status || error?.data?.status;
    const isNetworkError =
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.toLowerCase().includes('network');

    return (
      status === 404 ||
      status === 405 ||
      status === 500 ||
      status === 501 ||
      isNetworkError
    );
  }

  async withFallback(primaryFn, legacyFn) {
    try {
      return await primaryFn();
    } catch (error) {
      if (legacyFn && this.shouldFallback(error)) {
        console.warn('Endpoint /sales no disponible, usando /ventas legacy');
        return legacyFn();
      }
      console.error('API Ventas error:', error.message);
      throw error;
    }
  }

  async crearVenta(ventaData) {
    return this.withFallback(
      () => apiClient.post(PRIMARY_BASE, ventaData),
      () => apiClient.post(LEGACY_BASE, ventaData)
    );
  }

  async obtenerVentas(params = {}) {
    return this.withFallback(
      () => apiClient.get(PRIMARY_BASE, params),
      () => apiClient.get(LEGACY_BASE, params)
    );
  }

  async obtenerEstadisticas() {
    return this.withFallback(
      () => apiClient.get(PRIMARY_STATS),
      () => apiClient.get(LEGACY_STATS)
    );
  }

  async obtenerVentaPorId(id) {
    return this.withFallback(
      () => apiClient.get(`${PRIMARY_BASE}/${id}`),
      () => apiClient.get(`${LEGACY_BASE}/${id}`)
    );
  }

  async actualizarVenta(id, ventaData) {
    return this.withFallback(
      () => apiClient.put(`${PRIMARY_BASE}/${id}`, ventaData),
      () => apiClient.put(`${LEGACY_BASE}/${id}`, ventaData)
    );
  }

  async avanzarEstado(id) {
    return this.withFallback(
      () => apiClient.patch(`${PRIMARY_BASE}/${id}/advance`),
      () => apiClient.patch(`${LEGACY_BASE}/${id}/avanzar-estado`)
    );
  }

  async cancelarVenta(id) {
    return this.withFallback(
      () => apiClient.patch(`${PRIMARY_BASE}/${id}/cancel`),
      () => apiClient.patch(`${LEGACY_BASE}/${id}/cancelar`)
    );
  }

  async obtenerVentasPorInmueble(inmuebleId) {
    return this.withFallback(
      () => apiClient.get(`${PRIMARY_BASE}?inmueble_id=${inmuebleId}`),
      () => apiClient.get(`${LEGACY_BASE}/inmueble/${inmuebleId}`)
    );
  }
}

export default new VentaApiService();
