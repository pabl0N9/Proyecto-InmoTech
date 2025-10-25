const express = require('express');
const router = express.Router();
const citaController = require('../controllers/cita.controller');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const { createLimiter, strictLimiter } = require('../middlewares/security.middleware');

const {
  crearCitaSchema,
  actualizarCitaSchema,
  confirmarCitaSchema,
  cancelarCitaSchema,
  reagendarCitaSchema,
  buscarPersonaSchema
} = require('../validators/cita.validator');

// POST /api/v1/citas - Crear cita
router.post(
  '/',
  createLimiter,
  validate(crearCitaSchema),
  citaController.crearCita
);

// GET /api/v1/citas - Obtener todas las citas
router.get('/', citaController.obtenerCitas);

// GET /api/v1/citas/buscar-persona - Buscar persona por documento
router.get('/buscar-persona', validateQuery(buscarPersonaSchema), citaController.buscarPersonaPorDocumento);

// GET /api/v1/citas/:id - Obtener cita por ID
router.get('/:id', citaController.obtenerCitaPorId);

// ⭐ AGREGAR: PUT /api/v1/citas/:id - Actualizar cita
router.put(
  '/:id', 
  strictLimiter, 
  validate(actualizarCitaSchema), 
  citaController.actualizarCita
);

// PATCH /api/v1/citas/:id - Actualizar cita (alternativa)
router.patch(
  '/:id', 
  strictLimiter, 
  validate(actualizarCitaSchema), 
  citaController.actualizarCita
);

// POST /api/v1/citas/:id/confirmar - Confirmar cita
router.post(
  '/:id/confirmar', 
  strictLimiter, 
  validate(confirmarCitaSchema), 
  citaController.confirmarCita
);

// POST /api/v1/citas/:id/cancelar - Cancelar cita
router.post(
  '/:id/cancelar', 
  strictLimiter, 
  validate(cancelarCitaSchema), 
  citaController.cancelarCita
);

// POST /api/v1/citas/:id/reagendar - Reagendar cita
router.post(
  '/:id/reagendar',
  strictLimiter,
  validate(reagendarCitaSchema),
  citaController.reagendarCita
);

// DELETE /api/v1/citas/:id - Eliminar cita
router.delete('/:id', strictLimiter, citaController.eliminarCita);

module.exports = router;
