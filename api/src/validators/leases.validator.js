const Joi = require('joi');

const leaseStatuses = ['Activo', 'Pendiente', 'Finalizado', 'Cancelado'];

const createLeaseSchema = Joi.object({
  id_cliente: Joi.number().integer().required(),
  id_inmueble: Joi.number().integer().required(),
  fecha_inicio: Joi.date().iso().required(),
  fecha_finalizacion: Joi.date().iso().required(),
  valor_mensual: Joi.number().positive().required()
});

const updateLeaseSchema = Joi.object({
  id_cliente: Joi.number().integer(),
  id_inmueble: Joi.number().integer(),
  fecha_inicio: Joi.date().iso(),
  fecha_finalizacion: Joi.date().iso(),
  valor_mensual: Joi.number().positive(),
  estado: Joi.string().valid(...leaseStatuses)
}).min(1);

const createPaymentSchema = Joi.object({
  fecha_cobro: Joi.date().iso().required(),
  fecha_limite: Joi.date().iso().required(),
  valor_pago: Joi.number().positive().required(),
  estado: Joi.string().valid('Pendiente', 'Pagado', 'Vencido').default('Pendiente')
});

const updatePaymentSchema = Joi.object({
  estado: Joi.string().valid('Pendiente', 'Pagado', 'Vencido').required()
});

const createReceiptSchema = Joi.object({
  descripcion: Joi.string().max(500).allow('', null),
  valor_pagado: Joi.number().positive().required(),
  metodo_pago: Joi.string().max(50).allow('', null)
});

module.exports = {
  createLeaseSchema,
  updateLeaseSchema,
  createPaymentSchema,
  updatePaymentSchema,
  createReceiptSchema
};
