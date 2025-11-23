/**
 * @fileoverview Context de React para gestión global de autenticación JWT
 * @version 2.1.0 - Manejo de verificación de correo y registro sin login automático
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
   * Carga la información de autenticación desde cookies
   */
  const loadAuthFromStorage = useCallback(async () => {
    try {
      const response = await authService.getProfile();

      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        console.log('Sesión restaurada desde cookies:', userData.correo);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('No hay sesión activa en cookies');
      }
    } catch (err) {
      console.error('Error verificando sesión:', err);
      setUser(null);
      setIsAuthenticated(false);
      console.log('Sesión expirada o inválida');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Guarda la información de autenticación
   */
  const saveAuthToStorage = useCallback((userData, accessToken, refreshToken) => {
    try {
      apiClient.setTokens(accessToken, refreshToken);

      const userDataString = JSON.stringify(userData);
      sessionStorage.setItem(USER_KEY, userDataString);
      console.log('Sesión guardada');
    } catch (err) {
      console.error('Error guardando autenticación:', err);
    }
  }, []);

  /**
   * Limpia toda la información de autenticación
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('Datos de autenticación limpiados');
  }, []);

  /**
   * Inicia sesión del usuario
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Intentando iniciar sesión:', email);

      const response = await authService.login(email, password);

      if (response.success && response.data) {
        const userData = response.data.user;

        sseService.resetForcedDisconnect();

        setUser(userData);
        setIsAuthenticated(true);

        console.log('Usuario autenticado:', userData.correo);
        return userData;
      } else {
        throw new Error(response.message || 'Error en la autenticación');
      }
      
      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Usuario autenticado:', userData.email);
      console.log('👤 Datos del usuario:', {
        roles: userData.roles,
        es_administrativo: userData.es_administrativo,
        permisos: userData.permisos ? Object.keys(userData.permisos) : 'SIN PERMISOS'
      });

      // Verificación final
      console.log('🎯 Verificación FINAL:');
      console.log('   - localStorage Access Token:', !!localStorage.getItem('inmotech_access_token'));
      console.log('   - localStorage Refresh Token:', !!localStorage.getItem('inmotech_refresh_token'));
      
      return userData;
    } else {
      throw new Error(response.message || 'Error en la autenticación');
    }
  };

  /**
   * Registra un nuevo usuario (no inicia sesión; requiere verificación de correo)
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Registrando nuevo usuario:', userData.email);

      const response = await authService.register(userData);

      if (response.success && response.data) {
        // No se establece sesión hasta que verifique el correo
        return response.data;
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al registrar usuario');
      throw err;
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
      } catch (err) {
        console.warn('Error en logout del backend, continuando con logout local');
      }

      clearAuthData();
      console.log('Sesión cerrada exitosamente');
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

      if (response.success && response.data) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);

        const userDataStr = JSON.stringify(updatedUser);
        if (localStorage.getItem(USER_KEY)) {
          localStorage.setItem(USER_KEY, userDataStr);
        } else {
          sessionStorage.setItem(USER_KEY, userDataStr);
        }

        console.log('Perfil actualizado');
        return updatedUser;
      } else {
        throw new Error(response.message || 'Error al actualizar perfil');
      }
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError(err.message || 'Error al actualizar perfil');
      throw err;
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
      console.log('Cambiando contraseña...');

      const response = await authService.changePassword(currentPassword, newPassword);

      if (response.success) {
        console.log('Contraseña cambiada exitosamente');
        return true;
      } else {
        throw new Error(response.message || 'Error al cambiar contraseña');
      }
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      setError(err.message || 'Error al cambiar contraseña');
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

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = useCallback((modulo, permiso) => {
    // ✅ SUPER ADMINISTRADOR TIENE TODOS LOS PERMISOS
    if (user && user.roles && user.roles.includes('Super Administrador')) {
      console.log(`🔍 hasPermission - Super Admin: modulo:${modulo}, permiso:${permiso} -> ✅ (acceso total)`);
      return true;
    }

    if (!user || !user.permisos) {
      console.log(`❌ hasPermission - Sin usuario o permisos: modulo=${modulo}, permiso=${permiso}`);
      return false;
    }

    // 🔥 MANEJAR AMBOS FORMATOS: Array y Object
    let hasPerm = false;

    if (Array.isArray(user.permisos)) {
      // Formato Array: buscar por objeto
      hasPerm = user.permisos.some(p => p.modulo === modulo && p.permiso === permiso);
    } else {
      // Formato Object: acceder directamente
      hasPerm = user.permisos[modulo] && user.permisos[modulo][permiso] === true;
    }

    console.log(`🔍 hasPermission - modulo:${modulo}, permiso:${permiso} -> ${hasPerm ? '✅' : '❌'}`);
    return hasPerm;
  }, [user]);

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
    if (!user) {
      console.log('❌ getAvailableModules - Sin usuario');
      return [];
    }

    // ✅ SUPER ADMINISTRADOR TIENE ACCESO A TODOS LOS MÓDULOS
    if (user.roles && user.roles.includes('Super Administrador')) {
      console.log('✅ getAvailableModules - Super Admin, todos los módulos');
      return ['propiedades', 'citas', 'reportes', 'administrativos', 'roles'];
    }

    if (!user.permisos) {
      console.log('❌ getAvailableModules - Sin permisos');
      return [];
    }

    console.log('🔍 getAvailableModules - Tipos de datos:', {
      permisosType: typeof user.permisos,
      permisosIsArray: Array.isArray(user.permisos),
      permisosKeys: user.permisos ? (Array.isArray(user.permisos) ? user.permisos.length : Object.keys(user.permisos)) : 'null'
    });

    // 🔥 PERMISOS COMO ARRAY - Transformar a objeto si es necesario
    let permisosObj = user.permisos;
    if (Array.isArray(user.permisos)) {
      permisosObj = {};
      user.permisos.forEach(permiso => {
        if (!permisosObj[permiso.modulo]) {
          permisosObj[permiso.modulo] = {};
        }
        permisosObj[permiso.modulo][permiso.permiso] = true;
      });
    }

    const availableModules = [];

    if (permisosObj.gInmuebles) {
      console.log('✅ Permiso gInmuebles encontrado');
      availableModules.push('propiedades');
    }
    if (permisosObj.gCitas) {
      console.log('✅ Permiso gCitas encontrado');
      availableModules.push('citas');
    }
    if (permisosObj.gReporteInmuebles) {
      console.log('✅ Permiso gReporteInmuebles encontrado');
      availableModules.push('reportes');
    }
    if (permisosObj.usuarios) {
      console.log('✅ Permiso usuarios encontrado');
      availableModules.push('administrativos');
    }
    if (permisosObj.roles) {
      console.log('✅ Permiso roles encontrado');
      availableModules.push('roles');
    }

    // Buscar otros permisos que podrían haber
    if (permisosObj.gArriendos) {
      console.log('✅ Permiso gArriendos encontrado');
      // No hay módulo para arriendos aún
    }
    if (permisosObj.gClientes) {
      console.log('✅ Permiso gClientes encontrado');
      // No hay módulo para clientes aún
    }
    if (permisosObj.gComprador) {
      console.log('✅ Permiso gComprador encontrado');
      // No hay módulo para comprador aún
    }
    if (permisosObj.gVentas) {
      console.log('✅ Permiso gVentas encontrado');
      // No hay módulo para ventas aún
    }
    if (permisosObj.gArrendatario) {
      console.log('✅ Permiso gArrendatario encontrado');
      // No hay módulo para arrendatario aún
    }

    console.log('📦 getAvailableModules - Módulos disponibles:', availableModules);
    return availableModules;
  }, [user]);

  // Cargar autenticación al montar el componente
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
