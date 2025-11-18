/**
 * @fileoverview Servicio frontend para interactuar con el endpoint de Citas
 * @module shared/services/citaApiService
 * @description Cliente HTTP que consume la API REST de citas del backend
 * @author InmoTech Development Team
 * @version 5.0.0 - Adaptado a estructura real del backend con id_cita
 */

import { apiClient } from "./api.config";
import axios from 'axios';

const SERVICIO_MAP = {
  "Visita a Propiedad": 1,
  "Avalúos": 2,
  "Gestión de Alquileres": 3,
  "Asesoría Legal": 4,
};

const ESTADO_TO_ID_MAP = {
  "solicitada": 1,
  "confirmada": 2,
  "programada": 3,
  "re agendada": 4,
  "reagendada": 4,
  "completada": 5,
  "cancelada": 6,
};

const ID_TO_ESTADO_MAP = {
  1: "solicitada",
  2: "confirmada",
  3: "programada",
  4: "re agendada",
  5: "completada",
  6: "cancelada",
};

class CitaApiService {
  async obtenerCitas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append("estado", filtros.estado);
      if (filtros.fecha) params.append("fecha", filtros.fecha);
      if (filtros.agente) params.append("agente", filtros.agente);

      const endpoint = `/citas${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiClient.get(endpoint);

      // El GET all puede retornar array directamente o en data
      const citas = Array.isArray(response.data) ? response.data : response.data.data;

      if (!citas || !Array.isArray(citas)) {
        throw new Error("Formato de respuesta inválido del servidor");
      }

      return citas.map(cita => this.transformarCitaDesdeAPI(cita));
    } catch (error) {
      console.error("❌ Error al obtener citas:", error);
      throw new Error(error.message || "Error al cargar las citas desde el servidor");
    }
  }

  async crearCita(citaData, userId) {
    try {
      this.validarDatosCita(citaData);

      const payload = {
        tipo_documento: citaData.cliente?.tipo_documento || citaData.tipo_documento,
        numero_documento: citaData.cliente?.numero_documento || citaData.numero_documento,
        nombre_completo: citaData.cliente?.nombre_completo || citaData.nombre_completo,
        apellido_completo: citaData.cliente?.apellido_completo || citaData.apellido_completo,
        email: citaData.cliente?.correo || citaData.email || null,
        telefono: citaData.cliente?.telefono || citaData.telefono,
        id_inmueble: citaData.inmueble?.id_inmueble || citaData.id_inmueble || 1,
        id_servicio: citaData.servicio?.id_servicio || citaData.id_servicio || 1,
        fecha_cita: citaData.fecha_cita,
        hora_inicio: this.formatHoraParaAPI(citaData.hora_inicio || '09:00'),
        hora_fin: this.formatHoraParaAPI(citaData.hora_fin || '10:00'),
        id_estado_cita: citaData.id_estado_cita || 1,
        id_agente_asignado: citaData.id_agente_asignado || null,
        observaciones: citaData.observaciones || null,
        id_usuario_creador: userId || citaData.id_usuario_creador // ✅ Usar userId del contexto o el que viene en citaData
      };

      console.log("📤 Enviando nueva cita al backend:", payload);

      const response = await apiClient.post("/citas", payload);
      
      console.log("📥 Respuesta del backend al crear:", response.data);

      // Manejar estructura: { success, message, data: {...} }
      const citaCreada = response.data.data || response.data;
      return this.transformarCitaDesdeAPI(citaCreada);
    } catch (error) {
      console.error("❌ Error al crear cita:", error);
      throw new Error(error.message || "Error al crear la cita");
    }
  }

  async actualizarCita(id, citaData) {
    try {
      if (!id) throw new Error("ID de cita es requerido");

      const payload = {
        tipo_documento: citaData.cliente?.tipo_documento || citaData.tipo_documento,
        numero_documento: citaData.cliente?.numero_documento || citaData.numero_documento,
        nombre_completo: citaData.cliente?.nombre_completo || citaData.nombre_completo,
        apellido_completo: citaData.cliente?.apellido_completo || citaData.apellido_completo,
        email: citaData.cliente?.correo || citaData.email || null,
        telefono: citaData.cliente?.telefono || citaData.telefono,
        id_inmueble: citaData.inmueble?.id_inmueble || citaData.id_inmueble || 1,
        id_servicio: citaData.servicio?.id_servicio || citaData.id_servicio || 1,
        fecha_cita: citaData.fecha_cita,
        hora_inicio: this.formatHoraParaAPI(citaData.hora_inicio || '09:00'),
        hora_fin: this.formatHoraParaAPI(citaData.hora_fin || '10:00'),
        observaciones: citaData.observaciones || null,
        id_estado_cita: this.mapEstadoToId(citaData.estado) || citaData.id_estado_cita || 1
      };

      console.log("📤 Enviando actualización al backend:", { id, payload });

      const response = await apiClient.put(`/citas/${id}`, payload);
      
      console.log("📥 Respuesta del backend:", response.data);

      // Estructura: { success, message, data: {...} }
      const citaActualizada = response.data.data || response.data;
      
      // ✅ CORRECCIÓN CRÍTICA: usar id_cita en lugar de id
      if (!citaActualizada || (!citaActualizada.id_cita && !citaActualizada.id)) {
        console.error("❌ Respuesta inválida del backend:", response.data);
        throw new Error("El servidor no retornó datos válidos de la cita actualizada");
      }

      console.log("✅ Cita actualizada correctamente:", citaActualizada);
      return this.transformarCitaDesdeAPI(citaActualizada);
    } catch (error) {
      console.error("❌ Error en actualizarCita:", error);
      throw new Error(error.message || "Error al actualizar la cita");
    }
  }

  async eliminarCita(id) {
    try {
      if (!id) {
        throw new Error("ID de cita es requerido");
      }

      await apiClient.delete(`/citas/${id}`);
      return true;
    } catch (error) {
      console.error("❌ Error al eliminar cita:", error);
      throw new Error(error.message || "Error al eliminar la cita");
    }
  }

  async confirmarCita(id, id_agente_asignado) {
    try {
      if (!id) throw new Error("ID de cita es requerido");
      if (!id_agente_asignado) throw new Error("ID de agente es requerido");

      console.log("📤 Confirmando cita:", { id, id_agente_asignado });

      const response = await apiClient.post(`/citas/${id}/confirmar`, {
        id_agente_asignado: id_agente_asignado
      });

      console.log("📥 Respuesta del backend al confirmar:", response.data);

      const citaConfirmada = response.data.data || response.data;
      return this.transformarCitaDesdeAPI(citaConfirmada);
    } catch (error) {
      console.error("❌ Error al confirmar cita:", error);
      throw new Error(error.message || "Error al confirmar la cita");
    }
  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  validarDatosCita(citaData) {
    const camposRequeridos = {
      nombre_completo: "Nombre completo",
      apellido_completo: "Apellido completo",
      numero_documento: "Número de documento",
      telefono: "Teléfono",
      fecha_cita: "Fecha de la cita",
      hora_inicio: "Hora de inicio"
    };

    for (const [campo, etiqueta] of Object.entries(camposRequeridos)) {
      if (!citaData[campo] || String(citaData[campo]).trim() === "") {
        throw new Error(`${etiqueta} es requerido`);
      }
    }

    if (citaData.numero_documento && !/^[0-9]+$/.test(citaData.numero_documento)) {
      throw new Error("El número de documento debe contener solo números");
    }

    if (citaData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(citaData.email)) {
      throw new Error("El formato del correo electrónico es inválido");
    }

    if (citaData.telefono) {
      const telefonoLimpio = citaData.telefono.replace(/\D/g, "");
      if (telefonoLimpio.length < 10) {
        throw new Error("El teléfono debe tener al menos 10 dígitos");
      }
    }
  }

  // ==========================================
  // HELPERS - MAPEOS
  // ==========================================

  mapServicioToId(servicio) {
    return SERVICIO_MAP[servicio] || 1;
  }

  mapEstadoToId(estado) {
    return ESTADO_TO_ID_MAP[estado?.toLowerCase()] || 1;
  }

  mapIdToEstado(id) {
    return ID_TO_ESTADO_MAP[id] || 'solicitada';
  }

  mapTipoDocumentoToShort(tipo) {
    const map = {
      "Cédula de Ciudadanía": "CC",
      "Cédula de Extranjería": "CE",
      "NIT": "NIT",
      "Pasaporte": "Pasaporte",
      "Tarjeta de Identidad": "TI",
    };
    return map[tipo] || tipo;
  }

  // ==========================================
  // HELPERS - TELÉFONO
  // ==========================================

  limpiarTelefono(telefono) {
    if (!telefono) return "";
    const limpio = telefono.replace(/\D/g, "");
    if (limpio.startsWith("57") && limpio.length === 12) {
      return limpio.slice(2);
    }
    return limpio;
  }

  formatearTelefono(telefono) {
    const limpio = telefono.replace(/\D/g, "");
    if (limpio.length === 10) {
      return `(${limpio.slice(0, 3)}) ${limpio.slice(3, 6)}-${limpio.slice(6)}`;
    }
    return telefono;
  }

  // ==========================================
  // HELPERS - HORAS
  // ==========================================

  formatHoraParaAPI(hora) {
    if (!hora) return "09:00";

    const horaLimpia = hora.toLowerCase().replace(/\s+/g, "");
    const isPM = horaLimpia.includes("pm");
    const isAM = horaLimpia.includes("am");

    let [horas, minutos] = horaLimpia
      .replace(/am|pm/g, "")
      .split(":")
      .map(Number);

    if (isPM && horas !== 12) horas += 12;
    if (isAM && horas === 12) horas = 0;

    return `${String(horas).padStart(2, "0")}:${String(minutos || 0).padStart(2, "0")}`;
  }

  calcularHoraFin(horaInicio) {
    const [horas, minutos] = horaInicio.split(":").map(Number);
    const horaFin = horas + 1;
    return `${String(horaFin).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
  }

