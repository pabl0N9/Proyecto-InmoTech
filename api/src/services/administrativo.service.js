const { Persona, Administrativo, Acceso, PersonasRol, Rol } = require('../models');
const { sequelize } = require('../config/database');
const bcryptUtils = require('../utils/bcrypt');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');

class AdministrativoService {
  /**
   * Registra un nuevo administrativo
   * @param {Object} adminData - Datos del administrativo
   * @returns {Promise<Object>} Administrativo creado con tokens
   */
  async registrarAdministrativo(adminData) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const {
          email,
          password,
          nombre_completo,
          apellido_completo,
          telefono,
          tipo_documento,
          numero_documento,
          codigo_empleado,
          fecha_ingreso,
          cargo,
          departamento,
          salario,
          id_rol
        } = adminData;

        // Verificar si el email ya existe
        const personaExistente = await Persona.findOne({
          where: { correo: email },
          transaction: t
        });

        if (personaExistente) {
          throw new Error('El correo electrónico ya está registrado');
        }

        // Verificar si el documento ya existe
        const documentoExistente = await Persona.findOne({
          where: { tipo_documento, numero_documento },
          transaction: t
        });

        if (documentoExistente) {
          throw new Error('El documento ya está registrado');
        }

        // Verificar si el código de empleado ya existe
        const adminExistente = await Administrativo.findOne({
          where: { codigo_empleado },
          transaction: t
        });

        if (adminExistente) {
          throw new Error('El código de empleado ya está registrado');
        }

        // Crear persona
        const nuevaPersona = await Persona.create({
          tipo_documento,
          numero_documento,
          nombre_completo,
          apellido_completo,
          correo: email,
          telefono,
          tiene_cuenta: true,
          estado: true
        }, { transaction: t });

        // Crear acceso
        const hashedPassword = await bcryptUtils.hashPassword(password);
        await Acceso.create({
          id_persona: nuevaPersona.id_persona,
          contrasena: hashedPassword
        }, { transaction: t });

        // Crear registro administrativo
        const nuevoAdministrativo = await Administrativo.create({
          id_persona: nuevaPersona.id_persona,
          codigo_empleado,
          fecha_ingreso,
          cargo,
          departamento,
          salario,
          estado_laboral: 'Activo'
        }, { transaction: t });

        // Asignar rol administrativo específico si se proporciona
        if (id_rol) {
          // Verificar que el rol existe y es administrativo
          const rolSeleccionado = await Rol.findOne({
            where: {
              id_rol: id_rol,
              es_rol_administrativo: true,
              estado: true
            },
            transaction: t
          });

          if (!rolSeleccionado) {
            throw new Error('El rol seleccionado no es válido o no es administrativo');
          }

          await PersonasRol.create({
            id_persona: nuevaPersona.id_persona,
            id_rol: id_rol
          }, { transaction: t });
        } else {
          // Asignar rol por defecto (Empleado)
          const rolDefault = await Rol.findOne({
            where: {
              nombre_rol: 'Empleado',
              es_rol_administrativo: true,
              estado: true
            },
            transaction: t
          });

          if (rolDefault) {
            await PersonasRol.create({
              id_persona: nuevaPersona.id_persona,
              id_rol: rolDefault.id_rol
            }, { transaction: t });
          }
        }

        logger.info(`Administrativo registrado: ${email} (Código: ${codigo_empleado})`);

        // Obtener roles asignados
        const rolesAsignados = await PersonasRol.findAll({
          where: { id_persona: nuevaPersona.id_persona },
          include: [{
            model: Rol,
            as: 'rol',
            where: { estado: true },
            required: true
          }],
          transaction: t
        });

        const rolesNombres = rolesAsignados.map(pr => pr.rol.nombre_rol);

        // Generar tokens
        const payload = {
          id: nuevaPersona.id_persona,
          email: nuevaPersona.correo,
          roles: rolesNombres,
          es_administrativo: true
        };

        const tokens = jwtUtils.generateTokens(payload);

