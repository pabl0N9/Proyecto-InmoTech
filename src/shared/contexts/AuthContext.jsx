/**
 * @fileoverview Context de React para gestiÃ³n global de autenticaciÃ³n JWT
 * @version 2.1.0 - Manejo de verificaciÃ³n de correo y registro sin login automÃ¡tico
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Carga la informaciÃ³n de autenticaciÃ³n desde cookies
   */
  const loadAuthFromStorage = useCallback(async () => {
    try {
      const response = await authService.getProfile();

      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        console.log('SesiÃ³n restaurada desde cookies:', userData.correo);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('No hay sesiÃ³n activa en cookies');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      const backendError = err?.data?.errors ? Object.values(err.data.errors)[0] : null;
      const message = backendError || err.message || "Error al registrar usuario";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guarda la informaciÃ³n de autenticaciÃ³n
   */
  const saveAuthToStorage = useCallback((userData, accessToken, refreshToken) => {
    try {
      apiClient.setTokens(accessToken, refreshToken);

      const userDataString = JSON.stringify(userData);
      sessionStorage.setItem(USER_KEY, userDataString);
      console.log('SesiÃ³n guardada');
    } catch (err) {
      console.error('Error guardando autenticaciÃ³n:', err);
    }
  }, []);

  /**
   * Limpia toda la informaciÃ³n de autenticaciÃ³n
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('Datos de autenticaciÃ³n limpiados');
  }, []);

  /**
   * Inicia sesiÃ³n del usuario
   */
    /**
   * Inicia sesiÃ³n del usuario
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Intentando iniciar sesiÃ³n:', email);

      const response = await authService.login(email, password);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error en la autenticaciÃ³n');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.message || 'Error en la autenticaciÃ³n');
      throw err;
    } finally {
      setLoading(false);
    }
  };



  /**
   * Registra un nuevo usuario (no inicia sesiÃ³n; requiere verificaciÃ³n de correo)
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Registrando nuevo usuario:', userData.email);

      const response = await authService.register(userData);

      if (response.success && response.data) {
        // No se establece sesiÃ³n hasta que verifique el correo
        return response.data;
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      const backendError = err?.data?.errors ? Object.values(err.data.errors)[0] : null;
      const message = backendError || err.message || 'Error al registrar usuario';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesiÃ³n del usuario
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);

      try {
        await authService.logout();
      } catch (err) {
        console.warn('Error en logout del backend, continuando con logout local');
      }

      clearAuthData();
      console.log('SesiÃ³n cerrada exitosamente');
    } catch (err) {
      console.error('Error en logout:', err);
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

      console.log('Refrescando token...');
      const response = await authService.refreshToken(storedRefreshToken);

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        apiClient.setTokens(accessToken, newRefreshToken);

        console.log('Token refrescado exitosamente');
        return true;
      } else {
        throw new Error('Error al refrescar token');
      }
    } catch (err) {
      console.error('Error refrescando token:', err);
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
      console.log('Actualizando perfil...');

      const response = await authService.updateProfile(profileData);

      // Intentar diferentes formas de respuesta
      const updatedData =
        response?.data?.user ||
        response?.data?.usuario ||
        response?.data?.data ||
        response?.data ||
        response?.user ||
        response?.usuario ||
        null;

      // Normalizar datos aunque la API no devuelva el usuario actualizado
      const mergedData = updatedData ? { ...updatedData, ...profileData } : { ...profileData };

      if (profileData.nombre) {
        const nombreParts = profileData.nombre.trim().split(' ');
        mergedData.nombre_completo = profileData.nombre;
        mergedData.nombre = profileData.nombre;
        mergedData.primer_nombre = nombreParts[0] || mergedData.primer_nombre || '';
        mergedData.segundo_nombre = nombreParts.slice(1).join(' ') || mergedData.segundo_nombre || '';
      }

      if (profileData.apellidos) {
        const apellidoParts = profileData.apellidos.trim().split(' ');
        mergedData.apellidos = profileData.apellidos;
        mergedData.apellido_completo = profileData.apellidos;
        mergedData.primer_apellido = apellidoParts[0] || mergedData.primer_apellido || '';
        mergedData.segundo_apellido = apellidoParts.slice(1).join(' ') || mergedData.segundo_apellido || '';
      }

      const updatedUser = { ...user, ...mergedData };

      setUser(updatedUser);

      const userDataStr = JSON.stringify(updatedUser);
      // Mantener compatibilidad con claves usadas en otros flujos
      localStorage.setItem(USER_KEY, userDataStr);
      localStorage.setItem('user', userDataStr);
      sessionStorage.setItem(USER_KEY, userDataStr);

      console.log('Perfil actualizado');
      return updatedUser;
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError(err.message || 'Error al actualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambia la contraseÃ±a del usuario
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cambiando contraseÃ±a...');

      const response = await authService.changePassword(currentPassword, newPassword);

      if (response.success) {
        console.log('ContraseÃ±a cambiada exitosamente');
        return true;
      } else {
        throw new Error(response.message || 'Error al cambiar contraseÃ±a');
      }
    } catch (err) {
      console.error('Error cambiando contraseÃ±a:', err);
      setError(err.message || 'Error al cambiar contraseÃ±a');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const permissionsMap = useMemo(() => {
    if (!user) return {};
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

  const hasAccess = useCallback((allowedRoles) => {
    return isAuthenticated && hasRole(allowedRoles);
  }, [isAuthenticated, hasRole]);

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
      sseService.resetForcedDisconnect();
      if (!sseService.isConnected) {
        sseService.connect();
      }
    } catch (err) {
      console.error('Error conectando SSE:', err);
    }
  }, [isAuthenticated, user]);

  const disconnectSSE = useCallback(() => {
    try {
      sseService.setForcedDisconnect();
      sseService.disconnect();
    } catch (err) {
      console.error('Error desconectando SSE:', err);
    }
  }, []);

  const performForcedLogout = useCallback(async (message) => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      sseService.setForcedDisconnect();
      sseService.disconnect();
      clearAuthData();

      toast({
        title: 'Cuenta deshabilitada',
        description: message,
        variant: 'destructive'
      });

      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }, 1500);
    } catch (err) {
      console.error('Error manejando logout forzado:', err);
    }
  }, [toast, navigate, clearAuthData]);

  const handleForcedLogout = useCallback(async (eventData) => {
    console.log('Evento SSE recibido - Cierre de sesion forzado:', eventData);
    const message = eventData.message || 'Tu sesion ha sido terminada por seguridad.';
    await performForcedLogout(message);
  }, [performForcedLogout]);

  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectSSE();
    } else {
      disconnectSSE();
    }
    return () => disconnectSSE();
  }, [isAuthenticated, user, connectSSE, disconnectSSE]);

  useEffect(() => {
    const handleUserDisabled = (data) => handleForcedLogout(data);
    const handlePasswordChanged = (data) => handleForcedLogout(data);
    const handleAdminAccessRevoked = (data) => handleForcedLogout(data);

    sseService.on('user_disabled', handleUserDisabled);
    sseService.on('password_changed', handlePasswordChanged);
    sseService.on('admin_access_revoked', handleAdminAccessRevoked);

    return () => {
      sseService.off('user_disabled', handleUserDisabled);
      sseService.off('password_changed', handlePasswordChanged);
      sseService.off('admin_access_revoked', handleAdminAccessRevoked);
    };
  }, [handleForcedLogout]);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
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


