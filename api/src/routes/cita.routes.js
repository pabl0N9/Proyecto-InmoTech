const express = require('express');
const Joi = require('joi');
const router = express.Router();
const citaController = require('../controllers/cita.controller');
const { validate, validateQuery } = require('../middlewares/validate.middleware');
const { createLimiter, strictLimiter } = require('../middlewares/security.middleware');
const { authenticateToken } = require('../middlewares/auth.middleware');

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

// GET /api/v1/citas/agentes-disponibles - Obtener agentes disponibles
// Nota: Se desactiva sanitizeInput para evitar problemas con parseInt válidos
router.get('/agentes-disponibles', function(req, res, next) {
  // Saltar sanitizeInput si está aplicándose globalmente
  req.skipSanitize = true;
  next();
}, citaController.obtenerAgentesDisponibles);

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

// ✅ NUEVA RUTA OPTIMIZADA: PATCH /api/v1/citas/:id/estado - Actualizar solo el estado de la cita
router.patch(
  '/:id/estado',
  strictLimiter,
  validate(Joi.object({
    id_estado_cita: Joi.number()
      .integer()
      .valid(1, 2, 3, 4, 5, 6)
      .required()
  })),
  citaController.actualizarEstadoCita
);

// POST /api/v1/citas/:id/asignar-agente - Asignar agente a cita
router.post(
  '/:id/asignar-agente',
  authenticateToken,
  strictLimiter,
  validate(Joi.object({
    id_agente_nuevo: Joi.number().integer().required(),
    comentario: Joi.string().max(500).allow('').optional() // Permitir vacío para primera asignación
  })),
  citaController.asignarAgente
);

// GET /api/v1/citas/:id/historial-asignaciones - Obtener historial de asignaciones
router.get('/:id/historial-asignaciones', citaController.obtenerHistorialAsignaciones);

// GET /api/v1/citas/:id/con-historial - Obtener cita con historial completo
router.get('/:id/con-historial', citaController.obtenerCitaConHistorial);

module.exports = router;
