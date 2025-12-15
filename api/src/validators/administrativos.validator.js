<<<<<<< HEAD
const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware para manejar errores de validación
 */
=======
const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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

<<<<<<< HEAD
/**
 * Validaciones para registro de administrativo
 */
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
const validarRegistroAdmin = [
  body('tipo_documento')
    .isIn(['CC', 'CE', 'NIT', 'Pasaporte', 'TI'])
    .withMessage('El tipo de documento debe ser CC, CE, NIT, Pasaporte o TI'),

  body('numero_documento')
    .trim()
    .notEmpty()
    .withMessage('El número de documento es obligatorio')
    .isLength({ min: 6, max: 20 })
    .withMessage('El número de documento debe tener entre 6 y 20 caracteres'),

  body('nombre_completo')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre completo debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('El nombre completo solo puede contener letras y espacios'),

  body('apellido_completo')
    .trim()
    .notEmpty()
    .withMessage('El apellido completo es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido completo debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('El apellido completo solo puede contener letras y espacios'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),

  body('telefono')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('El teléfono debe contener solo números, espacios, guiones, paréntesis y el símbolo +')
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres'),

<<<<<<< HEAD
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),

=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  body('id_rol')
    .notEmpty()
    .withMessage('El rol es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del rol debe ser un número válido'),

<<<<<<< HEAD

  // Código de empleado eliminado - ahora se genera automáticamente en el backend

=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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

<<<<<<< HEAD
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

  handleValidationErrors
];

/**
 * Validaciones para actualización de administrativo
 */
=======
  handleValidationErrors
];

>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
const validarActualizacionAdmin = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del administrativo debe ser un número entero positivo'),

  body('personaData')
    .optional()
    .isObject()
    .withMessage('Los datos de persona deben ser un objeto'),

  body('personaData.nombre_completo')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre completo debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('El nombre completo solo puede contener letras y espacios'),

  body('personaData.apellido_completo')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido completo debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('El apellido completo solo puede contener letras y espacios'),

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

<<<<<<< HEAD
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
  handleValidationErrors
];

/**
 * Validaciones para cambio de estado laboral
 */
=======
  handleValidationErrors
];

>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
const validarCambioEstado = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del administrativo debe ser un número entero positivo'),

  body('estado_laboral')
    .isIn(['Activo', 'Inactivo'])
    .withMessage('El estado laboral debe ser: Activo o Inactivo'),

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