  /**
   * ✅ CORREGIDO: Maneja formato ISO completo del backend (1970-01-01T06:00:00.000Z)
   */
  formatHoraDesdeAPI(hora) {
    if (!hora || typeof hora !== 'string') {
      return '9:00 am';
    }

    try {
      const horaLimpia = hora.trim();

      // Si viene en formato ISO completo (1970-01-01T06:00:00.000Z)
      if (horaLimpia.includes('T')) {
        const fecha = new Date(horaLimpia);
        if (isNaN(fecha.getTime())) {
          return '9:00 am';
        }

        // Extraer solo las horas y minutos UTC
        const horas = fecha.getUTCHours();
        const minutos = fecha.getUTCMinutes();
        const isPM = horas >= 12;
        let horas12 = horas === 0 ? 12 : (horas > 12 ? horas - 12 : horas);
        return `${horas12}:${String(minutos).padStart(2, '0')} ${isPM ? 'pm' : 'am'}`;
      }

      // Si viene en formato HH:MM o HH:MM:SS
      const match = horaLimpia.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!match) {
        return '9:00 am';
      }

      const horas = parseInt(match[1], 10);
      const minutos = parseInt(match[2], 10);

      if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
        return '9:00 am';
      }

      const isPM = horas >= 12;
      let horas12 = horas === 0 ? 12 : (horas > 12 ? horas - 12 : horas);

