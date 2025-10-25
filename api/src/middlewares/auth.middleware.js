const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware para verificar token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const decoded = jwtUtils.verifyAccessToken(token);

    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || []
    };

    logger.info(`Usuario autenticado: ${req.user.email}`);
    next();
  } catch (error) {
    logger.error('Error de autenticación:', error.message);

    if (error.message.includes('expirado')) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {string[]} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userRoles = req.user.roles;
      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        logger.warn(`Acceso denegado para usuario ${req.user.email}. Roles requeridos: ${allowedRoles.join(', ')}, roles del usuario: ${userRoles.join(', ')}`);

        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
      }

      logger.info(`Acceso autorizado para usuario ${req.user.email}`);
      next();
    } catch (error) {
      logger.error('Error en autorización:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Middleware opcional para autenticación (no requiere token obligatorio)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = jwtUtils.verifyAccessToken(token);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          roles: decoded.roles || []
        };
        logger.info(`Usuario opcionalmente autenticado: ${req.user.email}`);
      } catch (error) {
        // Token inválido pero no bloqueamos la petición
        logger.warn('Token opcional inválido, continuando sin autenticación');
      }
    }

    next();
  } catch (error) {
    logger.error('Error en autenticación opcional:', error);
    next(); // Continuar sin autenticación
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth
};
