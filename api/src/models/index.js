<<<<<<< HEAD
const { sequelize } = require('../config/database');

// Importar modelos existentes
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
const Persona = require('./Persona');
const Administrativo = require('./Administrativo');
const Inmueble = require('./Inmueble');
const ServicioCita = require('./ServicioCita');
<<<<<<< HEAD
const EstadoCita = require('./EstadoCita');
const Cita = require('./Cita');
const HistorialAsignacionAgente = require('./HistorialAsignacionAgente');
=======
const Comodidad = require('./Comodidad');
const InmuebleComodidad = require('./InmuebleComodidad');
const EstadoCita = require('./EstadoCita');
const Cita = require('./Cita');
const HistorialAsignacionAgente = require('./HistorialAsignacionAgente');  // <-- NUEVO
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
const Notificacion = require('./Notificacion');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const Acceso = require('./Acceso');
const PersonasRol = require('./PersonasRol');
const PropiedadInmueble = require('./PropiedadInmueble');
<<<<<<< HEAD
const Buyer = require('./Buyer');
const Renant = require('./Renant');
const Reporte = require('./Reporte');
const Sale = require('./Sale');
const Lease = require('./Lease');
const Arriendo = require('./Arriendo');
const Invitacion = require('./Invitacion');
const Comodidad = require('./Comodidad');
const InmuebleComodidad = require('./InmuebleComodidad');

// =============================================================================
// ASOCIACIONES PRINCIPALES - PERSONA
// =============================================================================

// Persona - Acceso (One-to-One)
=======
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
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
Acceso.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasOne(Acceso, {
  foreignKey: 'id_persona',
  as: 'acceso'
});

<<<<<<< HEAD
// Persona - Administrativo (One-to-One)
Administrativo.belongsTo(Persona, {
=======
// Asociaciones de Invitacion
Invitacion.belongsTo(Persona, {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  foreignKey: 'id_persona',
  as: 'persona'
});

<<<<<<< HEAD
Persona.hasOne(Administrativo, {
  foreignKey: 'id_persona',
  as: 'administrativo'
});

// Persona - Roles (Many-to-Many through PersonasRol)
=======
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

>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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

<<<<<<< HEAD
PersonasRol.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

PersonasRol.belongsTo(Rol, {
  foreignKey: 'id_rol',
  as: 'rol'
});

// Persona - Invitaciones (One-to-Many)
Invitacion.belongsTo(Persona, {
  foreignKey: 'id_persona',
  as: 'persona'
});

Persona.hasMany(Invitacion, {
  foreignKey: 'id_persona',
  as: 'invitaciones'
});

// =============================================================================
// ASOCIACIONES DE INMUEBLES
// =============================================================================

// Inmueble - Propiedad (Many-to-Many through PropiedadInmueble)
=======
// Asociaciones de PropiedadInmueble
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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

<<<<<<< HEAD
// =============================================================================
// ASOCIACIONES INMUEBLE - COMODIDADES (Many-to-Many)
// =============================================================================
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

// Cita - Persona (Creador)
Cita.belongsTo(Persona, {
  foreignKey: 'id_usuario_creador',
  as: 'creador'
});

Persona.hasMany(Cita, {
  foreignKey: 'id_usuario_creador',
  as: 'citasCreadas'
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

=======
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
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
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

<<<<<<< HEAD
// =============================================================================
// EXPORTACIÓN DE MODELOS
// =============================================================================

module.exports = {
  sequelize,
=======
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
// (Las asociaciones Persona↔Renant ya se definen en Renant.js para evitar alias duplicados)
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
  foreignKey: 'id_arrendatario', // mapea id_cliente en el servicio
  as: 'arrendatario'
});

Inmueble.hasMany(Lease, {
  foreignKey: 'id_inmueble',
  as: 'arrendamientosLegacy'
});

Persona.hasMany(Lease, {
  foreignKey: 'id_arrendatario',
  as: 'arrendamientosLegacy'
});

module.exports = {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  Persona,
  Administrativo,
  Inmueble,
  ServicioCita,
  EstadoCita,
  Cita,
<<<<<<< HEAD
  HistorialAsignacionAgente,
=======
  HistorialAsignacionAgente,  // <-- NUEVO
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  Notificacion,
  Rol,
  Permiso,
  Acceso,
  PersonasRol,
  PropiedadInmueble,
  Reporte,
<<<<<<< HEAD
  Buyer,
  Renant,
  Sale,
  Lease,
  Arriendo,
  Invitacion,
  Comodidad,
  InmuebleComodidad
};
=======
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
  Invitacion,
  Comodidad,
  InmuebleComodidad,
  InmuebleImagen
};

>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
