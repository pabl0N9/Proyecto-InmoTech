/**
 * @fileoverview Servicio frontend para interactuar con el endpoint de Citas
 * @module shared/services/citaApiService
 * @description Cliente HTTP que consume la API REST de citas del backend
 * @author InmoTech Development Team
 * @version 5.0.0 - Adaptado a estructura real del backend con id_cita
 */

import { apiClient } from "./api.config";
import axios from 'axios';
import { formatTimeTo12Hour, formatTimeTo24Hour } from "../utils/time";

const SERVICIO_MAP = {
  "Visita a Propiedad": 1,
  "AvalÃºos": 2,
  "GestiÃ³n de Alquileres": 3,
  "AsesorÃ­a Legal": 4,
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
        throw new Error("Formato de respuesta invÃ¡lido del servidor");
      }

      return citas.map(cita => this.transformarCitaDesdeAPI(cita));
    } catch (error) {
      console.error("â Error al obtener citas:", error);
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
        observaciones: citaData.observaciones || null,
        id_usuario_creador: userId // ✅ Agregado: ID del usuario que crea la cita
      };

      console.log("ð¤ Enviando nueva cita al backend:", payload);

      const response = await apiClient.post("/citas", payload);
      
      console.log("ð¥ Respuesta del backend al crear:", response.data);

      // Manejar estructura: { success, message, data: {...} }
      const citaCreada = response.data.data || response.data;
      return this.transformarCitaDesdeAPI(citaCreada);
    } catch (error) {
      console.error("â Error al crear cita:", error);
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

      console.log("ð¤ Enviando actualizaciÃ³n al backend:", { id, payload });

      const response = await apiClient.put(`/citas/${id}`, payload);
      
      console.log("ð¥ Respuesta del backend:", response.data);

      // Estructura: { success, message, data: {...} }
      const citaActualizada = response.data.data || response.data;
      
      // â CORRECCIÃN CRÃTICA: usar id_cita en lugar de id
      if (!citaActualizada || (!citaActualizada.id_cita && !citaActualizada.id)) {
        console.error("â Respuesta invÃ¡lida del backend:", response.data);
        throw new Error("El servidor no retornÃ³ datos vÃ¡lidos de la cita actualizada");
      }

      console.log("â Cita actualizada correctamente:", citaActualizada);
      return this.transformarCitaDesdeAPI(citaActualizada);
    } catch (error) {
      console.error("â Error en actualizarCita:", error);
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
      console.error("â Error al eliminar cita:", error);
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
      numero_documento: "NÃºmero de documento",
      telefono: "TelÃ©fono",
      fecha_cita: "Fecha de la cita",
      hora_inicio: "Hora de inicio"
    };

    for (const [campo, etiqueta] of Object.entries(camposRequeridos)) {
      if (!citaData[campo] || String(citaData[campo]).trim() === "") {
        throw new Error(`${etiqueta} es requerido`);
      }
    }

    if (citaData.numero_documento && !/^[0-9]+$/.test(citaData.numero_documento)) {
      throw new Error("El nÃºmero de documento debe contener solo nÃºmeros");
    }

    if (citaData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(citaData.email)) {
      throw new Error("El formato del correo electrÃ³nico es invÃ¡lido");
    }

    if (citaData.telefono) {
      const telefonoLimpio = citaData.telefono.replace(/\D/g, "");
      if (telefonoLimpio.length < 10) {
        throw new Error("El telÃ©fono debe tener al menos 10 dÃ­gitos");
      }
    }
  }

  validarDatosReagendamiento(datosReagendamiento) {
    if (!datosReagendamiento.fecha_cita) {
      throw new Error("La fecha de la cita es obligatoria");
    }

    if (!datosReagendamiento.hora_inicio) {
      throw new Error("La hora de inicio es obligatoria");
    }

    if (!datosReagendamiento.motivo_reagendamiento || datosReagendamiento.motivo_reagendamiento.trim().length < 10) {
      throw new Error("El motivo de reagendamiento es obligatorio y debe tener al menos 10 caracteres");
    }

    if (!datosReagendamiento.id_agente_asignado) {
      throw new Error("El agente asignado es obligatorio");
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
      "CÃ©dula de CiudadanÃ­a": "CC",
      "CÃ©dula de ExtranjerÃ­a": "CE",
      "NIT": "NIT",
      "Pasaporte": "Pasaporte",
      "Tarjeta de Identidad": "TI",
    };
    return map[tipo] || tipo;
  }

  // ==========================================
  // HELPERS - TELÃFONO
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
    let horaFin = horas;
    let minutosFin = minutos + 30; // â Citas de 30 minutos

    if (minutosFin >= 60) {
      horaFin += 1;
      minutosFin = 0;
    }

    return `${String(horaFin).padStart(2, "0")}:${String(minutosFin).padStart(2, "0")}`;
  }

  /**
   * ✅ CORREGIDO: Función para zona horaria Colombia (UTC-5)
   * Los TIME fields de SQL Server son interpretados por Sequelize como UTC
   */
  formatHoraDesdeAPI(hora) {
    if (!hora || typeof hora !== 'string') {
      return '9:00 am';
    }

    try {
      const horaLimpia = hora.trim();
      console.log("🔍 Formateando hora:", horaLimpia);

      if (horaLimpia.includes('T')) {
        const fecha = new Date(horaLimpia);

        if (isNaN(fecha.getTime())) {
          console.warn("⚠️ Hora ISO inválida:", horaLimpia);
          return '9:00 am';
        }

        const colombia24 = formatTimeTo24Hour(horaLimpia);
        if (colombia24) {
          const [horasColombia, minutosColombia] = colombia24
            .split(':')
            .map((value) => parseInt(value, 10));
          console.log(`🔄 Hora UTC: ${fecha.getUTCHours()}:${fecha.getUTCMinutes()} → Hora Colombia: ${horasColombia}:${minutosColombia}`);
        }
      }

      const horaFormateada = formatTimeTo12Hour(horaLimpia);
      if (horaFormateada) {
        return horaFormateada;
      }

      console.warn("⚠️ Formato de hora no reconocido:", horaLimpia);
      return '9:00 am';
    } catch (error) {
      console.error("❌ Error crítico al formatear hora:", error, "Hora original:", hora);
      return '9:00 am';
    }
  }

  /**
   * â CORRECCIÃN CRÃTICA: Transformar correctamente la estructura del backend
   * Backend usa: id_cita, id_persona, id_inmueble, etc.
   * Frontend necesita: id como alias de id_cita
   */
  transformarCitaDesdeAPI(citaAPI) {
    return {
      // â Usar id_cita del backend, pero tambiÃ©n crear alias 'id' para el frontend
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
      
      // Fechas de auditorÃ­a
      fecha_creacion: citaAPI.fecha_creacion,
      fecha_actualizacion: citaAPI.fecha_actualizacion,
      
      // Contador de ediciones
      ediciones_realizadas: citaAPI.ediciones_realizadas || 0,
      ediciones_maximas: citaAPI.ediciones_maximas || 2,

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
 * â CORREGIDO: FunciÃ³n optimizada para cambiar solo el estado
 */
export const actualizarEstadoCita = async (idCita, idEstadoCita) => {
  try {
    console.log(`ð Actualizando estado de cita ${idCita} a estado ${idEstadoCita} (endpoint optimizado)`);
    
    const response = await apiClient.patch(`/citas/${idCita}/estado`, {
      id_estado_cita: idEstadoCita
    });

    console.log("ð¥ Respuesta del servidor:", response.data);

    // Estructura: { success, message, data: {...} }
    const citaActualizada = response.data.data || response.data;
    
    if (!citaActualizada || (!citaActualizada.id_cita && !citaActualizada.id)) {
      throw new Error("El servidor no retornÃ³ datos vÃ¡lidos de la cita actualizada");
    }

    console.log("â Estado actualizado correctamente");
    return citaApiService.transformarCitaDesdeAPI(citaActualizada);
  } catch (error) {
    console.error("â Error en actualizarEstadoCita:", error);
    throw error;
  }
};

