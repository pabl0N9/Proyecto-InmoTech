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
const Reporte = require('./Reporte');
const Comodidad = require('./Comodidad');
const InmuebleComodidad = require('./InmuebleComodidad');
const Buyer = require('./Buyer');
const Renant = require('./Renant');
const Sale = require('./Sale');
const Lease = require('./Lease');
const Arriendo = require('./Arriendo');
const Invitacion = require('./Invitacion');

// ===========================
// Asociaciones de Cita
// ===========================

Cita.belongsTo(Persona, { foreignKey: 'id_persona', as: 'cliente' });
Cita.belongsTo(Inmueble, { foreignKey: 'id_inmueble', as: 'inmueble' });
Cita.belongsTo(ServicioCita, { foreignKey: 'id_servicio', as: 'servicio' });
Cita.belongsTo(EstadoCita, { foreignKey: 'id_estado_cita', as: 'estado' });
Cita.belongsTo(Persona, { foreignKey: 'id_agente_asignado', as: 'agente' });
Cita.belongsTo(Persona, { foreignKey: 'id_usuario_creador', as: 'creador' });
Cita.belongsTo(Cita, { foreignKey: 'id_cita_original', as: 'citaOriginal' });

Persona.hasMany(Cita, { foreignKey: 'id_persona', as: 'citasComoCliente' });
Persona.hasMany(Cita, { foreignKey: 'id_agente_asignado', as: 'citasComoAgente' });

Inmueble.hasMany(Cita, { foreignKey: 'id_inmueble', as: 'citas' });
ServicioCita.hasMany(Cita, { foreignKey: 'id_servicio', as: 'citas' });
EstadoCita.hasMany(Cita, { foreignKey: 'id_estado_cita', as: 'citas' });

// ===========================
// Notificaciones
// ===========================

Notificacion.belongsTo(Cita, { foreignKey: 'id_cita', as: 'cita' });
Notificacion.belongsTo(Rol, { foreignKey: 'id_rol_destino', as: 'rol' });
Notificacion.belongsTo(Persona, { foreignKey: 'id_persona_destino', as: 'persona' });

Cita.hasMany(Notificacion, { foreignKey: 'id_cita', as: 'notificaciones' });
Rol.hasMany(Notificacion, { foreignKey: 'id_rol_destino', as: 'notificaciones' });
Persona.hasMany(Notificacion, { foreignKey: 'id_persona_destino', as: 'notificaciones' });

// ===========================
// Acceso
// ===========================

Acceso.belongsTo(Persona, { foreignKey: 'id_persona', as: 'persona' });
Persona.hasOne(Acceso, { foreignKey: 'id_persona', as: 'acceso' });

// ===========================
// Invitaciones
// ===========================

Invitacion.belongsTo(Persona, { foreignKey: 'id_persona', as: 'persona' });
Persona.hasMany(Invitacion, { foreignKey: 'id_persona', as: 'invitaciones' });

// ===========================
// Roles y permisos
// ===========================

PersonasRol.belongsTo(Persona, { foreignKey: 'id_persona', as: 'persona' });
PersonasRol.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });

Persona.belongsToMany(Rol, { through: PersonasRol, foreignKey: 'id_persona', otherKey: 'id_rol', as: 'roles' });
Rol.belongsToMany(Persona, { through: PersonasRol, foreignKey: 'id_rol', otherKey: 'id_persona', as: 'personas' });

Permiso.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });
Rol.hasMany(Permiso, { foreignKey: 'id_rol', as: 'permisos' });

// ===========================
// Propiedad e inmueble
// ===========================

PropiedadInmueble.belongsTo(Inmueble, { foreignKey: 'id_inmueble', as: 'inmueble' });
PropiedadInmueble.belongsTo(Persona, { foreignKey: 'id_persona', as: 'propietario' });

Inmueble.hasMany(PropiedadInmueble, { foreignKey: 'id_inmueble', as: 'propietariosRelacion' });
Persona.hasMany(PropiedadInmueble, { foreignKey: 'id_persona', as: 'propiedadesRelacion' });

