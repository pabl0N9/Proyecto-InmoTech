const { sequelize } = require('../config/database');

// Importar modelos existentes
const Persona = require('./Persona');
const Administrativo = require('./Administrativo');
const Inmueble = require('./Inmueble');
const ServicioCita = require('./ServicioCita');
const EstadoCita = require('./EstadoCita');
const Cita = require('./Cita');
const HistorialAsignacionAgente = require('./HistorialAsignacionAgente');
const Notificacion = require('./Notificacion');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const Acceso = require('./Acceso');
const PersonasRol = require('./PersonasRol');
const PropiedadInmueble = require('./PropiedadInmueble');
const Buyer = require('./Buyer');
const Renant = require('./Renant');
const Reporte = require('./Reporte');
const Sale = require('./Sale');
const Lease = require('./Lease');

// =============================================================================
// ASOCIACIONES PRINCIPALES - PERSONA
// =============================================================================

// Persona - Acceso (One-to-One)
Acceso.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasOne(Acceso, {
  foreignKey: 'id_persona',
  as: 'acceso'
});

// Persona - Administrativo (One-to-One)
Administrativo.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasOne(Administrativo, {
  foreignKey: 'id_persona',
  as: 'administrativo'
});

// Persona - Roles (Many-to-Many through PersonasRol)
Persona.belongsToMany(Rol, {
  through: PersonasRol,
  foreignKey: 'id_persona',
  otherKey: 'id_rol',
  as: 'roles'
});

Rol.belongsToMany(Persona, {
  through: PersonasRol,
  foreignKey: 'id_rol',
  otherKey: 'id_persona',
  as: 'personas'
});

PersonasRol.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

PersonasRol.belongsTo(Rol, {
  foreignKey: 'id_rol',
  as: 'rol'
});

// =============================================================================
// ASOCIACIONES DE INMUEBLES
// =============================================================================

// Inmueble - Propiedad (Many-to-Many through PropiedadInmueble)
PropiedadInmueble.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

PropiedadInmueble.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'propietario'
});

Inmueble.hasMany(PropiedadInmueble, {
  foreignKey: 'id_inmueble',
  as: 'propietarios'
});

Persona.hasMany(PropiedadInmueble, {
  foreignKey: 'id_persona',
  as: 'propiedades'
});

// =============================================================================
// ASOCIACIONES DE CITAS
// =============================================================================

// Cita - Persona (Cliente)
Cita.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'cliente'
});

Persona.hasMany(Cita, {
  foreignKey: 'id_persona',
  as: 'citasComoCliente'
});

// Cita - Persona (Agente)
Cita.belongsTo(Persona, {
  foreignKey: 'id_agente_asignado',
  as: 'agente'
});

Persona.hasMany(Cita, {
  foreignKey: 'id_agente_asignado',
  as: 'citasComoAgente'
});

// Cita - Inmueble
Cita.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Inmueble.hasMany(Cita, {
  foreignKey: 'id_inmueble',
  as: 'citas'
});

// Cita - Servicio
Cita.belongsTo(ServicioCita, {
  foreignKey: 'id_servicio',
  as: 'servicio'
});

ServicioCita.hasMany(Cita, {
  foreignKey: 'id_servicio',
  as: 'citas'
});

// Cita - Estado
Cita.belongsTo(EstadoCita, {
  foreignKey: 'id_estado_cita',
  as: 'estado'
});

EstadoCita.hasMany(Cita, {
  foreignKey: 'id_estado_cita',
  as: 'citas'
});

// Cita - Cita (Reagendamiento)
Cita.belongsTo(Cita, {
  foreignKey: 'id_cita_original',
  as: 'citaOriginal'
});

Cita.hasMany(Cita, {
  foreignKey: 'id_cita_original',
  as: 'reagendamientos'
});

// =============================================================================
// ASOCIACIONES DE COMPRADORES (BUYER) - ¡NUEVAS Y CORREGIDAS!
// =============================================================================

// Buyer - Persona (One-to-One)
Buyer.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasOne(Buyer, {
  foreignKey: 'id_persona',
  as: 'buyer'
});

// Buyer - Inmueble (Many-to-One)
Buyer.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Inmueble.hasMany(Buyer, {
  foreignKey: 'id_inmueble',
  as: 'compradores'
});

// Buyer - Sale (One-to-One) - ¡RELACIÓN CLAVE CORREGIDA!
Buyer.belongsTo(Sale, {
  foreignKey: 'id_venta',
  as: 'venta'
});

