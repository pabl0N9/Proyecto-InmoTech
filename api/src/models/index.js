const Persona = require('./Persona');
const Administrativo = require('./Administrativo');
const Inmueble = require('./Inmueble');
const ServicioCita = require('./ServicioCita');
const Comodidad = require('./Comodidad');
const InmuebleComodidad = require('./InmuebleComodidad');
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
const SeguimientoVenta = require('./SeguimientoVenta');
const EstadosVenta = require('./EstadosVenta');
const Invitacion = require('./Invitacion');
const Buyer = require('./Buyer');
const Sale = require('./Sale');
const Renant = require('./Renant');
const Arriendo = require('./Arriendo');
const Lease = require('./Lease');
const Payment = require('./Payment');
const Receipt = require('./Receipt');
const InmuebleImagen = require('./InmuebleImagen');

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

// Asociaciones Inmueble-Comodidad (many-to-many)
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
InmuebleComodidad.belongsTo(Inmueble, { foreignKey: 'id_inmueble', as: 'inmueble' });
InmuebleComodidad.belongsTo(Comodidad, { foreignKey: 'id_comodidad', as: 'comodidad' });

// Asociaciones de imágenes de inmuebles
Inmueble.hasMany(InmuebleImagen, {
  foreignKey: 'id_inmueble',
  as: 'imagenes'
});
InmuebleImagen.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

// Asociaciones de Notificacion
Notificacion.belongsTo(Cita, {
  foreignKey: 'id_cita',
  as: 'cita'
});

// AGREGAR ESTAS ASOCIACIONES
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

// Asociaciones de Reporte (inmuebles, persona que reporta, adjuntos y rubros)
Reporte.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});
Inmueble.hasMany(Reporte, {
  foreignKey: 'id_inmueble',
  as: 'reportes'
});

Reporte.belongsTo(Persona, {
  foreignKey: 'id_persona_reporta',
  as: 'reportadoPor'
});
Persona.hasMany(Reporte, {
  foreignKey: 'id_persona_reporta',
  as: 'reportesReportados'
});

Reporte.hasMany(ReporteImagen, {
  foreignKey: 'id_reporte',
  as: 'imagenes'
});
ReporteImagen.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});

Reporte.hasMany(ReporteArchivo, {
  foreignKey: 'id_reporte',
  as: 'archivos'
});
ReporteArchivo.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});

Reporte.hasMany(ReporteRubro, {
  foreignKey: 'id_reporte',
  as: 'rubros'
});
ReporteRubro.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});

ReporteRubro.hasMany(RubroSeguimiento, {
  foreignKey: 'id_rubro',
  as: 'seguimientos'
});
RubroSeguimiento.belongsTo(ReporteRubro, {
  foreignKey: 'id_rubro',
  as: 'rubro'
});
RubroSeguimiento.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'responsable'
});

Reporte.hasMany(ReporteSeguimientoGeneral, {
  foreignKey: 'id_reporte',
  as: 'seguimientosGenerales'
});
ReporteSeguimientoGeneral.belongsTo(Reporte, {
  foreignKey: 'id_reporte',
  as: 'reporte'
});
ReporteSeguimientoGeneral.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'responsable'
});
// FIN DE NUEVAS ASOCIACIONES DE REPORTES

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

// Asociaciones de Buyer (Compradores)
Buyer.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasOne(Buyer, {
  foreignKey: 'id_persona',
  as: 'buyer'
});

// Asociaciones de Sale (Ventas)
Sale.belongsTo(Buyer, {
  foreignKey: 'id_comprador',
  as: 'comprador'
});

// Vendedor (Persona asociada a la venta)
Sale.belongsTo(Persona, {
  foreignKey: 'id_vendedor',
  as: 'vendedor'
});

Sale.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Buyer.hasMany(Sale, {
  foreignKey: 'id_comprador',
  as: 'ventas'
});

// Seguimiento de venta
Sale.hasMany(SeguimientoVenta, { foreignKey: 'id_venta', as: 'seguimientos' });
SeguimientoVenta.belongsTo(Sale, { foreignKey: 'id_venta', as: 'venta' });
SeguimientoVenta.belongsTo(Persona, { foreignKey: 'id_persona', as: 'persona' });
SeguimientoVenta.belongsTo(EstadosVenta, { foreignKey: 'id_estado_venta', as: 'estado' });

// Persona como vendedor en ventas
Persona.hasMany(Sale, {
  foreignKey: 'id_vendedor',
  as: 'ventasComoVendedor'
});

Inmueble.hasMany(Sale, {
  foreignKey: 'id_inmueble',
  as: 'ventas'
});

// Asociaciones de Renant (Arrendatarios)
// (Las asociaciones Persona-Renant ya se definen en Renant.js para evitar alias duplicados)
// Asociaciones de Arriendo (Contratos)
Arriendo.belongsTo(Renant, {
  foreignKey: 'id_arrendatario',
  as: 'arrendatario'
});

Arriendo.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Renant.hasMany(Arriendo, {
  foreignKey: 'id_arrendatario',
  as: 'arrendamientos'
});

Inmueble.hasMany(Arriendo, {
  foreignKey: 'id_inmueble',
  as: 'arrendamientos'
});

// Asociaciones de Lease (arrendamientos legacy/alternativo)
Lease.belongsTo(Inmueble, {
  foreignKey: 'id_inmueble',
  as: 'inmueble'
});

Lease.belongsTo(Persona, {
  foreignKey: 'id_codeudor',
  as: 'codeudor'
});

Lease.belongsTo(Renant, {
  foreignKey: 'id_arrendatario', // mapea id_cliente en el servicio
  as: 'arrendatario'
});

Inmueble.hasMany(Lease, {
  foreignKey: 'id_inmueble',
  as: 'arrendamientosLegacy'
});

Renant.hasMany(Lease, {
  foreignKey: 'id_arrendatario',
  as: 'arrendamientosLegacy'
});

Persona.hasMany(Lease, {
  foreignKey: 'id_codeudor',
  as: 'arrendamientosComoCodeudor'
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
  ReporteSeguimientoGeneral,
  SeguimientoVenta,
  EstadosVenta,
  Buyer,
  Sale,
  Renant,
  Arriendo,
  Lease,
  Payment,
  Receipt,
  Invitacion,
  Comodidad,
  InmuebleComodidad,
  InmuebleImagen
};
