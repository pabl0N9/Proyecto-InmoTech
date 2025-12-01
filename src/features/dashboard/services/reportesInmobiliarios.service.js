// Top-level module scope
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

      const response = await this.api.post('/', payload);
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

      const response = await this.api.patch(`/${reporteId}`, payload);
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
      const response = await this.api.get(`/${reporteId}`);
      const body = this.unwrapResponseBody(response.data);
      return body?.reporte || body;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el reporte');
    }
  }

  async listarReportes(filtros = {}, opciones = {}) {
    try {
      const params = { ...filtros, ...opciones };
      const response = await this.api.get('/', { params });
      const body = this.unwrapResponseBody(response.data);
      return Array.isArray(body) ? body : body?.data || []; // soporta ambos esquemas
    } catch (error) {
      throw this.handleError(error, 'Error al listar los reportes');
    }
  }

  async crearSeguimiento(reporteId, descripcion, estado = 'Pendiente') {
    try {
      const payload = { descripcion, estado };
      const response = await this.api.post(`/${reporteId}/seguimientos`, payload);
      const body = this.unwrapResponseBody(response.data);
      return body;
    } catch (error) {
      throw this.handleError(error, 'Error al crear el seguimiento');
    }
  }

  async obtenerHistorialSeguimientos(reporteId, filtros = {}) {
    try {
      const response = await this.api.get(`/${reporteId}/seguimientos`, { params: filtros });
      const body = this.unwrapResponseBody(response.data);
      return Array.isArray(body) ? body : body?.data || [];
    } catch (error) {
      throw this.handleError(error, 'Error al obtener el historial de seguimientos');
    }
  }

  async actualizarEstadoSeguimiento(reporteId, seguimientoId, estado) {
    try {
      const payload = { estado };
      const response = await this.api.patch(`/${reporteId}/seguimientos/${seguimientoId}`, payload);
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
      const response = await this.api.delete(`/${reporteId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar el reporte');
    }
  }

  /**
   * Manejar errores de la API
   * @param {Object} error - Error de la API
   * @param {string} defaultMessage - Mensaje por defecto
   * @returns {Error} Error procesado
   */
  handleError(error, defaultMessage) {
    const message = error.data?.message || error.message || defaultMessage;
    const statusCode = error.status || error.response?.status || 500;
    
    const processedError = new Error(message);
    processedError.statusCode = statusCode;
    processedError.originalError = error;
    
    return processedError;
  }

  /**
   * Obtener estadísticas de reportes
   * @param {Object} filtros - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de reportes
   */
  async obtenerEstadisticas(filtros = {}) {
    try {
      const response = await this.api.get('/estadisticas', { params: filtros });
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
      const response = await this.api.get('/exportar', {
        params: filtros,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Error al exportar los reportes');
    }
  }
}

// Instancia singleton del servicio
const reportesInmobiliariosService = new ReportesInmobiliariosService();

export default reportesInmobiliariosService;

// Exportar también la clase para testing
export { ReportesInmobiliariosService };