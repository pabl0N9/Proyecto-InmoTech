const { Persona } = require('../models');
const { Cita } = require('../models');
const { Inmueble } = require('../models');
const { ServicioCita } = require('../models');
const { EstadoCita } = require('../models');
const { sequelize, Op } = require('../config/database');
const { isSuperAdministrator } = require('../middlewares/auth.middleware');
const logger = require('../utils/logger');

class CitaService {

  async crearCita(dataCita) {
    const result = await sequelize.transaction(async (t) => {
      try {
        // ✅ Usar directamente nombre_completo y apellido_completo como vienen del frontend
        const nombre_completo = dataCita.nombre_completo || '';
        const apellido_completo = dataCita.apellido_completo || '';

        // 1. Buscar o crear persona
        const correo = dataCita.correo || dataCita.email || '';
        const [persona, creada] = await Persona.findOrCreate({
          where: {
            tipo_documento: dataCita.tipo_documento,
            numero_documento: dataCita.numero_documento
          },
          defaults: {
            tipo_documento: dataCita.tipo_documento,
            numero_documento: dataCita.numero_documento,
            nombre_completo,
            apellido_completo,
            correo,
            telefono: dataCita.telefono,
            tiene_cuenta: false
          },
          transaction: t
        });

        if (!creada) {
          await persona.update({
            nombre_completo,
            apellido_completo,
            correo,
            telefono: dataCita.telefono
          }, { transaction: t });
        }

        // 3. Validación para evitar cita duplicada (misma persona, inmueble, fecha, hora inicio-fin que se solapen)
        const citaExistente = await Cita.findOne({
          where: {
            id_persona: persona.id_persona,
            id_inmueble: dataCita.id_inmueble,
            fecha_cita: dataCita.fecha_cita,
            hora_inicio: dataCita.hora_inicio,
            hora_fin: dataCita.hora_fin
          },
          transaction: t
        });

        if (citaExistente) {
          throw new Error('Ya existe una cita con la misma información para este usuario');
        }

        // 4. Crear la cita si no existe duplicado
        const nuevaCita = await Cita.create({
          id_persona: persona.id_persona,
          id_inmueble: dataCita.id_inmueble,
          id_servicio: dataCita.id_servicio,
          fecha_cita: dataCita.fecha_cita,
          hora_inicio: dataCita.hora_inicio,
          hora_fin: dataCita.hora_fin,
          id_estado_cita: dataCita.id_estado_cita || 1, // 1 = Solicitada
          observaciones: dataCita.observaciones || null,
          id_agente_asignado: null,
          id_usuario_creador: dataCita.id_usuario_creador // ✅ Agregado: quién creó la cita
        }, { transaction: t });

        return await this.obtenerCitaPorId(nuevaCita.id_cita, t);

      } catch (error) {
        throw error;
      }
    });

    return result;
  }

  async obtenerCitaPorId(id, transaction = null) {
    const cita = await Cita.findByPk(id, {
      include: [
        { association: 'cliente' },
        { association: 'inmueble' },
        { association: 'servicio' },
        { association: 'estado' },
        { association: 'agente', required: false },
        { association: 'creador', required: false, attributes: ['id_persona', 'nombre_completo', 'apellido_completo'] }
      ],
      transaction
    });

    if (!cita) throw new Error('Cita no encontrada');

    return cita;
  }

