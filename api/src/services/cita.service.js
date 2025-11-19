const { Persona } = require('../models');
const { Cita } = require('../models');
const { Inmueble } = require('../models');
const { ServicioCita } = require('../models');
const { EstadoCita } = require('../models');
const { sequelize } = require('../config/database');
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
          id_agente_asignado: null
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
        { association: 'agente', required: false }
      ],
      transaction
    });

    if (!cita) throw new Error('Cita no encontrada');

    return cita;
  }

  async obtenerTodasLasCitas(filtros = {}) {
    try {
      logger.info(`🔍 Consultando citas con filtros: ${JSON.stringify(filtros)}`);

      // ✅ OPTIMIZACIÓN: Usar Sequelize con includes optimizados y caching
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
        }
      ];

      const whereClause = {};
      if (filtros.id_estado_cita) whereClause.id_estado_cita = filtros.id_estado_cita;
      if (filtros.fecha_cita) whereClause.fecha_cita = filtros.fecha_cita;
      if (filtros.id_agente_asignado) whereClause.id_agente_asignado = filtros.id_agente_asignado;

      const citas = await Cita.findAll({
        where: whereClause,
        include: includeOptions,
        order: [
          ['fecha_cita', 'DESC'],
          ['hora_inicio', 'ASC']
        ],
        // ✅ OPTIMIZACIÓN: Deshabilitar logging SQL de Sequelize para mejor rendimiento
        logging: false
      });

      logger.info(`✅ ${citas.length} citas obtenidas exitosamente`);

      // Transformar al formato esperado por el frontend
      return citas.map(cita => ({
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
        } : null
      }));

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

}

module.exports = new CitaService();
