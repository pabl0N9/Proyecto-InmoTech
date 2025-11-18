const Persona = require('./Persona');
const Administrativo = require('./Administrativo');
const Inmueble = require('./Inmueble');
const ServicioCita = require('./ServicioCita');
const EstadoCita = require('./EstadoCita');
const Cita = require('./Cita');
const HistorialAsignacionAgente = require('./HistorialAsignacionAgente');  // <-- NUEVO
const Notificacion = require('./Notificacion');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const Acceso = require('./Acceso');
const PersonasRol = require('./PersonasRol');
const PropiedadInmueble = require('./PropiedadInmueble');
const Reporte = require('./Reporte');
const ReporteImagen = require('./ReporteImagen');
const ReporteArchivo = require('./ReporteArchivo');

const ReporteRubro = require('./ReporteRubro');
const RubroSeguimiento = require('./RubroSeguimiento');
const ReporteSeguimientoGeneral = require('./ReporteSeguimientoGeneral');

// Asociaciones de Cita
Cita.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'cliente'
});

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
Acceso.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasOne(Acceso, {
  foreignKey: 'id_persona',
  as: 'acceso'
});

// Asociaciones de PersonasRol
PersonasRol.belongsTo(Persona, {
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
  as: 'propietarios'
});

Persona.hasMany(PropiedadInmueble, {
  foreignKey: 'id_persona',
  as: 'propiedades'
});

// Asociaciones de Reporte
Reporte.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Reporte.belongsTo(Persona, {
  foreignKey: 'id_responsable',
  as: 'responsable'
});

Reporte.belongsTo(Persona, {
  foreignKey: 'id_persona_reporta',
  as: 'reportadoPor'
});

Persona.hasMany(Reporte, {
  foreignKey: 'id_responsable',
  as: 'reportesComoResponsable'
});

Persona.hasMany(Reporte, {
  foreignKey: 'id_persona_reporta',
  as: 'reportesReportados'
});

// Asociaciones de ReporteImagen
ReporteImagen.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});

Reporte.hasMany(ReporteImagen, {
  foreignKey: 'id_reporte',
  as: 'imagenes'
});

// Asociaciones de ReporteArchivo
ReporteArchivo.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});

Reporte.hasMany(ReporteArchivo, {
  foreignKey: 'id_reporte',
  as: 'archivos'
});

// Asociaciones de ReporteRubro
ReporteRubro.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});

Reporte.hasMany(ReporteRubro, {
  foreignKey: 'id_reporte',
  as: 'rubros'
});

// Asociaciones de RubroSeguimiento
RubroSeguimiento.belongsTo(ReporteRubro, {
  foreignKey: 'id_rubro',
  as: 'rubro'
});

RubroSeguimiento.belongsTo(Persona, {
  foreignKey: 'id_responsable',
  as: 'responsable'
});

ReporteRubro.hasMany(RubroSeguimiento, {
  foreignKey: 'id_rubro',
  as: 'seguimientos'
});

Persona.hasMany(RubroSeguimiento, {
  foreignKey: 'id_responsable',
  as: 'seguimientosRubros'
});

// Asociaciones de ReporteSeguimientoGeneral
ReporteSeguimientoGeneral.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});

ReporteSeguimientoGeneral.belongsTo(Persona, {
  foreignKey: 'id_responsable',
  as: 'responsable'
});

Reporte.hasMany(ReporteSeguimientoGeneral, {
  foreignKey: 'id_reporte',
  as: 'seguimientosGenerales'
});

Persona.hasMany(ReporteSeguimientoGeneral, {
  foreignKey: 'id_responsable',
  as: 'seguimientosGenerales'
});

// FIN DE NUEVAS ASOCIACIONES

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
  HistorialAsignacionAgente,  // <-- NUEVO
  Notificacion,
  Rol,
  Permiso,
  Acceso,
  PersonasRol,
  PropiedadInmueble,
  Reporte,
  ReporteImagen,
  ReporteArchivo,
  ReporteRubro,
  RubroSeguimiento,
  ReporteSeguimientoGeneral
};