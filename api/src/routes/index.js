const express = require('express');
const router = express.Router();

const salesRoutes = require('./sales.route');
const buyersRoutes = require('./buyers.routes');
const leasesRoutes = require('./leases.routes');
const renantsRoutes = require('./renants.route');
const inmueblesRoutes = require('./inmuebles.routes');
const setupRoutes = require('./setup.routes');
const authRoutes = require('./auth.routes');
const sseRoutes = require('./sse.routes');
const arriendoRoutes = require('./arriendo.routes');
const uploadRoutes = require('./upload.routes');
const personasRoutes = require('./personas.routes');
const citaRoutes = require('./cita.routes');
const reportesRoutes = require('./reportes.routes');

router.use('/setup', setupRoutes);
router.use('/auth', authRoutes);
router.use('/sse', sseRoutes);
router.use('/sales/buyers', buyersRoutes);
router.use('/sales', salesRoutes);
router.use('/leases/renants', renantsRoutes);
router.use('/leases', leasesRoutes);
router.use('/arriendos', arriendoRoutes);
router.use('/inmuebles', inmueblesRoutes);
router.use('/files', uploadRoutes);
router.use('/personas', personasRoutes);
router.use('/citas', citaRoutes);
router.use('/reportes', reportesRoutes);

// Ruta de salud para verificar que el servidor funciona
router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const dbStatus = await require('../config/database').testConnection();
    
    res.json({ 
      success: true,
      status: 'OK', 
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'Conectado' : 'Desconectado',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.API_VERSION || 'v1'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

module.exports = router;
