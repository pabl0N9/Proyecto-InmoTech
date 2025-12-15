const { Reporte, Persona } = require('../models');
const { sequelize } = require('../config/database');
<<<<<<< HEAD
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { normalizePermissionsStructure, normalizeModuleKey, normalizePermissionKey } = require('../utils/permissions.helper');

class ReportesService {
  async resolvePermissionMap(userId, inlinePermissions = {}) {
    const normalizedInline = this.normalizePermissions(inlinePermissions);

    if (!userId) {
      return normalizedInline;
    }

    const permissionsFromDb = await this.fetchUserPermissions(userId);

    Object.entries(normalizedInline).forEach(([moduleKey, perms]) => {
      if (!permissionsFromDb[moduleKey]) {
        permissionsFromDb[moduleKey] = {};
      }

      Object.entries(perms || {}).forEach(([permKey, value]) => {
        if (value) {
          permissionsFromDb[moduleKey][permKey] = true;
        }
      });
    });

    return permissionsFromDb;
  }

  normalizePermissions(permisos = {}) {
    return normalizePermissionsStructure(permisos);
  }

  async fetchUserPermissions(userId) {
    if (!userId) {
      return {};
    }

    let rows = [];
    try {
      [rows] = await sequelize.query(`
        SELECT DISTINCT pe.modulo, pe.permiso
        FROM Personas_rol pr
        INNER JOIN Roles r ON r.id_rol = pr.id_rol AND r.estado = 1
        INNER JOIN Permisos pe ON pe.id_rol = r.id_rol AND pe.estado = 1
        WHERE pr.id_persona = :userId AND pr.estado = 1
      `, { replacements: { userId } });
    } catch (err) {
      // Si la tabla Permisos no existe en esta base, continuamos sin permisos
      logger.warn('fetchUserPermissions: tabla Permisos no disponible, se continua sin permisos');
      rows = [];
    }

    const permissionsMap = rows.reduce((acc, row) => {
      if (!row || !row.modulo || !row.permiso) {
        return acc;
      }

      if (!acc[row.modulo]) {
        acc[row.modulo] = {};
      }
      acc[row.modulo][row.permiso] = true;
      return acc;
    }, {});

    return normalizePermissionsStructure(permissionsMap);
  }

  hasModuleAccess(permissionMap = {}, modules = [], permisos = []) {
    const modulesList = (Array.isArray(modules) ? modules : [modules])
      .map(moduleKey => normalizeModuleKey(moduleKey))
      .filter(Boolean);

    const permisosList = permisos ? (Array.isArray(permisos) ? permisos : [permisos]) : [];
    const normalizedPermissions = permisosList
      .map(permisoKey => normalizePermissionKey(permisoKey))
      .filter(Boolean);

    return modulesList.some(moduleKey => {
      const modulePermissions = permissionMap[moduleKey];
      if (!modulePermissions) {
        return false;
      }

      if (!normalizedPermissions.length) {
        return Object.keys(modulePermissions).length > 0;
      }

      return normalizedPermissions.some(permisoKey => modulePermissions[permisoKey]);
    });
  }

  getRangeDates(rangeKey = '30d') {
    if (rangeKey === 'all') {
      const startDate = new Date(2000, 0, 1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      return {
        key: 'all',
        label: 'Todo el histórico',
        isAll: true,
        days: null,
        startDate,
        endDate,
        previousStartDate: new Date(startDate),
        previousEndDate: new Date(endDate)
      };
    }

    const ranges = { '7d': 7, '30d': 30, '90d': 90 };
    const normalizedKey = ranges[rangeKey] ? rangeKey : '30d';
    const days = ranges[normalizedKey];

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    previousEndDate.setHours(23, 59, 59, 999);

    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousEndDate.getDate() - (days - 1));
    previousStartDate.setHours(0, 0, 0, 0);

    return {
      key: normalizedKey,
      label: `Últimos ${days} días`,
      days,
      startDate,
      endDate,
      previousStartDate,
      previousEndDate
    };
  }

  calculateVariation(current = 0, previous = 0) {
    if (!previous) {
      return current > 0 ? 100 : 0;
    }

    const variation = ((current - previous) / previous) * 100;
    return Number(variation.toFixed(2));
  }

