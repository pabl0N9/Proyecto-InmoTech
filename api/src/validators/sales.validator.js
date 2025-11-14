const Joi = require('joi');

const documentTypes = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI'];
const paymentMethods = ['efectivo', 'transferencia', 'credito', 'mixto'];
const saleStates = ['Activa', 'Cancelada', 'Finalizada'];

const buyerInfoSchema = Joi.object({
  tipo_documento: Joi.string().valid(...documentTypes).required(),
  numero_documento: Joi.string().max(20).required(),
  nombre_completo: Joi.string().max(100).required(),
  apellido_completo: Joi.string().max(100).required(),
  correo: Joi.string().email().required(),
  telefono: Joi.string().max(20).allow('', null)
});

const createSaleSchema = Joi.object({
  id_inmueble: Joi.number().integer().positive().required(),
  id_persona: Joi.number().integer().positive().required(),
  fecha_venta: Joi.date().required(),
  valor_venta: Joi.number().precision(2).positive().required(),
  medio_pago: Joi.string().valid(...paymentMethods).required(),
  estado: Joi.string().valid(...saleStates).default('Activa'),
  comprador: buyerInfoSchema.optional()
});

const updateSaleSchema = Joi.object({
  id_inmueble: Joi.number().integer().positive(),
  id_persona: Joi.number().integer().positive(),
  fecha_venta: Joi.date(),
  valor_venta: Joi.number().precision(2).positive(),
  medio_pago: Joi.string().valid(...paymentMethods),
  estado: Joi.string().valid(...saleStates)
}).min(1);

const createTrackingSchema = Joi.object({
  id_estado_venta: Joi.number().integer().positive().required(),
  fecha_estado_seguimiento: Joi.date().required(),
  descripcion: Joi.string().required()
});

module.exports = {
  createSaleSchema,
  updateSaleSchema,
  createTrackingSchema
};
