const Joi = require('joi');

// Validación para crear persona
const crearPersonaSchema = Joi.object({
  tipo_documento: Joi.string()
    .valid('CC', 'CE', 'TI', 'NIT', 'PAS')
    .required()
    .messages({
      'any.only': 'Tipo de documento inválido',
      'any.required': 'Tipo de documento es obligatorio'
    }),

  numero_documento: Joi.string()
    .min(5)
    .max(20)
    .pattern(/^[0-9A-Z]+$/)
    .required()
    .messages({
      'string.min': 'Número de documento debe tener al menos 5 caracteres',
      'string.max': 'Número de documento no puede exceder 20 caracteres',
      'string.pattern.base': 'Número de documento solo puede contener números y letras mayúsculas',
      'any.required': 'Número de documento es obligatorio'
    }),

  nombre_completo: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/u)
    .required()
    .messages({
      'string.min': 'El nombre completo debe tener al menos 2 caracteres',
      'string.max': 'El nombre completo no puede exceder 100 caracteres',
      'string.pattern.base': 'El nombre completo solo puede contener letras y espacios',
      'any.required': 'El nombre completo es obligatorio'
    }),

  apellido_completo: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/u)
    .required()
    .messages({
      'string.min': 'El apellido completo debe tener al menos 2 caracteres',
      'string.max': 'El apellido completo no puede exceder 100 caracteres',
      'string.pattern.base': 'El apellido completo solo puede contener letras y espacios',
      'any.required': 'El apellido completo es obligatorio'
    }),

  correo: Joi.string()
    .email()
    .max(100)
    .allow('', null)
    .optional()
    .messages({
      'string.email': 'El formato del correo electrónico es inválido'
    }),

  telefono: Joi.string()
    .min(10)
    .max(20)
    .pattern(/^(\+57\s?)?[3]\d{2}\s?\d{3}\s?\d{4}$|^\+57\s?3\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base': 'El teléfono debe tener formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)'
    }),

  tiene_cuenta: Joi.boolean()
    .optional()
    .default(false),

  estado: Joi.boolean()
    .optional()
    .default(true)
});

// Validación para actualizar persona
const actualizarPersonaSchema = Joi.object({
  primer_nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+/)
    .optional(),

  segundo_nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+/)
    .allow('', null)
    .optional(),

  primer_apellido: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+/)
    .optional(),

  segundo_apellido: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+/)
    .allow('', null)
    .optional(),

  nombre_completo: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/u)
    .optional(),

  apellido_completo: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/u)
    .optional(),

  correo: Joi.string()
    .email()
    .max(100)
    .allow('', null)
    .optional()
    .messages({
      'string.email': 'El formato del correo electrónico es inválido'
    }),

  telefono: Joi.string()
    .min(10)
    .max(20)
    .pattern(/^(\+57\s?)?[3]\d{2}\s?\d{3}\s?\d{4}$|^\+57\s?3\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/)
    .allow('', null)
    .optional()
    .messages({
      'string.pattern.base': 'El teléfono debe tener formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)'
    }),

  tipo_documento: Joi.string()
    .valid('CC', 'CE', 'TI', 'NIT', 'PAS')
    .optional(),

  numero_documento: Joi.string()
    .min(5)
    .max(20)
    .pattern(/^[0-9A-Z]+$/)
    .optional(),

  password: Joi.string()
    .min(8)
    .max(100)
    .optional()
    .messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.max': 'La contraseña no puede exceder 100 caracteres'
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .when('password', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'any.only': 'Las contraseñas no coinciden',
      'any.required': 'La confirmación de contraseña es requerida cuando se proporciona una contraseña'
    }),

  estado: Joi.boolean()
    .optional()
})
  .min(1)
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

// Validación para buscar personas
const buscarPersonaSchema = Joi.object({
  tipo_documento: Joi.string()
    .valid('CC', 'CE', 'TI', 'NIT', 'PAS')
    .required()
    .messages({
      'any.only': 'Tipo de documento inválido',
      'any.required': 'Tipo de documento es obligatorio'
    }),

  numero_documento: Joi.string()
    .min(1)
    .max(20)
    .required()
    .messages({
      'any.required': 'Número de documento es obligatorio'
    })
});

module.exports = {
  crearPersonaSchema,
  actualizarPersonaSchema,
  buscarPersonaSchema
};
