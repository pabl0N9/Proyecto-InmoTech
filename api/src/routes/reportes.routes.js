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

// ✅ CORRECCIÓN: Cambiar auth.authorize por auth.authorizeRoles
router.use(auth.authorizeRoles(['Super Admin', 'Admin', 'Empleado']));

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
