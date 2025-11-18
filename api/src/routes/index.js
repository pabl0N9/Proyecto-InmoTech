const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const administrativosRoutes = require('./administrativos.routes');
const citaRoutes = require('./cita.routes');
const notificacionRoutes = require('./notificacion.routes');
const personasRoutes = require('./personas.routes');
const rolesRoutes = require('./roles.routes');
const inmueblesRoutes = require('./inmuebles.routes');
const reportesRoutes = require('./reportes.routes');
const reportesInmobiliariosRoutes = require('./reportesInmobiliarios.routes');
const setupRoutes = require('./setup.routes');
const sseRoutes = require('./sse.routes');

router.use('/auth', authRoutes);
router.use('/administrativos', administrativosRoutes);
router.use('/citas', citaRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/personas', personasRoutes);
router.use('/roles', rolesRoutes);
router.use('/inmuebles', inmueblesRoutes);
router.use('/reportes', reportesRoutes);
router.use('/reportes-inmobiliarios', reportesInmobiliariosRoutes);
router.use('/setup', setupRoutes);
router.use('/sse', sseRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

module.exports = router;
