/**
 * @fileoverview Context de React para gestión global de autenticación JWT
 * @version 2.0.0 - Corregido manejo de tokens con apiClient
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { apiClient } from '../services/api.config';

const AuthContext = createContext(undefined);

const USER_KEY = 'inmotech_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carga la información de autenticación desde storage
   */
  const loadAuthFromStorage = useCallback(() => {
    try {
      // Verificar tokens usando apiClient (que maneja localStorage)
      const accessToken = apiClient.getAccessToken();
      const refreshToken = apiClient.getRefreshToken();
      
      // Buscar datos de usuario en localStorage o sessionStorage
      let userData = localStorage.getItem(USER_KEY);
      if (!userData) {
        userData = sessionStorage.getItem(USER_KEY);
      }

      if (accessToken && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('✅ Autenticación cargada:', parsedUser.email);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('⚠️ No hay sesión activa');
      }
    } catch (error) {
      console.error('❌ Error cargando autenticación:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guarda la información de autenticación
   */
  const saveAuthToStorage = useCallback((userData, accessToken, refreshToken, rememberMe = false) => {
    try {
      // ✅ CRÍTICO: Guardar tokens usando apiClient (siempre en localStorage)
      apiClient.setTokens(accessToken, refreshToken);
      
      // Guardar info de usuario según preferencia
      const userDataString = JSON.stringify(userData);
      if (rememberMe) {
        localStorage.setItem(USER_KEY, userDataString);
        console.log('💾 Sesión persistente guardada');
      } else {
        sessionStorage.setItem(USER_KEY, userDataString);
        console.log('💾 Sesión temporal guardada');
      }
    } catch (error) {
      console.error('❌ Error guardando autenticación:', error);
    }
  }, []);

  /**
   * Limpia toda la información de autenticación
   */
  const clearAuthData = useCallback(() => {
    apiClient.clearTokens();
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('🧹 Datos de autenticación limpiados');
  }, []);

  /**
   * Inicia sesión del usuario
   */
/**
 * Inicia sesión del usuario
 */
const login = async (email, password, rememberMe = false) => {
  try {
    setLoading(true);
    setError(null);
    console.log('🔐 Intentando iniciar sesión:', email);

    // authService.login() ya guarda los tokens automáticamente
    const response = await authService.login(email, password);

    if (response.success && response.data) {
      const { user: userData, accessToken, refreshToken } = response.data;
      
      console.log('📦 Respuesta de login:', {
        hasUser: !!userData,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      // ✅ CRÍTICO: Verificar que authService guardó los tokens
      const savedAccessToken = apiClient.getAccessToken();
      const savedRefreshToken = apiClient.getRefreshToken();
      
      console.log('🔍 Verificación de tokens guardados:');
      console.log('   - Access Token guardado:', !!savedAccessToken);
      console.log('   - Refresh Token guardado:', !!savedRefreshToken);
      
      if (!savedAccessToken || !savedRefreshToken) {
        console.warn('⚠️ authService no guardó los tokens, guardando ahora...');
        apiClient.setTokens(accessToken, refreshToken);
      }

      // Guardar info de usuario según preferencia
      const userDataString = JSON.stringify(userData);
      if (rememberMe) {
        localStorage.setItem(USER_KEY, userDataString);
        console.log('💾 Sesión persistente guardada');
      } else {
        sessionStorage.setItem(USER_KEY, userDataString);
        console.log('💾 Sesión temporal guardada');
      }
      
      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Usuario autenticado:', userData.email);
      
      // Verificación final
      console.log('🎯 Verificación FINAL:');
      console.log('   - localStorage Access Token:', !!localStorage.getItem('inmotech_access_token'));
      console.log('   - localStorage Refresh Token:', !!localStorage.getItem('inmotech_refresh_token'));
      
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
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Registrando nuevo usuario:', userData.email);

      const response = await authService.register(userData);

      if (response.success && response.data) {
        const { user: newUser, accessToken, refreshToken } = response.data;
        
        saveAuthToStorage(newUser, accessToken, refreshToken, true);
        setUser(newUser);
        setIsAuthenticated(true);

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
      
      try {
        await authService.logout();
      } catch (error) {
        console.warn('⚠️ Error en logout del backend, continuando con logout local');
      }

      clearAuthData();
      console.log('👋 Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  /**
   * Refresca el token de acceso
   */
  const refreshToken = async () => {
    try {
      const storedRefreshToken = apiClient.getRefreshToken();
      
      if (!storedRefreshToken) {
        throw new Error('No hay token de refresco disponible');
      }

      console.log('🔄 Refrescando token...');
      const response = await authService.refreshToken(storedRefreshToken);

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Actualizar tokens
        apiClient.setTokens(accessToken, newRefreshToken);
        
        console.log('✅ Token refrescado exitosamente');
        return true;
      } else {
        throw new Error('Error al refrescar token');
      }
    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      clearAuthData();
      return false;
    }
  };

  /**
   * Actualiza el perfil del usuario
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
