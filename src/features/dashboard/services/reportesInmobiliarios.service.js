// Top-level module scope
<<<<<<< HEAD
import axios from 'axios'

// Read API URL for both Vite and CRA, with safe fallbacks
const API_BASE_URL =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined) ||
  (typeof process !== 'undefined' ? process.env?.REACT_APP_API_URL : undefined) ||
  (typeof window !== 'undefined' && window.__ENV__?.API_URL) ||
  'http://localhost:5000/api/v1' // <-- corregido: coincide con tu backend

class ReportesInmobiliariosService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/reportes-inmobiliarios`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.api.interceptors.request.use(
      (config) => {
        const token =
          localStorage.getItem('inmotech_access_token') ||
          localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Interceptor para manejar respuestas
    this.api.interceptors.response.use(
      // Return the full response so methods that use response.data continue to work
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw error.response?.data || error;
      }
    );
=======
import { apiClient } from '../../../shared/services/api.config'

class ReportesInmobiliariosService {
  constructor() {
    this.api = apiClient
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  }

  // Helper para desempaquetar { success, data }
  unwrapResponseBody(body) {
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return body.data;
    }
    return body;
  }

  async crearReporte(reporteData, seguimientoGeneral = '') {
    try {
      const { seguimientosTemporales, ...datosReporte } = reporteData;
      const payload = { ...datosReporte, seguimiento_general: seguimientoGeneral };

<<<<<<< HEAD
      const response = await this.api.post('/', payload);
=======
      const response = await this.api.post('/reportes-inmobiliarios', payload);
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      const body = this.unwrapResponseBody(response.data);
      const creado = Array.isArray(body?.reporte) || typeof body?.reporte === 'object' ? body.reporte : body;

      // Procesar seguimientos temporales
      if (seguimientosTemporales && seguimientosTemporales.length > 0) {
        for (const seguimiento of seguimientosTemporales) {
          try {
            await this.crearSeguimiento(
              creado.id_reporte || creado.id,
              seguimiento.descripcion,
              seguimiento.estado || 'Pendiente'
            );
          } catch (seguimientoError) {
            console.warn('Error al crear seguimiento temporal:', seguimientoError);
          }
        }
      }

      return creado;
    } catch (error) {
      throw this.handleError(error, 'Error al crear el reporte');
    }
  }

  async actualizarReporte(reporteId, reporteData, seguimientoGeneral = '') {
    try {
      const { seguimientosTemporales, ...datosReporte } = reporteData;
      const payload = { ...datosReporte, seguimiento_general: seguimientoGeneral };

<<<<<<< HEAD
      const response = await this.api.patch(`/${reporteId}`, payload);
=======
      const response = await this.api.patch(`/reportes-inmobiliarios/${reporteId}`, payload);
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      const body = this.unwrapResponseBody(response.data);
      const actualizado = Array.isArray(body?.reporte) || typeof body?.reporte === 'object' ? body.reporte : body;

      if (seguimientosTemporales && seguimientosTemporales.length > 0) {
        for (const seguimiento of seguimientosTemporales) {
          try {
            await this.crearSeguimiento(
              reporteId,
              seguimiento.descripcion,
              seguimiento.estado || 'Pendiente'
            );
          } catch (seguimientoError) {
            console.warn('Error al crear seguimiento temporal (actualización):', seguimientoError);
          }
        }
      }

      return actualizado;
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar el reporte');
    }
  }

  async obtenerReporte(reporteId) {
    try {
<<<<<<< HEAD
      const response = await this.api.get(`/${reporteId}`);
=======
      const response = await this.api.get(`/reportes-inmobiliarios/${reporteId}`);
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      const body = this.unwrapResponseBody(response.data);
      return body?.reporte || body;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el reporte');
    }
  }

  async listarReportes(filtros = {}, opciones = {}) {
    try {
      const params = { ...filtros, ...opciones };
<<<<<<< HEAD
      const response = await this.api.get('/', { params });
=======
      const response = await this.api.get('/reportes-inmobiliarios', { params });
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      const body = this.unwrapResponseBody(response.data);
      return Array.isArray(body) ? body : body?.data || []; // soporta ambos esquemas
    } catch (error) {
      throw this.handleError(error, 'Error al listar los reportes');
    }
  }

  async crearSeguimiento(reporteId, descripcion, estado = 'Pendiente') {
    try {
      const payload = { descripcion, estado };
<<<<<<< HEAD
      const response = await this.api.post(`/${reporteId}/seguimientos`, payload);
=======
      const response = await this.api.post(`/reportes-inmobiliarios/${reporteId}/seguimientos`, payload);
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      const body = this.unwrapResponseBody(response.data);
      return body;
    } catch (error) {
      throw this.handleError(error, 'Error al crear el seguimiento');
    }
  }

  async obtenerHistorialSeguimientos(reporteId, filtros = {}) {
    try {
<<<<<<< HEAD
      const response = await this.api.get(`/${reporteId}/seguimientos`, { params: filtros });
=======
      const response = await this.api.get(`/reportes-inmobiliarios/${reporteId}/seguimientos`, { params: filtros });
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      const body = this.unwrapResponseBody(response.data);
      return Array.isArray(body) ? body : body?.data || [];
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el historial de seguimientos');
    }
  }

  async actualizarEstadoSeguimiento(reporteId, seguimientoId, estado) {
    try {
      const payload = { estado };
<<<<<<< HEAD
      const response = await this.api.patch(`/${reporteId}/seguimientos/${seguimientoId}`, payload);
=======
      const response = await this.api.patch(`/reportes-inmobiliarios/${reporteId}/seguimientos/${seguimientoId}`, payload);
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      const body = this.unwrapResponseBody(response.data);
      return body;
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar el estado del seguimiento');
    }
  }

  /**
   * Eliminar un reporte
   * @param {number} reporteId - ID del reporte
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async eliminarReporte(reporteId) {
    try {
<<<<<<< HEAD
      const response = await this.api.delete(`/${reporteId}`);
=======
      const response = await this.api.delete(`/reportes-inmobiliarios/${reporteId}`);
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar el reporte');
    }
  }

<<<<<<< HEAD
  /**
   * Manejar errores de la API
   * @param {Object} error - Error de la API
=======
  // CRUD Rubros API methods

  async listarRubros(reporteId) {
    try {
      const response = await this.api.get(`/reportes-inmobiliarios/${reporteId}/rubros`);
      const body = this.unwrapResponseBody(response.data);
      return Array.isArray(body) ? body : body?.data || [];
    } catch (error) {
      throw this.handleError(error, 'Error al listar los rubros');
    }
  }

  async crearRubro(reporteId, rubroData) {
    try {
      const response = await this.api.post(`/reportes-inmobiliarios/${reporteId}/rubros`, rubroData);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al crear el rubro');
    }
  }

  async actualizarRubro(reporteId, rubroId, rubroData) {
    try {
      const response = await this.api.patch(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}`, rubroData);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar el rubro');
    }
  }

  async eliminarRubro(reporteId, rubroId) {
    try {
      const response = await this.api.delete(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}`);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar el rubro');
    }
  }

  // CRUD Seguimiento Rubro API methods

  async listarSeguimientosRubro(reporteId, rubroId) {
    try {
      const response = await this.api.get(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}/seguimientos`);
      const body = this.unwrapResponseBody(response.data);
      return Array.isArray(body) ? body : body?.data || [];
    } catch (error) {
      throw this.handleError(error, 'Error al listar los seguimientos del rubro');
    }
  }

  async crearSeguimientoRubro(reporteId, rubroId, seguimientoData) {
    try {
      const response = await this.api.post(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}/seguimientos`, seguimientoData);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al crear el seguimiento del rubro');
    }
  }

  async actualizarSeguimientoRubro(reporteId, rubroId, seguimientoId, seguimientoData) {
    try {
      const response = await this.api.patch(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}/seguimientos/${seguimientoId}`, seguimientoData);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar el seguimiento del rubro');
    }
  }

  async eliminarSeguimientoRubro(reporteId, rubroId, seguimientoId) {
    try {
      const response = await this.api.delete(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}/seguimientos/${seguimientoId}`);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar el seguimiento del rubro');
    }
  }


  /**
   * Manejar errores de la API
   * @param {Object} error - Error de la API (Axios u otro)
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
   * @param {string} defaultMessage - Mensaje por defecto
   * @returns {Error} Error procesado
   */
  handleError(error, defaultMessage) {
<<<<<<< HEAD
    const message = error.data?.message || error.message || defaultMessage;
    const statusCode = error.status || error.response?.status || 500;
    
    const processedError = new Error(message);
    processedError.statusCode = statusCode;
    processedError.originalError = error;
    
=======
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    const statusCode = error?.response?.status || error?.status || 500;

    const processedError = new Error(message);
    processedError.statusCode = statusCode;
    processedError.originalError = error;

>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
    return processedError;
  }

  /**
   * Obtener estadísticas de reportes
   * @param {Object} filtros - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de reportes
   */
  async obtenerEstadisticas(filtros = {}) {
    try {
<<<<<<< HEAD
      const response = await this.api.get('/estadisticas', { params: filtros });
=======
      const response = await this.api.get('/reportes-inmobiliarios/estadisticas', { params: filtros });
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener las estadísticas');
    }
  }

  /**
   * Exportar reportes a Excel
   * @param {Object} filtros - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo Excel
   */
  async exportarReportes(filtros = {}) {
    try {
<<<<<<< HEAD
      const response = await this.api.get('/exportar', {
=======
      const response = await this.api.get('/reportes-inmobiliarios/exportar', {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
        params: filtros,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Error al exportar los reportes');
    }
  }
<<<<<<< HEAD
=======
  // Adjuntos: Imágenes
  async agregarImagen(reporteId, imagenData) {
    try {
      const response = await this.api.post(`/reportes-inmobiliarios/${reporteId}/imagenes`, imagenData);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al agregar la imagen');
    }
  }

  // Adjuntos: Archivos
  async agregarArchivo(reporteId, archivoData) {
    try {
      const response = await this.api.post(`/reportes-inmobiliarios/${reporteId}/archivos`, archivoData);
      return this.unwrapResponseBody(response.data);
    } catch (error) {
      throw this.handleError(error, 'Error al agregar el archivo');
    }
  }
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
}

// Instancia singleton del servicio
const reportesInmobiliariosService = new ReportesInmobiliariosService();

export default reportesInmobiliariosService;
<<<<<<< HEAD

// Exportar también la clase para testing
export { ReportesInmobiliariosService };
=======
export { ReportesInmobiliariosService };

// Top-level module scope
const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '/api';

async function http(path, { method = 'GET', body, headers = {} } = {}) {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
        const message = isJson && data && data.message ? data.message : res.statusText;
        throw new Error(`Error ${res.status}: ${message}`);
    }

    return data;
}

function clean(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null) out[k] = v;
    }
    return out;
}

// Rubros (alineados con /reportes-inmobiliarios/:reporteId/rubros)
export async function crearRubro(reporteId, rubro) {
    if (!reporteId) throw new Error('reporteId es requerido para crear un rubro');
    return http(`/reportes-inmobiliarios/${reporteId}/rubros`, { method: 'POST', body: clean(rubro) });
}

export async function obtenerRubros(reporteId) {
    if (!reporteId) throw new Error('reporteId es requerido para listar rubros');
    return http(`/reportes-inmobiliarios/${reporteId}/rubros`, { method: 'GET' });
}

export async function actualizarRubro(reporteId, id, rubro) {
    if (!reporteId || !id) throw new Error('IDs requeridos para actualizar rubro');
    return http(`/reportes-inmobiliarios/${reporteId}/rubros/${id}`, { method: 'PATCH', body: clean(rubro) });
}

// export helpers (seguir usando http y clean)
// Seguimientos de rubro
export async function crearSeguimientoRubro(reporteId, rubroId, seguimiento) {
    if (!reporteId || !rubroId) throw new Error('reporteId y rubroId son requeridos para crear un seguimiento');
    return http(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}/seguimientos`, { method: 'POST', body: clean(seguimiento) });
}

export async function obtenerSeguimientosRubro(reporteId, rubroId) {
    if (!reporteId || !rubroId) throw new Error('reporteId y rubroId son requeridos para listar seguimientos');
    return http(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}/seguimientos`, { method: 'GET' });
}

export async function actualizarSeguimientoRubro(reporteId, rubroId, seguimientoId, seguimiento) {
    if (!reporteId || !rubroId || !seguimientoId) throw new Error('IDs requeridos para actualizar seguimiento');
    return http(`/reportes-inmobiliarios/${reporteId}/rubros/${rubroId}/seguimientos/${seguimientoId}`, { method: 'PATCH', body: clean(seguimiento) });
}
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
