const Joi = require('joi');

const documentTypes = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI'];
const purchaseTypes = ['Directa', 'Financiada', 'Mixta'];
const buyerStatuses = ['Activo', 'Inactivo', 'Proceso'];

const createBuyerSchema = Joi.object({
  tipo_documento: Joi.string().valid(...documentTypes).required(),
  numero_documento: Joi.string().max(20).required(),
  nombre_completo: Joi.string().max(100).required(),
  apellido_completo: Joi.string().max(100).required(),
  correo: Joi.string().email().required(),
  telefono: Joi.string().max(20).allow('', null),
  id_inmueble: Joi.number().integer().positive(),
  id_venta: Joi.number().integer().positive().allow(null),
  fecha_compra: Joi.date().max('now'),
  valor_compra: Joi.number().precision(2).positive(),
  tipo_compra: Joi.string().valid(...purchaseTypes).default('Directa'),
  ciudad_residencia: Joi.string().max(50).allow('', null),
  direccion_anterior: Joi.string().max(100).allow('', null),
  entidad_financiera: Joi.string().max(100).allow('', null),
  numero_credito: Joi.string().max(50).allow('', null),
  monto_financiado: Joi.number().precision(2).positive().allow(null),
  observaciones: Joi.string().allow('', null),
  estado: Joi.string().valid(...buyerStatuses).default('Activo'),
  registro_comprador: Joi.string().max(20)
}).with('id_inmueble', ['fecha_compra', 'valor_compra'])
  .with('fecha_compra', ['id_inmueble', 'valor_compra'])
  .with('valor_compra', ['id_inmueble', 'fecha_compra']);

const updateBuyerSchema = Joi.object({
  nombre_completo: Joi.string().max(100),
  apellido_completo: Joi.string().max(100),
  correo: Joi.string().email(),
  telefono: Joi.string().max(20),
  id_inmueble: Joi.number().integer().positive(),
  id_venta: Joi.number().integer().positive().allow(null),
  fecha_compra: Joi.date().max('now'),
  valor_compra: Joi.number().precision(2).positive(),
  tipo_compra: Joi.string().valid(...purchaseTypes),
  ciudad_residencia: Joi.string().max(50).allow('', null),
  direccion_anterior: Joi.string().max(100).allow('', null),
  entidad_financiera: Joi.string().max(100).allow('', null),
  numero_credito: Joi.string().max(50).allow('', null),
  monto_financiado: Joi.number().precision(2).positive().allow(null),
  observaciones: Joi.string().allow('', null),
  estado: Joi.string().valid(...buyerStatuses)
}).min(1)
  .with('id_inmueble', ['fecha_compra', 'valor_compra'])
  .with('fecha_compra', ['id_inmueble', 'valor_compra'])
  .with('valor_compra', ['id_inmueble', 'fecha_compra']);

const searchBuyersSchema = Joi.object({
  tipo_documento: Joi.string().valid(...documentTypes),
  numero_documento: Joi.string().max(20),
  nombre: Joi.string().max(100),
  status: Joi.string().valid(...buyerStatuses),
  tipo_compra: Joi.string().valid(...purchaseTypes),
  id_inmueble: Joi.number().integer().positive(),
  fecha_inicio: Joi.date(),
  fecha_fin: Joi.alternatives().conditional('fecha_inicio', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('fecha_inicio')),
    otherwise: Joi.date()
  })
});

module.exports = {
  createBuyerSchema,
  updateBuyerSchema,
  searchBuyersSchema
};
