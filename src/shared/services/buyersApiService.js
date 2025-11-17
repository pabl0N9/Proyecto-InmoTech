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

const toDateInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
};

const mapInmuebleToCard = (inmueble) => {
  if (!inmueble) return null;

  return {
    nombre: inmueble.registro || inmueble.registro_inmobiliario || `Inmueble #${inmueble.id}`,
    m2: inmueble.m2 || '--',
    hab: inmueble.habitaciones || '--',
    banos: inmueble.banos || '--',
    registro: inmueble.registro || inmueble.registro_inmobiliario || '',
    direccion: inmueble.direccion || '',
    tipo: inmueble.categoria || inmueble.tipo || 'Sin categorizar',
    estado: inmueble.estado || 'Activo'
  };
};

class BuyersApiService {
  extractArray(response) {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
  }

  extractSingle(response) {
    if (response?.data && typeof response.data === 'object') {
      return response.data;
    }
    if (response?.data?.data && typeof response.data.data === 'object') {
      return response.data.data;
    }
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      return response;
    }
    return null;
  }

  normalize(buyer) {
    if (!buyer) return null;

    const persona = buyer.persona || {};
    const inmueble = buyer.inmueble || buyer.property || null;
    const personaId = persona.id_persona;
    const buyerId = buyer.id_buyer || buyer.id_comprador || buyer.id;

    const [primerNombre, segundoNombre] = splitInTwo(persona.nombre_completo || '');
    const [primerApellido, segundoApellido] = splitInTwo(persona.apellido_completo || '');

    const normalizedInmueble = inmueble
      ? {
          id: inmueble.id_inmueble || inmueble.id,
          registro: inmueble.registro_inmobiliario || inmueble.registro || '',
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
      id: personaId,
      personaId,
      buyerId,
      tipoDocumento: persona.tipo_documento || 'CC',
      documento: persona.numero_documento || '',
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      correo: persona.correo || '',
      telefono: persona.telefono || '',
      idInmueble: normalizedInmueble?.id ? String(normalizedInmueble.id) : '',
      fechaCompra: toDateInput(buyer.fecha_compra),
      valorCompra: buyer.valor_compra !== undefined && buyer.valor_compra !== null
        ? String(buyer.valor_compra)
        : '',
      tipoCompra: buyer.tipo_compra || 'Directa',
      ciudadResidencia: buyer.ciudad_residencia || '',
      direccionAnterior: buyer.direccion_anterior || '',
      entidadFinanciera: buyer.entidad_financiera || '',
      numeroCredito: buyer.numero_credito || '',
      montoFinanciado: buyer.monto_financiado !== undefined && buyer.monto_financiado !== null
        ? String(buyer.monto_financiado)
        : '',
      observaciones: buyer.observaciones || '',
      estado: buyer.estado || 'Activo',
      registroComprador: buyer.registro_comprador || '',
      inmueble: normalizedInmueble,
      inmueblesComprados: normalizedInmueble ? [mapInmuebleToCard(normalizedInmueble)] : [],
      registrationDate: buyer.fecha_registro_comprador || buyer.fecha_creacion || null,
      raw: buyer
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
      observaciones: formData.observaciones || null
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    return payload;
  }

  handleResponseMessage(response, fallbackMessage) {
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success) return;
      throw new Error(response?.message || fallbackMessage);
    }
    if (!response) {
      throw new Error(fallbackMessage);
    }
  }

  async getAll(filters = {}) {
    const response = await apiClient.get('/sales/buyers', { params: filters });
    this.handleResponseMessage(response, 'No fue posible obtener los compradores');
    const list = this.extractArray(response);
    return list.map((buyer) => this.normalize(buyer));
  }

  async findByDocument(tipoDocumento, numeroDocumento) {
    if (!tipoDocumento || !numeroDocumento) return null;
    const response = await apiClient.get('/sales/buyers', {
      params: {
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento
      }
    });
    this.handleResponseMessage(response, 'No fue posible buscar el comprador');
    const list = this.extractArray(response);
    return list.length ? this.normalize(list[0]) : null;
  }

  async create(formData) {
    const payload = this.toApiPayload(formData);
    const response = await apiClient.post('/sales/buyers', payload);
    this.handleResponseMessage(response, 'No fue posible crear el comprador');
    return this.normalize(this.extractSingle(response));
  }

  async update(id, formData) {
    const payload = this.toApiPayload(formData);
    const response = await apiClient.put(`/sales/buyers/${id}`, payload);
    this.handleResponseMessage(response, 'No fue posible actualizar el comprador');
    return this.normalize(this.extractSingle(response));
  }

  async updatePurchaseData(id, purchaseData = {}) {
    const response = await apiClient.put(`/sales/buyers/${id}`, purchaseData);
    this.handleResponseMessage(response, 'No fue posible actualizar la compra del comprador');
    return this.normalize(this.extractSingle(response));
  }

  async deactivate(id) {
    const response = await apiClient.patch(`/sales/buyers/${id}/deactivate`);
    this.handleResponseMessage(response, 'No fue posible desactivar el comprador');
    return this.normalize(this.extractSingle(response));
  }

  async delete(id) {
    const response = await apiClient.delete(`/sales/buyers/${id}`);
    this.handleResponseMessage(response, 'No fue posible eliminar el comprador');
    return this.normalize(this.extractSingle(response));
  }

  async getById(id) {
    const response = await apiClient.get(`/sales/buyers/${id}`);
    this.handleResponseMessage(response, 'No fue posible obtener el comprador');
    return this.normalize(this.extractSingle(response));
  }
}

export const buyersApiService = new BuyersApiService();
