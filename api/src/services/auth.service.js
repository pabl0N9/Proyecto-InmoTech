const crypto = require('crypto');
const { Op } = require('sequelize');
const { Persona, Acceso, PersonasRol, Rol, Administrativo, Permiso } = require('../models');
const { sequelize } = require('../config/database');
const bcryptUtils = require('../utils/bcrypt');
const jwtUtils = require('../utils/jwt');
const logger = require('../utils/logger');
const { buildPermissionsResponse } = require('../utils/permissions.helper');
const invitacionService = require('./invitacion.service');
const personaService = require('./persona.service');
const emailService = require('./email.service');

const VERIFY_INVITE_TYPE = 'signup_verify';

const normalizeEmail = (email = '') =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const buildEmailCondition = (email) =>
  sequelize.where(sequelize.fn('LOWER', sequelize.col('correo')), email);

const PASSWORD_RESET_TTL = 60 * 60 * 1000;
const passwordResetTokens = new Map();
const PASSWORD_RESET_URL_BASE = process.env.PASSWORD_RESET_URL_BASE || 'http://localhost:5173/restablecer-contrasena';

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
        const normalizedEmail = normalizeEmail(email);

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
   * Solicita envío de enlace de recuperación de contraseña
   * Envía un correo con el mismo template de verificación, pero apuntando al flujo de reset.
   */
  async solicitarRecuperacionContrasena(email) {
    const normalizedEmail = normalizeEmail(email);

    const persona = await Persona.findOne({
      where: buildEmailCondition(normalizedEmail),
      attributes: ['id_persona', 'correo', 'nombre_completo']
    });

    // Evitar enumerar correos: responder siempre 200 aunque no exista
    if (!persona) {
      logger.warn(`Solicitud de recuperación para correo no registrado: ${normalizedEmail}`);
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expira_en = new Date(Date.now() + PASSWORD_RESET_TTL);

    passwordResetTokens.set(tokenHash, {
      id_persona: persona.id_persona,
      correo: persona.correo,
      expira_en
    });

    const resetLink = `${PASSWORD_RESET_URL_BASE}?token=${encodeURIComponent(token)}`;

    await emailService.enviarEmailResetPassword({
      email: persona.correo,
      nombre_completo: persona.nombre_completo,
      expira_en,
      resetLink
    });
  }

  /**
   * Restablece la contraseña usando el token enviado por correo
   */
  async restablecerContrasena(token, newPassword) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const data = passwordResetTokens.get(tokenHash);

    if (!data || (data.expira_en && new Date() > data.expira_en)) {
      passwordResetTokens.delete(tokenHash);
      const err = new Error('Token de recuperacion invalido o expirado');
      err.status = 400;
      throw err;
    }

    const hashedPassword = await bcryptUtils.hashPassword(newPassword);
    await Acceso.update(
      { contrasena: hashedPassword },
      { where: { id_persona: data.id_persona } }
    );

    passwordResetTokens.delete(tokenHash);
  }

  async validarTokenRecuperacion(token) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const data = passwordResetTokens.get(tokenHash);

    if (!data || (data.expira_en && new Date() > data.expira_en)) {
      passwordResetTokens.delete(tokenHash);
      const err = new Error('Token de recuperacion invalido o expirado');
      err.status = 400;
      throw err;
    }

    return {
      email: data.correo,
      expira_en: data.expira_en
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
      const normalizedEmail = normalizeEmail(email);

      // Buscar persona por email y verificar que esté activa
      const persona = await Persona.findOne({
        where: {
          estado: true,
          [Op.and]: buildEmailCondition(normalizedEmail)
        },
        attributes: [
          'id_persona',
          'correo',
          'estado',
          'correo_verificado'
        ],
        include: [
          {
            model: Acceso,
            as: 'acceso',
            required: true,
            attributes: ['id_persona', 'contrasena']
          },
          {
            model: Rol,
            as: 'roles',
            through: { attributes: [] },
            attributes: ['id_rol', 'nombre_rol', 'es_rol_administrativo']
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

      let adminData = null;
      try {
        adminData = await Administrativo.findOne({
          where: { id_persona: persona.id_persona }
        });
      } catch (adminErr) {
        logger.warn('No se pudo obtener administrativo (continuando sin bloquear):', {
          message: adminErr.message,
          original: adminErr.original?.message
        });
      }

      const adminActivo = adminData &&
        (adminData.estado_laboral === 'Activo' ||
         adminData.estado_laboral === true ||
         adminData.estado_laboral === 1);

      if (!es_super_admin_login && persona.roles && persona.roles.some(rol => rol.es_rol_administrativo) && !adminActivo) {
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

      const es_administrativo = es_super_admin || (tiene_rol_administrativo && adminActivo);

      // Consolidar permisos (si la tabla existe). Si no, evitamos romper el login.
      const rolesIds = persona.roles?.map(rol => rol.id_rol) || [];
      let permisos = {};

      if (rolesIds.length > 0) {
        try {
          const permisosRegistros = await Permiso.findAll({
            where: {
              id_rol: { [Op.in]: rolesIds },
              estado: true
            },
            raw: true
          });

          const permisosConsolidados = permisosRegistros.reduce((acc, permiso) => {
            if (!acc[permiso.modulo]) {
              acc[permiso.modulo] = {};
            }
            acc[permiso.modulo][permiso.permiso] = true;
            return acc;
          }, {});

          permisos = buildPermissionsResponse(permisosConsolidados);
        } catch (permErr) {
          logger.warn('Tabla Permisos no encontrada o no accesible, se continua sin permisos detallados');
          permisos = {};
        }
      }

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
          nombre_completo: persona.nombre_completo || null,
          apellido_completo: persona.apellido_completo || null,
          tipo_documento: persona.tipo_documento || null,
          numero_documento: persona.numero_documento || null,
          telefono: persona.telefono || null,
          foto_perfil_url: persona.foto_perfil_url || null,
          foto_public_id: persona.foto_public_id || null,
          roles: roles,
          es_administrativo: es_administrativo,
          permisos: permisos,
          ultimo_cambio_password: persona.acceso?.ultimo_cambio_password
        },
        ...tokens
      };

    } catch (error) {
      logger.error('Error en inicio de sesiÃ³n:', error);
      logger.error('Error en inicio de sesión (detallado):', {
        message: error.message,
        original: error.original?.message,
        sql: error.original?.sql
      });
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
        attributes: [
          'id_persona',
          'correo',
          'estado',
          'correo_verificado',
          'tipo_documento',
          'numero_documento',
          'telefono',
          'nombre_completo',
          'apellido_completo',
          'foto_perfil_url',
          'foto_public_id',
          'tiene_cuenta',
          'fecha_registro'
        ],
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
            attributes: ['id_rol', 'nombre_rol', 'descripcion', 'es_rol_administrativo']
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

      let adminData = null;
      try {
        adminData = await Administrativo.findOne({
          where: { id_persona: persona.id_persona }
        });
      } catch (adminErr) {
        logger.warn('No se pudo obtener administrativo (continuando sin bloquear):', {
          message: adminErr.message,
          original: adminErr.original?.message
        });
      }

      const adminActivo = adminData &&
        (adminData.estado_laboral === 'Activo' ||
         adminData.estado_laboral === true ||
         adminData.estado_laboral === 1);

      const es_administrativo = es_super_admin || (tiene_rol_administrativo && adminActivo);

      if (tiene_rol_administrativo && !es_super_admin && !adminActivo) {
        throw new Error('Acceso administrativo revocado - sesión terminada por seguridad');
      }

      let permisos = {};
      const rolesIds = persona.roles?.map(rol => rol.id_rol) || [];

      if (rolesIds.length > 0) {
        const registrosPermisos = await Permiso.findAll({
          where: {
            id_rol: { [Op.in]: rolesIds },
            estado: true
          },
          raw: true
        });

        const permisosConsolidados = registrosPermisos.reduce((acc, permiso) => {
          if (!acc[permiso.modulo]) {
            acc[permiso.modulo] = {};
          }
          acc[permiso.modulo][permiso.permiso] = true;
          return acc;
        }, {});

        permisos = buildPermissionsResponse(permisosConsolidados);
      }

      return {
        id_persona: persona.id_persona,
        tipo_documento: persona.tipo_documento || null,
        numero_documento: persona.numero_documento || null,
        nombre_completo: persona.nombre_completo || null,
        apellido_completo: persona.apellido_completo || null,
        correo: persona.correo,
        telefono: persona.telefono || null,
        foto_perfil_url: persona.foto_perfil_url || null,
        foto_public_id: persona.foto_public_id || null,
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