Inmueble.belongsToMany(Persona, { through: PropiedadInmueble, foreignKey: 'id_inmueble', otherKey: 'id_persona', as: 'propietarios' });
Persona.belongsToMany(Inmueble, { through: PropiedadInmueble, foreignKey: 'id_persona', otherKey: 'id_inmueble', as: 'inmuebles' });

// Comodidades de inmueble
Inmueble.belongsToMany(Comodidad, { through: InmuebleComodidad, foreignKey: 'id_inmueble', otherKey: 'id_comodidad', as: 'comodidades' });
Comodidad.belongsToMany(Inmueble, { through: InmuebleComodidad, foreignKey: 'id_comodidad', otherKey: 'id_inmueble', as: 'inmuebles' });
Inmueble.hasMany(InmuebleComodidad, { foreignKey: 'id_inmueble', as: 'comodidadesRelacion' });
InmuebleComodidad.belongsTo(Comodidad, { foreignKey: 'id_comodidad', as: 'comodidad' });

// ===========================
// Reportes
// ===========================

Reporte.belongsTo(Persona, { foreignKey: 'id_generado_por', as: 'generadoPor' });
Persona.hasMany(Reporte, { foreignKey: 'id_generado_por', as: 'reportes' });

// ===========================
// Historial de asignacion de agente
// ===========================

HistorialAsignacionAgente.belongsTo(Cita, { foreignKey: 'id_cita', as: 'cita' });
HistorialAsignacionAgente.belongsTo(Persona, { foreignKey: 'id_agente_anterior', as: 'agenteAnterior' });
HistorialAsignacionAgente.belongsTo(Persona, { foreignKey: 'id_agente_nuevo', as: 'agenteNuevo' });
HistorialAsignacionAgente.belongsTo(Persona, { foreignKey: 'id_usuario_realizo', as: 'usuarioRealizo' });

Cita.hasMany(HistorialAsignacionAgente, { foreignKey: 'id_cita', as: 'historialAsignaciones' });

// ===========================
// Administrativo
// ===========================

Administrativo.belongsTo(Persona, { foreignKey: 'id_persona', as: 'persona' });
Persona.hasOne(Administrativo, { foreignKey: 'id_persona', as: 'administrativo' });

// ===========================
// Compradores / Arrendatarios y operaciones
// ===========================

Buyer.belongsTo(Persona, { foreignKey: 'id_persona', as: 'persona' });
Persona.hasOne(Buyer, { foreignKey: 'id_persona', as: 'buyer' });

Sale.belongsTo(Inmueble, { foreignKey: 'id_inmueble', as: 'inmueble' });
Inmueble.hasMany(Sale, { foreignKey: 'id_inmueble', as: 'ventas' });
Sale.belongsTo(Buyer, { foreignKey: 'id_comprador', as: 'comprador' });
Buyer.hasMany(Sale, { foreignKey: 'id_comprador', as: 'ventas' });

Lease.belongsTo(Inmueble, { foreignKey: 'id_inmueble', as: 'inmueble' });
Inmueble.hasMany(Lease, { foreignKey: 'id_inmueble', as: 'arriendos' });
Lease.belongsTo(Persona, { foreignKey: 'id_cliente', as: 'arrendatario' });
Persona.hasMany(Lease, { foreignKey: 'id_cliente', as: 'arriendosComoArrendatario' });

// Asociaciones de arrendatarios se definen en el modelo Renant

Arriendo.belongsTo(Inmueble, { foreignKey: 'id_inmueble', as: 'inmueble' });
Inmueble.hasMany(Arriendo, { foreignKey: 'id_inmueble', as: 'arriendosContrato' });
Arriendo.belongsTo(Renant, { foreignKey: 'id_arrendatario', as: 'arrendatario' });
Renant.hasMany(Arriendo, { foreignKey: 'id_arrendatario', as: 'arriendos' });

module.exports = {
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
  Comodidad,
  InmuebleComodidad,
  Buyer,
  Renant,
  Sale,
  Lease,
  Arriendo,
  Invitacion
};
