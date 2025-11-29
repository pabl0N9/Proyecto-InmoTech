/**
 * @fileoverview Servicio frontend para interactuar con el endpoint de Autenticación
 * @module shared/services/authService
 * @description Cliente HTTP que consume la API REST de autenticación del backend
 * @version 1.0.0
 */

import { apiClient } from './api.config';

class AuthService {
  async login(email, password) {
    try {
      console.log('🔐 Enviando solicitud de login para:', email);
      const response = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.success && response.data) {
        console.log('Login exitoso - tokens guardados en cookies httpOnly');
      } else {
        console.error('El servidor no devolvió respuesta válida');
      }

      return response;
    } catch (error) {
      console.error('Error en login:', error.message);
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('Enviando solicitud de registro para:', userData.email);

      const payload = {
        tipo_documento: userData.tipo_documento,
        numero_documento: userData.numero_documento,
        nombre_completo: userData.nombre_completo,
        apellido_completo: userData.apellido_completo,
        email: userData.email.trim().toLowerCase(),
        telefono: userData.telefono,
        password: userData.password,
        confirmPassword: userData.confirmPassword
      };

      const response = await apiClient.post('/auth/register', payload);
      console.log('Registro exitoso');
      return response;
    } catch (error) {
      console.error('Error en registro:', error.message);
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
      console.log('Refrescando token...');
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response;
    } catch (error) {
      console.error('Error refrescando token:', error.message);
      throw error;
    }
  }

  async getProfile() {
    try {
      console.log('Obteniendo perfil de usuario...');
      const response = await apiClient.get('/auth/me');
      return response;
    } catch (error) {
      console.error('Error obteniendo perfil:', error.message);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      console.log('Actualizando perfil...');

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

      if (profileData.foto_perfil_url) {
        payload.foto_perfil_url = profileData.foto_perfil_url;
      }

      if (profileData.foto_public_id) {
        payload.foto_public_id = profileData.foto_public_id;
      }

      const response = await apiClient.patch('/auth/me', payload);
      console.log('Perfil actualizado');
      return response;
    } catch (error) {
      console.error('Error actualizando perfil:', error.message);
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      console.log('Cambiando contraseña...');

      const response = await apiClient.patch('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword: newPassword
      });

      console.log('Contraseña cambiada');
      return response;
    } catch (error) {
      console.error('Error cambiando contraseña:', error.message);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('Cerrando sesión...');
      const response = await apiClient.post('/auth/logout');
      return response;
    } catch (error) {
      console.error('Error cerrando sesión:', error.message);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      console.log('Solicitando recuperación de contraseña para:', email);
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });
      return response;
    } catch (error) {
      console.error('Error solicitando recuperación:', error.message);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      console.log('Reseteando contraseña...');
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword,
        confirmPassword: newPassword
      });
      return response;
    } catch (error) {
      console.error('Error reseteando contraseña:', error.message);
      throw error;
    }
  }

  async checkEmailAvailability(email) {
    try {
      console.log('Verificando disponibilidad de email:', email);
      const response = await apiClient.post('/auth/check-email', {
        email: email.trim().toLowerCase()
      });
      return response.data?.available || false;
    } catch (error) {
      console.error('Error verificando email:', error.message);
      return false;
    }
  }

  async getPasswordLastChanged() {
    try {
      console.log('Obteniendo último cambio de contraseña...');
      const response = await apiClient.get('/auth/password-last-changed');
      return response.data?.data?.ultimo_cambio_password || null;
    } catch (error) {
      console.error('Error obteniendo último cambio de contraseña:', error.message);
      throw error;
    }
  }
}

export default new AuthService();