      return `${horas12}:${String(minutos).padStart(2, '0')} ${isPM ? 'pm' : 'am'}`;
    } catch (error) {
      console.error("❌ Error al formatear hora:", error);
      return '9:00 am';
    }
  }

  /**
   * ✅ CORRECCIÓN CRÍTICA: Transformar correctamente la estructura del backend
   * Backend usa: id_cita, id_persona, id_inmueble, etc.
   * Frontend necesita: id como alias de id_cita
   */
  transformarCitaDesdeAPI(citaAPI) {
    return {
      // ✅ Usar id_cita del backend, pero también crear alias 'id' para el frontend
      id: citaAPI.id_cita || citaAPI.id,
      id_cita: citaAPI.id_cita || citaAPI.id,
      
      // Estado
      estado: citaAPI.estado?.nombre_estado?.toLowerCase() || 
              this.mapIdToEstado(citaAPI.id_estado_cita),
      id_estado_cita: citaAPI.id_estado_cita,
      
      // IDs de relaciones
      id_persona: citaAPI.id_persona,
      id_inmueble: citaAPI.id_inmueble,
      id_servicio: citaAPI.id_servicio,
      id_agente_asignado: citaAPI.id_agente_asignado,
      id_cita_original: citaAPI.id_cita_original,
      
      // Datos de la cita
      fecha_cita: citaAPI.fecha_cita,
      hora_inicio: citaAPI.hora_inicio,
      hora_fin: citaAPI.hora_fin,
      observaciones: citaAPI.observaciones,
      motivo_cancelacion: citaAPI.motivo_cancelacion,
      
      // Fechas de auditoría
      fecha_creacion: citaAPI.fecha_creacion,
      fecha_actualizacion: citaAPI.fecha_actualizacion,
      
      // Objetos relacionados
      cliente: citaAPI.cliente,
      inmueble: citaAPI.inmueble,
      servicio: citaAPI.servicio,
      agente: citaAPI.agente,
      creador: citaAPI.creador,
      estado_detalle: citaAPI.estado
    };
  }

  /**
   * Obtener lista de agentes disponibles para asignación
   * @returns {Promise<Array>} Lista de agentes disponibles
   */
  async obtenerAgentesDisponibles() {
    try {
      console.log("🔍 Obteniendo agentes disponibles para asignación");

      const response = await apiClient.get('/citas/agentes-disponibles');
      const agentes = response.data.data || response.data;

      if (!Array.isArray(agentes)) {
        throw new Error("Formato de respuesta inválido para agentes disponibles");
      }

      console.log(`✅ ${agentes.length} agentes disponibles obtenidos`);
      return agentes;
    } catch (error) {
      console.error("❌ Error al obtener agentes disponibles:", error);
      throw new Error(error.message || "Error al cargar los agentes disponibles");
    }
  }

  /**
   * Asignar un agente a una cita
   * @param {number} idCita - ID de la cita
   * @param {number} idAgenteNuevo - ID del agente a asignar
   * @param {string} comentario - Comentario obligatorio para reasignaciones
   * @returns {Promise<Object>} Cita actualizada con historial
   */
  async asignarAgente(idCita, idAgenteNuevo, comentario = null) {
    try {
      if (!idCita) throw new Error("ID de cita es requerido");
      if (!idAgenteNuevo) throw new Error("ID de agente es requerido");

      console.log(`🔄 Asignando agente ${idAgenteNuevo} a cita ${idCita}`);

      const payload = {
        id_agente_nuevo: idAgenteNuevo,
        comentario: comentario
      };

      const response = await apiClient.post(`/citas/${idCita}/asignar-agente`, payload);

      console.log("📥 Respuesta del backend al asignar agente:", response.data);

      const citaActualizada = response.data.data || response.data;
      return this.transformarCitaDesdeAPI(citaActualizada);
    } catch (error) {
      console.error("❌ Error al asignar agente:", error);
      throw new Error(error.message || "Error al asignar el agente a la cita");
    }
  }

  /**
   * Obtener historial de asignaciones de una cita
   * @param {number} idCita - ID de la cita
   * @returns {Promise<Array>} Historial de asignaciones
   */
  async obtenerHistorialAsignaciones(idCita) {
    try {
      if (!idCita) throw new Error("ID de cita es requerido");

      console.log(`🔍 Obteniendo historial de asignaciones para cita ${idCita}`);

      const response = await apiClient.get(`/citas/${idCita}/historial-asignaciones`);
      const historial = response.data.data || response.data;

      if (!Array.isArray(historial)) {
        throw new Error("Formato de respuesta inválido para historial de asignaciones");
      }

      console.log(`✅ Historial de asignaciones obtenido: ${historial.length} registros`);
      return historial;
    } catch (error) {
      console.error("❌ Error al obtener historial de asignaciones:", error);
      throw new Error(error.message || "Error al cargar el historial de asignaciones");
    }
  }

  /**
   * Obtener cita con historial completo de asignaciones
   * @param {number} idCita - ID de la cita
   * @returns {Promise<Object>} Cita con historial incluido
   */
  async obtenerCitaConHistorial(idCita) {
    try {
      if (!idCita) throw new Error("ID de cita es requerido");

      console.log(`🔍 Obteniendo cita ${idCita} con historial completo`);

      const response = await apiClient.get(`/citas/${idCita}/con-historial`);
      const citaCompleta = response.data.data || response.data;

      const citaTransformada = this.transformarCitaDesdeAPI(citaCompleta);
      citaTransformada.historial_asignaciones = citaCompleta.historial_asignaciones || [];

      console.log(`✅ Cita con historial obtenida`);
      return citaTransformada;
    } catch (error) {
      console.error("❌ Error al obtener cita con historial:", error);
      throw new Error(error.message || "Error al cargar la cita con historial");
    }
  }
}

const citaApiService = new CitaApiService();
export default citaApiService;

/**
 * ✅ CORREGIDO: Función optimizada para cambiar solo el estado
 */
export const actualizarEstadoCita = async (idCita, idEstadoCita) => {
  try {
    console.log(`🔄 Actualizando estado de cita ${idCita} a estado ${idEstadoCita} (endpoint optimizado)`);
    
    const response = await apiClient.patch(`/citas/${idCita}/estado`, {
      id_estado_cita: idEstadoCita
    });

    console.log("📥 Respuesta del servidor:", response.data);

    // Estructura: { success, message, data: {...} }
    const citaActualizada = response.data.data || response.data;
    
    if (!citaActualizada || (!citaActualizada.id_cita && !citaActualizada.id)) {
      throw new Error("El servidor no retornó datos válidos de la cita actualizada");
    }

    console.log("✅ Estado actualizado correctamente");
    return citaApiService.transformarCitaDesdeAPI(citaActualizada);
  } catch (error) {
    console.error("❌ Error en actualizarEstadoCita:", error);
    throw error;
  }
};
