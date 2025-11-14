import { apiClient } from './api.config';

const buildLabel = (property) => {
  const registro = property.registro_inmobiliario || property.registro || `INM-${property.id_inmueble || property.id || ''}`;
  const ciudad = property.ciudad || property.location || '';
  const direccion = property.direccion || '';
  return [registro, ciudad, direccion]
    .filter(Boolean)
    .join(' · ');
};

class PropertiesApiService {
  normalize(property) {
    if (!property) return null;

    const id = property.id_inmueble || property.id;

    return {
      id,
      label: buildLabel(property),
      registro: property.registro_inmobiliario || property.registro || '',
      direccion: property.direccion || '',
      ciudad: property.ciudad || '',
      departamento: property.departamento || '',
      categoria: property.categoria || '',
      estado: typeof property.estado === 'boolean'
        ? (property.estado ? 'Activo' : 'Inactivo')
        : property.estado || 'Activo',
      raw: property
    };
  }

  handleResponse(response, fallbackMessage) {
    if (response?.success) return;
    throw new Error(response?.message || fallbackMessage);
  }

  async getAll(params = {}) {
    const response = await apiClient.get('/inmuebles', { params });
    this.handleResponse(response, 'No fue posible obtener los inmuebles');
    return (response.data || []).map((property) => this.normalize(property));
  }
}

export const propertiesApiService = new PropertiesApiService();
