const { Persona, Acceso, PersonasRol, Rol, Administrativo, Invitacion } = require('../models');
const { sequelize } = require('../config/database');
const bcryptUtils = require('../utils/bcrypt');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');
const { buildPermissionsResponse } = require('../utils/permissions.helper');
const emailService = require('./email.service');
const invitacionService = require('./invitacion.service');

const VERIFY_INVITE_TYPE = 'signup_verify';
const INVITE_MAX_REENVIOS = Number(process.env.INVITATION_MAX_REENVIOS || 3);

class AuthService {
  /**
   * Registra un nuevo usuario (requiere verificación de correo)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async registrarUsuario(userData) {
    const result = await sequelize.transaction(async (t) => {
      try {
        const { email, password } = userData;

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
          estado: true,
          correo_verificado: false
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

        return {
          user: {
            id: nuevaPersona.id_persona,
            email: nuevaPersona.correo,
            nombre_completo: nuevaPersona.nombre_completo,
            apellido_completo: nuevaPersona.apellido_completo,
            roles: rolUsuario ? [rolUsuario.nombre_rol] : []
          }
        };

      } catch (error) {
        logger.error('Error en registro de usuario:', error);
        throw error;
      }
    });

    // Enviar invitación de verificación de correo
    try {
      await invitacionService.crearInvitacion({
        id_persona: result.user.id,
        tipo: VERIFY_INVITE_TYPE,
        creado_por: null
      });
    } catch (emailError) {
      logger.warn(`No se pudo enviar el email de verificación a ${result.user.email}:`, emailError.message);
    }

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
      // Buscar persona por email y verificar que esté activa
      const persona = await Persona.findOne({
        where: {
          correo: email,
          estado: true // ✅ VALIDACIÓN: Solo usuarios activos pueden iniciar sesión
        },
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
            attributes: ['id_rol', 'nombre_rol', 'es_rol_administrativo'],
            include: [
              {
                model: require('../models').Permiso,
                as: 'permisos',
                where: { estado: true },
                required: false
              }
            ]
          },
          {
            model: Administrativo,
            as: 'administrativo',
            required: false,
            where: { estado_laboral: 'Activo' } // ✅ VALIDACIÓN: Solo administrativos activos
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

      // ✅ VALIDACIÓN ADICIONAL: Si es administrativo y no está activo, denegar acceso
      if (persona.roles && persona.roles.some(rol => rol.es_rol_administrativo) && !persona.administrativo) {
        throw new Error('Acceso denegado, comunícate con el administrador para resolver este problema');
      }

      // Actualizar último acceso
      await Acceso.update(
        { ultimo_acceso: new Date() },
        { where: { id_persona: persona.id_persona } }
      );

      // Preparar roles y determinar si es administrativo
      const roles = persona.roles ? persona.roles.map(rol => rol.nombre_rol) : [];
      const esAdminBase = roles.includes('Super Administrador') || roles.includes('Administrador');

      // Bloquear verificación de correo solo a usuarios no administrativos
      if (!esAdminBase && !persona.correo_verificado) {
        const ultimaInvitacion = await Invitacion.findOne({
          where: { id_persona: persona.id_persona, tipo: VERIFY_INVITE_TYPE },
          order: [['creado_en', 'DESC']]
        });

        if (ultimaInvitacion && new Date() > ultimaInvitacion.expira_en) {
          await Persona.update(
            { estado: false },
            { where: { id_persona: persona.id_persona } }
          );
          throw new Error('Tu cuenta fue deshabilitada por no verificar el correo en 24h. Solicita un reenvío.');
        }

        throw new Error('Debes verificar tu correo electrónico para iniciar sesión');
      }

      const tiene_rol_administrativo = persona.roles ?
        persona.roles.some(rol => rol.es_rol_administrativo) : false;

      const es_super_admin = persona.roles ?
        persona.roles.some(rol => rol.nombre_rol === 'Super Administrador') : false;

      const es_administrativo = es_super_admin || (tiene_rol_administrativo && persona.administrativo !== null);

      // Consolidar permisos de todos los roles del usuario
      const permisosConsolidados = persona.roles?.reduce((acc, rol) => {
        rol.permisos?.forEach(p => {
          if (!acc[p.modulo]) {
            acc[p.modulo] = {};
          }
          acc[p.modulo][p.permiso] = true;
        });
        return acc;
      }, {}) || {};
      const permisos = buildPermissionsResponse(permisosConsolidados);

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
          correo: persona.correo,
          nombre_completo: persona.nombre_completo,
          apellido_completo: persona.apellido_completo,
          tipo_documento: persona.tipo_documento,
          numero_documento: persona.numero_documento,
          telefono: persona.telefono,
          roles: roles,
          es_administrativo: es_administrativo,
          permisos: permisos
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

      // Buscar usuario y roles - ✅ VERIFICAR ESTADO: Solo usuarios activos pueden refrescar tokens
      const persona = await Persona.findOne({
        where: {
          id_persona: decoded.id,
          estado: true // ✅ Usuarios deshabilitados pierden sesión inmediatamente
        },
        include: [
          {
            model: Rol,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id_rol', 'nombre_rol', 'es_rol_administrativo']
          }
        ]
      });

      if (!persona) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      const roles = persona.roles ? persona.roles.map(rol => rol.nombre_rol) : [];
      const permisos = buildPermissionsResponse({});

      // Generar nuevos tokens
      const payload = {
        id: persona.id_persona,
        email: persona.correo,
        roles: roles
      };

      const tokens = jwtUtils.generateTokens(payload);

      return { ...tokens, roles, permisos };
    } catch (error) {
      logger.error('Error refrescando token:', error);
      throw error;
    }
  }

  /**
   * Verifica correo electrónico usando el token de invitación
   */
  async verificarCorreo(token, meta = {}) {
    return invitacionService.verificarCorreo(token, meta);
  }

