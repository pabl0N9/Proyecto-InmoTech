/**
 * Servicio frontend para interactuar con el endpoint de Citas.
 */
import { apiClient } from "./api.config";
import { formatTimeTo12Hour, formatTimeTo24Hour } from "../utils/time";

const SERVICIO_MAP = {
  "Visita a Propiedad": 1,
  "Avaluos": 2,
  "Gestion de Alquileres": 3,
  "Asesoria Legal": 4,
};

const ESTADO_TO_ID_MAP = {
  solicitada: 1,
  confirmada: 2,
  programada: 3,
  "re agendada": 4,
  reagendada: 4,
  completada: 5,
  cancelada: 6,
};

const ID_TO_ESTADO_MAP = {
  1: "solicitada",
  2: "confirmada",
  3: "programada",
  4: "re agendada",
  5: "completada",
  6: "cancelada",
};

const generarHorariosBase = () => {
  const horarios = [];
  for (let hora = 8; hora <= 17; hora++) {
    horarios.push(`${hora.toString().padStart(2, "0")}:00`);
    if (hora < 17) {
      horarios.push(`${hora.toString().padStart(2, "0")}:30`);
    }
  }
  return horarios;
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

      const citas = Array.isArray(response.data) ? response.data : response.data?.data;
      if (!Array.isArray(citas)) {
        throw new Error("Formato de respuesta invalido del servidor");
      }

      return citas.map(cita => this.transformarCitaDesdeAPI(cita));
    } catch (error) {
      console.error("Error al obtener citas:", error);
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
        hora_inicio: this.formatHoraParaAPI(citaData.hora_inicio || "09:00"),
        hora_fin: this.formatHoraParaAPI(citaData.hora_fin || "10:00"),
        id_estado_cita: citaData.id_estado_cita || 1,
        id_agente_asignado: citaData.id_agente_asignado || null,
        observaciones: citaData.observaciones || null,
        id_usuario_creador: userId || citaData.id_usuario_creador || null,
      };

      console.log("Enviando nueva cita al backend:", payload);

      const response = await apiClient.post("/citas", payload);
      const citaCreada = response.data?.data || response.data;

      return this.transformarCitaDesdeAPI(citaCreada);
    } catch (error) {
      console.error("Error al crear cita:", error);
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
        hora_inicio: this.formatHoraParaAPI(citaData.hora_inicio || "09:00"),
        hora_fin: this.formatHoraParaAPI(citaData.hora_fin || "10:00"),
        observaciones: citaData.observaciones || null,
        id_estado_cita: this.mapEstadoToId(citaData.estado) || citaData.id_estado_cita || 1,
      };

      console.log("Enviando actualizacion al backend:", { id, payload });

      const response = await apiClient.put(`/citas/${id}`, payload);
      const citaActualizada = response.data?.data || response.data;

      if (!citaActualizada || (!citaActualizada.id_cita && !citaActualizada.id)) {
        throw new Error("El servidor no retorno datos validos de la cita actualizada");
      }

      console.log("Cita actualizada correctamente:", citaActualizada);
      return this.transformarCitaDesdeAPI(citaActualizada);
    } catch (error) {
      console.error("Error en actualizarCita:", error);
      throw new Error(error.message || "Error al actualizar la cita");
    }
  }

  async eliminarCita(id) {
    try {
      if (!id) throw new Error("ID de cita es requerido");
      await apiClient.delete(`/citas/${id}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      throw new Error(error.message || "Error al eliminar la cita");
    }
  }

  async confirmarCita(id, id_agente_asignado) {
    try {
      if (!id) throw new Error("ID de cita es requerido");
      if (!id_agente_asignado) throw new Error("ID de agente es requerido");

      console.log("Confirmando cita:", { id, id_agente_asignado });

      const response = await apiClient.post(`/citas/${id}/confirmar`, {
        id_agente_asignado,
      });

      const citaConfirmada = response.data?.data || response.data;
      return this.transformarCitaDesdeAPI(citaConfirmada);
    } catch (error) {
      console.error("Error al confirmar cita:", error);
      throw new Error(error.message || "Error al confirmar la cita");
    }
  }

  async cancelarCita(id, motivo_cancelacion) {
    try {
      if (!id) throw new Error("ID de cita es requerido");
      if (!motivo_cancelacion || motivo_cancelacion.trim().length < 10) {
        throw new Error("El motivo de cancelacion es requerido y debe tener al menos 10 caracteres");
      }

      console.log("Cancelando cita:", { id, motivo_cancelacion });

      const response = await apiClient.post(`/citas/${id}/cancelar`, {
        motivo_cancelacion: motivo_cancelacion.trim(),
      });

      const citaCancelada = response.data?.data || response.data;
      return this.transformarCitaDesdeAPI(citaCancelada);
    } catch (error) {
      console.error("Error al cancelar cita:", error);
      throw new Error(error.message || "Error al cancelar la cita");
    }
  }

  async reagendarCita(id, datosReagendamiento) {
    try {
      if (!id) throw new Error("ID de cita es requerido");
      this.validarDatosReagendamiento(datosReagendamiento);

      const payload = {
        fecha_cita: datosReagendamiento.fecha_cita,
        hora_inicio: this.formatHoraParaAPI(datosReagendamiento.hora_inicio || "09:00"),
        hora_fin: this.formatHoraParaAPI(datosReagendamiento.hora_fin || "10:00"),
        motivo_reagendamiento: datosReagendamiento.motivo_reagendamiento,
        id_agente_asignado: datosReagendamiento.id_agente_asignado,
      };

      console.log("Reagendando cita:", { id, payload });

      const response = await apiClient.put(`/citas/${id}/reagendar`, payload);
      const citaReagendada = response.data?.data || response.data;

      return this.transformarCitaDesdeAPI(citaReagendada);
    } catch (error) {
      console.error("Error al reagendar cita:", error);
      throw new Error(error.message || "Error al reagendar la cita");
    }
  }

  // ===========================
  // Validaciones
  // ===========================

  validarDatosCita(citaData) {
    const camposRequeridos = {
      nombre_completo: "Nombre completo",
      apellido_completo: "Apellido completo",
      numero_documento: "Numero de documento",
      telefono: "Telefono",
      fecha_cita: "Fecha de la cita",
      hora_inicio: "Hora de inicio",
    };

    for (const [campo, etiqueta] of Object.entries(camposRequeridos)) {
      if (!citaData[campo] || String(citaData[campo]).trim() === "") {
        throw new Error(`${etiqueta} es requerido`);
      }
    }

    if (citaData.numero_documento && !/^[0-9]+$/.test(citaData.numero_documento)) {
      throw new Error("El numero de documento debe contener solo numeros");
    }

    if (citaData.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(citaData.email)) {
      throw new Error("El formato del correo electronico es invalido");
    }

    if (citaData.telefono) {
      const telefonoLimpio = citaData.telefono.replace(/\\D/g, "");
      if (telefonoLimpio.length < 10) {
        throw new Error("El telefono debe tener al menos 10 digitos");
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

    if (
      !datosReagendamiento.motivo_reagendamiento ||
      datosReagendamiento.motivo_reagendamiento.trim().length < 10
    ) {
      throw new Error("El motivo de reagendamiento es obligatorio y debe tener al menos 10 caracteres");
    }

    if (!datosReagendamiento.id_agente_asignado) {
      throw new Error("El agente asignado es obligatorio");
    }
  }

  // ===========================
  // Mapeos
  // ===========================

  mapServicioToId(servicio) {
    return SERVICIO_MAP[servicio] || 1;
  }

  mapEstadoToId(estado) {
    return ESTADO_TO_ID_MAP[estado?.toLowerCase()] || 1;
  }

  mapIdToEstado(id) {
    return ID_TO_ESTADO_MAP[id] || "solicitada";
  }

  mapTipoDocumentoToShort(tipo) {
    const map = {
      "Cedula de Ciudadania": "CC",
      "Cedula de Extranjeria": "CE",
      NIT: "NIT",
      Pasaporte: "Pasaporte",
      "Tarjeta de Identidad": "TI",
    };
    return map[tipo] || tipo;
  }

  // ===========================
  // Helpers de telefono
  // ===========================

  limpiarTelefono(telefono) {
    if (!telefono) return "";
    const limpio = telefono.replace(/\\D/g, "");
    if (limpio.startsWith("57") && limpio.length === 12) {
      return limpio.slice(2);
    }
    return limpio;
  }

  formatearTelefono(telefono) {
    const limpio = telefono.replace(/\\D/g, "");
    if (limpio.length === 10) {
      return `(${limpio.slice(0, 3)}) ${limpio.slice(3, 6)}-${limpio.slice(6)}`;
    }
    return telefono;
  }

  // ===========================
  // Helpers de horas
  // ===========================

  formatHoraParaAPI(hora) {
    if (!hora) return "09:00";

    const horaLimpia = hora.toLowerCase().replace(/\\s+/g, "");
    const isPM = horaLimpia.includes("pm");
    const isAM = horaLimpia.includes("am");

    let [horas, minutos] = horaLimpia.replace(/am|pm/g, "").split(":").map(Number);

    if (isPM && horas !== 12) horas += 12;
    if (isAM && horas === 12) horas = 0;

    return `${String(horas).padStart(2, "0")}:${String(minutos || 0).padStart(2, "0")}`;
  }

  calcularHoraFin(horaInicio) {
    const [horas, minutos] = horaInicio.split(":").map(Number);
    let horaFin = horas;
    let minutosFin = minutos + 30; // Citas de 30 minutos

    if (minutosFin >= 60) {
      horaFin += 1;
      minutosFin = 0;
    }

    return `${String(horaFin).padStart(2, "0")}:${String(minutosFin).padStart(2, "0")}`;
  }

  formatHoraDesdeAPI(hora) {
    if (!hora || typeof hora !== "string") {
      return "9:00 am";
    }

    try {
      const horaLimpia = hora.trim();
      console.log("Formateando hora:", horaLimpia);

      if (horaLimpia.includes("T")) {
        const fecha = new Date(horaLimpia);

        if (Number.isNaN(fecha.getTime())) {
          console.warn("Hora ISO invalida:", horaLimpia);
          return "9:00 am";
        }

        const colombia24 = formatTimeTo24Hour(horaLimpia);
        if (colombia24) {
          const [horasColombia, minutosColombia] = colombia24.split(":").map(value => parseInt(value, 10));
          console.log(`Hora UTC: ${fecha.getUTCHours()}:${fecha.getUTCMinutes()} -> Hora Colombia: ${horasColombia}:${minutosColombia}`);
        }
      }

      const horaFormateada = formatTimeTo12Hour(horaLimpia);
      if (horaFormateada) {
        return horaFormateada;
      }

      console.warn("Formato de hora no reconocido:", horaLimpia);
      return "9:00 am";
    } catch (error) {
      console.error("Error critico al formatear hora:", error, "Hora original:", hora);
      return "9:00 am";
    }
  }

  /**
   * Ajusta la estructura de la cita que retorna el backend a lo que consume el frontend.
   */
  transformarCitaDesdeAPI(citaAPI) {
    return {
      id: citaAPI.id_cita || citaAPI.id,
      id_cita: citaAPI.id_cita || citaAPI.id,

      estado: citaAPI.estado?.nombre_estado?.toLowerCase() || this.mapIdToEstado(citaAPI.id_estado_cita),
      id_estado_cita: citaAPI.id_estado_cita,

      id_persona: citaAPI.id_persona,
      id_inmueble: citaAPI.id_inmueble,
      id_servicio: citaAPI.id_servicio,
      id_agente_asignado: citaAPI.id_agente_asignado,
      id_cita_original: citaAPI.id_cita_original,

      fecha_cita: citaAPI.fecha_cita,
      hora_inicio: citaAPI.hora_inicio,
      hora_fin: citaAPI.hora_fin,
      observaciones: citaAPI.observaciones,
      motivo_cancelacion: citaAPI.motivo_cancelacion,

      fecha_creacion: citaAPI.fecha_creacion,
      fecha_actualizacion: citaAPI.fecha_actualizacion,

      ediciones_realizadas: citaAPI.ediciones_realizadas || 0,
      ediciones_maximas: citaAPI.ediciones_maximas || 2,

      cliente: citaAPI.cliente,
      inmueble: citaAPI.inmueble,
      servicio: citaAPI.servicio,
      agente: citaAPI.agente,
      creador: citaAPI.creador,
      estado_detalle: citaAPI.estado,
    };
  }

  async obtenerAgentesDisponibles() {
    try {
      console.log("Obteniendo agentes disponibles para asignacion");

      const response = await apiClient.get("/citas/agentes-disponibles");
      const agentes = response.data?.data || response.data;

      if (!Array.isArray(agentes)) {
        throw new Error("Formato de respuesta invalido para agentes disponibles");
      }

      return agentes;
    } catch (error) {
      console.error("Error al obtener agentes disponibles:", error);
      throw new Error(error.message || "Error al cargar los agentes disponibles");
    }
  }

  async asignarAgente(idCita, idAgenteNuevo, comentario = null) {
    try {
      if (!idCita) throw new Error("ID de cita es requerido");
      if (!idAgenteNuevo) throw new Error("ID de agente es requerido");

      console.log("Asignando agente a cita:", { idCita, idAgenteNuevo });

      const payload = {
        id_agente_nuevo: idAgenteNuevo,
        comentario,
      };

      const response = await apiClient.post(`/citas/${idCita}/asignar-agente`, payload);
      const citaActualizada = response.data?.data || response.data;

      return this.transformarCitaDesdeAPI(citaActualizada);
    } catch (error) {
      console.error("Error al asignar agente:", error);
      throw new Error(error.message || "Error al asignar el agente a la cita");
    }
  }

  async obtenerHistorialAsignaciones(idCita) {
    try {
      if (!idCita) throw new Error("ID de cita es requerido");

      console.log("Obteniendo historial de asignaciones para cita:", idCita);

      const response = await apiClient.get(`/citas/${idCita}/historial-asignaciones`);
      const historial = response.data?.data || response.data;

      if (!Array.isArray(historial)) {
        throw new Error("Formato de respuesta invalido para historial de asignaciones");
      }

      return historial;
    } catch (error) {
      console.error("Error al obtener historial de asignaciones:", error);
      throw new Error(error.message || "Error al cargar el historial de asignaciones");
    }
  }

  async obtenerCitaConHistorial(idCita) {
    try {
      if (!idCita) throw new Error("ID de cita es requerido");

      console.log("Obteniendo cita con historial completo:", idCita);

      const response = await apiClient.get(`/citas/${idCita}/con-historial`);
      const citaCompleta = response.data?.data || response.data;

      const citaTransformada = this.transformarCitaDesdeAPI(citaCompleta);
      citaTransformada.historial_asignaciones = citaCompleta.historial_asignaciones || [];

      return citaTransformada;
    } catch (error) {
      console.error("Error al obtener cita con historial:", error);
      throw new Error(error.message || "Error al cargar la cita con historial");
    }
  }

  async obtenerHorariosDisponibles(data) {
    try {
      console.log("Obteniendo horarios disponibles (admin):", data);

      if (data.id_servicio === 1 || data.servicio === 1) {
        const citasExistentes = await this.obtenerCitas({
          fecha: data.fecha_cita,
          servicio: 1,
        });

        const todosHorarios = generarHorariosBase();

        const citasActivas = (citasExistentes || []).filter(
          cita =>
            ["confirmada", "programada"].includes(cita.estado) &&
            cita.fecha_cita === data.fecha_cita
        );

        const horariosOcupados = new Set(citasActivas.map(cita => cita.hora_inicio));
        return todosHorarios.filter(hora => !horariosOcupados.has(hora));
      }

      return generarHorariosBase();
    } catch (error) {
      console.error("Error en obtenerHorariosDisponibles:", error);
      return generarHorariosBase();
    }
  }

  async obtenerHorariosDisponiblesUsuario(data) {
    try {
      console.log("Usuario obteniendo horarios disponibles:", data);

      const params = new URLSearchParams();
      params.append("fecha_cita", data.fecha_cita);
      params.append("id_servicio", data.id_servicio);

      const response = await apiClient.get(`/citas/mis-citas/horarios-disponibles?${params.toString()}`);
      const result = response.data?.data || response.data;

      if (!Array.isArray(result)) {
        throw new Error("Formato de respuesta invalido del servidor");
      }

      return result;
    } catch (error) {
      console.error("Error en obtenerHorariosDisponiblesUsuario:", error);
      return generarHorariosBase();
    }
  }

  async reagendarMiCita(id, datosReagendamiento) {
    try {
      if (!id) throw new Error("ID de cita es requerido");

      if (!datosReagendamiento.fecha_cita) {
        throw new Error("La fecha de la cita es obligatoria");
      }
      if (!datosReagendamiento.hora_inicio) {
        throw new Error("La hora de inicio es obligatoria");
      }
      if (
        !datosReagendamiento.motivo_reagendamiento ||
        datosReagendamiento.motivo_reagendamiento.trim().length < 10
      ) {
        throw new Error("El motivo de reagendamiento es obligatorio y debe tener al menos 10 caracteres");
      }

      const horaFinCalculada = datosReagendamiento.hora_fin || this.calcularHoraFin(datosReagendamiento.hora_inicio);

      const payload = {
        fecha_cita: datosReagendamiento.fecha_cita,
        hora_inicio: datosReagendamiento.hora_inicio,
        hora_fin: horaFinCalculada,
        motivo_reagendamiento: datosReagendamiento.motivo_reagendamiento,
      };

      if (datosReagendamiento.id_servicio) {
        payload.id_servicio = datosReagendamiento.id_servicio;
      }
      if (typeof datosReagendamiento.id_agente_asignado !== "undefined") {
        payload.id_agente_asignado = datosReagendamiento.id_agente_asignado;
      }
      if (typeof datosReagendamiento.observaciones !== "undefined") {
        payload.observaciones = datosReagendamiento.observaciones;
      }

      console.log("Reagendando mi cita:", { id, payload });

      const response = await apiClient.put(`/citas/user/${id}/reagendar`, payload);
      const citaReagendada = response.data?.data || response.data;

      return this.transformarCitaDesdeAPI(citaReagendada);
    } catch (error) {
      console.error("Error al reagendar mi cita:", error);
      throw new Error(error.message || "Error al reagendar la cita");
    }
  }

  async obtenerMisCitas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      if (filtros.estado) params.append("estado", filtros.estado);
      if (filtros.fecha) params.append("fecha", filtros.fecha);
      if (filtros.servicio) params.append("servicio", filtros.servicio);

      const endpoint = `/citas/mis-citas${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await apiClient.get(endpoint);

      const data = response.data?.data || response.data;
      if (!Array.isArray(data)) {
        throw new Error("Formato de respuesta invalido del servidor");
      }

      return data.map(cita => this.transformarCitaDesdeAPI(cita));
    } catch (error) {
      console.error("Error al obtener mis citas:", error);
      throw new Error(error.message || "Error al cargar tus citas desde el servidor");
    }
  }
}

const citaApiService = new CitaApiService();
export default citaApiService;

export const actualizarEstadoCita = async (idCita, idEstadoCita) => {
  try {
    console.log(`Actualizando estado de cita ${idCita} a estado ${idEstadoCita}`);

    const response = await apiClient.patch(`/citas/${idCita}/estado`, {
      id_estado_cita: idEstadoCita,
    });

    const citaActualizada = response.data?.data || response.data;
    if (!citaActualizada || (!citaActualizada.id_cita && !citaActualizada.id)) {
      throw new Error("El servidor no retorno datos validos de la cita actualizada");
    }

    console.log("Estado actualizado correctamente");
    return citaApiService.transformarCitaDesdeAPI(citaActualizada);
  } catch (error) {
    console.error("Error en actualizarEstadoCita:", error);
    throw error;
  }
};
