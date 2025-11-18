const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');

// ✅ CORRECTO
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const {
  crearReporteSchema,
  generarReporteCitasSchema,
  generarReporteInmueblesSchema,
  actualizarEstadoReporteSchema,
  listarReportesSchema
} = require('../validators/reportes.validator');

// ✅ CORRECCIÓN: Cambiar auth.authenticate por auth.authenticateToken
router.use(auth.authenticateToken);

// ✅ TEMPORALMENTE: Quitar middleware de roles para debugging
// router.use(auth.authorizeRoles(['Super Administrador', 'Administrador', 'Empleado']));

// Estadísticas del dashboard - Solo requiere autenticación por ahora
router.get('/dashboard-stats',
  reportesController.obtenerEstadisticasDashboard
);

// Listar reportes
router.get('/',
  validateQuery(listarReportesSchema),
  reportesController.listarReportes
);

// Crear reporte manual
router.post('/',
  validate(crearReporteSchema),
  reportesController.crearReporte
);

// Generar reporte de citas
router.post('/citas',
  validate(generarReporteCitasSchema),
  reportesController.generarReporteCitas
);

// Generar reporte de inmuebles
router.post('/inmuebles',
  validate(generarReporteInmueblesSchema),
  reportesController.generarReporteInmuebles
);

// Obtener reporte por ID
router.get('/:id',
  reportesController.obtenerReporte
);

// Actualizar estado del reporte
router.patch('/:id/estado',
  validate(actualizarEstadoReporteSchema),
  reportesController.actualizarEstado
);

// Descargar reporte
router.get('/:id/descargar',
  reportesController.descargarReporte
);

// Eliminar reporte
router.delete('/:id',
  reportesController.eliminarReporte
);

module.exports = router;
