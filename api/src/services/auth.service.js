const { Persona, Acceso, PersonasRol, Rol, Administrativo } = require('../models');
const { sequelize } = require('../config/database');
const bcryptUtils = require('../utils/bcrypt');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado con tokens
   */
  async registrarUsuario(userData) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const { email, password, ...personaData } = userData;

        // Verificar si el email ya existe
        const personaExistente = await Persona.findOne({
          where: { correo: email },
          transaction: t
        });

        if (personaExistente) {
          throw new Error('El correo electrónico ya está registrado');
        }

        // Crear persona
        const nuevaPersona = await Persona.create({
          tipo_documento: userData.tipo_documento,
          numero_documento: userData.numero_documento,
          nombre_completo: userData.nombre_completo,
          apellido_completo: userData.apellido_completo,
          correo: email,
          telefono: userData.telefono,
          tiene_cuenta: true,
          estado: true
        }, { transaction: t });

        // Crear acceso
        const hashedPassword = await bcryptUtils.hashPassword(password);
        await Acceso.create({
          id_persona: nuevaPersona.id_persona,
          contrasena: hashedPassword
        }, { transaction: t });

        // Asignar rol por defecto (Usuario)
        const rolUsuario = await Rol.findOne({
          where: { nombre_rol: 'Usuario' },
          transaction: t
        });

        if (rolUsuario) {
          await PersonasRol.create({
            id_persona: nuevaPersona.id_persona,
            id_rol: rolUsuario.id_rol
          }, { transaction: t });
        }

        logger.info(`Usuario registrado: ${email}`);

        // Generar tokens
        const payload = {
          id: nuevaPersona.id_persona,
          email: nuevaPersona.correo,
          roles: rolUsuario ? [rolUsuario.nombre_rol] : []
        };

        const tokens = jwtUtils.generateTokens(payload);

        return {
          user: {
            id: nuevaPersona.id_persona,
            email: nuevaPersona.correo,
            nombre_completo: nuevaPersona.nombre_completo,
            apellido_completo: nuevaPersona.apellido_completo,
            roles: payload.roles
          },
          ...tokens
        };

      } catch (error) {
        logger.error('Error en registro de usuario:', error);
        throw error;
      }
    });

    return result;
  }

  /**
   * Inicia sesión de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Usuario autenticado con tokens
   */
  async iniciarSesion(email, password) {
    try {
      // Buscar persona por email
      const persona = await Persona.findOne({
        where: { correo: email },
        include: [
          {
            model: Acceso,
            as: 'acceso',
            required: true
          },
          {
            model: Rol,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id_rol', 'nombre_rol', 'es_rol_administrativo']
          },
          {
            model: Administrativo,
            as: 'administrativo',
            required: false,
            where: { estado_laboral: 'Activo' }
          }
        ]
      });

      if (!persona) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const isValidPassword = await bcryptUtils.verifyPassword(password, persona.acceso.contrasena);

      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }

      // Actualizar último acceso
      await Acceso.update(
        { ultimo_acceso: new Date() },
        { where: { id_persona: persona.id_persona } }
      );

      // Preparar roles y determinar si es administrativo
      const roles = persona.roles ? persona.roles.map(rol => rol.nombre_rol) : [];
      const es_administrativo = persona.roles ?
        persona.roles.some(rol => rol.es_rol_administrativo) && persona.administrativo !== null :
        false;

      // Generar tokens
      const payload = {
        id: persona.id_persona,
        email: persona.correo,
        roles: roles,
        es_administrativo: es_administrativo
      };

      const tokens = jwtUtils.generateTokens(payload);

      logger.info(`Usuario inició sesión: ${email} (Administrativo: ${es_administrativo})`);

      return {
        user: {
          id: persona.id_persona,
          email: persona.correo,
          nombre_completo: persona.nombre_completo,
          apellido_completo: persona.apellido_completo,
          roles: roles,
          es_administrativo: es_administrativo
        },
        ...tokens
      };

    } catch (error) {
      logger.error('Error en inicio de sesión:', error);
      throw error;
    }
  }

  /**
   * Refresca el token de acceso
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise<Object>} Nuevos tokens
   */
  async refrescarToken(refreshToken) {
    try {
      // Verificar token de refresco
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);

      // Buscar usuario y roles
      const persona = await Persona.findOne({
        where: { id_persona: decoded.id },
        include: [
          {
            model: Rol,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id_rol', 'nombre_rol', 'es_rol_administrativo']
          },
          {
            model: Administrativo,
            as: 'administrativo',
            required: false,
            where: { estado_laboral: 'Activo' }
          }
        ]
      });

      if (!persona) {
        throw new Error('Usuario no encontrado');
      }

      const roles = persona.roles ? persona.roles.map(rol => rol.nombre_rol) : [];
      const es_administrativo = persona.roles ?
        persona.roles.some(rol => rol.es_rol_administrativo) && persona.administrativo !== null :
        false;

      // Generar nuevos tokens
      const payload = {
        id: persona.id_persona,
        email: persona.correo,
        roles: roles,
        es_administrativo: es_administrativo
      };

      const tokens = jwtUtils.generateTokens(payload);

      logger.info(`Token refrescado para usuario: ${persona.correo} (Administrativo: ${es_administrativo})`);

      return tokens;

    } catch (error) {
      logger.error('Error refrescando token:', error);
      throw new Error('Token de refresco inválido');
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} True si se cambió exitosamente
   */
  async cambiarContrasena(userId, currentPassword, newPassword) {
    try {
      // Buscar acceso del usuario
      const acceso = await Acceso.findOne({
        where: { id_persona: userId }
      });

      if (!acceso) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isValidPassword = await bcryptUtils.verifyPassword(currentPassword, acceso.contrasena);

      if (!isValidPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await bcryptUtils.hashPassword(newPassword);

      // Actualizar contraseña
      await acceso.update({ contrasena: hashedNewPassword });

      logger.info(`Contraseña cambiada para usuario ID: ${userId}`);

      return true;

    } catch (error) {
      logger.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Datos del perfil
   */
  async obtenerPerfil(userId) {
    try {
      const persona = await Persona.findOne({
        where: { id_persona: userId },
        include: [
          {
            model: Rol,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id_rol', 'nombre_rol', 'descripcion']
          }
        ]
      });

      if (!persona) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: persona.id_persona,
        primer_nombre: persona.primer_nombre,
        segundo_nombre: persona.segundo_nombre,
        primer_apellido: persona.primer_apellido,
        segundo_apellido: persona.segundo_apellido,
        correo: persona.correo,
        telefono: persona.telefono,
        fecha_registro: persona.fecha_registro,
        roles: persona.roles || []
      };

    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