        return {
          user: {
            id: nuevaPersona.id_persona,
            email: nuevaPersona.correo,
            nombre_completo: nuevaPersona.nombre_completo,
            apellido_completo: nuevaPersona.apellido_completo,
            roles: rolesNombres,
            es_administrativo: true,
            administrativo: {
              id_administrativo: nuevoAdministrativo.id_administrativo,
              codigo_empleado: nuevoAdministrativo.codigo_empleado,
              cargo: nuevoAdministrativo.cargo,
              departamento: nuevoAdministrativo.departamento
            }
          },
          ...tokens
        };

      } catch (error) {
        logger.error('Error en registro de administrativo:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Obtiene administrativos con paginación
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Lista de administrativos
   */
  async obtenerAdministrativos({ page = 1, limit = 10, estado }) {
    try {
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (estado) {
        whereClause.estado_laboral = estado;
      }

      const { count, rows } = await Administrativo.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Persona,
            as: 'persona',
            attributes: ['id_persona', 'tipo_documento', 'numero_documento', 'nombre_completo', 'apellido_completo', 'correo', 'telefono', 'fecha_registro']
          }
        ],
        limit,
        offset,
        order: [['fecha_ingreso', 'DESC']]
      });

      return {
        administrativos: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      logger.error('Error obteniendo administrativos:', error);
      throw error;
    }
  }

  /**
   * Obtiene un administrativo por ID
   * @param {number} id - ID del administrativo
   * @returns {Promise<Object>} Datos del administrativo
   */
  async obtenerAdministrativoPorId(id) {
    try {
      const administrativo = await Administrativo.findOne({
        where: { id_administrativo: id },
        include: [
          {
            model: Persona,
            as: 'persona',
            attributes: ['id_persona', 'tipo_documento', 'numero_documento', 'nombre_completo', 'apellido_completo', 'correo', 'telefono', 'fecha_registro']
          }
        ]
      });

      if (!administrativo) {
        throw new Error('Administrativo no encontrado');
      }

      return administrativo;

    } catch (error) {
      logger.error('Error obteniendo administrativo por ID:', error);
      throw error;
    }
  }

  /**
   * Actualiza un administrativo
   * @param {number} id - ID del administrativo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Administrativo actualizado
   */
  async actualizarAdministrativo(id, updateData) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const administrativo = await Administrativo.findOne({
          where: { id_administrativo: id },
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ],
          transaction: t
        });

        if (!administrativo) {
          throw new Error('Administrativo no encontrado');
        }

        const { personaData, administrativoData } = updateData;

        // Actualizar datos de persona si se proporcionan
        if (personaData) {
          await administrativo.persona.update(personaData, { transaction: t });
        }

        // Actualizar datos administrativos
        if (administrativoData) {
          await administrativo.update(administrativoData, { transaction: t });
        }

        logger.info(`Administrativo actualizado: ID ${id}`);

        return administrativo;

      } catch (error) {
        logger.error('Error actualizando administrativo:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Cambia el estado laboral de un administrativo
   * @param {number} id - ID del administrativo
   * @param {string} estadoLaboral - Nuevo estado laboral
   * @param {string} fechaRetiro - Fecha de retiro (opcional)
   * @returns {Promise<Object>} Administrativo actualizado
   */
  async cambiarEstadoLaboral(id, estadoLaboral, fechaRetiro = null) {
    try {
      const administrativo = await Administrativo.findOne({
        where: { id_administrativo: id }
      });

      if (!administrativo) {
        throw new Error('Administrativo no encontrado');
      }

      const updateData = { estado_laboral: estadoLaboral };

      if (estadoLaboral === 'Retirado' && fechaRetiro) {
        updateData.fecha_retiro = fechaRetiro;
      }

      await administrativo.update(updateData);

      logger.info(`Estado laboral actualizado para administrativo ID ${id}: ${estadoLaboral}`);

      return administrativo;

    } catch (error) {
      logger.error('Error cambiando estado laboral:', error);
      throw error;
    }
  }

  /**
   * Elimina un administrativo (desactivación lógica)
   * @param {number} id - ID del administrativo
   * @returns {Promise<void>}
   */
  async eliminarAdministrativo(id) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const administrativo = await Administrativo.findOne({
          where: { id_administrativo: id },
          include: [
            {
              model: Persona,
              as: 'persona'
            }
          ],
          transaction: t
        });

        if (!administrativo) {
          throw new Error('Administrativo no encontrado');
        }

        // Cambiar estado laboral a 'Retirado'
        await administrativo.update({
          estado_laboral: 'Retirado',
          fecha_retiro: new Date()
        }, { transaction: t });

        // Desactivar persona
        await administrativo.persona.update({
          estado: false
        }, { transaction: t });

        logger.info(`Administrativo eliminado: ID ${id}`);

      } catch (error) {
        logger.error('Error eliminando administrativo:', error);
        throw error;
      }
    });

    return result;
  }
}

module.exports = new AdministrativoService();
