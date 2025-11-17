const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Helper function to check if user is Super Administrator
 */
const isSuperAdministrator = (user) => {
  return user && user.roles && user.roles.includes('Super Administrador');
};

/**
 * Middleware para verificar token JWT
 */
const authenticateToken = (req, res, next) => {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🔍 AUTHENTICATING REQUEST');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📍 URL:', req.method, req.url);
  
  try {
    // Buscar header de autorización (minúsculas y mayúsculas)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    console.log('📦 Headers:', {
      authorization: req.headers['authorization'],
      Authorization: req.headers['Authorization'],
      'content-type': req.headers['content-type']
    });
    
    if (!authHeader) {
      console.log('❌ No hay header de autorización');
      console.log('═══════════════════════════════════════════════════════\n');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar formato "Bearer TOKEN"
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Formato incorrecto. Header:', authHeader.substring(0, 20));
      console.log('═══════════════════════════════════════════════════════\n');
      return res.status(401).json({
        success: false,
        message: 'Formato de autorización inválido. Use: Bearer [token]'
      });
    }

    const token = authHeader.substring(7); // Quitar "Bearer "
    
    if (!token || token.trim() === '') {
      console.log('❌ Token vacío');
      console.log('═══════════════════════════════════════════════════════\n');
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    console.log('✅ Token extraído:', token.substring(0, 30) + '...');

    // Verificar token
    const decoded = jwtUtils.verifyAccessToken(token);
    
    if (!decoded) {
      console.log('❌ Token inválido (decoded es null)');
      console.log('═══════════════════════════════════════════════════════\n');
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    console.log('✅ Token verificado:', { id: decoded.id, email: decoded.email });
    console.log('═══════════════════════════════════════════════════════\n');

    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
      es_administrativo: decoded.es_administrativo || false
    };

    logger.info(`Usuario autenticado: ${req.user.email} (ID: ${req.user.id})`);
    next();

  } catch (error) {
    console.log('❌ Error en authenticateToken:', error.name, error.message);
    console.log('═══════════════════════════════════════════════════════\n');
    
    logger.error('Error de autenticación:', { message: error.message, name: error.name });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'El token proporcionado es inválido o ha sido manipulado.',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Error de autenticación. No se pudo verificar el token.',
      code: 'AUTH_ERROR'
    });
  }
};

// VERSIÓN v2.1 - Control de acceso unificado con nombres de roles largos
/**
 * Middleware NEW para verificar roles específicos
 * Usa comparación directa de nombres largos: "Super Administrador", "Administrador"
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!req.user.roles || req.user.roles.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
      }

      // Comparar directamente los roles tal como vienen en el JWT
      const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

      if (!hasRequiredRole) {
        logger.warn(`ROL DEBUG - Usuario: ${req.user.email}, Roles usuario: [${req.user.roles.join(', ')}], Roles requeridos: [${allowedRoles.join(', ')}], Tiene acceso: ${hasRequiredRole}`);
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción'
        });
      }

      logger.info(`Acceso autorizado para usuario ${req.user.email} (rol: ${req.user.roles.join(', ')})`);
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
 * Middleware opcional para autenticación
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwtUtils.verifyAccessToken(token);
        
        if (decoded) {
          req.user = {
            id: decoded.id,
            email: decoded.email,
            roles: decoded.roles || [],
            es_administrativo: decoded.es_administrativo || false
          };
          
          logger.info(`Usuario opcionalmente autenticado: ${req.user.email}`);
        }
      } catch (error) {
        logger.warn('Token opcional inválido, continuando sin autenticación');
      }
    }
    
    next();
  } catch (error) {
    logger.error('Error en autenticación opcional:', error);
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
  isSuperAdministrator
};
