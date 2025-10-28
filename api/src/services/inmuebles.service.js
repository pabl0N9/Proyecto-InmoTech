const { Inmueble, Persona, PropiedadInmueble } = require('../models');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class InmueblesService {
  /**
   * Crear un nuevo inmueble
   * @param {Object} inmuebleData - Datos del inmueble
   * @param {number} userId - ID del usuario que crea
   * @returns {Promise<Object>} Inmueble creado
   */
  async crearInmueble(inmuebleData, userId) {
    const result = await sequelize.transaction(async (t) => {
      try {
        // Crear inmueble
        const inmueble = await Inmueble.create({
          ...inmuebleData,
          estado: true
        }, { transaction: t });

        // Si el usuario no es propietario, asignar rol de propietario
        const persona = await Persona.findByPk(userId, { transaction: t });
        if (persona && !persona.tiene_cuenta) {
          // Aquí podríamos actualizar el rol, pero por simplicidad asumimos que se maneja en otro lugar
        }

        logger.info(`Inmueble creado: ${inmueble.registro_inmobiliario} por usuario ${userId}`);

        return inmueble;
      } catch (error) {
        logger.error('Error creando inmueble:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Listar inmuebles con filtros
   * @param {Object} filtros - Filtros de búsqueda
   * @param {Object} opciones - Opciones de paginación
   * @returns {Promise<Object>} Lista paginada de inmuebles
   */
  async listarInmuebles(filtros = {}, opciones = {}) {
    try {
      const {
        ciudad,
        precio_min,
        precio_max,
        area_min,
        categoria,
        estado = true
      } = filtros;

      const {
        pagina = 1,
        limite = 20,
        ordenarPor = 'fecha_registro',
        orden = 'DESC'
      } = opciones;

      const offset = (pagina - 1) * limite;

      const whereClause = { estado };

      if (ciudad) whereClause.ciudad = { [sequelize.Op.iLike]: `%${ciudad}%` };
      if (categoria) whereClause.categoria = categoria;
      if (precio_min || precio_max) {
        whereClause.precio_venta = {};
        if (precio_min) whereClause.precio_venta[sequelize.Op.gte] = precio_min;
        if (precio_max) whereClause.precio_venta[sequelize.Op.lte] = precio_max;
      }
      if (area_min) whereClause.area_construida = { [sequelize.Op.gte]: area_min };

      const { count, rows } = await Inmueble.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [[ordenarPor, orden]],
        include: [
          {
            model: Persona,
            as: 'propietarios',
            through: { attributes: [] },
            attributes: ['id_persona', 'primer_nombre', 'primer_apellido', 'correo']
          }
        ]
      });

      return {
        inmuebles: rows,
        paginacion: {
          total: count,
          pagina,
          limite,
          paginas_totales: Math.ceil(count / limite)
        }
      };
    } catch (error) {
      logger.error('Error listando inmuebles:', error);
      throw error;
    }
  }

  /**
   * Obtener inmueble por ID
   * @param {number} inmuebleId - ID del inmueble
   * @returns {Promise<Object>} Inmueble encontrado
   */
  async obtenerPorId(inmuebleId) {
    try {
      const inmueble = await Inmueble.findOne({
        where: { id_inmueble: inmuebleId, estado: true },
        include: [
          {
            model: Persona,
            as: 'propietarios',
            through: { attributes: [] },
            attributes: ['id_persona', 'primer_nombre', 'primer_apellido', 'correo', 'telefono']
          }
        ]
      });

      if (!inmueble) {
        throw new Error('Inmueble no encontrado');
      }

      return inmueble;
    } catch (error) {
      logger.error('Error obteniendo inmueble:', error);
      throw error;
    }
  }

  /**
   * Obtener disponibilidad horaria de un inmueble
   * @param {number} inmuebleId - ID del inmueble
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise<Object>} Horarios disponibles
   */
  async obtenerDisponibilidad(inmuebleId, fecha) {
    try {
      // Verificar que el inmueble existe
      const inmueble = await this.obtenerPorId(inmuebleId);

      // Obtener citas del día
      const { Cita, ServicioCita } = require('../models');
      const citasDelDia = await Cita.findAll({
        where: {
          id_inmueble: inmuebleId,
          fecha_cita: fecha,
          id_estado_cita: { [sequelize.Op.in]: [1, 2, 3] } // Solicitada, Confirmada, Programada
        },
        include: [
          {
            model: ServicioCita,
            as: 'servicio',
            attributes: ['duracion_estimada']
          }
        ]
      });

      // Horarios de trabajo (ejemplo: 8:00 - 18:00)
      const horaInicio = 8;
      const horaFin = 18;
      const intervalo = 30; // minutos

      const horariosDisponibles = [];
      let horaActual = horaInicio;

      while (horaActual < horaFin) {
        const horaInicioSlot = `${horaActual.toString().padStart(2, '0')}:00:00`;
        const horaFinSlot = `${(horaActual + intervalo / 60).toString().padStart(2, '0')}:00:00`;

        // Verificar si hay conflicto con citas existentes
        const conflicto = citasDelDia.some(cita => {
          const citaInicio = cita.hora_inicio;
          const citaFin = cita.hora_fin;
          return (horaInicioSlot < citaFin && horaFinSlot > citaInicio);
        });

        if (!conflicto) {
          horariosDisponibles.push({
            hora_inicio: horaInicioSlot,
            hora_fin: horaFinSlot,
            disponible: true
          });
        }

        horaActual += intervalo / 60;
      }

      return {
        inmueble: {
          id_inmueble: inmueble.id_inmueble,
          registro_inmobiliario: inmueble.registro_inmobiliario,
          direccion: inmueble.direccion
        },
        fecha,
        horarios_disponibles: horariosDisponibles
      };
    } catch (error) {
      logger.error('Error obteniendo disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Actualizar inmueble
   * @param {number} inmuebleId - ID del inmueble
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Inmueble actualizado
   */
  async actualizarInmueble(inmuebleId, updateData) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const inmueble = await Inmueble.findOne({
          where: { id_inmueble: inmuebleId, estado: true },
          transaction: t
        });

        if (!inmueble) {
          throw new Error('Inmueble no encontrado');
        }

        await inmueble.update(updateData, { transaction: t });

        logger.info(`Inmueble actualizado: ${inmuebleId}`);

        return await this.obtenerPorId(inmuebleId);
      } catch (error) {
        logger.error('Error actualizando inmueble:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Eliminar inmueble (lógicamente)
   * @param {number} inmuebleId - ID del inmueble
   * @returns {Promise<boolean>} True si se eliminó
   */
  async eliminarInmueble(inmuebleId) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const inmueble = await Inmueble.findOne({
          where: { id_inmueble: inmuebleId, estado: true },
          transaction: t
        });

        if (!inmueble) {
          throw new Error('Inmueble no encontrado');
        }

        await inmueble.update({ estado: false }, { transaction: t });

        logger.info(`Inmueble eliminado: ${inmuebleId}`);

        return true;
      } catch (error) {
        logger.error('Error eliminando inmueble:', error);
        throw error;
      }
    });

    return result;
  }
}

module.exports = new InmueblesService();
