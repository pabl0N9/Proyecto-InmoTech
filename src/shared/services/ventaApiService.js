import { apiClient } from './api.config';

const extractList = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const ventaApiService = {
  async obtenerVentas(params = {}) {
    const response = await apiClient.get('/sales', params);
    const data = extractList(response);
    return { data };
  },

  async crearVenta(payload) {
    return apiClient.post('/sales', payload);
  },
};

export default ventaApiService;