  /**
   * Obtiene el perfil del usuario actual
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Perfil del usuario
   */
  async obtenerPerfil(userId) {
    try {
      const persona = await Persona.findOne({
        where: { id_persona: userId },
        include: [
          {
            model: Acceso,
            as: 'acceso',
            required: false,
            attributes: ['ultimo_cambio_password']
          },
          {
            model: Rol,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id_rol', 'nombre_rol', 'descripcion', 'es_rol_administrativo'],
            include: [
              {
                model: require('../models').Permiso,
                as: 'permisos',
                where: { estado: true },
                required: false
              }
            ]
          },
          {
            model: Administrativo,
            as: 'administrativo',
            required: false,
            where: { estado_laboral: 'Activo' },
            attributes: ['id_administrativo', 'estado_laboral']
          }
        ]
      });

      if (!persona) {
        throw new Error('Usuario no encontrado');
      }

      if (!persona.estado) {
        throw new Error('Usuario inactivo - sesión terminada por seguridad');
      }

      const tiene_rol_administrativo = persona.roles ?
        persona.roles.some(rol => rol.es_rol_administrativo) : false;

      const es_super_admin = persona.roles ?
        persona.roles.some(rol => rol.nombre_rol === 'Super Administrador') : false;

      const es_administrativo = es_super_admin || (tiene_rol_administrativo && persona.administrativo !== null);

      if (tiene_rol_administrativo && !es_super_admin && !persona.administrativo) {
        throw new Error('Acceso administrativo revocado - sesión terminada por seguridad');
      }

      const permisosConsolidados = persona.roles?.reduce((acc, rol) => {
        rol.permisos?.forEach(p => {
          if (!acc[p.modulo]) {
            acc[p.modulo] = {};
          }
          acc[p.modulo][p.permiso] = true;
        });
        return acc;
      }, {}) || {};
      const permisos = buildPermissionsResponse(permisosConsolidados);

      return {
        id: persona.id_persona,
        nombre_completo: persona.nombre_completo,
        apellido_completo: persona.apellido_completo,
        correo: persona.correo,
        telefono: persona.telefono,
        fecha_registro: persona.fecha_registro,
        estado: persona.estado,
        correo_verificado: persona.correo_verificado,
        roles: persona.roles ? persona.roles.map(rol => rol.nombre_rol) : [],
        es_administrativo: es_administrativo,
        permisos: permisos,
        ultimo_cambio_password: persona.acceso?.ultimo_cambio_password
      };

    } catch (error) {
      logger.error('Error obteniendo perfil:', error);
      throw error;
    }
  }

  /**
   * Obtiene el timestamp del último cambio de contraseña
   * @param {number} userId - ID del usuario
   * @returns {Promise<Date|null>} Timestamp del último cambio
   */
  async obtenerUltimoCambioPassword(userId) {
    try {
      const acceso = await Acceso.findOne({
        where: { id_persona: userId },
        attributes: ['ultimo_cambio_password']
      });

      return acceso ? acceso.ultimo_cambio_password : null;

    } catch (error) {
      logger.error('Error obteniendo último cambio de contraseña:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
