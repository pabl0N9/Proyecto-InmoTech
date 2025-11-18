const Joi = require('joi');

const createLeaseSchema = Joi.object({
  id_cliente: Joi.number().integer().positive().required(),
  id_inmueble: Joi.number().integer().positive().required(),
  fecha_inicio: Joi.date().required(),
  fecha_finalizacion: Joi.date().greater(Joi.ref('fecha_inicio')).required(),
  valor_mensual: Joi.number().precision(2).positive().required()
});

const updateLeaseSchema = Joi.object({
  fecha_inicio: Joi.date(),
  fecha_finalizacion: Joi.date().greater(Joi.ref('fecha_inicio')),
  valor_mensual: Joi.number().precision(2).positive(),
  estado: Joi.string().valid('Activo', 'Al día', 'Pendiente', 'Recuperación', 'Finalizado', 'Cancelado')
});

const createPaymentSchema = Joi.object({
  fecha_cobro: Joi.date().required(),
  fecha_limite: Joi.date().greater(Joi.ref('fecha_cobro')).required(),
  valor_pago: Joi.number().precision(2).positive().required()
});

const updatePaymentSchema = Joi.object({
  estado: Joi.string().valid('Pendiente', 'Pagado', 'Vencido', 'Cancelado').required(),
  fecha_pago: Joi.date().allow(null)
});

const createReceiptSchema = Joi.object({
  url_comprobante: Joi.string().uri().required(),
  entidad_bancaria: Joi.string().max(100).required(),
  referencia_bancaria: Joi.string().max(100).required(),
  monto_pagado: Joi.number().precision(2).positive().required(),
  fecha_pago: Joi.date().required()
});

module.exports = {
  createLeaseSchema,
  updateLeaseSchema,
  createPaymentSchema,
  updatePaymentSchema,
  createReceiptSchema
};