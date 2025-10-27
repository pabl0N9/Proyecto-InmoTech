const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Errores de validación:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validaciones para registro de administrativo
 */
const validarRegistroAdmin = [
  body('primer_nombre')
    .trim()
    .notEmpty()
    .withMessage('El primer nombre es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El primer nombre debe tener entre 2 y 50 caracteres'),

  body('segundo_nombre')
    .optional()
    .trim()
    .isLength({ min: 0, max: 50 })
    .withMessage('El segundo nombre debe tener máximo 50 caracteres'),

  body('primer_apellido')
    .trim()
    .notEmpty()
    .withMessage('El primer apellido es obligatorio')
    .isLength({ min: 2, max: 50 })
    .withMessage('El primer apellido debe tener entre 2 y 50 caracteres'),

  body('segundo_apellido')
    .optional()
    .trim()
    .isLength({ min: 0, max: 50 })
    .withMessage('El segundo apellido debe tener máximo 50 caracteres'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),

  body('telefono')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('El teléfono debe contener solo números, espacios, guiones, paréntesis y el símbolo +')
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),

  body('codigo_empleado')
    .trim()
    .notEmpty()
    .withMessage('El código de empleado es obligatorio')
    .isLength({ min: 3, max: 20 })
    .withMessage('El código de empleado debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9\-_]+$/)
    .withMessage('El código de empleado solo puede contener letras mayúsculas, números, guiones y guiones bajos'),

  body('fecha_ingreso')
    .isISO8601()
    .withMessage('La fecha de ingreso debe tener formato ISO 8601')
    .custom((value) => {
      const fechaIngreso = new Date(value);
      const hoy = new Date();
      if (fechaIngreso > hoy) {
        throw new Error('La fecha de ingreso no puede ser futura');
      }
      return true;
    }),

  body('cargo')
    .optional()
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('El cargo debe tener máximo 100 caracteres'),

  body('departamento')
    .optional()
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('El departamento debe tener máximo 100 caracteres'),

  body('salario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El salario debe ser un número positivo'),

  handleValidationErrors
];

/**
 * Validaciones para actualización de administrativo
 */
const validarActualizacionAdmin = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del administrativo debe ser un número entero positivo'),

  body('personaData')
    .optional()
    .isObject()
    .withMessage('Los datos de persona deben ser un objeto'),

  body('personaData.primer_nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El primer nombre debe tener entre 2 y 50 caracteres'),

  body('personaData.segundo_nombre')
    .optional()
    .trim()
    .isLength({ min: 0, max: 50 })
    .withMessage('El segundo nombre debe tener máximo 50 caracteres'),

  body('personaData.primer_apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El primer apellido debe tener entre 2 y 50 caracteres'),

  body('personaData.segundo_apellido')
    .optional()
    .trim()
    .isLength({ min: 0, max: 50 })
    .withMessage('El segundo apellido debe tener máximo 50 caracteres'),

  body('personaData.telefono')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('El teléfono debe contener solo números, espacios, guiones, paréntesis y el símbolo +')
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres'),

  body('administrativoData')
    .optional()
    .isObject()
    .withMessage('Los datos administrativos deben ser un objeto'),

  body('administrativoData.cargo')
    .optional()
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('El cargo debe tener máximo 100 caracteres'),

  body('administrativoData.departamento')
    .optional()
    .trim()
    .isLength({ min: 0, max: 100 })
    .withMessage('El departamento debe tener máximo 100 caracteres'),

  body('administrativoData.salario')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El salario debe ser un número positivo'),

  handleValidationErrors
];

/**
 * Validaciones para cambio de estado laboral
 */
const validarCambioEstado = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del administrativo debe ser un número entero positivo'),

  body('estado_laboral')
    .isIn(['Activo', 'Inactivo', 'Suspendido', 'Retirado'])
    .withMessage('El estado laboral debe ser: Activo, Inactivo, Suspendido o Retirado'),

  body('fecha_retiro')
    .optional()
    .isISO8601()
    .withMessage('La fecha de retiro debe tener formato ISO 8601')
    .custom((value, { req }) => {
      if (req.body.estado_laboral === 'Retirado' && !value) {
        throw new Error('La fecha de retiro es obligatoria cuando el estado es Retirado');
      }
      if (value) {
        const fechaRetiro = new Date(value);
        const hoy = new Date();
        if (fechaRetiro > hoy) {
          throw new Error('La fecha de retiro no puede ser futura');
        }
      }
      return true;
    }),

  handleValidationErrors
];

module.exports = {
  validarRegistroAdmin,
  validarActualizacionAdmin,
  validarCambioEstado
};
