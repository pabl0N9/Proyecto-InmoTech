/**
 * Rutas para Server-Sent Events (SSE)
 * Proporciona endpoints para conexiones SSE en tiempo real
 */

const express = require('express');
const router = express.Router();
const sseService = require('../services/sse.service');
const { authenticateToken } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');

/**
 * GET /api/v1/sse/connect?token=jwt_token
 * Establece una conexión SSE para el usuario autenticado usando token en query param
 */
router.get('/connect', async (req, res) => {
  try {
    // Para SSE, el token viene en query parameter porque EventSource no soporta headers custom
    const token = req.query.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    // Verificar token
    const jwtUtils = require('../utils/jwt');
    const decoded = jwtUtils.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Simular req.user como en el middleware authenticateToken
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
      es_administrativo: decoded.es_administrativo || false
    };

    const userId = req.user.id;

    // Verificar que el usuario esté activo consultando la BD
    const { Persona } = require('../models');
    const persona = await Persona.findOne({
      where: { id_persona: userId },
      attributes: ['estado']
    });

    if (!persona || !persona.estado) {
      // 🚨 CRÍTICO: Si el usuario está inactivo, enviar evento SSE ANTES de rechazar
      const sseService = require('../services/sse.service');

      // Avisar al cliente que debe hacer logout inmediato
      const forcedLogoutData = {
        message: 'Tu cuenta ha sido deshabilitada por un administrador',
        action: 'logout',
        timestamp: new Date().toISOString()
      };

      // Si hay una conexión SSE activa, enviarle el evento y desconectarla
      sseService.sendImmediateLogout(userId, forcedLogoutData);

      logger.warn(`🚨 SSE: Usuario ${userId} inactivo detectado, enviando logout forzado`);

      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo - logout forzado enviado',
        forceLogout: true
      });
    }

    console.log(`📡 SSE: Conexión aceptada por usuario ${userId} (${req.user.email})`);

    // Establecer conexión SSE
    sseService.addClient(userId, res);

  } catch (error) {
    logger.error('Error en conexión SSE:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
});

/**
 * GET /api/v1/sse/stats
 * Obtiene estadísticas de conexiones SSE (solo para administradores)
 */
router.get('/stats', authenticateToken, (req, res) => {
  try {
    // Verificar permisos de administrador
    const esAdmin = req.user.roles && (
      req.user.roles.includes('Super Administrador') ||
      req.user.roles.includes('Administrador')
    );

    if (!esAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado - Se requieren permisos administrativos'
      });
    }

    const stats = sseService.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas SSE:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
