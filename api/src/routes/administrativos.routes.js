const express = require('express');
const router = express.Router();
const administrativosController = require('../controllers/administrativos.controller');
const { validarAccesoAdmin } = require('../middlewares/admin.middleware');
const { validarRegistroAdmin, validarActualizacionAdmin, validarCambioEstado } = require('../validators/administrativos.validator');

// Todas las rutas requieren autenticación administrativa
router.use(validarAccesoAdmin);

/**
 * @route POST /api/administrativos
 * @desc Registra un nuevo administrativo
 * @access Admin
 */
router.post('/', validarRegistroAdmin, administrativosController.registrarAdministrativo);

/**
 * @route GET /api/administrativos
 * @desc Obtiene lista de administrativos con paginación
 * @access Admin
 */
router.get('/', administrativosController.obtenerAdministrativos);

/**
 * @route GET /api/administrativos/:id
 * @desc Obtiene un administrativo por ID
 * @access Admin
 */
router.get('/:id', administrativosController.obtenerAdministrativoPorId);

/**
 * @route PUT /api/administrativos/:id
 * @desc Actualiza un administrativo
 * @access Admin
 */
router.put('/:id', validarActualizacionAdmin, administrativosController.actualizarAdministrativo);

/**
 * @route PATCH /api/administrativos/:id/estado
 * @desc Cambia el estado laboral de un administrativo
 * @access Admin
 */
router.patch('/:id/estado', validarCambioEstado, administrativosController.cambiarEstadoLaboral);

/**
 * @route DELETE /api/administrativos/:id
 * @desc Elimina un administrativo (desactivación lógica)
 * @access Admin
 */
router.delete('/:id', administrativosController.eliminarAdministrativo);

module.exports = router;
