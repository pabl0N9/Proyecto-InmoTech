const express = require('express');
const router = express.Router();
const personasController = require('../controllers/personas.controller');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const {
  crearPersonaSchema,
  actualizarPersonaSchema,
  buscarPersonaSchema
} = require('../validators/personas.validator');

// Aplicar autenticación a todas las rutas
router.use(auth.authenticateToken);

// Buscar personas por documento (accesible para todos los usuarios autenticados)
router.get('/buscar',
  validateQuery(buscarPersonaSchema),
  personasController.buscarPorDocumento
);

// Obtener perfil de la persona autenticada (solo el propio usuario)
router.get('/me',
  personasController.obtenerPerfil
);

// Actualizar perfil de la persona autenticada (solo el propio usuario)
router.patch('/me',
  validate(actualizarPersonaSchema),
  personasController.actualizarPerfil
);

// Rutas administrativas (requieren permisos de admin)
router.use(auth.authorizeRoles(['Super Administrador', 'Administrador']));

// Listar personas con filtros (solo administradores)
router.get('/',
  personasController.listarPersonas
);

// Crear persona (solo administradores)
router.post('/',
  validate(crearPersonaSchema),
  personasController.crearPersona
);

// Obtener persona por ID (solo administradores)
router.get('/:id',
  personasController.obtenerPorId
);

// Actualizar persona (solo administradores)
router.patch('/:id',
  validate(actualizarPersonaSchema),
  personasController.actualizarPersona
);

module.exports = router;
