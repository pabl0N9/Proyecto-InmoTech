const personasService = require('../services/persona.service');
const logger = require('../utils/logger');

class PersonasController {
  /**
   * Buscar personas por documento
   */
  async buscarPorDocumento(req, res, next) {
    try {
      const { tipo_documento, numero_documento } = req.query;

      if (!tipo_documento || !numero_documento) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de documento y número son requeridos'
        });
      }

      const personas = await personasService.buscarPorDocumento(tipo_documento, numero_documento);

      return res.status(200).json({
        success: true,
        message: 'Personas encontradas exitosamente',
        data: personas
      });
    } catch (error) {
      logger.error('Error buscando personas por documento:', error);
      next(error);
    }
  }

  /**
   * Obtener perfil de la persona autenticada
   */
  async obtenerPerfil(req, res, next) {
    try {
      const personaId = req.user.id;
      const perfil = await personasService.obtenerPerfil(personaId);

      return res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: perfil
      });
    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      next(error);
    }
  }

  /**
   * Actualizar perfil de la persona autenticada
   */
  async actualizarPerfil(req, res, next) {
    try {
      const personaId = req.user.id;
      const updateData = req.validatedData;

      const perfilActualizado = await personasService.actualizarPerfil(personaId, updateData);

      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: perfilActualizado
      });
    } catch (error) {
      logger.error('Error actualizando perfil:', error);
      next(error);
    }
  }

  /**
   * Listar personas con filtros (solo para administradores)
   */
  async listarPersonas(req, res, next) {
    try {
      const filtros = req.query;
      const opciones = {
        pagina: parseInt(req.query.pagina) || 1,
        limite: parseInt(req.query.limite) || 20,
        ordenarPor: req.query.ordenar_por || 'nombre_completo',
        orden: req.query.orden || 'ASC'
      };

      const resultado = await personasService.listarPersonas(filtros, opciones);

      return res.status(200).json({
        success: true,
        message: 'Personas listadas exitosamente',
        data: resultado
      });
    } catch (error) {
      logger.error('Error listando personas:', error);
      next(error);
    }
  }

  /**
   * Crear persona (solo para administradores)
   */
  async crearPersona(req, res, next) {
    try {
      const personaData = req.validatedData;
      const persona = await personasService.crearOActualizar(personaData);

      return res.status(201).json({
        success: true,
        message: 'Persona creada exitosamente',
        data: persona
      });
    } catch (error) {
      logger.error('Error creando persona:', error);
      next(error);
    }
  }

  /**
   * Actualizar persona (solo para administradores)
   */
  async actualizarPersona(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;

      const personaActualizada = await personasService.actualizarPerfil(parseInt(id), updateData);

      return res.status(200).json({
        success: true,
        message: 'Persona actualizada exitosamente',
        data: personaActualizada
      });
    } catch (error) {
      logger.error('Error actualizando persona:', error);
      next(error);
    }
  }

  /**
   * Obtener persona por ID (solo para administradores)
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      const persona = await personasService.obtenerPorId(parseInt(id));

      if (!persona) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Persona obtenida exitosamente',
        data: persona
      });
    } catch (error) {
      logger.error('Error obteniendo persona:', error);
      next(error);
    }
  }
}

module.exports = new PersonasController();
