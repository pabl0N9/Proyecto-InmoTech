const service = require('../services/reportesInmobiliarios.service');
const logger = require('../utils/logger');

class ReportesInmobiliariosController {
  async listarReportes(req, res, next) {
    try {
      const data = await service.listarReportes(req.validatedQuery || req.query);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error listarReportes', err);
      next(err);
    }
  }

  async crearReporte(req, res, next) {
    try {
      const userId = req.user?.id;
      const data = await service.crearReporte(req.validatedData, userId);
      return res.status(201).json(data);
    } catch (err) {
      logger.error('Error crearReporte', err);
      next(err);
    }
  }

  async obtenerReporte(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await service.obtenerReporte(id);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error obtenerReporte', err);
      next(err);
    }
  }

  async actualizarReporte(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      const data = await service.actualizarReporte(id, req.validatedData, userId);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error actualizarReporte', err);
      next(err);
    }
  }

  async eliminarReporte(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      await service.eliminarReporte(id);
      return res.status(200).json({ success: true, message: 'Reporte eliminado' });
    } catch (err) {
      logger.error('Error eliminarReporte', err);
      next(err);
    }
  }

  async crearSeguimientoGeneral(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id;
      const data = await service.crearSeguimientoGeneral(id, req.validatedData, userId);
      return res.status(201).json(data);
    } catch (err) {
      logger.error('Error crearSeguimientoGeneral', err);
      next(err);
    }
  }

  async listarSeguimientosGenerales(req, res, next) {
    try {
      const id = req.params.id;
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'ID de reporte inválido' });
      }
      const idNum = parseInt(id, 10);
      const data = await service.listarSeguimientosGenerales(idNum, req.query);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error listarSeguimientosGenerales', err);
      next(err);
    }
  }

  async actualizarSeguimientoGeneral(req, res, next) {
    try {
      const reporteId = parseInt(req.params.reporteId, 10);
      const seguimientoId = parseInt(req.params.seguimientoId, 10);
      const data = await service.actualizarSeguimientoGeneral(reporteId, seguimientoId, req.validatedData);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error actualizarSeguimientoGeneral', err);
      next(err);
    }
  }

  async eliminarSeguimientoGeneral(req, res, next) {
    try {
      const reporteId = parseInt(req.params.reporteId, 10);
      const seguimientoId = parseInt(req.params.seguimientoId, 10);
      await service.eliminarSeguimientoGeneral(reporteId, seguimientoId);
      return res.status(200).json({ success: true, message: 'Seguimiento general eliminado' });
    } catch (err) {
      logger.error('Error eliminarSeguimientoGeneral', err);
      next(err);
    }
  }

  async agregarImagen(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await service.agregarImagen(id, req.validatedData);
      return res.status(201).json(data);
    } catch (err) {
      logger.error('Error agregarImagen', err);
      next(err);
    }
  }

  async eliminarImagen(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const imagenId = parseInt(req.params.imagenId, 10);
      await service.eliminarImagen(id, imagenId);
      return res.status(200).json({ success: true, message: 'Imagen eliminada' });
    } catch (err) {
      logger.error('Error eliminarImagen', err);
      next(err);
    }
  }

  async agregarArchivo(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await service.agregarArchivo(id, req.validatedData);
      return res.status(201).json(data);
    } catch (err) {
      logger.error('Error agregarArchivo', err);
      next(err);
    }
  }

  async eliminarArchivo(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const archivoId = parseInt(req.params.archivoId, 10);
      await service.eliminarArchivo(id, archivoId);
      return res.status(200).json({ success: true, message: 'Archivo eliminado' });
    } catch (err) {
      logger.error('Error eliminarArchivo', err);
      next(err);
    }
  }

  async crearRubro(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await service.crearRubro(id, req.validatedData);
      return res.status(201).json(data);
    } catch (err) {
      logger.error('Error crearRubro', err);
      next(err);
    }
  }

  async listarRubros(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = await service.listarRubros(id);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error listarRubros', err);
      next(err);
    }
  }

  async actualizarRubro(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const rubroId = parseInt(req.params.rubroId, 10);
      const data = await service.actualizarRubro(id, rubroId, req.validatedData);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error actualizarRubro', err);
      next(err);
    }
  }

  async eliminarRubro(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const rubroId = parseInt(req.params.rubroId, 10);
      await service.eliminarRubro(id, rubroId);
      return res.status(200).json({ success: true, message: 'Rubro eliminado' });
    } catch (err) {
      logger.error('Error eliminarRubro', err);
      next(err);
    }
  }

  async crearSeguimientoRubro(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const rubroId = parseInt(req.params.rubroId, 10);
      const userId = req.user?.id;
      const data = await service.crearSeguimientoRubro(id, rubroId, req.validatedData, userId);
      return res.status(201).json(data);
    } catch (err) {
      logger.error('Error crearSeguimientoRubro', err);
      next(err);
    }
  }

  async listarSeguimientosRubro(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const rubroId = parseInt(req.params.rubroId, 10);
      const data = await service.listarSeguimientosRubro(id, rubroId, req.query);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error listarSeguimientosRubro', err);
      next(err);
    }
  }

  async actualizarSeguimientoRubro(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const rubroId = parseInt(req.params.rubroId, 10);
      const seguimientoId = parseInt(req.params.seguimientoId, 10);
      const data = await service.actualizarSeguimientoRubro(id, rubroId, seguimientoId, req.validatedData);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error actualizarSeguimientoRubro', err);
      next(err);
    }
  }

  async obtenerEstadisticas(req, res, next) {
    try {
      const data = await service.obtenerEstadisticas(req.query);
      return res.status(200).json(data);
    } catch (err) {
      logger.error('Error obtenerEstadisticas', err);
      next(err);
    }
  }

  async exportarReportes(req, res, next) {
    try {
      // Stub: devuelve CSV simple por ahora
      const csv = await service.exportarReportes(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="reportes_inmobiliarios.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      logger.error('Error exportarReportes', err);
      next(err);
    }
  }

  async autocompleteInmuebles(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;
      const data = await service.buscarInmueblesAutocomplete(q, parseInt(limit));
      return res.status(200).json({
        success: true,
        message: 'Resultados de autocompletado',
        data
      });
    } catch (err) {
      logger.error('Error autocompleteInmuebles', err);
      next(err);
    }
  }

  async obtenerInmuebleBasico(req, res, next) {
    try {
      const { id } = req.params;
      const result = await service.obtenerInmuebleBasico(parseInt(id));
      const status = result.success ? 200 : 404;
      return res.status(status).json(result);
    } catch (err) {
      logger.error('Error obtenerInmuebleBasico', err);
      next(err);
    }
  }

  async crearInmuebleBasico(req, res, next) {
    try {
      const userId = req.user?.id;
      const result = await service.crearInmuebleBasico(req.validatedData, userId);
      const status = result.success ? 201 : 400;
      return res.status(status).json(result);
    } catch (err) {
      logger.error('Error crearInmuebleBasico', err);
      next(err);
    }
  }
}

module.exports = new ReportesInmobiliariosController();