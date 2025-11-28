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

      const userData = response.data.user;

      sseService.resetForcedDisconnect();
      setUser(userData);
      setIsAuthenticated(true);

      console.log('Usuario autenticado:', userData.correo);
      console.log('âœ… Datos del usuario:', {
        roles: userData.roles,
        es_administrativo: userData.es_administrativo,
        permisos: userData.permisos ? Object.keys(userData.permisos) : 'SIN PERMISOS'
      });

      console.log('ðŸ”Ž VerificaciÃ³n FINAL:', {
        accessToken: !!localStorage.getItem('inmotech_access_token'),
        refreshToken: !!localStorage.getItem('inmotech_refresh_token')
      });

      return userData;
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

  /**
   * Verifica si el usuario tiene un permiso especÃ­fico
   */
  const hasPermission = useCallback((modulo, permiso) => {
    // âœ… SUPER ADMINISTRADOR TIENE TODOS LOS PERMISOS
    if (user && user.roles && user.roles.includes('Super Administrador')) {
      console.log(`ðŸ” hasPermission - Super Admin: modulo:${modulo}, permiso:${permiso} -> âœ… (acceso total)`);
      return true;
    }

    if (!user || !user.permisos) {
      console.log(`âŒ hasPermission - Sin usuario o permisos: modulo=${modulo}, permiso=${permiso}`);
      return false;
    }

    // ðŸ”¥ MANEJAR AMBOS FORMATOS: Array y Object
    let hasPerm = false;

    if (Array.isArray(user.permisos)) {
      // Formato Array: buscar por objeto
      hasPerm = user.permisos.some(p => p.modulo === modulo && p.permiso === permiso);
    } else {
      // Formato Object: acceder directamente
      hasPerm = user.permisos[modulo] && user.permisos[modulo][permiso] === true;
    }

    console.log(`ðŸ” hasPermission - modulo:${modulo}, permiso:${permiso} -> ${hasPerm ? 'âœ…' : 'âŒ'}`);
    return hasPerm;
  }, [user]);

  /**
   * Verifica si el usuario estÃ¡ autenticado y tiene roles especÃ­ficos
   */
  const hasAccess = useCallback((allowedRoles) => {
    return isAuthenticated && hasRole(allowedRoles);
  }, [isAuthenticated, hasRole]);

  /**
   * Obtiene los mÃ³dulos disponibles para el usuario basado en sus permisos
   */
  const getAvailableModules = useCallback(() => {
    if (!user) {
      console.log('âŒ getAvailableModules - Sin usuario');
      return [];
    }

    // âœ… SUPER ADMINISTRADOR TIENE ACCESO A TODOS LOS MÃ“DULOS
    if (user.roles && user.roles.includes('Super Administrador')) {
      console.log('âœ… getAvailableModules - Super Admin, todos los mÃ³dulos');
      return ['propiedades', 'citas', 'reportes', 'administrativos', 'roles'];
    }

    if (!user.permisos) {
      console.log('âŒ getAvailableModules - Sin permisos');
      return [];
    }

    console.log('ðŸ” getAvailableModules - Tipos de datos:', {
      permisosType: typeof user.permisos,
      permisosIsArray: Array.isArray(user.permisos),
      permisosKeys: user.permisos ? (Array.isArray(user.permisos) ? user.permisos.length : Object.keys(user.permisos)) : 'null'
    });

    // ðŸ”¥ PERMISOS COMO ARRAY - Transformar a objeto si es necesario
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
      console.log('âœ… Permiso gInmuebles encontrado');
      availableModules.push('propiedades');
    }
    if (permisosObj.gCitas) {
      console.log('âœ… Permiso gCitas encontrado');
      availableModules.push('citas');
    }
    if (permisosObj.gReporteInmuebles) {
      console.log('âœ… Permiso gReporteInmuebles encontrado');
      availableModules.push('reportes');
    }
    if (permisosObj.usuarios) {
      console.log('âœ… Permiso usuarios encontrado');
      availableModules.push('administrativos');
    }
    if (permisosObj.roles) {
      console.log('âœ… Permiso roles encontrado');
      availableModules.push('roles');
    }

    // Buscar otros permisos que podrÃ­an haber
    if (permisosObj.gArriendos) {
      console.log('âœ… Permiso gArriendos encontrado');
      // No hay mÃ³dulo para arriendos aÃºn
    }
    if (permisosObj.gClientes) {
      console.log('âœ… Permiso gClientes encontrado');
      // No hay mÃ³dulo para clientes aÃºn
    }
    if (permisosObj.gComprador) {
      console.log('âœ… Permiso gComprador encontrado');
      // No hay mÃ³dulo para comprador aÃºn
    }
    if (permisosObj.gVentas) {
      console.log('âœ… Permiso gVentas encontrado');
      // No hay mÃ³dulo para ventas aÃºn
    }
    if (permisosObj.gArrendatario) {
      console.log('âœ… Permiso gArrendatario encontrado');
      // No hay mÃ³dulo para arrendatario aÃºn
    }

    console.log('ðŸ“¦ getAvailableModules - MÃ³dulos disponibles:', availableModules);
    return availableModules;
  }, [user]);

  // Control de la conexión SSE para eventos de seguridad
  const connectSSE = useCallback(() => {
    if (!isAuthenticated || !user) return;
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

  // Logout forzado por eventos SSE
  const handleForcedLogout = useCallback((data) => {
    try {
      console.warn('Logout forzado por SSE', data);
      disconnectSSE();
      clearAuthData();
      toast({
        title: 'Sesión finalizada',
        description: data?.message || 'Tu sesión fue cerrada por seguridad',
        variant: 'destructive'
      });
      navigate('/login');
    } catch (err) {
      console.error('Error manejando logout forzado:', err);
    }
  }, [clearAuthData, disconnectSSE, navigate, toast]);

  // Cargar autenticaciÃ³n al montar el componente
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


