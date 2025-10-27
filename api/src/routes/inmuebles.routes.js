const express = require('express');
const router = express.Router();
const inmueblesController = require('../controllers/inmuebles.controller');

// ✅ CORRECTO
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');

const {
  crearInmuebleSchema,
  actualizarInmuebleSchema,
  buscarInmueblesSchema
} = require('../validators/inmuebles.validator');

// Rutas públicas (no requieren autenticación)
router.get('/buscar',
  validateQuery(buscarInmueblesSchema),
  inmueblesController.buscarInmuebles
);

// ✅ CORRECCIÓN: Cambiar auth.authenticate por auth.authenticateToken
router.use(auth.authenticateToken);

// Obtener inmueble por ID (todos los usuarios autenticados)
router.get('/:id',
  inmueblesController.obtenerInmueble
);

// Obtener disponibilidad horaria de un inmueble (todos los usuarios autenticados)
router.get('/:id/disponibilidad',
  inmueblesController.obtenerDisponibilidad
);

// Listar inmuebles con filtros (todos los usuarios autenticados)
router.get('/',
  inmueblesController.listarInmuebles
);

// ✅ CORRECCIÓN: Cambiar auth.authorize por auth.authorizeRoles
router.use(auth.authorizeRoles(['Super Admin', 'Admin', 'Empleado']));

// Crear inmueble (Empleado+)
router.post('/',
  validate(crearInmuebleSchema),
  inmueblesController.crearInmueble
);

// Actualizar inmueble (Empleado+)
router.patch('/:id',
  validate(actualizarInmuebleSchema),
  inmueblesController.actualizarInmueble
);

// Eliminar inmueble (Empleado+)
router.delete('/:id',
  inmueblesController.eliminarInmueble
);

module.exports = router;
