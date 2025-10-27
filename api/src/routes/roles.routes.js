const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { validate } = require('../middlewares/validate.middleware');
const auth = require('../middlewares/auth.middleware');
const {
  crearRolSchema,
  actualizarRolSchema
} = require('../validators/roles.validator');

// Aplicar autenticación a todas las rutas
router.use(auth.authenticateToken);

// Listar roles (todos los usuarios autenticados pueden ver roles)
router.get('/',
  rolesController.listarRoles
);

// Obtener rol por ID (todos los usuarios autenticados)
router.get('/:id',
  rolesController.obtenerRol
);

// Rutas que requieren permisos de Super Admin
router.use(auth.authorizeRoles(['Super Admin']));

// Crear rol (solo Super Admin)
router.post('/',
  validate(crearRolSchema),
  rolesController.crearRol
);

// Actualizar rol (solo Super Admin)
router.patch('/:id',
  validate(actualizarRolSchema),
  rolesController.actualizarRol
);

// Eliminar rol (solo Super Admin)
router.delete('/:id',
  rolesController.eliminarRol
);

// Rutas que requieren permisos de Admin+
router.use(auth.authorizeRoles(['Super Admin', 'Admin']));

// Asignar rol a persona (Admin+)
router.post('/:idRol/asignar/:idPersona',
  rolesController.asignarRol
);

// Remover rol de persona (Admin+)
router.delete('/:idRol/remover/:idPersona',
  rolesController.removerRol
);

// Listar roles de una persona (Admin+)
router.get('/persona/:idPersona',
  rolesController.listarRolesDePersona
);

// Listar personas con un rol específico (Admin+)
router.get('/:idRol/personas',
  rolesController.listarPersonasPorRol
);

module.exports = router;
