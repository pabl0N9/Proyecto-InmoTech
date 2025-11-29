const Persona = require('./Persona');
const Administrativo = require('./Administrativo');
const Inmueble = require('./Inmueble');
const ServicioCita = require('./ServicioCita');
const EstadoCita = require('./EstadoCita');
const Cita = require('./Cita');
<<<<<<< HEAD
const HistorialAsignacionAgente = require('./HistorialAsignacionAgente');  // <-- NUEVO
=======
const HistorialAsignacionAgente = require('./HistorialAsignacionAgente');
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
const Notificacion = require('./Notificacion');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const Acceso = require('./Acceso');
const PersonasRol = require('./PersonasRol');
const PropiedadInmueble = require('./PropiedadInmueble');
const Reporte = require('./Reporte');
<<<<<<< HEAD
=======
const Sale = require('./Sale');
const Lease = require('./Lease');
const Arriendo = require('./Arriendo');
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
const Invitacion = require('./Invitacion');

// Asociaciones de Cita
Cita.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'cliente'
});

<<<<<<< HEAD
Cita.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Cita.belongsTo(ServicioCita, {
  foreignKey: 'id_servicio',
  as: 'servicio'
});

Cita.belongsTo(EstadoCita, {
  foreignKey: 'id_estado_cita',
  as: 'estado'
});

Cita.belongsTo(Persona, {
  foreignKey: 'id_agente_asignado',
  as: 'agente'
});

Cita.belongsTo(Persona, {
  foreignKey: 'id_usuario_creador',
  as: 'creador'
});

Cita.belongsTo(Cita, {
  foreignKey: 'id_cita_original',
  as: 'citaOriginal'
});

// Asociaciones inversas de Persona
Persona.hasMany(Cita, {
  foreignKey: 'id_persona',
  as: 'citasComoCliente'
});

Persona.hasMany(Cita, {
  foreignKey: 'id_agente_asignado',
  as: 'citasComoAgente'
});

// Asociaciones inversas de otros modelos
Inmueble.hasMany(Cita, {
  foreignKey: 'id_inmueble',
  as: 'citas'
});

ServicioCita.hasMany(Cita, {
  foreignKey: 'id_servicio',
  as: 'citas'
});

EstadoCita.hasMany(Cita, {
  foreignKey: 'id_estado_cita',
  as: 'citas'
});

// Asociaciones de Notificacion
Notificacion.belongsTo(Cita, {
  foreignKey: 'id_cita',
  as: 'cita'
});

// ← AGREGAR ESTAS ASOCIACIONES
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

// Asociaciones de Acceso
=======
// Persona - Acceso (One-to-One)
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
Acceso.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasOne(Acceso, {
  foreignKey: 'id_persona',
  as: 'acceso'
});

<<<<<<< HEAD
// Asociaciones de Invitacion
Invitacion.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasMany(Invitacion, {
  foreignKey: 'id_persona',
  as: 'invitaciones'
});

// Asociaciones de PersonasRol
PersonasRol.belongsTo(Persona, {
=======
// Persona - Administrativo (One-to-One)
Administrativo.belongsTo(Persona, {
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
  foreignKey: 'id_persona',
  as: 'persona'
});

PersonasRol.belongsTo(Rol, {
  foreignKey: 'id_rol',
  as: 'rol'
});

Persona.belongsToMany(Rol, {
  through: PersonasRol,
  foreignKey: 'id_persona',
  otherKey: 'id_rol',
  as: 'roles'
});

// Asociaciones de Permiso
Permiso.belongsTo(Rol, {
  foreignKey: 'id_rol',
  as: 'rol'
});

Rol.hasMany(Permiso, {
  foreignKey: 'id_rol',
  as: 'permisos'
});

// FIN ASOCIACIONES DE PERMISOS

Rol.belongsToMany(Persona, {
  through: PersonasRol,
  foreignKey: 'id_rol',
  otherKey: 'id_persona',
  as: 'personas'
});

// Asociaciones de PropiedadInmueble
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
  as: 'propietariosRelacion'
});

Persona.hasMany(PropiedadInmueble, {
  foreignKey: 'id_persona',
  as: 'propiedadesRelacion'
});

Inmueble.belongsToMany(Persona, {
  through: PropiedadInmueble,
  foreignKey: 'id_inmueble',
  otherKey: 'id_persona',
  as: 'propietarios'
});

