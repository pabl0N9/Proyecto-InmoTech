const express = require('express');
const router = express.Router();
const inmueblesController = require('../controllers/inmuebles.controller');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const {
  crearInmuebleSchema,
  actualizarInmuebleSchema,
  buscarInmueblesSchema
} = require('../validators/inmuebles.validator');

// ========================================
// RUTAS PÚBLICAS (sin autenticación)
// ========================================
router.get('/buscar',
  validateQuery(buscarInmueblesSchema),
  inmueblesController.buscarInmuebles
);

// ========================================
// MIDDLEWARE DE AUTENTICACIÓN
// ========================================
router.use(auth.authenticateToken);

// ========================================
// RUTAS AUTENTICADAS (todos los usuarios)
// ========================================

// ⚠️ IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
router.get('/:id/disponibilidad',
  inmueblesController.obtenerDisponibilidad
);

// Listar todos los inmuebles
router.get('/',
  inmueblesController.listarInmuebles
);

// Obtener un inmueble específico (debe ir DESPUÉS de rutas específicas)
router.get('/:id',
  inmueblesController.obtenerInmueble
);

// ========================================
// MIDDLEWARE DE AUTORIZACIÓN POR ROLES
// ========================================
router.use(auth.authorizeRoles(['Super Administrador', 'Administrador', 'Empleado']));

// ========================================
// RUTAS CON PERMISOS (Empleado+)
// ========================================

// Crear inmueble
router.post('/',
  validate(crearInmuebleSchema),
  inmueblesController.crearInmueble
);

// Actualizar inmueble
router.patch('/:id',
  validate(actualizarInmuebleSchema),
  inmueblesController.actualizarInmueble
);

// Eliminar inmueble
router.delete('/:id',
  inmueblesController.eliminarInmueble
);

module.exports = router;