  async buildUsuariosStats(rangeInfo) {
    const startCurrent = new Date(rangeInfo.endDate);
    startCurrent.setDate(1);
    startCurrent.setHours(0, 0, 0, 0);

    const startNext = new Date(startCurrent);
    startNext.setMonth(startNext.getMonth() + 1);

    const startPrevious = new Date(startCurrent);
    startPrevious.setMonth(startPrevious.getMonth() - 1);

    const [
      [summaryRows],
      [newRows],
      [recentRows],
      [inactiveRows],
      [onlineRows]
    ] = await Promise.all([
      sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN estado = 0 THEN 1 ELSE 0 END) as inactivos
        FROM Personas
      `),
      sequelize.query(`
        SELECT
          SUM(CASE WHEN fecha_registro >= :startCurrent AND fecha_registro < :startNext THEN 1 ELSE 0 END) as actuales,
          SUM(CASE WHEN fecha_registro >= :startPrevious AND fecha_registro < :startCurrent THEN 1 ELSE 0 END) as anteriores
        FROM Personas
      `, { replacements: { startCurrent, startNext, startPrevious } }),
      sequelize.query(`
        SELECT TOP 6 
          p.id_persona,
          p.nombre_completo,
          p.apellido_completo,
          p.correo,
          a.ultimo_acceso
        FROM Personas p
        INNER JOIN Acceso a ON a.id_persona = p.id_persona
        WHERE p.estado = 1
        ORDER BY a.ultimo_acceso DESC
      `),
      sequelize.query(`
        SELECT TOP 6 
          p.id_persona,
          p.nombre_completo,
          p.apellido_completo,
          p.correo,
          DATEDIFF(DAY, ISNULL(a.ultimo_acceso, p.fecha_registro), GETDATE()) as diasSinActividad
        FROM Personas p
        LEFT JOIN Acceso a ON a.id_persona = p.id_persona
        WHERE p.estado = 1
        ORDER BY diasSinActividad DESC
      `),
      sequelize.query(`
        SELECT COUNT(*) as total
        FROM Acceso
        WHERE ultimo_acceso IS NOT NULL
          AND ultimo_acceso >= DATEADD(MINUTE, -20, GETDATE())
      `)
    ]);

    const resumenRow = summaryRows[0] || {};
    const nuevosRow = newRows[0] || {};
    const onlineRow = onlineRows[0] || {};

    return {
      resumen: {
        total: parseInt(resumenRow.total || 0, 10),
        activos: parseInt(resumenRow.activos || 0, 10),
        inactivos: parseInt(resumenRow.inactivos || 0, 10),
        nuevosMes: parseInt(nuevosRow.actuales || 0, 10),
        variacionNuevos: this.calculateVariation(
          parseInt(nuevosRow.actuales || 0, 10),
          parseInt(nuevosRow.anteriores || 0, 10)
        ),
        activosAhora: parseInt(onlineRow.total || 0, 10)
      },
      activosRecientes: (recentRows || []).map(row => ({
        id: row.id_persona,
        nombre: row.nombre_completo,
        apellido: row.apellido_completo,
        correo: row.correo,
        ultimo_acceso: row.ultimo_acceso
      })),
      sinActividad: (inactiveRows || []).map(row => ({
        id: row.id_persona,
        nombre: row.nombre_completo,
        apellido: row.apellido_completo,
        correo: row.correo,
        dias_sin_actividad: parseInt(row.diasSinActividad || 0, 10)
      }))
    };
  }

  async buildCitasStats(rangeInfo) {
    const { startDate, endDate, previousStartDate, previousEndDate } = rangeInfo;
    const heatmapStart = new Date(endDate);
    heatmapStart.setDate(heatmapStart.getDate() - 6);
    heatmapStart.setHours(0, 0, 0, 0);

    const [
      [summaryRows],
      [previousRows],
      [estadoRows],
      [mesRows],
      [servicioRows],
      [heatmapRows],
      [agentesRows],
      [agendaRows]
    ] = await Promise.all([
      sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN CONVERT(DATE, fecha_cita) = CONVERT(DATE, GETDATE()) THEN 1 ELSE 0 END) as totalHoy,
          SUM(CASE WHEN fecha_cita >= DATEADD(DAY, -6, CONVERT(DATE, GETDATE())) THEN 1 ELSE 0 END) as estaSemana,
          SUM(CASE WHEN e.nombre_estado IN ('Confirmada','Programada','Asignada','Solicitada') THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN e.nombre_estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN e.nombre_estado = 'Cancelada' THEN 1 ELSE 0 END) as canceladas,
          SUM(CASE WHEN e.nombre_estado = 'Reprogramada' THEN 1 ELSE 0 END) as reprogramadas
        FROM Citas c
        INNER JOIN Estados_cita e ON e.id_estado_cita = c.id_estado_cita
        WHERE c.fecha_cita BETWEEN :startDate AND :endDate
      `, { replacements: { startDate, endDate } }),
      sequelize.query(`
        SELECT COUNT(*) as total
        FROM Citas
        WHERE fecha_cita BETWEEN :startDate AND :endDate
      `, { replacements: { startDate: previousStartDate, endDate: previousEndDate } }),
      sequelize.query(`
        SELECT e.nombre_estado as estado, COUNT(*) as cantidad
        FROM Citas c
        INNER JOIN Estados_cita e ON e.id_estado_cita = c.id_estado_cita
        WHERE c.fecha_cita BETWEEN :startDate AND :endDate
        GROUP BY e.nombre_estado, e.orden
        ORDER BY e.orden
      `, { replacements: { startDate, endDate } }),
      sequelize.query(`
        SELECT 
          CONCAT(YEAR(fecha_cita), '-', RIGHT('0' + CAST(MONTH(fecha_cita) AS VARCHAR(2)), 2)) AS periodo,
          COUNT(*) as cantidad
        FROM Citas
        WHERE fecha_cita BETWEEN :startDate AND :endDate
        GROUP BY YEAR(fecha_cita), MONTH(fecha_cita)
        ORDER BY YEAR(fecha_cita), MONTH(fecha_cita)
      `, { replacements: { startDate, endDate } }),
      sequelize.query(`
        SELECT TOP 6 s.nombre_servicio as servicio, COUNT(*) as cantidad
        FROM Citas c
        INNER JOIN Servicios_cita s ON s.id_servicio = c.id_servicio
        WHERE c.fecha_cita BETWEEN :startDate AND :endDate
        GROUP BY s.nombre_servicio
        ORDER BY cantidad DESC, servicio ASC
      `, { replacements: { startDate, endDate } }),
      sequelize.query(`
        SELECT 
          DATEPART(WEEKDAY, fecha_cita) as diaIndice,
          DATEPART(HOUR, hora_inicio) as hora,
          COUNT(*) as total
        FROM Citas
        WHERE fecha_cita BETWEEN :startDate AND :endDate
        GROUP BY DATEPART(WEEKDAY, fecha_cita), DATEPART(HOUR, hora_inicio)
      `, { replacements: { startDate: heatmapStart, endDate } }),
      sequelize.query(`
        SELECT TOP 5 
          agente.id_persona,
          agente.nombre_completo,
          agente.apellido_completo,
          COUNT(c.id_cita) as total,
          SUM(CASE WHEN e.nombre_estado = 'Completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN e.nombre_estado = 'Cancelada' THEN 1 ELSE 0 END) as canceladas
        FROM Citas c
        INNER JOIN Personas agente ON agente.id_persona = c.id_agente_asignado
        INNER JOIN Estados_cita e ON e.id_estado_cita = c.id_estado_cita
        WHERE c.id_agente_asignado IS NOT NULL
          AND c.fecha_cita BETWEEN :startDate AND :endDate
        GROUP BY agente.id_persona, agente.nombre_completo, agente.apellido_completo
        ORDER BY total DESC, completadas DESC
      `, { replacements: { startDate, endDate } }),
      sequelize.query(`
        SELECT TOP 6 
          c.id_cita,
          c.fecha_cita,
          c.hora_inicio,
          c.hora_fin,
          cliente.nombre_completo AS cliente,
          agente.nombre_completo AS agente,
          e.nombre_estado AS estado,
          s.nombre_servicio AS servicio,
          i.registro_inmobiliario AS inmueble
        FROM Citas c
        LEFT JOIN Personas cliente ON cliente.id_persona = c.id_persona
        LEFT JOIN Personas agente ON agente.id_persona = c.id_agente_asignado
        LEFT JOIN Estados_cita e ON e.id_estado_cita = c.id_estado_cita
        LEFT JOIN Servicios_cita s ON s.id_servicio = c.id_servicio
        LEFT JOIN Inmuebles i ON i.id_inmueble = c.id_inmueble
        WHERE CONVERT(DATE, c.fecha_cita) = CONVERT(DATE, GETDATE())
        ORDER BY c.hora_inicio ASC
      `)
    ]);

    const resumenRow = summaryRows[0] || {};
    const previousRow = previousRows[0] || {};
    const totalEstados = (estadoRows || []).reduce((acc, item) => acc + parseInt(item.cantidad || 0, 10), 0);

    return {
      resumen: {
        total: parseInt(resumenRow.total || 0, 10),
        totalHoy: parseInt(resumenRow.totalHoy || 0, 10),
        estaSemana: parseInt(resumenRow.estaSemana || 0, 10),
        pendientes: parseInt(resumenRow.pendientes || 0, 10),
        completadas: parseInt(resumenRow.completadas || 0, 10),
        canceladas: parseInt(resumenRow.canceladas || 0, 10),
        reprogramadas: parseInt(resumenRow.reprogramadas || 0, 10),
        variacionVsAnterior: this.calculateVariation(
          parseInt(resumenRow.total || 0, 10),
          parseInt(previousRow.total || 0, 10)
        )
      },
      porEstado: (estadoRows || []).map(item => {
        const cantidad = parseInt(item.cantidad || 0, 10);
        return {
          estado: item.estado || 'Sin estado',
          cantidad,
          porcentaje: totalEstados ? Math.round((cantidad / totalEstados) * 100) : 0
        };
      }),
      porMes: (mesRows || []).map(item => ({
        periodo: item.periodo,
        cantidad: parseInt(item.cantidad || 0, 10)
      })),
      servicios: (servicioRows || []).map(item => ({
        servicio: item.servicio,
        cantidad: parseInt(item.cantidad || 0, 10)
      })),
      heatmap: (heatmapRows || []).map(item => ({
        diaIndice: item.diaIndice,
        hora: item.hora,
        total: parseInt(item.total || 0, 10)
      })),
      topAgentes: (agentesRows || []).map(item => ({
        id: item.id_persona,
        nombre: item.nombre_completo,
        apellido: item.apellido_completo,
        total: parseInt(item.total || 0, 10),
        completadas: parseInt(item.completadas || 0, 10),
        canceladas: parseInt(item.canceladas || 0, 10)
      })),
      agendaHoy: (agendaRows || []).map(item => ({
        id: item.id_cita,
        cliente: item.cliente,
        agente: item.agente,
        estado: item.estado,
        servicio: item.servicio,
        inmueble: item.inmueble,
        fecha: item.fecha_cita,
        hora_inicio: item.hora_inicio,
        hora_fin: item.hora_fin
      }))
    };
  }

  async buildAdministrativosStats(rangeInfo) {
    const { startDate, endDate } = rangeInfo;

    const [
      [summaryRows],
      [destacadosRows],
      [estadoRows]
    ] = await Promise.all([
      sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado_laboral = 'Activo' THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN estado_laboral IN ('Inactivo','Retirado') THEN 1 ELSE 0 END) as inactivos,
          SUM(CASE WHEN estado_laboral = 'Suspendido' THEN 1 ELSE 0 END) as suspendidos
        FROM Administrativos
      `),
      sequelize.query(`
        SELECT TOP 5 
          p.id_persona,
          p.nombre_completo,
          p.apellido_completo,
          a.cargo,
          COUNT(c.id_cita) as citas_gestionadas,
          SUM(CASE WHEN e.nombre_estado = 'Completada' THEN 1 ELSE 0 END) as completadas
        FROM Administrativos a
        INNER JOIN Personas p ON p.id_persona = a.id_persona
        LEFT JOIN Citas c ON c.id_agente_asignado = a.id_persona AND c.fecha_cita BETWEEN :startDate AND :endDate
        LEFT JOIN Estados_cita e ON e.id_estado_cita = c.id_estado_cita
        GROUP BY p.id_persona, p.nombre_completo, p.apellido_completo, a.cargo
        ORDER BY citas_gestionadas DESC, completadas DESC
      `, { replacements: { startDate, endDate } }),
      sequelize.query(`
        SELECT estado_laboral as estado, COUNT(*) as cantidad
        FROM Administrativos
        GROUP BY estado_laboral
      `)
    ]);

    const resumenRow = summaryRows[0] || {};

    return {
      resumen: {
        total: parseInt(resumenRow.total || 0, 10),
        activos: parseInt(resumenRow.activos || 0, 10),
        inactivos: parseInt(resumenRow.inactivos || 0, 10),
        suspendidos: parseInt(resumenRow.suspendidos || 0, 10)
      },
      destacados: (destacadosRows || []).map(item => ({
        id: item.id_persona,
        nombre: item.nombre_completo,
        apellido: item.apellido_completo,
        cargo: item.cargo,
        citas: parseInt(item.citas_gestionadas || 0, 10),
        completadas: parseInt(item.completadas || 0, 10)
      })),
      distribucionEstado: (estadoRows || []).map(item => ({
        estado: item.estado,
        cantidad: parseInt(item.cantidad || 0, 10)
      }))
    };
  }

  async buildRolesStats() {
    const [
      [resumenRows],
      [permisosRows],
      [rolesRows]
    ] = await Promise.all([
      sequelize.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN estado = 1 AND es_rol_administrativo = 1 THEN 1 ELSE 0 END) as administrativos
        FROM Roles
      `),
      sequelize.query(`
        SELECT modulo, COUNT(*) as cantidad
        FROM Permisos
        WHERE estado = 1
        GROUP BY modulo
      `),
      sequelize.query(`
        SELECT TOP 6 r.nombre_rol, COUNT(pr.id_persona) as asignados
        FROM Roles r
        LEFT JOIN Personas_rol pr ON pr.id_rol = r.id_rol AND pr.estado = 1
        WHERE r.estado = 1
        GROUP BY r.nombre_rol
        ORDER BY asignados DESC, r.nombre_rol ASC
      `)
    ]);

    const resumenRow = resumenRows[0] || {};

    return {
      resumen: {
        total: parseInt(resumenRow.total || 0, 10),
        activos: parseInt(resumenRow.activos || 0, 10),
        administrativos: parseInt(resumenRow.administrativos || 0, 10),
        permisosActivos: (permisosRows || []).reduce((acc, item) => acc + parseInt(item.cantidad || 0, 10), 0)
      },
      permisosPorModulo: (permisosRows || []).map(item => {
        const canonicalModule = normalizeModuleKey(item.modulo) || item.modulo;
        return {
          modulo: canonicalModule,
          cantidad: parseInt(item.cantidad || 0, 10)
        };
      }),
      rolesMasUsados: (rolesRows || []).map(item => ({
        nombre: item.nombre_rol,
        asignados: parseInt(item.asignados || 0, 10)
      }))
    };
  }

  composeHighlights(stats = {}, modulesAccess = {}) {
    const highlights = [];

    if (modulesAccess.citas && stats.citas?.resumen) {
      highlights.push({
        id: 'citasHoy',
        module: 'citas',
        label: 'Citas para hoy',
        value: stats.citas.resumen.totalHoy || 0,
        delta: stats.citas.resumen.variacionVsAnterior || 0,
        helper: 'vs periodo anterior'
      });
    }

    if (modulesAccess.usuarios && stats.usuarios?.resumen) {
      highlights.push({
        id: 'usuariosActivos',
        module: 'usuarios',
        label: 'Usuarios activos',
        value: stats.usuarios.resumen.activos || 0,
        delta: stats.usuarios.resumen.variacionNuevos || 0,
        helper: 'variacion de nuevos'
      });
    }

    if (modulesAccess.administrativos && stats.administrativos?.resumen) {
      highlights.push({
        id: 'administrativosActivos',
        module: 'administrativos',
        label: 'Administrativos activos',
        value: stats.administrativos.resumen.activos || 0,
        delta: 0,
        helper: 'recursos disponibles'
      });
    }

    if (modulesAccess.roles && stats.roles?.resumen) {
      highlights.push({
        id: 'rolesActivos',
        module: 'roles',
        label: 'Roles activos',
        value: stats.roles.resumen.activos || 0,
        delta: 0,
        helper: 'permisos vigentes'
      });
    }

    return highlights;
  }

