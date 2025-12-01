const crypto = require('crypto');
const { Persona, Acceso, PersonasRol, Rol, Administrativo } = require('../models');
const { sequelize } = require('../config/database');
const bcryptUtils = require('../utils/bcrypt');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');
const { buildPermissionsResponse } = require('../utils/permissions.helper');
const invitacionService = require('./invitacion.service');
const personaService = require('./persona.service');

const VERIFY_INVITE_TYPE = 'signup_verify';

const normalizeEmail = (email = '') =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const buildEmailCondition = (email) =>
  sequelize.where(sequelize.fn('LOWER', sequelize.col('correo')), email);

const PASSWORD_RESET_TTL = 60 * 60 * 1000;
const passwordResetTokens = new Map();

class AuthService {
  /**
   * Registra un nuevo usuario (requiere verificación de correo)
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async registrarUsuario(userData) {
    let verificationInvite = null;

    const result = await sequelize.transaction(async (t) => {
      try {
        const { email, password } = userData;

        // Verificar si el email ya existe
        const personaExistente = await Persona.findOne({
          where: buildEmailCondition(normalizedEmail),
          transaction: t
        });

        if (personaExistente) {
          throw new Error('El correo electrÃ³nico ya estÃ¡ registrado');
        }

        // Crear persona
        const nuevaPersona = await Persona.create({
          tipo_documento: userData.tipo_documento,
          numero_documento: userData.numero_documento,
          nombre_completo: userData.nombre_completo,
          apellido_completo: userData.apellido_completo,
          correo: normalizedEmail,
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
        const userRoles = rolUsuario ? [rolUsuario.nombre_rol] : [];

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
      verificationInvite = await invitacionService.crearInvitacion({
        id_persona: result.user.id,
        tipo: VERIFY_INVITE_TYPE,
        creado_por: null
      });
    } catch (emailError) {
      logger.warn(`No se pudo enviar el email de verificación a ${result.user.email}:`, emailError.message);
    }

    const limits = invitacionService.getVerificationLimits();

    return {
      ...result,
      verification: {
        expira_en: verificationInvite?.expira_en || null,
        total_enviados: (verificationInvite?.reenvios || 0) + 1,
        max_codigos: limits.max_codigos,
        token: verificationInvite?.token || null
      }
    };
  }

  /**
   * Inicia sesiÃ³n de usuario
   * @param {string} email - Correo electrÃ³nico
   * @param {string} password - contraseña
   * @returns {Promise<Object>} Usuario autenticado con tokens
   */
  async iniciarSesion(email, password) {
    try {
      // Buscar persona por email y verificar que esté activa
      const persona = await Persona.findOne({
        where: {
          correo: email,
          estado: true
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
            where: { estado_laboral: 'Activo' }
          }
        ]
      });

      if (!persona) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
      }

      // Verificar contraseña
      const isValidPassword = await bcryptUtils.verifyPassword(password, persona.acceso.contrasena);
      if (!isValidPassword) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
      }

      // Validación adicional administrativa
      const es_super_admin_login = persona.roles ?
        persona.roles.some(rol => rol.nombre_rol === 'Super Administrador') : false;

      if (!es_super_admin_login && persona.roles && persona.roles.some(rol => rol.es_rol_administrativo) && !persona.administrativo) {
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
        const status = await invitacionService.getSignupVerificationStatus(persona.id_persona);

        let expira_en = status.expira_en;
        let total_enviados = status.total_enviados;
        let reenvios_actuales = status.reenvios_actuales;
        const max_codigos = status.max_codigos;

        const necesitaNuevoCodigo = !expira_en || (expira_en && new Date() > expira_en);

        if (necesitaNuevoCodigo && total_enviados < max_codigos) {
          const siguienteReenvio = total_enviados > 0 ? (reenvios_actuales + 1) : 0;
          const nuevaInvitacion = await invitacionService.crearInvitacion({
            id_persona: persona.id_persona,
            tipo: VERIFY_INVITE_TYPE,
            creado_por: null,
            reenvios: siguienteReenvio
          });
          expira_en = nuevaInvitacion.expira_en;
          total_enviados = (siguienteReenvio || 0) + 1;
          reenvios_actuales = siguienteReenvio;
        }

        if (total_enviados >= max_codigos && (!expira_en || new Date() > expira_en)) {
          const limitError = new Error('Has superado el limite de codigos de verificacion. Contacta a soporte para validar tu cuenta.');
          limitError.code = 'EMAIL_VERIFICATION_LIMIT';
          limitError.status = 429;
          limitError.meta = {
            email: persona.correo,
            max_codigos,
            total_enviados,
            puede_reenviar: false
          };
          throw limitError;
        }

        const verifyError = new Error('Debes verificar tu correo electrónico para iniciar sesión');
        verifyError.code = 'EMAIL_NOT_VERIFIED';
        verifyError.status = 403;
        verifyError.meta = {
          email: persona.correo,
          expira_en,
          max_codigos,
          total_enviados,
          puede_reenviar: total_enviados < max_codigos
        };
        throw verifyError;
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

      logger.info(`Usuario iniciÃ³ sesiÃ³n: ${email} (Administrativo: ${es_administrativo})`);

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
          foto_perfil_url: persona.foto_perfil_url,
          foto_public_id: persona.foto_public_id,
          roles: roles,
          es_administrativo: es_administrativo,
          permisos: permisos,
          ultimo_cambio_password: persona.acceso.ultimo_cambio_password
        },
        ...tokens
      };

    } catch (error) {
      logger.error('Error en inicio de sesiÃ³n:', error);
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

      // Buscar usuario y roles - Validar estado
      const persona = await Persona.findOne({
        where: { id_persona: decoded.id, estado: true },
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
        id_persona: persona.id_persona,
        tipo_documento: persona.tipo_documento,
        numero_documento: persona.numero_documento,
        nombre_completo: persona.nombre_completo,
        apellido_completo: persona.apellido_completo,
        correo: persona.correo,
        telefono: persona.telefono,
        foto_perfil_url: persona.foto_perfil_url,
        foto_public_id: persona.foto_public_id,
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

  async verificarCodigoCorreo(email, codigo_6d, meta = {}) {
    return invitacionService.verificarCodigoSignup({ email, codigo_6d, meta });
  }

  async reenviarCodigoVerificacion(email) {
    return invitacionService.reenviarSignupPorEmail(email);
  }
}

module.exports = new AuthService();



