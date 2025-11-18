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

      // Enviar tokens como cookies httpOnly para registro
      const { accessToken, refreshToken } = result;
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction, // Solo HTTPS en producción
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000 // 1 hora
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: result.user
        }
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

      // Enviar tokens como cookies httpOnly para login
      const { accessToken, refreshToken } = result;
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction, // Solo HTTPS en producción
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000 // 1 hora
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: result.user
        }
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

      // Enviar tokens refrescados como cookies httpOnly
      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000 // 1 hora
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

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

      // ⚠️ MANEJAR ERROR PERSONALIZADO: Usuario deshabilitado
      if (error.message.includes('Usuario inactivo') || error.message.includes('deshabilitado')) {
        logger.warn(`🚫 Logout forzado para usuario ${req.user.id}: ${error.message}`);
        return res.status(423).json({
          success: false,
          message: 'Tu cuenta ha sido deshabilitada por un administrador. Sesión terminada.',
          forceLogout: true,
          reason: 'user_disabled'
        });
      }

      // ⚠️ MANEJAR ERROR PERSONALIZADO: Acceso administrativo revocado
      if (error.message.includes('Acceso administrativo revocado')) {
        logger.warn(`🚫 Logout forzado para usuario administrativo ${req.user.id}: ${error.message}`);
        return res.status(403).json({
          success: false,
          message: 'Tu acceso administrativo ha sido revocado. Sesión terminada.',
          forceLogout: true,
          reason: 'admin_access_revoked'
        });
      }

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
   * Cierra la sesión del usuario (limpia cookies)
   */
  async cerrarSesion(req, res, next) {
    try {
      // Limpiar cookies de tokens
      const isProduction = process.env.NODE_ENV === 'production';

      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict'
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict'
      });

      return res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      logger.error('Error cerrando sesión:', error);
      next(error);
    }
  }

  /**
   * Obtiene el timestamp del último cambio de contraseña
   */
  async obtenerUltimoCambioPassword(req, res, next) {
    try {
      const userId = req.user.id;
      const ultimoCambio = await authService.obtenerUltimoCambioPassword(userId);

      return res.status(200).json({
        success: true,
        message: 'Último cambio de contraseña obtenido exitosamente',
        data: { ultimo_cambio_password: ultimoCambio }
      });
    } catch (error) {
      logger.error('Error obteniendo último cambio de contraseña:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