Sale.hasOne(Buyer, {
  foreignKey: 'id_venta',
  as: 'buyerRecord'
});

// =============================================================================
// ASOCIACIONES DE VENTAS (SALE)
// =============================================================================

// Sale - Inmueble
Sale.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Inmueble.hasMany(Sale, {
  foreignKey: 'id_inmueble',
  as: 'ventas'
});

// Sale - Persona (Comprador)
Sale.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'comprador'
});

Persona.hasMany(Sale, {
  foreignKey: 'id_persona',
  as: 'ventasComoComprador'
});

// =============================================================================
// ASOCIACIONES DE ARRIENDOS (LEASE)
// =============================================================================

// Lease - Inmueble
Lease.belongsTo(Inmueble, {
  foreignKey: 'inmueble_id',
  as: 'inmueble'
});

Inmueble.hasMany(Lease, {
  foreignKey: 'inmueble_id',
  as: 'arriendos'
});

// Lease - Persona (Arrendador)
Lease.belongsTo(Persona, {
  foreignKey: 'arrendador_id',
  as: 'arrendador'
});

Persona.hasMany(Lease, {
  foreignKey: 'arrendador_id',
  as: 'arriendosComoArrendador'
});

// Lease - Persona (Arrendatario)
Lease.belongsTo(Persona, {
  foreignKey: 'arrendatario_id',
  as: 'arrendatario'
});

Persona.hasMany(Lease, {
  foreignKey: 'arrendatario_id',
  as: 'arriendosComoArrendatario'
});

// Lease - Cita
Lease.belongsTo(Cita, {
  foreignKey: 'cita_id',
  as: 'cita'
});

Cita.hasOne(Lease, {
  foreignKey: 'cita_id',
  as: 'arriendo'
});

// =============================================================================
// ASOCIACIONES DE NOTIFICACIONES
// =============================================================================

Notificacion.belongsTo(Cita, {
  foreignKey: 'id_cita',
  as: 'cita'
});

Notificacion.belongsTo(Rol, {
  foreignKey: 'id_rol_destino',
  as: 'rol'
});

Notificacion.belongsTo(Persona, {
  foreignKey: 'id_persona_destino',
  as: 'persona'
});

Cita.hasMany(Notificacion, {
  foreignKey: 'id_cita',
  as: 'notificaciones'
});

Rol.hasMany(Notificacion, {
  foreignKey: 'id_rol_destino',
  as: 'notificaciones'
});

Persona.hasMany(Notificacion, {
  foreignKey: 'id_persona_destino',
  as: 'notificaciones'
});

// =============================================================================
// ASOCIACIONES DE PERMISOS
// =============================================================================

Permiso.belongsTo(Rol, {
  foreignKey: 'id_rol',
  as: 'rol'
});

Rol.hasMany(Permiso, {
  foreignKey: 'id_rol',
  as: 'permisos'
});

// =============================================================================
// ASOCIACIONES DE REPORTES
// =============================================================================

Reporte.belongsTo(Persona, {
  foreignKey: 'id_generado_por',
  as: 'generadoPor'
});

Persona.hasMany(Reporte, {
  foreignKey: 'id_generado_por',
  as: 'reportes'
});

// =============================================================================
// ASOCIACIONES DE HISTORIAL ASIGNACIÓN AGENTE
// =============================================================================

HistorialAsignacionAgente.belongsTo(Cita, {
  foreignKey: 'id_cita',
  as: 'cita'
});

HistorialAsignacionAgente.belongsTo(Persona, {
  foreignKey: 'id_agente_anterior',
  as: 'agenteAnterior'
});

HistorialAsignacionAgente.belongsTo(Persona, {
  foreignKey: 'id_agente_nuevo',
  as: 'agenteNuevo'
});

HistorialAsignacionAgente.belongsTo(Persona, {
  foreignKey: 'id_usuario_realizo',
  as: 'usuarioRealizo'
});

Cita.hasMany(HistorialAsignacionAgente, {
  foreignKey: 'id_cita',
  as: 'historialAsignaciones'
});

// =============================================================================
// EXPORTACIÓN DE MODELOS
// =============================================================================

module.exports = {
  sequelize,
  Persona,
  Administrativo,
  Inmueble,
  ServicioCita,
  EstadoCita,
  Cita,
  HistorialAsignacionAgente,
  Notificacion,
  Rol,
  Permiso,
  Acceso,
  PersonasRol,
  PropiedadInmueble,
  Reporte,
  Buyer,
  Renant,
  Sale,
  Lease
};
