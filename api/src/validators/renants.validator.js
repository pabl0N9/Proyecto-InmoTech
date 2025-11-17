const Joi = require('joi');

const documentTypes = ['CC', 'CE', 'NIT', 'Pasaporte', 'TI'];
const tenantStatuses = ['Activo', 'Inactivo', 'Moroso', 'Proceso'];
const guaranteeTypes = ['Deposito', 'Fiador', 'Seguro', 'Mixta'];

const createRenantSchema = Joi.object({
  tipo_documento: Joi.string().valid(...documentTypes).required(),
  numero_documento: Joi.string().max(20).required(),
  nombre_completo: Joi.string().max(100).required(),
  apellido_completo: Joi.string().max(100).required(),
  correo: Joi.string().email().required(),
  telefono: Joi.string().max(20).allow('', null),
  id_inmueble: Joi.number().integer().positive().allow(null).optional(),
  id_arrendamiento: Joi.number().integer().positive().allow(null).optional(),
  fecha_inicio_arrendamiento: Joi.date().allow(null).optional(),
  fecha_fin_arrendamiento: Joi.alternatives().conditional('fecha_inicio_arrendamiento', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('fecha_inicio_arrendamiento')).allow(null),
    otherwise: Joi.date().allow(null)
  }).optional(),
  valor_arriendo_mensual: Joi.number().precision(2).positive().allow(null).optional(),
  tipo_garantia: Joi.string().valid(...guaranteeTypes).allow(null).optional(),
  valor_garantia: Joi.number().precision(2).positive().allow(null).optional(),
  descripcion_garantia: Joi.string().max(200).allow('', null).optional(),
  contacto_emergencia_nombre: Joi.string().max(100).allow('', null).optional(),
  contacto_emergencia_telefono: Joi.string().max(20).allow('', null).optional(),
  contacto_emergencia_parentesco: Joi.string().max(50).allow('', null).optional(),
  observaciones: Joi.string().allow('', null).optional(),
  estado: Joi.string().valid(...tenantStatuses).default('Activo'),
  registro_arrendatario: Joi.string().max(20).allow(null).optional()
});

const updateRenantSchema = Joi.object({
  nombre_completo: Joi.string().max(100),
  apellido_completo: Joi.string().max(100),
  correo: Joi.string().email(),
  telefono: Joi.string().max(20),
  id_inmueble: Joi.number().integer().positive(),
  id_arrendamiento: Joi.number().integer().positive().allow(null),
  fecha_inicio_arrendamiento: Joi.date(),
  fecha_fin_arrendamiento: Joi.date()
    .min(Joi.ref('fecha_inicio_arrendamiento'))
    .allow(null),
  valor_arriendo_mensual: Joi.number().precision(2).positive(),
  tipo_garantia: Joi.string().valid(...guaranteeTypes).allow(null),
  valor_garantia: Joi.number().precision(2).positive().allow(null),
  descripcion_garantia: Joi.string().max(200).allow('', null),
  contacto_emergencia_nombre: Joi.string().max(100).allow('', null),
  contacto_emergencia_telefono: Joi.string().max(20).allow('', null),
  contacto_emergencia_parentesco: Joi.string().max(50).allow('', null),
  observaciones: Joi.string().allow('', null),
  estado: Joi.string().valid(...tenantStatuses)
}).min(1);

const searchRenantsSchema = Joi.object({
  tipo_documento: Joi.string().valid(...documentTypes),
  numero_documento: Joi.string().max(20),
  nombre: Joi.string().max(100),
  status: Joi.string().valid(...tenantStatuses),
  tipo_garantia: Joi.string().valid(...guaranteeTypes),
  id_inmueble: Joi.number().integer().positive(),
  fecha_inicio: Joi.date(),
  fecha_fin: Joi.alternatives().conditional('fecha_inicio', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('fecha_inicio')),
    otherwise: Joi.date()
  })
});

module.exports = {
  createRenantSchema,
  updateRenantSchema,
  searchRenantsSchema
};
