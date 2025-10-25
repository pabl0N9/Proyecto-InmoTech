const citaService = require('../services/cita.service');
const personaService = require('../services/persona.service');
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
        filtros.id_estado_cita = parseInt(req.query.estado);
      }

      if (req.query.fecha) {
        filtros.fecha_cita = req.query.fecha;
      }

      if (req.query.agente) {
        filtros.id_agente_asignado = parseInt(req.query.agente);
      }

      const citas = await citaService.obtenerTodasLasCitas(filtros);

      return res.status(200).json({
        success: true,
        message: 'Citas obtenidas exitosamente',
        data: citas,
        total: citas.length
      });
    } catch (error) {
      next(error);
    }
  }

  async obtenerCitaPorId(req, res, next) {
    try {
      const { id } = req.params;
      const cita = await citaService.obtenerCitaPorId(parseInt(id));

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
      const { id_agente_asignado } = req.validatedData;

      const cita = await citaService.confirmarCita(parseInt(id), id_agente_asignado);

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
      const { motivo_cancelacion } = req.validatedData;

      const cita = await citaService.cancelarCita(parseInt(id), motivo_cancelacion);

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
      const { fecha_cita, hora_inicio, hora_fin } = req.validatedData;

      const cita = await citaService.reagendarCita(parseInt(id), {
        fecha_cita,
        hora_inicio,
        hora_fin
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
      const cita = await citaService.completarCita(parseInt(id));

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
      const cita = await citaService.actualizarCita(parseInt(id), req.validatedData);

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
      const cita = await citaService.eliminarCita(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: cita
      });
    } catch (error) {
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
}

module.exports = new CitaController();
