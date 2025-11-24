const express = require('express');
const router = express.Router();

const salesRoutes = require('./sales.route');
const buyersRoutes = require('./buyers.routes');
const leasesRoutes = require('./leases.routes');
const renantsRoutes = require('./renants.route');
const setupRoutes = require('./setup.routes');
const authRoutes = require('./auth.routes');
const sseRoutes = require('./sse.routes');
const arriendoRoutes = require('./arriendo.routes');

router.use('/setup', setupRoutes);
router.use('/auth', authRoutes);
router.use('/sse', sseRoutes);
router.use('/sales/buyers', buyersRoutes);
router.use('/sales', salesRoutes);
router.use('/leases/renants', renantsRoutes);
router.use('/leases', leasesRoutes);
router.use('/arriendos', arriendoRoutes);

// ✅ CORRECTO: Importar desde models
const { 
  Inmueble, 
  Persona, 
  Cita, 
  Sale, 
  Lease 
} = require('../models');

// ❌ INCORRECTO (lo que tenías antes):
// const Inmueble = require('./Inmueble');
// const Persona = require('./Persona');
// const Cita = require('./Cita');
// const Venta = require('./Venta');
// const Arriendo = require('./Arriendo');

// Rutas para Inmuebles
router.get('/inmuebles', async (req, res) => {
  try {
    const inmuebles = await Inmueble.findAll();
    res.json({
      success: true,
      data: inmuebles,
      count: inmuebles.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.get('/inmuebles/:id', async (req, res) => {
  try {
    const inmueble = await Inmueble.findByPk(req.params.id);
    if (!inmueble) {
      return res.status(404).json({ 
        success: false,
        error: 'Inmueble no encontrado' 
      });
    }
    res.json({
      success: true,
      data: inmueble
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Rutas para Personas
router.get('/personas', async (req, res) => {
  try {
    const personas = await Persona.findAll();
    res.json({
      success: true,
      data: personas,
      count: personas.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

router.get('/personas/:id', async (req, res) => {
  try {
    const persona = await Persona.findByPk(req.params.id);
    if (!persona) {
      return res.status(404).json({ 
        success: false,
        error: 'Persona no encontrada' 
      });
    }
    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Rutas para Citas
router.get('/citas', async (req, res) => {
  try {
    const citas = await Cita.findAll({
      include: [
        { model: Persona, as: 'cliente' },
        { model: Inmueble, as: 'inmueble' },
        { model: Persona, as: 'agente' }
      ]
    });
    res.json({
      success: true,
      data: citas,
      count: citas.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Rutas para Ventas (Sales)
router.get('/ventas', async (req, res) => {
  try {
    const ventas = await Sale.findAll({
      include: [
        { model: Inmueble, as: 'inmueble' },
        { model: Persona, as: 'vendedor' },
        { model: Persona, as: 'comprador' },
        { model: Cita, as: 'cita' }
      ]
    });
    res.json({
      success: true,
      data: ventas,
      count: ventas.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

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
