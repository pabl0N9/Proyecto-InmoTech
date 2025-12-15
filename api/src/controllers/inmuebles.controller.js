const inmueblesService = require('../services/inmuebles.service');
const logger = require('../utils/logger');

class InmueblesController {
  /**
   * Crear un nuevo inmueble
   */
  async crearInmueble(req, res, next) {
    try {
      const inmuebleData = req.validatedData;
      const userId = req.user.id;

      const inmueble = await inmueblesService.crearInmueble(inmuebleData, userId);

      return res.status(201).json({
        success: true,
        message: 'Inmueble creado exitosamente',
        data: inmueble
      });
    } catch (error) {
      logger.error('Error creando inmueble:', error);
      next(error);
    }
  }

  /**
<<<<<<< HEAD
=======
   * Obtener inmueble público por ID (sin auth)
   */
  async obtenerInmueblePublic(req, res, next) {
    try {
      const { id } = req.params;
      const inmueble = await inmueblesService.obtenerPorId(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Inmueble obtenido exitosamente',
        data: inmueble
      });
    } catch (error) {
      logger.error('Error obteniendo inmueble público:', error);
      next(error);
    }
  }

  /**
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
   * Listar inmuebles con filtros
   */
  async listarInmuebles(req, res, next) {
    try {
      const filtros = req.query;
      const opciones = {
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 20,
        ordenarPor: req.query.ordenar_por || 'id_inmueble',
        orden: req.query.orden || 'DESC'
      };

      const resultado = await inmueblesService.listarInmuebles(filtros, opciones);

      return res.status(200).json({
        success: true,
        message: 'Inmuebles listados exitosamente',
        data: resultado
      });
    } catch (error) {
      logger.error('Error listando inmuebles:', error);
      next(error);
    }
  }

  /**
   * Obtener inmueble por ID
   */
  async obtenerInmueble(req, res, next) {
    try {
      const { id } = req.params;
      const inmueble = await inmueblesService.obtenerPorId(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Inmueble obtenido exitosamente',
        data: inmueble
      });
    } catch (error) {
      logger.error('Error obteniendo inmueble:', error);
      next(error);
    }
  }

  /**
<<<<<<< HEAD
=======
   * Obtener inmueble por registro inmobiliario
   */
  async obtenerInmueblePorRegistro(req, res, next) {
    try {
      const { registro } = req.params;
      const inmueble = await inmueblesService.obtenerPorRegistro(registro);

      return res.status(200).json({
        success: true,
        message: 'Inmueble obtenido exitosamente',
        data: inmueble
      });
    } catch (error) {
      logger.error('Error obteniendo inmueble por registro:', error);
      next(error);
    }
  }

  /**
   * Obtener inmueble público por registro (sin auth)
   */
  async obtenerInmueblePublicPorRegistro(req, res, next) {
    try {
      const { registro } = req.params;
      const inmueble = await inmueblesService.obtenerPorRegistro(registro);

      return res.status(200).json({
        success: true,
        message: 'Inmueble obtenido exitosamente',
        data: inmueble
      });
    } catch (error) {
      logger.error('Error obteniendo inmueble público por registro:', error);
      next(error);
    }
  }

  /**
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
   * Obtener disponibilidad horaria de un inmueble
   */
  async obtenerDisponibilidad(req, res, next) {
    try {
      const { id } = req.params;
      const { fecha } = req.query;

      if (!fecha) {
        return res.status(400).json({
          success: false,
          message: 'La fecha es requerida'
        });
      }

      const disponibilidad = await inmueblesService.obtenerDisponibilidad(parseInt(id), fecha);

      return res.status(200).json({
        success: true,
        message: 'Disponibilidad obtenida exitosamente',
        data: disponibilidad
      });
    } catch (error) {
      logger.error('Error obteniendo disponibilidad:', error);
      next(error);
    }
  }

  /**
   * Actualizar inmueble
   */
  async actualizarInmueble(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;

      const inmueble = await inmueblesService.actualizarInmueble(parseInt(id), updateData);

      return res.status(200).json({
        success: true,
        message: 'Inmueble actualizado exitosamente',
        data: inmueble
      });
    } catch (error) {
      logger.error('Error actualizando inmueble:', error);
      next(error);
    }
  }

  /**
   * Eliminar inmueble (lógicamente)
   */
  async eliminarInmueble(req, res, next) {
    try {
      const { id } = req.params;

      await inmueblesService.eliminarInmueble(parseInt(id));

      return res.status(200).json({
        success: true,
        message: 'Inmueble eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando inmueble:', error);
      next(error);
    }
  }

  /**
   * Buscar inmuebles por criterios
   */
  async buscarInmuebles(req, res, next) {
    try {
      const {
        ciudad,
        precio_min,
        precio_max,
        area_min,
        categoria,
        pagina = 1,
        limite = 20
      } = req.query;

      const filtros = {
        ciudad,
        precio_min: precio_min ? parseFloat(precio_min) : undefined,
        precio_max: precio_max ? parseFloat(precio_max) : undefined,
        area_min: area_min ? parseFloat(area_min) : undefined,
<<<<<<< HEAD
        categoria
=======
        categoria,
        estado: true
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      };

      const opciones = {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        ordenarPor: 'id_inmueble',
        orden: 'DESC'
      };

      const resultado = await inmueblesService.listarInmuebles(filtros, opciones);

      return res.status(200).json({
        success: true,
        message: 'Búsqueda de inmuebles completada',
        data: resultado
      });
    } catch (error) {
      logger.error('Error buscando inmuebles:', error);
      next(error);
    }
  }
}

module.exports = new InmueblesController();
