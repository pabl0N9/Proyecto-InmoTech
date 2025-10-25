/**
 * @fileoverview Context de React para gestión global de autenticación JWT
 * @module shared/contexts/AuthContext
 * @description Provee estado y funciones para manejar autenticación en toda la aplicación
 * @author InmoTech Development Team
 * @version 1.0.0
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(undefined);

// Constantes para localStorage
const ACCESS_TOKEN_KEY = 'inmotech_access_token';
const REFRESH_TOKEN_KEY = 'inmotech_refresh_token';
const USER_KEY = 'inmotech_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carga la información de autenticación desde localStorage o sessionStorage
   */
  const loadAuthFromStorage = useCallback(() => {
    try {
      // Intentar cargar desde localStorage primero (sesión persistente)
      let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      let refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      let userData = localStorage.getItem(USER_KEY);
      let storageType = 'localStorage';

      // Si no hay datos en localStorage, intentar sessionStorage (sesión temporal)
      if (!accessToken || !userData) {
        accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
        refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
        userData = sessionStorage.getItem(USER_KEY);
        storageType = 'sessionStorage';
      }

      if (accessToken && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log(`✅ Autenticación cargada desde ${storageType}:`, parsedUser.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error cargando autenticación desde storage:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guarda la información de autenticación en localStorage
   */
  const saveAuthToStorage = useCallback((userData, accessToken, refreshToken) => {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      console.log('💾 Autenticación guardada en localStorage');
    } catch (error) {
      console.error('❌ Error guardando autenticación en localStorage:', error);
    }
  }, []);

  /**
   * Limpia toda la información de autenticación
   */
  const clearAuthData = useCallback(() => {
    // Importar dinámicamente para evitar dependencias circulares
    import('../services/api.config').then(({ apiClient }) => {
      apiClient.clearTokens();
    });

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('🧹 Datos de autenticación limpiados');
  }, []);

  /**
   * Inicia sesión del usuario
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @param {boolean} rememberMe - Recordar sesión
   * @returns {Promise<Object>} Usuario autenticado
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Intentando iniciar sesión:', email);

      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        setUser(userData);
        setIsAuthenticated(true);

        // Guardar en localStorage si rememberMe está activado
        if (rememberMe) {
          saveAuthToStorage(userData, accessToken, refreshToken);
        } else {
          // Usar sessionStorage para sesión temporal
          sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
        }

        console.log('✅ Usuario autenticado:', userData.email);

        return userData;
      } else {
        throw new Error(response.message || 'Error en la autenticación');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario registrado
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Registrando nuevo usuario:', userData.email);

      const response = await authService.register(userData);

      if (response.success && response.data) {
        const { user: newUser, accessToken, refreshToken } = response.data;

        setUser(newUser);
        setIsAuthenticated(true);
        saveAuthToStorage(newUser, accessToken, refreshToken);

        console.log('✅ Usuario registrado:', newUser.email);
        return newUser;
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      setError(error.message || 'Error al registrar usuario');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // Intentar hacer logout en el backend (opcional)
      try {
        await authService.logout();
      } catch (error) {
        console.warn('⚠️ Error en logout del backend, continuando con logout local');
      }

      clearAuthData();
      console.log('👋 Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Aún así limpiar datos locales
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  /**
   * Refresca el token de acceso
   * @returns {Promise<boolean>} True si se refrescó exitosamente
   */
  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) ||
                                 sessionStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        throw new Error('No hay token de refresco disponible');
      }

      console.log('🔄 Refrescando token...');

      const response = await authService.refreshToken(storedRefreshToken);

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Actualizar tokens en storage
        if (localStorage.getItem(ACCESS_TOKEN_KEY)) {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }
        } else {
          sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          if (newRefreshToken) {
            sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }
        }

        console.log('✅ Token refrescado exitosamente');
        return true;
      } else {
        throw new Error('Error al refrescar token');
      }
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      // Si falla el refresh, hacer logout
      clearAuthData();
      return false;
    }
  };

  /**
   * Actualiza el perfil del usuario
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>} Perfil actualizado
   */
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Actualizando perfil...');

      const response = await authService.updateProfile(profileData);

      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);

        // Actualizar en storage
        const userData = JSON.stringify(updatedUser);
        if (localStorage.getItem(USER_KEY)) {
          localStorage.setItem(USER_KEY, userData);
        } else {
          sessionStorage.setItem(USER_KEY, userData);
        }

        console.log('✅ Perfil actualizado');
        return updatedUser;
      } else {
        throw new Error(response.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      setError(error.message || 'Error al actualizar perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambia la contraseña del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} True si se cambió exitosamente
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔑 Cambiando contraseña...');

      const response = await authService.changePassword(currentPassword, newPassword);

      if (response.success) {
        console.log('✅ Contraseña cambiada exitosamente');
        return true;
      } else {
        throw new Error(response.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      setError(error.message || 'Error al cambiar contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string|string[]} roles - Rol(es) a verificar
   * @returns {boolean} True si tiene el rol
   */
  const hasRole = useCallback((roles) => {
    if (!user || !user.roles) return false;

    const userRoles = user.roles;
    if (Array.isArray(roles)) {
      return roles.some(role => userRoles.includes(role));
    }
    return userRoles.includes(roles);
  }, [user]);

  /**
   * Verifica si el usuario está autenticado y tiene roles específicos
   * @param {string|string[]} allowedRoles - Roles permitidos
   * @returns {boolean} True si tiene acceso
   */
  const hasAccess = useCallback((allowedRoles) => {
    return isAuthenticated && hasRole(allowedRoles);
  }, [isAuthenticated, hasRole]);

  // Cargar autenticación al montar el componente
  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  const value = {
    // Estado
    user,
    isAuthenticated,
    loading,
    error,

    // Funciones de autenticación
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,

    // Utilidades
    hasRole,
    hasAccess,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
