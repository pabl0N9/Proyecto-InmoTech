const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
<<<<<<< HEAD

// ✅ CORRECTO
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const {
  crearReporteSchema,
  generarReporteCitasSchema,
  generarReporteInmueblesSchema,
  actualizarEstadoReporteSchema,
  listarReportesSchema
} = require('../validators/reportes.validator');

<<<<<<< HEAD
// ✅ CORRECCIÓN: Cambiar auth.authenticate por auth.authenticateToken
router.use(auth.authenticateToken);

// ✅ TEMPORALMENTE: Quitar middleware de roles para debugging
// router.use(auth.authorizeRoles(['Super Administrador', 'Administrador', 'Empleado']));

// Estadísticas del dashboard - Solo requiere autenticación por ahora
=======
// Autenticación obligatoria
router.use(auth.authenticateToken);

// Acceso base: ver reportes (usa permisos, Admin/SuperAdmin pasan)
router.use(auth.authorizePermissions('reportes', ['read']));

// Estadísticas del dashboard (ruta específica antes de :id)
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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
<<<<<<< HEAD
=======
  auth.authorizePermissions('reportes', ['create']),
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  validate(crearReporteSchema),
  reportesController.crearReporte
);

// Generar reporte de citas
router.post('/citas',
<<<<<<< HEAD
=======
  auth.authorizePermissions('reportes', ['create']),
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  validate(generarReporteCitasSchema),
  reportesController.generarReporteCitas
);

// Generar reporte de inmuebles
router.post('/inmuebles',
<<<<<<< HEAD
=======
  auth.authorizePermissions('reportes', ['create']),
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  validate(generarReporteInmueblesSchema),
  reportesController.generarReporteInmuebles
);

// Obtener reporte por ID
router.get('/:id',
  reportesController.obtenerReporte
);

// Actualizar estado del reporte
router.patch('/:id/estado',
<<<<<<< HEAD
=======
  auth.authorizePermissions('reportes', ['update']),
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  validate(actualizarEstadoReporteSchema),
  reportesController.actualizarEstado
);

// Descargar reporte
router.get('/:id/descargar',
  reportesController.descargarReporte
);

// Eliminar reporte
router.delete('/:id',
<<<<<<< HEAD
=======
  auth.authorizePermissions('reportes', ['delete']),
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  reportesController.eliminarReporte
);

module.exports = router;
