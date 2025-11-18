/**
 * Servicio frontend para consumir la API de arrendatarios (Renants)
 */

import { apiClient } from './api.config';

const joinNames = (first = '', second = '') => {
  return [first, second]
    .map((value) => (value || '').trim())
    .filter(Boolean)
    .join(' ');
};

const splitInTwo = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return ['', ''];
  const [first, ...rest] = parts;
  return [first, rest.join(' ')];
};

const onlyDigits = (value = '') => value.replace(/[^\d]/g, '');
const toNumberOrUndefined = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toDateInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const mapInmuebleToCard = (inmueble, estado = 'Activo') => {
  if (!inmueble) return null;

  return {
    nombre: inmueble.registro_inmobiliario || `Inmueble #${inmueble.id_inmueble || inmueble.id}`,
    m2: inmueble.m2 || '--',
    hab: inmueble.habitaciones || '--',
    banos: inmueble.banos || '--',
    registro: inmueble.registro_inmobiliario || '',
    direccion: inmueble.direccion || '',
    tipo: inmueble.categoria || 'Sin categorizar',
    estado
  };
};

class RenantsApiService {
  normalize(renant) {
    if (!renant) return null;

    const persona = renant.persona || {};
    const inmueble = renant.inmueble || null;

    const [primerNombre, segundoNombre] = splitInTwo(persona.nombre_completo || '');
    const [primerApellido, segundoApellido] = splitInTwo(persona.apellido_completo || '');

    const normalizedInmueble = inmueble
      ? {
          id: inmueble.id_inmueble || inmueble.id,
          registro: inmueble.registro_inmobiliario || '',
          direccion: inmueble.direccion || '',
          ciudad: inmueble.ciudad || '',
          departamento: inmueble.departamento || '',
          categoria: inmueble.categoria || '',
          estado: typeof inmueble.estado === 'boolean'
            ? (inmueble.estado ? 'Activo' : 'Inactivo')
            : inmueble.estado || 'Activo'
        }
      : null;

    return {
      id: renant.id_arrendatario || renant.id_renant || renant.id,
      personaId: persona.id_persona,
      tipoDocumento: persona.tipo_documento || 'CC',
      documento: persona.numero_documento || '',
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      correo: persona.correo || '',
      telefono: persona.telefono || '',
      idInmueble: normalizedInmueble?.id ? String(normalizedInmueble.id) : '',
      fechaInicio: toDateInput(renant.fecha_inicio_arrendamiento),
      fechaFin: toDateInput(renant.fecha_fin_arrendamiento),
      valorMensual: renant.valor_arriendo_mensual !== undefined && renant.valor_arriendo_mensual !== null
        ? String(renant.valor_arriendo_mensual)
        : '',
      tipoGarantia: renant.tipo_garantia || '',
      valorGarantia: renant.valor_garantia !== undefined && renant.valor_garantia !== null
        ? String(renant.valor_garantia)
        : '',
      descripcionGarantia: renant.descripcion_garantia || '',
      contactoEmergenciaNombre: renant.contacto_emergencia_nombre || '',
      contactoEmergenciaTelefono: renant.contacto_emergencia_telefono || '',
      contactoEmergenciaParentesco: renant.contacto_emergencia_parentesco || '',
      observaciones: renant.observaciones || '',
      estado: renant.estado || 'Activo',
      registroArrendatario: renant.registro_arrendatario || '',
      inmueble: normalizedInmueble,
      inmueblesArrendados: normalizedInmueble
        ? [mapInmuebleToCard(normalizedInmueble, renant.estado)]
        : [],
      raw: renant
    };
  }

  toApiPayload(formData) {
    const payload = {
      tipo_documento: formData.tipoDocumento,
      numero_documento: onlyDigits(formData.documento),
      nombre_completo: joinNames(formData.primerNombre, formData.segundoNombre),
      apellido_completo: joinNames(formData.primerApellido, formData.segundoApellido),
      correo: formData.correo,
      telefono: onlyDigits(formData.telefono),
      id_inmueble: toNumberOrUndefined(formData.idInmueble),
      fecha_inicio_arrendamiento: formData.fechaInicio,
      fecha_fin_arrendamiento: formData.fechaFin || null,
      valor_arriendo_mensual: toNumberOrUndefined(formData.valorMensual),
      tipo_garantia: formData.tipoGarantia || null,
      valor_garantia: toNumberOrUndefined(formData.valorGarantia),
      descripcion_garantia: formData.descripcionGarantia || null,
      contacto_emergencia_nombre: formData.contactoEmergenciaNombre || null,
      contacto_emergencia_telefono: formData.contactoEmergenciaTelefono
        ? onlyDigits(formData.contactoEmergenciaTelefono)
        : null,
      contacto_emergencia_parentesco: formData.contactoEmergenciaParentesco || null,
      observaciones: formData.observaciones || null,
      estado: formData.estado || 'Activo'
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  }

  handleResponseMessage(response, fallbackMessage) {
    if (response?.success) return;
    throw new Error(response?.message || fallbackMessage);
  }

  async getAll(filters = {}) {
    const response = await apiClient.get('/leases/renants', { params: filters });
    this.handleResponseMessage(response, 'No fue posible obtener los arrendatarios');
    return (response.data || []).map((tenant) => this.normalize(tenant));
  }

  async create(formData) {
    const payload = this.toApiPayload(formData);
    const response = await apiClient.post('/leases/renants', payload);
    this.handleResponseMessage(response, 'No fue posible crear el arrendatario');
    return this.normalize(response.data);
  }

  async update(id, formData) {
    const payload = this.toApiPayload(formData);
    const response = await apiClient.put(`/leases/renants/${id}`, payload);
    this.handleResponseMessage(response, 'No fue posible actualizar el arrendatario');
    return this.normalize(response.data);
  }

  async deactivate(id) {
    const response = await apiClient.patch(`/leases/renants/${id}/deactivate`);
    this.handleResponseMessage(response, 'No fue posible desactivar el arrendatario');
    return this.normalize(response.data);
  }

  async delete(id) {
    const response = await apiClient.delete(`/leases/renants/${id}`);
    this.handleResponseMessage(response, 'No fue posible eliminar el arrendatario');
    return this.normalize(response.data);
  }

  async getById(id) {
    const response = await apiClient.get(`/leases/renants/${id}`);
    this.handleResponseMessage(response, 'No fue posible obtener el arrendatario');
    return this.normalize(response.data);
  }

  async search(criteria = {}) {
    const response = await apiClient.get('/leases/renants/search/query', { params: criteria });
    this.handleResponseMessage(response, 'No fue posible buscar arrendatarios');
    return (response.data || []).map((tenant) => this.normalize(tenant));
  }
}

export const renantsApiService = new RenantsApiService();
