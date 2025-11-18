/**
 * @fileoverview Context de React para gestión global de autenticación JWT
 * @version 2.0.0 - Corregido manejo de tokens con apiClient
 */

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { apiClient } from '../services/api.config';
import sseService from '../services/sseService';
import { useToast } from '../hooks/use-toast';
import { canonicalizePermissions, normalizeModuleKey, normalizePermissionKey, ADMIN_FULL_ACCESS_MODULES } from '../utils/permissions';

const AuthContext = createContext(undefined);

const USER_KEY = 'inmotech_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading: true
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Carga la información de autenticación desde cookies
   */
  const loadAuthFromStorage = useCallback(async () => {
    try {
      // Verificar si hay sesión válida haciendo una petición autenticada al backend
      const response = await authService.getProfile();

      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Sesión restaurada desde cookies:', userData.correo);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('⚠️ No hay sesión activa en cookies');
      }
    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      setUser(null);
      setIsAuthenticated(false);
      console.log('❌ Sesión expirada o inválida');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guarda la información de autenticación
   */
  const saveAuthToStorage = useCallback((userData, accessToken, refreshToken) => {
    try {
      // ✅ CRÍTICO: Guardar tokens usando apiClient (siempre en localStorage)
      apiClient.setTokens(accessToken, refreshToken);

      // Guardar info de usuario en sessionStorage
      const userDataString = JSON.stringify(userData);
      sessionStorage.setItem(USER_KEY, userDataString);
      console.log('💾 Sesión guardada');
    } catch (error) {
      console.error('❌ Error guardando autenticación:', error);
    }
  }, []);

  /**
   * Limpia toda la información de autenticación
   */
  const clearAuthData = useCallback(() => {
    // Tokens ya se limpiaron en el backend con cookies.clearCookie()
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
const login = async (email, password) => {
  try {
    setLoading(true);
    setError(null);
    console.log('🔐 Intentando iniciar sesión:', email);

    // authService.login() envía tokens como cookies httpOnly
    const response = await authService.login(email, password);

    if (response.success && response.data) {
      const userData = response.data.user;

      // Resetear la bandera de desconexión forzada porque es un login normal
      sseService.resetForcedDisconnect();

      setUser(userData);
      setIsAuthenticated(true);

      console.log('📦 Datos de usuario recibidos:', response.data);
      console.log('✅ Usuario autenticado:', userData.correo);
      console.log('🍪 Tokens guardados como cookies httpOnly');

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
        const newUser = response.data; // ⚠️ Cambiar de response.data.user a response.data

        // Después del registro, agregar los datos enviados que podrían no estar en la respuesta
        const completeUserData = {
          ...userData, // Los datos que intentamos registrar
          ...newUser   // Datos que devuelve el backend (id, etc.)
        };

        setUser(completeUserData);
        setIsAuthenticated(true);

        console.log('✅ Usuario registrado:', completeUserData.correo);
        console.log('🍪 Tokens enviados como cookies httpOnly');
        console.log('📊 Datos completos del usuario:', completeUserData);

        return completeUserData;
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
  const permissionsMap = useMemo(() => {
    if (!user) {
      return {};
    }

    return canonicalizePermissions(user.permisos || {});
  }, [user]);

  const hasRole = useCallback((roles) => {
    if (!user || !user.roles) return false;

    const userRoles = user.roles;
    if (Array.isArray(roles)) {
      return roles.some(role => userRoles.includes(role));
    }

    return userRoles.includes(roles);
  }, [user]);

  /**
   * Verifica si el usuario tiene un permiso específico
  */
  const hasPermission = useCallback((modulo, permiso) => {
    const roleNames = user?.roles?.map(rol =>
      typeof rol === 'object' ? rol.nombre_rol : rol
    ).filter(Boolean) || [];

    if (roleNames.includes('Super Administrador') || roleNames.includes('Administrador')) {
      return true;
    }

    const modulesToCheck = (Array.isArray(modulo) ? modulo : [modulo]).filter(Boolean);
    const canonicalModules = modulesToCheck
      .map((moduleKey) => normalizeModuleKey(moduleKey))
      .filter(Boolean);

    if (!canonicalModules.length) {
      return false;
    }

    const permisosToCheck = permiso ? (Array.isArray(permiso) ? permiso : [permiso]) : [];
    const canonicalPermissions = permisosToCheck
      .map((permisoKey) => normalizePermissionKey(permisoKey))
      .filter(Boolean);

    const hasPermiso = canonicalModules.some(moduleKey => {
      const modulePermissions = permissionsMap[moduleKey];
      if (!modulePermissions) return false;
      if (!canonicalPermissions.length) return Object.keys(modulePermissions).length > 0;
      return canonicalPermissions.some(permisoKey => modulePermissions[permisoKey]);
    });

    return hasPermiso;
  }, [permissionsMap, user]);

  /**
   * Verifica si el usuario está autenticado y tiene roles específicos
   */
  const hasAccess = useCallback((allowedRoles) => {
    return isAuthenticated && hasRole(allowedRoles);
  }, [isAuthenticated, hasRole]);

  /**
   * Obtiene los módulos disponibles para el usuario basado en sus permisos
   */
  const getAvailableModules = useCallback(() => {
    if (!user) return [];

    const roleNames = user.roles?.map(rol =>
      typeof rol === 'object' ? rol.nombre_rol : rol
    ).filter(Boolean) || [];

    if (roleNames.includes('Super Administrador') || roleNames.includes('Administrador')) {
      return ADMIN_FULL_ACCESS_MODULES;
    }

    const modules = Object.keys(permissionsMap || {});
    return modules;
  }, [permissionsMap, user]);

  /**
   * Conecta al servicio SSE para notificaciones en tiempo real
   */
  const connectSSE = useCallback(async () => {
    try {
      // SSE ahora se conecta con cookies httpOnly automáticamente
      if (isAuthenticated && user) {
        console.log('📡 Conectando SSE con cookies httpOnly...');
        await sseService.connect();
      }
    } catch (error) {
      console.error('❌ Error conectando SSE:', error);
    }
  }, [isAuthenticated, user]);

  /**
   * Desconecta del servicio SSE
   */
  const disconnectSSE = useCallback(() => {
    console.log('📡 Desconectando SSE...');
    sseService.disconnect();
  }, []);

  /**
   * Manejador de eventos SSE para cierre de sesión forzado
   */
  const handleForcedLogout = useCallback(async (eventData) => {
    console.log('🚨 Evento SSE recibido - Cierre de sesión forzado:', eventData);

    let message = 'Tu sesión ha sido terminada por seguridad.';

    switch (eventData.action) {
      case 'logout':
        if (eventData.message) {
          message = eventData.message;
        }
        break;
      default:
        message = eventData.message || message;
    }

    console.log('🚨 Ejecutando handleForcedLogout con mensaje:', message);
    await performForcedLogout(message);
  }, []);

  /**
   * Realiza el logout forzado con todas las acciones necesarias
   */
  const performForcedLogout = useCallback(async (message = 'Tu sesión ha sido terminada por seguridad.') => {
    console.log('🚨 Ejecutando logout forzado:', message);

    // 📝 IMPORTANTE: Marcar primero como NO autenticado para evitar reconexiones
    setIsAuthenticated(false);
    setUser(null);

    // Marcar desconexión forzada para evitar reconexiones SSE automáticas
    sseService.setForcedDisconnect();

    // Desconectar SSE
    sseService.disconnect();

    // Limpiar tokens (no usar logout() para evitar llamadas backend)
    clearAuthData();

    // Mostrar mensaje al usuario usando toast con estilo de alerta
    toast({
      title: "Cuenta deshabilitada",
      description: message,
      variant: "destructive"
    });

    // Redirigir al login usando React Router (más suave que recarga completa)
    // Solo ejecutar si todavía no está en login para evitar loops
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }, 1500); // Más tiempo para que el toast sea visible
  }, [toast, navigate]);

  // Cargar autenticación al montar el componente
  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  // Conectar SSE cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      connectSSE();
    } else {
      disconnectSSE();
    }

    return () => {
      // Cleanup al desmontar
      disconnectSSE();
    };
  }, [isAuthenticated, user, connectSSE, disconnectSSE]);

  // Configurar listeners SSE para eventos de seguridad
  useEffect(() => {
    const handleUserDisabled = (data) => handleForcedLogout(data);
    const handlePasswordChanged = (data) => handleForcedLogout(data);
    const handleAdminAccessRevoked = (data) => handleForcedLogout(data);

    // Registrar listeners
    sseService.on('user_disabled', handleUserDisabled);
    sseService.on('password_changed', handlePasswordChanged);
    sseService.on('admin_access_revoked', handleAdminAccessRevoked);

    // Cleanup: remover listeners
    return () => {
      sseService.off('user_disabled', handleUserDisabled);
      sseService.off('password_changed', handlePasswordChanged);
      sseService.off('admin_access_revoked', handleAdminAccessRevoked);
    };
  }, [handleForcedLogout]);

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
    hasPermission,
    getAvailableModules,
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
