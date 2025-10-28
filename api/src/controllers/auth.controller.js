const authService = require('../services/auth.service');
const { validarNoEsAdmin } = require('../middlewares/admin.middleware');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Registra un nuevo usuario
   */
  async registrarUsuario(req, res, next) {
    try {
      const userData = req.validatedData;
      const result = await authService.registrarUsuario(userData);

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      logger.error('Error en registro de usuario:', error);
      next(error);
    }
  }

  /**
   * Inicia sesión de usuario
   */
  async iniciarSesion(req, res, next) {
    try {
      const { email, password } = req.validatedData;
      const result = await authService.iniciarSesion(email, password);

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result
      });
    } catch (error) {
      logger.error('Error en inicio de sesión:', error);
      next(error);
    }
  }

  /**
   * Refresca el token de acceso
   */
  async refrescarToken(req, res, next) {
    try {
      const { refreshToken } = req.validatedData;
      const tokens = await authService.refrescarToken(refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: tokens
      });
    } catch (error) {
      logger.error('Error refrescando token:', error);
      next(error);
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async obtenerPerfil(req, res, next) {
    try {
      const userId = req.user.id;
      const perfil = await authService.obtenerPerfil(userId);

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
   * Actualiza el perfil del usuario autenticado
   */
  async actualizarPerfil(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.validatedData;

      // Aquí necesitaríamos un método en el servicio para actualizar perfil
      // Por ahora, devolveremos un mensaje de que la funcionalidad está pendiente
      return res.status(200).json({
        success: true,
        message: 'Funcionalidad de actualización de perfil pendiente de implementación',
        data: { userId, updateData }
      });
    } catch (error) {
      logger.error('Error actualizando perfil:', error);
      next(error);
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async cambiarContrasena(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.validatedData;

      await authService.cambiarContrasena(userId, currentPassword, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      logger.error('Error cambiando contraseña:', error);
      next(error);
    }
  }

  /**
   * Cierra la sesión del usuario (invalidar tokens)
   */
  async cerrarSesion(req, res, next) {
    try {
      // En una implementación completa, aquí invalidaríamos el token
      // Por ahora, solo devolvemos una respuesta exitosa
      return res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      logger.error('Error cerrando sesión:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
