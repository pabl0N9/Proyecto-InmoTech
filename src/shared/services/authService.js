/**
 * @fileoverview Servicio frontend para interactuar con el endpoint de Autenticación
 * @module shared/services/authService
 * @description Cliente HTTP que consume la API REST de autenticación del backend
 * @author InmoTech Development Team
 * @version 1.0.0
 */

import { apiClient } from './api.config';

class AuthService {
  /**
   * Inicia sesión de usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Respuesta del servidor (tokens enviados como cookies)
   */
  async login(email, password) {
    try {
      console.log('🔐 Enviando solicitud de login para:', email);
      const response = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      console.log('📦 Respuesta del servidor:', response);

      // ✅ Tokens ahora enviados como cookies httpOnly por el backend
      if (response.success && response.data) {
        console.log('✅ Login exitoso - tokens guardados en cookies httpOnly');
        console.log('🍪 El navegador recibió cookies de sesión');
      } else {
        console.error('❌ El servidor no devolvió respuesta válida');
      }

      console.log('✅ Login exitoso');
      return response;

    } catch (error) {
      console.error('❌ Error en login:', error.message);
      throw error;
    }
  }
  
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Respuesta del servidor con tokens y datos de usuario
   */
  async register(userData) {
    try {
      console.log('📝 Enviando solicitud de registro para:', userData.email);

      // Enviar datos directamente sin formateo adicional
      const payload = {
        tipo_documento: userData.tipo_documento,
        numero_documento: userData.numero_documento,
        nombre_completo: userData.nombre_completo,
        apellido_completo: userData.apellido_completo,
        email: userData.email.trim().toLowerCase(),
        telefono: userData.telefono, // Mantener como string
        password: userData.password,
        confirmPassword: userData.confirmPassword
      };

      const response = await apiClient.post('/auth/register', payload);

      console.log('✅ Registro exitoso');
      return response;
    } catch (error) {
      console.error('❌ Error en registro:', error.message);
      throw error;
    }
  }


  /**
   * Verifica el correo usando el codigo enviado
   * @param {string} email
   * @param {string} codigo
   */
  async verifyEmailCode(email, codigo) {
    try {
      return await apiClient.post('/auth/verify-code', { email, codigo });
    } catch (error) {
      console.error('??O Error verificando codigo de correo:', error.message);
      throw error;
    }
  }

  /**
   * Reenvia un nuevo codigo de verificacion
   * @param {string} email
   */
  async resendVerificationCode(email) {
    try {
      return await apiClient.post('/auth/resend-code', { email });
    } catch (error) {
      console.error('??O Error reenviando codigo de verificacion:', error.message);
      throw error;
    }
  }

  /**
   * Refresca el token de acceso
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise<Object>} Nuevos tokens
   */
  async refreshToken(refreshToken) {
    try {
      console.log('🔄 Refrescando token...');

      const response = await apiClient.post('/auth/refresh', {
        refreshToken
      });

      console.log('✅ Token refrescado');
      return response;
    } catch (error) {
      console.error('❌ Error refrescando token:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<Object>} Datos del perfil
   */
  async getProfile() {
    try {
      console.log('👤 Obteniendo perfil de usuario...');

      const response = await apiClient.get('/auth/me');

      console.log('✅ Perfil obtenido');
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error.message);
      throw error;
    }
  }

  /**
   * Actualiza el perfil del usuario
   * @param {Object} profileData - Datos a actualizar
   * @returns {Promise<Object>} Perfil actualizado
   */
  async updateProfile(profileData) {
    try {
      console.log('📝 Actualizando perfil...');

      const payload = {};

      if (profileData.nombre) {
        const nombreParts = profileData.nombre.trim().split(' ');
        payload.primer_nombre = nombreParts[0] || '';
        payload.segundo_nombre = nombreParts.slice(1, -1).join(' ') || null;
      }

      if (profileData.apellidos) {
        const apellidoParts = profileData.apellidos.trim().split(' ');
        payload.primer_apellido = apellidoParts[0] || '';
        payload.segundo_apellido = apellidoParts.slice(1).join(' ') || null;
      }

      if (profileData.telefono) {
        payload.telefono = profileData.telefono.replace(/\D/g, '');
      }

      const response = await apiClient.patch('/auth/me', payload);

      console.log('✅ Perfil actualizado');
      return response;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error.message);
      throw error;
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔑 Cambiando contraseña...');

      const response = await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword: newPassword
      });

      console.log('✅ Contraseña cambiada');
      return response;
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error.message);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async logout() {
    try {
      console.log('👋 Cerrando sesión...');

      const response = await apiClient.post('/auth/logout');

      console.log('✅ Sesión cerrada');
      return response;
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error.message);
      throw error;
    }
  }

  /**
   * Solicita recuperación de contraseña
   * @param {string} email - Correo electrónico
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async forgotPassword(email) {
    try {
      console.log('📧 Solicitando recuperación de contraseña para:', email);

      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      console.log('✅ Solicitud de recuperación enviada');
      return response;
    } catch (error) {
      console.error('❌ Error solicitando recuperación:', error.message);
      throw error;
    }
  }

  /**
   * Resetea la contraseña con token
   * @param {string} token - Token de reset
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async resetPassword(token, newPassword) {
    try {
      console.log('🔑 Reseteando contraseña...');

      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
        confirmPassword: newPassword
      });

      console.log('✅ Contraseña reseteada');
      return response;
    } catch (error) {
      console.error('❌ Error reseteando contraseña:', error.message);
      throw error;
    }
  }

  /**
   * Verifica si el email está disponible
   * @param {string} email - Correo electrónico
   * @returns {Promise<boolean>} True si está disponible
   */
  async checkEmailAvailability(email) {
    try {
      console.log('🔍 Verificando disponibilidad de email:', email);

      const response = await apiClient.post('/auth/check-email', {
        email: email.trim().toLowerCase()
      });

      return response.data?.available || false;
    } catch (error) {
      console.error('❌ Error verificando email:', error.message);
      // Si hay error, asumimos que no está disponible
      return false;
    }
  }

  /**
   * Obtiene el timestamp del último cambio de contraseña
   * @returns {Promise<Date|null>} Timestamp del último cambio
   */
  async getPasswordLastChanged() {
    try {
      console.log('🔑 Obteniendo último cambio de contraseña...');

      const response = await apiClient.get('/auth/password-last-changed');

      return response.data?.data?.ultimo_cambio_password || null;
    } catch (error) {
      console.error('❌ Error obteniendo último cambio de contraseña:', error.message);
      throw error;
    }
  }
}

export default new AuthService();
