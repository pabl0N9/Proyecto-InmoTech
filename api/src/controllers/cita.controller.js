const citaService = require('../services/cita.service');
const personaService = require('../services/persona.service');
const { isSuperAdministrator } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');
const { Persona } = require('../models');

class CitaController {
  async crearCita(req, res, next) {
    try {
      const data = req.body;
      const nuevaCita = await citaService.crearCita(data);
      return res.status(201).json({ success: true, data: nuevaCita });
    } catch (error) {
      if (error.message.includes('Ya existe una cita')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
  async obtenerCitas(req, res, next) {
    try {
      const filtros = {};

      if (req.query.estado) {
        const estadoParsed = parseInt(req.query.estado);
        if (!isNaN(estadoParsed)) {
          filtros.id_estado_cita = estadoParsed;
        }
      }

      if (req.query.fecha) {
        filtros.fecha_cita = req.query.fecha;
      }

      if (req.query.agente) {
        const agenteParsed = parseInt(req.query.agente);
        if (!isNaN(agenteParsed)) {
          filtros.id_agente_asignado = agenteParsed;
        }
      }

      // ✅ OPTIMIZACIÓN: Agregar paginación para listas grandes con validación
      const pageValue = req.query.page ? parseInt(req.query.page) : 1;
      const limitValue = req.query.limit ? parseInt(req.query.limit) : 50;
      const page = (!isNaN(pageValue) && pageValue > 0) ? pageValue : 1;
      const limit = (!isNaN(limitValue) && limitValue > 0) ? limitValue : 50;
      filtros.page = page;
      filtros.limit = limit;

      const result = await citaService.obtenerTodasLasCitas(filtros);

      return res.status(200).json({
        success: true,
        message: 'Citas obtenidas exitosamente',
        data: result.citas || result,
        total: Array.isArray(result) ? result.length : result.total,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerCitaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      // Validar que el ID sea un número válido y no NaN
      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const cita = await citaService.obtenerCitaPorId(parsedId);

      if (!cita) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cita obtenida exitosamente',
        data: cita
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmarCita(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const { id_agente_asignado } = req.validatedData;

      const cita = await citaService.confirmarCita(parsedId, id_agente_asignado);

      return res.status(200).json({
        success: true,
        message: 'Cita confirmada exitosamente',
        data: cita
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelarCita(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const { motivo_cancelacion } = req.validatedData;

      const cita = await citaService.cancelarCita(parsedId, motivo_cancelacion);

      return res.status(200).json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: cita
      });
    } catch (error) {
      next(error);
    }
  }

  async reagendarCita(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const { fecha_cita, hora_inicio, hora_fin } = req.validatedData;

      const cita = await citaService.reagendarCita(parsedId, {
        fecha_cita,
        hora_inicio,
        hora_fin,
        motivo_reagendamiento,
        id_agente_asignado: idAgenteFinal,
        id_usuario_realizo: req.user.id_persona
      });

      return res.status(200).json({
        success: true,
        message: 'Cita reagendada exitosamente',
        data: cita
      });
    } catch (error) {
      next(error);
    }
  }

  async completarCita(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const cita = await citaService.completarCita(parsedId);

      return res.status(200).json({
        success: true,
        message: 'Cita completada exitosamente',
        data: cita
      });
    } catch (error) {
      next(error);
    }
  }

  async actualizarCita(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const cita = await citaService.actualizarCita(parsedId, req.validatedData);

      return res.status(200).json({
        success: true,
        message: 'Cita actualizada exitosamente',
        data: cita
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarCita(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const cita = await citaService.eliminarCita(parsedId);

      return res.status(200).json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: cita
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ✅ ENDPOINT OPTIMIZADO: Actualizar solo el estado de la cita
   * Reduce el tiempo de respuesta de ~1 segundo a ~50-100ms
   */
  async actualizarEstadoCita(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const { id_estado_cita } = req.validatedData;

      logger.info(`🔄 Actualizando estado de cita ${parsedId} a ${id_estado_cita} (endpoint optimizado)`);

      const resultado = await citaService.actualizarEstadoCitaOptimizado(parsedId, id_estado_cita);

      return res.status(200).json({
        success: true,
        message: 'Estado de cita actualizado exitosamente',
        data: resultado
      });
    } catch (error) {
      logger.error(`❌ Error en actualizarEstadoCita: ${error.message}`);
      next(error);
    }
  }

  async buscarPersonaPorDocumento(req, res, next) {
    try {
      const { tipo_documento, numero_documento } = req.query;

      if (!tipo_documento || !numero_documento) {
        return res.status(400).json({
          success: false,
          message: 'Tipo y número de documento son requeridos'
        });
      }

      const persona = await Persona.findOne({
        where: {
          tipo_documento: tipo_documento.toUpperCase(),
          numero_documento: numero_documento.replace(/[\s\-\.]/g, '')
        }
      });

      if (!persona) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }

      res.json({
        success: true,
        data: {
          primer_nombre: persona.primer_nombre,
          segundo_nombre: persona.segundo_nombre,
          primer_apellido: persona.primer_apellido,
          segundo_apellido: persona.segundo_apellido,
          telefono: persona.telefono,
          correo: persona.correo
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar agente a una cita
   * Endpoint: POST /api/v1/citas/:id/asignar-agente
   */
  async asignarAgente(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const { id_agente_nuevo, comentario } = req.validatedData;
      const idUsuarioRealizo = req.user.id; // ✅ Corregido: usar req.user.id en lugar de req.user.id_persona

      logger.info(`🔄 Asignando agente ${id_agente_nuevo} a cita ${parsedId} por usuario ${idUsuarioRealizo}`);

      const citaActualizada = await citaService.asignarAgente(
        parsedId,
        id_agente_nuevo,
        idUsuarioRealizo,
        comentario
      );

      return res.status(200).json({
        success: true,
        message: 'Agente asignado exitosamente',
        data: citaActualizada
      });
    } catch (error) {
      logger.error(`❌ Error asignando agente a cita ${req.params.id}: ${error.message}`);
      next(error);
    }
  }

  /**
   * Obtener agentes disponibles para asignación
   * Endpoint: GET /api/v1/citas/agentes-disponibles
   */
  async obtenerAgentesDisponibles(req, res, next) {
    try {
      logger.info(`🔍 Obteniendo agentes disponibles`);

      const agentes = await citaService.obtenerAgentesDisponibles();

      return res.status(200).json({
        success: true,
        message: 'Agentes disponibles obtenidos exitosamente',
        data: agentes
      });
    } catch (error) {
      logger.error(`❌ Error obteniendo agentes disponibles: ${error.message}`);
      next(error);
    }
  }

  /**
   * Obtener historial de asignaciones de una cita
   * Endpoint: GET /api/v1/citas/:id/historial-asignaciones
   */
  async obtenerHistorialAsignaciones(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const idUsuario = req.user.id; // ✅ Corregido: usar req.user.id en lugar de req.user.id_persona

      logger.info(`🔍 Obteniendo historial de asignaciones para cita ${parsedId}`);

      const historial = await citaService.obtenerHistorialAsignaciones(parsedId);

      return res.status(200).json({
        success: true,
        message: 'Historial de asignaciones obtenido exitosamente',
        data: historial
      });
    } catch (error) {
      logger.error(`❌ Error obteniendo historial de cita ${req.params.id}: ${error.message}`);
      next(error);
    }
  }

  /**
   * Obtener cita con historial completo
   * Endpoint: GET /api/v1/citas/:id/con-historial
   */
  async obtenerCitaConHistorial(req, res, next) {
    try {
      const { id } = req.params;
      const parsedId = parseInt(id);

      if (!id || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de cita inválido'
        });
      }

      const idUsuario = req.user.id; // ✅ Corregido: usar req.user.id en lugar de req.user.id_persona

      logger.info(`🔍 Obteniendo cita ${parsedId} con historial completo`);

      const cita = await citaService.obtenerCitaConHistorial(parsedId);

      return res.status(200).json({
        success: true,
        message: 'Cita con historial obtenida exitosamente',
        data: cita
      });
    } catch (error) {
      logger.error(`❌ Error obteniendo cita con historial ${req.params.id}: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new CitaController();