Persona.belongsToMany(Inmueble, {
  through: PropiedadInmueble,
  foreignKey: 'id_persona',
  otherKey: 'id_inmueble',
  as: 'inmuebles'
});

<<<<<<< HEAD
// Asociaciones de comodidades
Inmueble.belongsToMany(Comodidad, {
  through: InmuebleComodidad,
  foreignKey: 'id_inmueble',
  otherKey: 'id_comodidad',
  as: 'comodidades'
});

Comodidad.belongsToMany(Inmueble, {
  through: InmuebleComodidad,
  foreignKey: 'id_comodidad',
  otherKey: 'id_inmueble',
  as: 'inmuebles'
});

Inmueble.hasMany(InmuebleComodidad, {
  foreignKey: 'id_inmueble',
  as: 'comodidadesRelacion'
});

InmuebleComodidad.belongsTo(Comodidad, {
  foreignKey: 'id_comodidad',
  as: 'comodidad'
});

// Asociaciones de Reporte
=======
Persona.hasOne(Buyer, {
  foreignKey: 'id_persona',
  as: 'buyer'
});

// Buyer - Sale (One-to-One) - ¡RELACIÓN CLAVE CORREGIDA!
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

// Sale - Buyer (Comprador)
Sale.belongsTo(Buyer, {
  foreignKey: 'id_comprador',
  as: 'comprador'
});

Buyer.hasMany(Sale, {
  foreignKey: 'id_comprador',
  as: 'ventas'
});

// =============================================================================
// ASOCIACIONES DE ARRIENDOS (LEASE)
// =============================================================================

// Lease - Inmueble (Arrendamientos)
Lease.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Inmueble.hasMany(Lease, {
  foreignKey: 'id_inmueble',
  as: 'arriendos'
});

// Lease - Persona (Arrendatario) usando id_cliente (columna id_arrendatario)
Lease.belongsTo(Persona, {
  foreignKey: 'id_cliente',
  as: 'arrendatario'
});

Persona.hasMany(Lease, {
  foreignKey: 'id_cliente',
  as: 'arriendosComoArrendatario'
});

// =============================================================================
// ASOCIACIONES DE ARRIENDOS (Arriendo - tabla Arriendos)
// =============================================================================
Arriendo.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'Inmueble'
});

Inmueble.hasMany(Arriendo, {
  foreignKey: 'id_inmueble',
  as: 'arriendosContrato'
});

Arriendo.belongsTo(Renant, {
  foreignKey: 'id_arrendatario',
  as: 'Arrendatario'
});

Renant.hasMany(Arriendo, {
  foreignKey: 'id_arrendatario',
  as: 'arriendos'
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

// ASOCIACIONES DE REPORTES
// =============================================================================

>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
Reporte.belongsTo(Persona, {
  foreignKey: 'id_generado_por',
  as: 'generadoPor'
});

Persona.hasMany(Reporte, {
  foreignKey: 'id_generado_por',
  as: 'reportes'
});
// FIN DE NUEVAS ASOCIACIONES

<<<<<<< HEAD
// Asociaciones de HistorialAsignacionAgente
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

// Asociaciones de Administrativo
Administrativo.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
=======
// =============================================================================
// ASOCIACIONES DE HISTORIAL ASIGNACIÓN AGENTE
// =============================================================================

HistorialAsignacionAgente.belongsTo(Cita, {
  foreignKey: 'id_cita',
  as: 'cita'
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
});

Persona.hasOne(Administrativo, {
  foreignKey: 'id_persona',
  as: 'administrativo'
});

module.exports = {
  Persona,
  Administrativo,
  Inmueble,
  ServicioCita,
  EstadoCita,
  Cita,
<<<<<<< HEAD
  HistorialAsignacionAgente,  // <-- NUEVO
=======
  HistorialAsignacionAgente,
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
  Notificacion,
  Rol,
  Permiso,
  Acceso,
  PersonasRol,
  PropiedadInmueble,
  Reporte,
<<<<<<< HEAD
=======
  Buyer,
  Renant,
  Sale,
  Lease,
  Arriendo,
>>>>>>> ce0cf95798581a8b1debed16ee980718455d53c2
  Invitacion
};
