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
      // Usar raw query para evitar problemas con las asociaciones de Sequelize
      let whereConditions = [];
      let replacements = {};

      if (filtros.id_estado_cita) {
        whereConditions.push('c.id_estado_cita = :estado');
        replacements.estado = filtros.id_estado_cita;
      }

      if (filtros.fecha_cita) {
        whereConditions.push('c.fecha_cita = :fecha');
        replacements.fecha = filtros.fecha_cita;
      }

      if (filtros.id_agente_asignado) {
        whereConditions.push('c.id_agente_asignado = :agente');
        replacements.agente = filtros.id_agente_asignado;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const query = `
        SELECT
          c.id_cita,
          c.id_persona,
          c.id_inmueble,
          c.id_servicio,
          c.fecha_cita,
          c.hora_inicio,
          c.hora_fin,
          c.id_estado_cita,
          c.id_agente_asignado,
          c.observaciones,
          c.fecha_creacion,

          -- Datos del cliente
          p.id_persona as cliente_id_persona,
          p.nombre_completo as cliente_nombre_completo,
          p.apellido_completo as cliente_apellido_completo,
          p.tipo_documento as cliente_tipo_documento,
          p.numero_documento as cliente_numero_documento,
          p.correo as cliente_correo,
          p.telefono as cliente_telefono,

          -- Datos del inmueble
          i.registro_inmobiliario as inmueble_registro,
          i.direccion as inmueble_direccion,
          i.pais as inmueble_pais,
          i.departamento as inmueble_departamento,
          i.ciudad as inmueble_ciudad,

          -- Datos del servicio
          s.nombre_servicio as servicio_nombre,

          -- Datos del estado
          e.nombre_estado as estado_nombre,

          -- Datos del agente (si existe)
          a.id_persona as agente_id_persona,
          a.nombre_completo as agente_nombre_completo,
          a.apellido_completo as agente_apellido_completo

        FROM Citas c
        INNER JOIN Personas p ON c.id_persona = p.id_persona
        INNER JOIN Inmuebles i ON c.id_inmueble = i.id_inmueble
        INNER JOIN Servicios_Cita s ON c.id_servicio = s.id_servicio
        INNER JOIN Estados_Cita e ON c.id_estado_cita = e.id_estado_cita
        LEFT JOIN Personas a ON c.id_agente_asignado = a.id_persona
        ${whereClause}
        ORDER BY c.fecha_cita DESC, c.hora_inicio ASC
      `;

      const citas = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      // Transformar los datos al formato esperado por el frontend
      const citasTransformadas = citas.map(cita => ({
        id: cita.id_cita,
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

        // Datos del cliente anidados
        cliente: {
          id_persona: cita.cliente_id_persona,
          nombre_completo: cita.cliente_nombre_completo,
          apellido_completo: cita.cliente_apellido_completo,
          tipo_documento: cita.cliente_tipo_documento,
          numero_documento: cita.cliente_numero_documento,
          correo: cita.cliente_correo,
          telefono: cita.cliente_telefono
        },

        // Datos del inmueble anidados
        inmueble: {
          registro_inmobiliario: cita.inmueble_registro,
          direccion: cita.inmueble_direccion,
          pais: cita.inmueble_pais,
          departamento: cita.inmueble_departamento,
          ciudad: cita.inmueble_ciudad
        },

        // Datos del servicio anidados
        servicio: {
          nombre_servicio: cita.servicio_nombre
        },

        // Datos del estado anidados
        estado: cita.estado_nombre,

        // Datos del agente anidados (si existe)
        agente: cita.agente_id_persona ? {
          id_persona: cita.agente_id_persona,
          nombre_completo: cita.agente_nombre_completo,
          apellido_completo: cita.agente_apellido_completo
        } : null
      }));

      return citasTransformadas;
    } catch (error) {
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

}

module.exports = new CitaService();
