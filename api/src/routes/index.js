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
const leasesRoutes = require('./leases.routes');
const renantsRoutes = require('./renants.route');
const buyersRoutes = require('./buyers.routes');
const salesRoutes = require('./sales.route');
const setupRoutes = require('./setup.routes');
const sseRoutes = require('./sse.routes');
const invitacionesRoutes = require('./invitaciones.routes');
const uploadRoutes = require('./upload.routes');

router.use('/auth', authRoutes);
router.use('/administrativos', administrativosRoutes);
router.use('/citas', citaRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/personas', personasRoutes);
router.use('/roles', rolesRoutes);
router.use('/inmuebles', inmueblesRoutes);
router.use('/reportes', reportesRoutes);
router.use('/reportes-inmobiliarios', reportesInmobiliariosRoutes);
// Importante: montar subruta específica antes de /leases para evitar que "renants" se tome como :id
router.use('/leases/renants', renantsRoutes);
router.use('/leases', leasesRoutes);
router.use('/sales/buyers', buyersRoutes);
router.use('/sales', salesRoutes);
router.use('/setup', setupRoutes);
router.use('/sse', sseRoutes);
router.use('/invitaciones', invitacionesRoutes);
router.use('/files', uploadRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

module.exports = router;