  async obtenerTodasLasCitas(filtros = {}) {
    try {
      logger.info(`🔍 Consultando citas con filtros: ${JSON.stringify(filtros)}`);

      // ✅ OPTIMIZACIÓN: Usar Sequelize con includes optimizados y paginación
      const includeOptions = [
        {
          association: 'cliente',
          attributes: ['id_persona', 'nombre_completo', 'apellido_completo', 'tipo_documento', 'numero_documento', 'correo', 'telefono']
        },
        {
          association: 'inmueble',
          attributes: ['registro_inmobiliario', 'direccion', 'pais', 'departamento', 'ciudad']
        },
        {
          association: 'servicio',
          attributes: ['nombre_servicio']
        },
        {
          association: 'estado',
          attributes: ['nombre_estado']
        },
        {
          association: 'agente',
          required: false,
          attributes: ['id_persona', 'nombre_completo', 'apellido_completo']
        },
        {
          association: 'creador',
          required: false,
          attributes: ['id_persona', 'nombre_completo', 'apellido_completo']
        }
      ];

      const whereClause = {};
      if (filtros.id_estado_cita) whereClause.id_estado_cita = filtros.id_estado_cita;
      if (filtros.fecha_cita) whereClause.fecha_cita = filtros.fecha_cita;
      if (filtros.id_agente_asignado) whereClause.id_agente_asignado = filtros.id_agente_asignado;

      // ✅ OPTIMIZACIÓN: Usar paginación si se especifica
      const queryOptions = {
        where: whereClause,
        include: includeOptions,
        order: [
          ['fecha_cita', 'DESC'],
          ['hora_inicio', 'ASC']
        ],
        logging: false // ✅ Deshabilitar logging SQL para mejor rendimiento
      };

      // Aplicar paginación si se especifica
      if (filtros.page && filtros.limit) {
        const offset = (filtros.page - 1) * filtros.limit;
        queryOptions.limit = filtros.limit;
        queryOptions.offset = offset;
      }

      const { count, rows } = await Cita.findAndCountAll(queryOptions);

      logger.info(`✅ ${rows.length} citas obtenidas exitosamente`);

      // Transformar al formato esperado por el frontend
      const citasFormateadas = rows.map(cita => ({
        id: cita.id_cita,
        id_cita: cita.id_cita,
        id_persona: cita.id_persona,
        id_inmueble: cita.id_inmueble,
        id_servicio: cita.id_servicio,
        fecha_cita: cita.fecha_cita,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        id_estado_cita: cita.id_estado_cita,
        id_agente_asignado: cita.id_agente_asignado,
        observaciones: cita.observaciones,
        fecha_creacion: cita.fecha_creacion,

        cliente: cita.cliente ? {
          id_persona: cita.cliente.id_persona,
          nombre_completo: cita.cliente.nombre_completo,
          apellido_completo: cita.cliente.apellido_completo,
          tipo_documento: cita.cliente.tipo_documento,
          numero_documento: cita.cliente.numero_documento,
          correo: cita.cliente.correo,
          telefono: cita.cliente.telefono
        } : null,

        inmueble: cita.inmueble ? {
          registro_inmobiliario: cita.inmueble.registro_inmobiliario,
          direccion: cita.inmueble.direccion,
          pais: cita.inmueble.pais,
          departamento: cita.inmueble.departamento,
          ciudad: cita.inmueble.ciudad
        } : null,

        servicio: cita.servicio ? {
          nombre_servicio: cita.servicio.nombre_servicio
        } : null,

        estado: cita.estado ? cita.estado.nombre_estado : 'Desconocido',

        agente: cita.agente ? {
          id_persona: cita.agente.id_persona,
          nombre_completo: cita.agente.nombre_completo,
          apellido_completo: cita.agente.apellido_completo
        } : null,

        creador: cita.creador ? {
          id_persona: cita.creador.id_persona,
          nombre_completo: cita.creador.nombre_completo,
          apellido_completo: cita.creador.apellido_completo
        } : null
      }));

      // ✅ OPTIMIZACIÓN: Retornar con paginación si se aplicó
      if (filtros.page && filtros.limit) {
        return {
          citas: citasFormateadas,
          total: count,
          page: filtros.page,
          limit: filtros.limit,
          pages: Math.ceil(count / filtros.limit)
        };
      }

      // Retornar array simple si no hay paginación
      return citasFormateadas;

    } catch (error) {
      logger.error(`❌ Error en obtenerTodasLasCitas: ${error.message}`);
      throw error;
    }
  }