=======
const logger = require('../utils/logger');

class ReportesService {
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  /**
   * Crear un nuevo reporte
   * @param {Object} reporteData - Datos del reporte
   * @param {number} userId - ID del usuario que crea
   * @returns {Promise<Object>} Reporte creado
   */
  async crearReporte(reporteData, userId) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const reporte = await Reporte.create({
          ...reporteData,
          id_generado_por: userId,
          estado: 'generado'
        }, { transaction: t });

        logger.info(`Reporte creado: ${reporte.titulo} por usuario ${userId}`);

        return reporte;
      } catch (error) {
        logger.error('Error creando reporte:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Listar reportes con filtros
   * @param {Object} filtros - Filtros de búsqueda
   * @param {Object} opciones - Opciones de paginación
   * @returns {Promise<Object>} Lista paginada de reportes
   */
  async listarReportes(filtros = {}, opciones = {}) {
    try {
      const {
        tipo_reporte,
        estado,
        fecha_desde,
        fecha_hasta,
        id_generado_por
      } = filtros;

      const {
        pagina = 1,
        limite = 20,
        ordenarPor = 'fecha_generacion',
        orden = 'DESC'
      } = opciones;

      const offset = (pagina - 1) * limite;

      const whereClause = {};

      if (tipo_reporte) whereClause.tipo_reporte = tipo_reporte;
      if (estado) whereClause.estado = estado;
<<<<<<< HEAD
      if (id_generado_por) whereClause.id_generado_por = id_generado_por;
      if (fecha_desde || fecha_hasta) {
        whereClause.fecha_generacion = {};
        if (fecha_desde) whereClause.fecha_generacion[Op.gte] = fecha_desde;
        if (fecha_hasta) whereClause.fecha_generacion[Op.lte] = fecha_hasta;
=======
      if (id_generado_por) whereClause.id_responsable = id_generado_por;
      if (fecha_desde || fecha_hasta) {
        whereClause.fecha_generacion = {};
        if (fecha_desde) whereClause.fecha_generacion[sequelize.Op.gte] = fecha_desde;
        if (fecha_hasta) whereClause.fecha_generacion[sequelize.Op.lte] = fecha_hasta;
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      }

      const { count, rows } = await Reporte.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Persona,
<<<<<<< HEAD
            as: 'generadoPor',
=======
            as: 'reportadoPor',
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
            attributes: ['id_persona', 'primer_nombre', 'primer_apellido']
          }
        ],
        limit,
        offset,
        order: [[ordenarPor, orden]]
      });

      return {
        reportes: rows,
        paginacion: {
          total: count,
          pagina,
          limite,
          paginas_totales: Math.ceil(count / limite)
        }
      };
    } catch (error) {
      logger.error('Error listando reportes:', error);
      throw error;
    }
  }

  /**
   * Obtener reporte por ID
   * @param {number} reporteId - ID del reporte
   * @returns {Promise<Object>} Reporte encontrado
   */
  async obtenerPorId(reporteId) {
    try {
      const reporte = await Reporte.findOne({
        where: { id_reporte: reporteId },
        include: [
          {
            model: Persona,
<<<<<<< HEAD
            as: 'generadoPor',
=======
            as: 'reportadoPor',
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
            attributes: ['id_persona', 'primer_nombre', 'primer_apellido', 'correo']
          }
        ]
      });

      if (!reporte) {
        throw new Error('Reporte no encontrado');
      }

      return reporte;
    } catch (error) {
      logger.error('Error obteniendo reporte:', error);
      throw error;
    }
  }

  /**
   * Generar reporte de citas
   * @param {Object} parametros - Parámetros del reporte
   * @param {number} userId - ID del usuario que genera
   * @returns {Promise<Object>} Reporte generado
   */
  async generarReporteCitas(parametros, userId) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const {
          fecha_desde,
          fecha_hasta,
          id_estado_cita,
          id_servicio,
          id_agente
        } = parametros;

        // Construir consulta
        let query = `
          SELECT
            c.id_cita,
            c.fecha_cita,
            c.hora_inicio,
            c.hora_fin,
            ec.nombre_estado as estado_cita,
            sc.nombre_servicio,
            p.primer_nombre + ' ' + p.primer_apellido as cliente,
            p.correo as cliente_correo,
            p.telefono as cliente_telefono,
            i.direccion as inmueble_direccion,
            i.ciudad as inmueble_ciudad,
            ag.primer_nombre + ' ' + ag.primer_apellido as agente,
            c.observaciones,
            c.fecha_creacion
          FROM Citas c
          INNER JOIN Personas p ON c.id_persona = p.id_persona
          INNER JOIN Inmuebles i ON c.id_inmueble = i.id_inmueble
          INNER JOIN Estados_Cita ec ON c.id_estado_cita = ec.id_estado_cita
          INNER JOIN Servicios_Cita sc ON c.id_servicio = sc.id_servicio
          LEFT JOIN Personas ag ON c.id_agente_asignado = ag.id_persona
          WHERE c.fecha_cita BETWEEN '${fecha_desde}' AND '${fecha_hasta}'
        `;

        if (id_estado_cita) query += ` AND c.id_estado_cita = ${id_estado_cita}`;
        if (id_servicio) query += ` AND c.id_servicio = ${id_servicio}`;
        if (id_agente) query += ` AND c.id_agente_asignado = ${id_agente}`;

        query += ' ORDER BY c.fecha_cita, c.hora_inicio';

        const [results] = await sequelize.query(query, { transaction: t });

        // Crear reporte
        const reporte = await Reporte.create({
          tipo_reporte: 'citas',
          titulo: `Reporte de Citas (${fecha_desde} - ${fecha_hasta})`,
          descripcion: `Reporte detallado de citas en el período especificado`,
          parametros: JSON.stringify(parametros),
          datos: JSON.stringify(results),
          id_generado_por: userId
        }, { transaction: t });

        logger.info(`Reporte de citas generado por usuario ${userId}`);

        return {
          reporte,
          datos: results,
          resumen: {
            total_citas: results.length,
            citas_por_estado: this.contarPorCampo(results, 'estado_cita'),
            citas_por_servicio: this.contarPorCampo(results, 'nombre_servicio')
          }
        };
      } catch (error) {
        logger.error('Error generando reporte de citas:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Generar reporte de inmuebles
   * @param {Object} parametros - Parámetros del reporte
   * @param {number} userId - ID del usuario que genera
   * @returns {Promise<Object>} Reporte generado
   */
  async generarReporteInmuebles(parametros, userId) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const {
          ciudad,
          categoria,
          estado = true
        } = parametros;

        let query = `
          SELECT
            i.id_inmueble,
            i.registro_inmobiliario,
            i.direccion,
            i.barrio,
            i.ciudad,
            i.departamento,
            i.categoria,
            i.estado,
            COUNT(c.id_cita) as total_citas,
            MAX(c.fecha_cita) as ultima_cita
          FROM Inmuebles i
          LEFT JOIN Citas c ON i.id_inmueble = c.id_inmueble
          WHERE i.estado = ${estado ? 1 : 0}
        `;

        if (ciudad) query += ` AND i.ciudad = '${ciudad}'`;
        if (categoria) query += ` AND i.categoria = '${categoria}'`;

        query += `
          GROUP BY i.id_inmueble, i.registro_inmobiliario, i.direccion, i.barrio, i.ciudad, i.departamento, i.categoria, i.estado
          ORDER BY i.ciudad, i.direccion
        `;

        const [results] = await sequelize.query(query, { transaction: t });

        // Crear reporte
        const reporte = await Reporte.create({
          tipo_reporte: 'inmuebles',
          titulo: `Reporte de Inmuebles`,
          descripcion: `Reporte detallado de inmuebles disponibles`,
          parametros: JSON.stringify(parametros),
          datos: JSON.stringify(results),
          id_generado_por: userId
        }, { transaction: t });

        logger.info(`Reporte de inmuebles generado por usuario ${userId}`);

        return {
          reporte,
          datos: results,
          resumen: {
            total_inmuebles: results.length,
            inmuebles_por_ciudad: this.contarPorCampo(results, 'ciudad'),
            inmuebles_por_categoria: this.contarPorCampo(results, 'categoria')
          }
        };
      } catch (error) {
        logger.error('Error generando reporte de inmuebles:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Actualizar estado del reporte
   * @param {number} reporteId - ID del reporte
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} Reporte actualizado
   */
  async actualizarEstado(reporteId, estado) {
    try {
      const reporte = await Reporte.findOne({
        where: { id_reporte: reporteId }
      });

      if (!reporte) {
        throw new Error('Reporte no encontrado');
      }

      await reporte.update({ estado });

      logger.info(`Estado del reporte ${reporteId} actualizado a ${estado}`);

      return reporte;
    } catch (error) {
      logger.error('Error actualizando estado del reporte:', error);
      throw error;
    }
  }

  /**
   * Eliminar reporte
   * @param {number} reporteId - ID del reporte
   * @returns {Promise<boolean>} True si se eliminó
   */
  async eliminarReporte(reporteId) {
    try {
      const reporte = await Reporte.findOne({
        where: { id_reporte: reporteId }
      });

      if (!reporte) {
        throw new Error('Reporte no encontrado');
      }

      await reporte.destroy();

      logger.info(`Reporte eliminado: ${reporteId}`);

      return true;
    } catch (error) {
      logger.error('Error eliminando reporte:', error);
      throw error;
    }
  }

  /**
<<<<<<< HEAD
   * Obtener estadísticas para el dashboard
   * @param {Object} userPermissions - Permisos del usuario
   * @param {Array} userRoles - Roles del usuario
   * @returns {Promise<Object>} Estadísticas del dashboard
   */
  async obtenerEstadisticasDashboard(userContext = {}, rangeKey = '30d') {
    try {
      logger.info('Obteniendo estadísticas del dashboard');

      const { id: userId, roles = [], permisos = {} } = userContext;
      const rangeInfo = this.getRangeDates(rangeKey);
      const permissionMap = await this.resolvePermissionMap(userId, permisos);

      const isSuperAdmin = Array.isArray(roles) && roles.includes('Super Administrador');
      const isAdmin = Array.isArray(roles) && roles.includes('Administrador');

      const modulesAccess = {
        citas: isSuperAdmin || isAdmin || this.hasModuleAccess(permissionMap, 'citas'),
        usuarios: isSuperAdmin || isAdmin || this.hasModuleAccess(permissionMap, 'usuarios'),
        administrativos: isSuperAdmin || isAdmin || this.hasModuleAccess(permissionMap, 'administrativos'),
        roles: isSuperAdmin || this.hasModuleAccess(permissionMap, 'roles')
      };

      const [
        citasStats,
        usuariosStats,
        administrativosStats,
        rolesStats
      ] = await Promise.all([
        modulesAccess.citas ? this.buildCitasStats(rangeInfo) : null,
        modulesAccess.usuarios ? this.buildUsuariosStats(rangeInfo) : null,
        modulesAccess.administrativos ? this.buildAdministrativosStats(rangeInfo) : null,
        modulesAccess.roles ? this.buildRolesStats() : null
      ]);

      const highlights = this.composeHighlights(
        { citas: citasStats, usuarios: usuariosStats, administrativos: administrativosStats, roles: rolesStats },
        modulesAccess
      );

      return {
        metadata: {
          generatedAt: new Date(),
          range: {
            key: rangeInfo.key,
            label: rangeInfo.label,
            start: rangeInfo.startDate,
            end: rangeInfo.endDate
          }
        },
        modulesAccess,
        highlights,
        citas: citasStats,
        usuarios: usuariosStats,
        administrativos: administrativosStats,
        roles: rolesStats
      };

    } catch (error) {
      logger.error('Error obteniendo estadísticas del dashboard:', error);

      return {
        metadata: {
          generatedAt: new Date(),
          range: {
            key: '30d',
            label: 'Últimos 30 días'
          }
        },
        modulesAccess: {
          citas: false,
          usuarios: false,
          administrativos: false,
          roles: false
        },
        highlights: [],
        citas: null,
        usuarios: null,
        administrativos: null,
        roles: null
      };
    }
  }

  /**
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
   * Función auxiliar para contar elementos por campo
   * @param {Array} array - Array de objetos
   * @param {string} campo - Campo a contar
   * @returns {Object} Conteo por campo
   */
  contarPorCampo(array, campo) {
    return array.reduce((acc, item) => {
      const valor = item[campo] || 'Sin especificar';
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = new ReportesService();