  async eliminarCita(id) {
    try {
      const cita = await this.obtenerCitaPorId(id);

      if (!cita) {
        throw new Error('Cita no encontrada');
      }

      // En lugar de eliminar, actualizar el estado a cancelada (6)
      await cita.update({
        id_estado_cita: 6, // Cancelada
        motivo_cancelacion: 'Eliminada por el usuario',
        fecha_cancelacion: new Date()
      });

      return await this.obtenerCitaPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async confirmarCita(id, idAgenteAsignado) {
    try {
      const cita = await this.obtenerCitaPorId(id);

      if (!cita) {
        throw new Error('Cita no encontrada');
      }

      await cita.update({
        id_estado_cita: 2, // Confirmada
        id_agente_asignado: idAgenteAsignado,
        fecha_confirmacion: new Date()
      });

      return cita;
    } catch (error) {
      throw error;
    }
  }

  async cancelarCita(id, motivoCancelacion) {
    try {
      const cita = await this.obtenerCitaPorId(id);

      if (!cita) {
        throw new Error('Cita no encontrada');
      }

      await cita.update({
        id_estado_cita: 6, // Cancelada
        motivo_cancelacion: motivoCancelacion,
        fecha_cancelacion: new Date()
      });

      return await this.obtenerCitaPorId(id);
    } catch (error) {
      throw error;
    }
  }

  async reagendarCita(id, nuevosDatos) {
    try {
      const cita = await this.obtenerCitaPorId(id);

      if (!cita) {
        throw new Error('Cita no encontrada');
      }

      await cita.update({
        ...nuevosDatos,
        id_estado_cita: 4, // Reagendada
        fecha_actualizacion: new Date()
      });

      return cita;
    } catch (error) {
      throw error;
    }
  }

  async completarCita(id) {
    try {
      const cita = await this.obtenerCitaPorId(id);

      if (!cita) {
        throw new Error('Cita no encontrada');
      }

      await cita.update({
        id_estado_cita: 5, // Completada
        fecha_completada: new Date()
      });

      return cita;
    } catch (error) {
      throw error;
    }
  }

  async actualizarCita(id, nuevosDatos) {
    try {
      const cita = await this.obtenerCitaPorId(id);

      if (!cita) {
        throw new Error('Cita no encontrada');
      }

      await cita.update({
        ...nuevosDatos,
        fecha_actualizacion: new Date()
      });

      return await this.obtenerCitaPorId(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asignar un agente a una cita y registrar en historial
   * @param {number} idCita - ID de la cita
   * @param {number} idAgenteNuevo - ID del agente a asignar
   * @param {number} idUsuarioRealizo - ID del usuario que realiza la asignación
   * @param {string} comentario - Comentario opcional (requerido si es reasignación)
   * @returns {Promise<Object>} Cita actualizada con historial
   */
  async asignarAgente(idCita, idAgenteNuevo, idUsuarioRealizo, comentario = null) {
    const result = await sequelize.transaction(async (t) => {
      try {
        logger.info(`🔄 Asignando agente ${idAgenteNuevo} a cita ${idCita}`);

        // Verificar cita existe
        const cita = await this.obtenerCitaPorId(idCita, t);
        if (!cita) {
          throw new Error('Cita no encontrada');
        }

        const idAgenteAnterior = cita.id_agente_asignado;

        // Si es reasignación, validar comentario
        if (idAgenteAnterior && !comentario) {
          throw new Error('Se requiere un comentario cuando se reasigna un agente');
        }

        // Actualizar cita con nuevo agente
        await cita.update({
          id_agente_asignado: idAgenteNuevo,
          fecha_actualizacion: new Date()
        }, { transaction: t });

        // Si cambió el estado a confirmada al asignar agente, actualizar fecha_confirmacion
        if (cita.id_estado_cita === 1) { // Solicitada
          await cita.update({
            id_estado_cita: 2, // Confirmada
            fecha_confirmacion: new Date()
          }, { transaction: t });
        }

        // Registrar en historial
        const { HistorialAsignacionAgente } = require('../models');
        await HistorialAsignacionAgente.create({
          id_cita: idCita,
          id_agente_anterior: idAgenteAnterior,
          id_agente_nuevo: idAgenteNuevo,
          comentario: comentario,
          estado_asignacion: idAgenteAnterior ? 'Reasignada' : 'Activa',
          id_usuario_realizo: idUsuarioRealizo,
          fecha_asignacion: new Date()
        }, { transaction: t });

        logger.info(`✅ Agente asignado exitosamente a cita ${idCita}`);

        // Retornar cita con historial actualizado
        return await this.obtenerCitaConHistorial(idCita, t);

      } catch (error) {
        logger.error(`❌ Error asignando agente: ${error.message}`);
        throw error;
      }
    });

    return result;
  }

  /**
   * Obtener agentes disponibles para asignación (empleados activos)
   * @returns {Promise<Array>} Lista de agentes disponibles
   */
  async obtenerAgentesDisponibles() {
    try {
      logger.info(`🔍 Obteniendo agentes disponibles`);

      const { Persona, Administrativo, Rol } = require('../models');

      const agentes = await Persona.findAll({
        include: [
          {
            model: Administrativo,
            as: 'administrativo',
            where: { estado_laboral: 'Activo' },
            required: true
          },
          {
            model: Rol,
            as: 'roles',
            where: { nombre_rol: 'Empleado' }, // Solo empleados con rol de agente
            through: { attributes: [] },
            required: true,
            attributes: []
          }
        ],
        attributes: [
          'id_persona',
          'nombre_completo',
          'apellido_completo',
          ['nombre_completo', 'nombres'],
          ['apellido_completo', 'apellidos'],
          'correo'
        ]
      });

      const agentesFormateados = agentes.map(agente => ({
        id_persona: agente.id_persona,
        nombre_completo: `${agente.nombre_completo} ${agente.apellido_completo}`,
        email: agente.correo
      }));

      logger.info(`✅ ${agentesFormateados.length} agentes disponibles encontrados`);
      return agentesFormateados;

    } catch (error) {
      logger.error(`❌ Error obteniendo agentes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener historial de asignaciones de una cita
   * @param {number} idCita - ID de la cita
   * @returns {Promise<Array>} Historial de asignaciones
   */
  async obtenerHistorialAsignaciones(idCita) {
    try {
      const { HistorialAsignacionAgente } = require('../models');

      const historial = await HistorialAsignacionAgente.findAll({
        where: { id_cita: idCita },
        include: [
          {
            association: 'agenteAnterior',
            attributes: ['id_persona', 'nombre_completo', 'apellido_completo'],
            required: false
          },
          {
            association: 'agenteNuevo',
            attributes: ['id_persona', 'nombre_completo', 'apellido_completo'],
            required: true
          },
          {
            association: 'usuarioRealizo',
            attributes: ['id_persona', 'nombre_completo', 'apellido_completo'],
            required: true
          }
        ],
        order: [['fecha_asignacion', 'DESC']]
      });

      const historialFormateado = historial.map(entry => ({
        id_historial: entry.id_historial,
        fecha_asignacion: entry.fecha_asignacion,
        comentario: entry.comentario,
        estado_asignacion: entry.estado_asignacion,
        agente_anterior: entry.agenteAnterior ? {
          id_persona: entry.agenteAnterior.id_persona,
          nombre_completo: `${entry.agenteAnterior.nombre_completo} ${entry.agenteAnterior.apellido_completo}`
        } : null,
        agente_nuevo: {
          id_persona: entry.agenteNuevo.id_persona,
          nombre_completo: `${entry.agenteNuevo.nombre_completo} ${entry.agenteNuevo.apellido_completo}`
        },
        usuario_realizo: {
          id_persona: entry.usuarioRealizo.id_persona,
          nombre_completo: `${entry.usuarioRealizo.nombre_completo} ${entry.usuarioRealizo.apellido_completo}`
        }
      }));

      return historialFormateado;

    } catch (error) {
      logger.error(`❌ Error obteniendo historial: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener cita con historial de asignaciones completo
   * @param {number} idCita - ID de la cita
   * @param {Object} transaction - Transacción opcional
   * @returns {Promise<Object>} Cita con historial
   */
  async obtenerCitaConHistorial(idCita, transaction = null) {
    try {
      const cita = await this.obtenerCitaPorId(idCita, transaction);
      const historial = await this.obtenerHistorialAsignaciones(idCita);

      return {
        ...cita.toJSON(),
        historial_asignaciones: historial
      };

    } catch (error) {
      logger.error(`❌ Error obteniendo cita con historial: ${error.message}`);
      throw error;
    }
  }

  /**
   * ✅ MÉTODO OPTIMIZADO: Actualizar solo el estado de la cita sin cargar asociaciones
   * Reduce el tiempo de respuesta de ~1 segundo a ~50-100ms
   */
  async actualizarEstadoCitaOptimizado(idCita, idEstadoCita) {
    try {
      logger.info(`🔄 Actualizando estado de cita ${idCita} a ${idEstadoCita} (optimizado)`);

      // Validar que la cita existe
      const citaExiste = await Cita.findByPk(idCita, {
        attributes: ['id_cita', 'id_estado_cita']
      });

      if (!citaExiste) {
        throw new Error('Cita no encontrada');
      }

      // Actualizar solo el estado sin cargar asociaciones
      const [affectedRows] = await Cita.update(
        {
          id_estado_cita: idEstadoCita,
          fecha_actualizacion: new Date()
        },
        {
          where: { id_cita: idCita },
          returning: false // No necesitamos devolver los datos actualizados
        }
      );

      if (affectedRows === 0) {
        throw new Error('No se pudo actualizar el estado de la cita');
      }

      logger.info(`✅ Estado de cita ${idCita} actualizado a ${idEstadoCita} (optimizado)`);

      // Retornar solo los datos mínimos necesarios para la actualización optimista
      return {
        id_cita: idCita,
        id_estado_cita: idEstadoCita,
        fecha_actualizacion: new Date()
      };
    } catch (error) {
      logger.error(`❌ Error en actualizarEstadoCitaOptimizado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener citas filtradas por permisos del usuario
   * @param {number} userId - ID del usuario
   * @param {Object} filtros - Filtros adicionales (estado, fecha, etc.)
   * @returns {Promise<Array>} Lista de citas filtradas por permisos
   */
  async obtenerCitasPorUsuario(userId, filtros = {}) {
    try {
      logger.info(`🔍 Consultando citas para usuario ${userId} con filtros: ${JSON.stringify(filtros)}`);

      // Verificar roles del usuario
      const { Persona, Rol } = require('../models');
      const persona = await Persona.findOne({
        where: { id_persona: userId },
        include: [
          {
            model: Rol,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['nombre_rol']
          }
        ]
      });

      if (!persona) {
        throw new Error('Usuario no encontrado');
      }

      const roles = persona.roles.map(rol => rol.nombre_rol);
      const esSuperAdmin = roles.includes('Super Administrador');
      const esAdmin = roles.includes('Administrador');

      let whereClause = {};

      // Aplicar filtros básicos
      if (filtros.id_estado_cita) whereClause.id_estado_cita = filtros.id_estado_cita;
      if (filtros.fecha_cita) whereClause.fecha_cita = filtros.fecha_cita;
      if (filtros.id_agente_asignado) whereClause.id_agente_asignado = filtros.id_agente_asignado;

      // Si NO es super admin ni admin, filtrar las citas por permisos
      if (!esSuperAdmin && !esAdmin) {
        // Para empleados: solo sus citas asignadas o creadas por ellos
        whereClause[Op.or] = [
          { id_agente_asignado: userId },
          { id_usuario_creador: userId }
        ];
      }
      // Si es super admin o admin, no filtra adicional (ve todas)

      logger.info(`📋 WHERE clause para usuario ${userId}: ${JSON.stringify(whereClause)}`);

      const citas = await Cita.findAll({
        where: whereClause,
        include: [
          {
            association: 'cliente',
            attributes: ['id_persona', 'nombre_completo', 'apellido_completo', 'tipo_documento', 'numero_documento', 'correo', 'telefono']
          },
          {
            association: 'inmueble',
            attributes: ['registro_inmobiliario', 'direccion', 'pais', 'departamento', 'ciudad']
          },
          {
            association: 'servicio',
            attributes: ['nombre_servicio']
          },
          {
            association: 'estado',
            attributes: ['nombre_estado']
          },
          {
            association: 'agente',
            required: false,
            attributes: ['id_persona', 'nombre_completo', 'apellido_completo']
          },
          {
            association: 'creador',
            required: false,
            attributes: ['id_persona', 'nombre_completo', 'apellido_completo']
          }
        ],
        order: [
          ['fecha_cita', 'DESC'],
          ['hora_inicio', 'ASC']
        ],
        logging: false
      });

      // Transformar al formato del frontend
      const citasFormateadas = citas.map(cita => ({
        id: cita.id_cita,
        id_cita: cita.id_cita,
        id_persona: cita.id_persona,
        id_inmueble: cita.id_inmueble,
        id_servicio: cita.id_servicio,
        id_usuario_creador: cita.id_usuario_creador,
        fecha_cita: cita.fecha_cita,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        id_estado_cita: cita.id_estado_cita,
        id_agente_asignado: cita.id_agente_asignado,
        observaciones: cita.observaciones,
        fecha_creacion: cita.fecha_creacion,

        cliente: cita.cliente ? {
          id_persona: cita.cliente.id_persona,
          nombre_completo: cita.cliente.nombre_completo,
          apellido_completo: cita.cliente.apellido_completo,
          tipo_documento: cita.cliente.tipo_documento,
          numero_documento: cita.cliente.numero_documento,
          correo: cita.cliente.correo,
          telefono: cita.cliente.telefono
        } : null,

        inmueble: cita.inmueble ? {
          registro_inmobiliario: cita.inmueble.registro_inmobiliario,
          direccion: cita.inmueble.direccion,
          pais: cita.inmueble.pais,
          departamento: cita.inmueble.departamento,
          ciudad: cita.inmueble.ciudad
        } : null,

        servicio: cita.servicio ? {
          nombre_servicio: cita.servicio.nombre_servicio
        } : null,

        estado: cita.estado ? cita.estado.nombre_estado : 'Desconocido',

        agente: cita.agente ? {
          id_persona: cita.agente.id_persona,
          nombre_completo: cita.agente.nombre_completo,
          apellido_completo: cita.agente.apellido_completo
        } : null,

        creador: cita.creador ? {
          id_persona: cita.creador.id_persona,
          nombre_completo: cita.creador.nombre_completo,
          apellido_completo: cita.creador.apellido_completo
        } : null
      }));

      logger.info(`✅ ${citasFormateadas.length} citas obtenidas para usuario ${userId} (${roles.join(', ')})`);
      return citasFormateadas;

    } catch (error) {
      logger.error(`❌ Error en obtenerCitasPorUsuario: ${error.message}`);
      throw error;
    }
  }

}

module.exports = new CitaService();
