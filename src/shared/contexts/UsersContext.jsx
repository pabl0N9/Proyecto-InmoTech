import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import usersApiService from '../services/usersApiService';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

const UsersContext = createContext();

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers debe ser usado dentro de un UsersProvider');
  }
  return context;
};

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Cargar usuarios
  const loadUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApiService.getUsers(params);
      setUsers(response.data.personas || []);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Agregar usuario
  const addUser = useCallback((nuevoUser) => {
    setUsers(prev => [nuevoUser, ...prev]);
  }, []);

  // Actualizar usuario
  const updateUser = useCallback((userActualizado) => {
    setUsers(prev =>
      prev.map(userItem =>
        // ✅ Protección: verificar que userItem exista y tenga id_persona
        userItem?.id_persona === userActualizado.id_persona
          ? userActualizado
          : userItem
      ).filter(Boolean) // ✅ Eliminar elementos undefined/null
    );
  }, []);

  // Eliminar usuario
  const deleteUser = useCallback((id) => {
    setUsers(prev =>
      prev.filter(userItem => userItem?.id_persona !== id)
    );
  }, []);

  // Cambiar estado de usuario
  const changeUserStatus = useCallback(async (id, nuevoEstado) => {
    try {
      const estadoData = { estado: nuevoEstado };
      await usersApiService.changeUserStatus(id, estadoData);

      // Actualizar el estado local
      setUsers(prev =>
        prev.map(userItem =>
          // ✅ Protección: verificar que userItem exista y tenga id_persona
          userItem?.id_persona === id
            ? { ...userItem, estado: nuevoEstado }
            : userItem
        ).filter(Boolean) // ✅ Eliminar elementos undefined/null
      );

      return true;
    } catch (error) {
      console.error('Error cambiando estado:', error);
      throw error;
    }
  }, []);

  // Crear usuario (ahora usa /auth/register que retorna diferente estructura)
  const createUser = useCallback(async (userData) => {
    try {
      console.log('👤 USERS CONTEXT: Creando usuario con datos:', userData);

      // ✅ VALIDACIÓN CRÍTICA: Asegurar que los campos requeridos estén presentes
      const sanitizedUserData = {
        ...userData,
        nombre_completo: userData.nombre_completo?.trim() || '',
        apellido_completo: userData.apellido_completo?.trim() || '',
        correo: userData.correo?.trim() || userData.email?.trim() || '',
        telefono: userData.telefono?.trim() || userData.phone?.trim() || '',
        tipo_documento: userData.tipo_documento?.trim() || '',
        numero_documento: userData.numero_documento?.trim() || ''
      };

      console.log('👤 USERS CONTEXT: Datos sanitizados antes de enviar:', sanitizedUserData);

      const response = await usersApiService.createUser(sanitizedUserData);

      // ✅ La respuesta del registro tiene estructura diferente: { success, data: { user, accessToken, refreshToken } }
      const userFromResponse = response.data?.user || response.data;

      console.log('👤 USERS CONTEXT: Usuario creado en BD:', userFromResponse);

      // Agregar a la lista local ( asegurar que tenga estado activado y nombres correctos )
      // ✅ PROTECCIÓN ADICIONAL: Filtrar valores 'undefined'
      const userWithEstado = {
        id_persona: userFromResponse.id_persona,
        estado: true,  // Usuarios registrados están activos por defecto
        // Asegurar que tenga los nombres de campos que espera UserTable
        // Filtrar 'undefined' convirtiéndolo a cadena vacía
        nombre_completo: (userFromResponse.nombre_completo !== 'undefined' ? userFromResponse.nombre_completo : '') || sanitizedUserData.nombre_completo,
        apellido_completo: (userFromResponse.apellido_completo !== 'undefined' ? userFromResponse.apellido_completo : '') || sanitizedUserData.apellido_completo,
        correo: userFromResponse.correo || userFromResponse.email || sanitizedUserData.correo,
        telefono: userFromResponse.telefono || sanitizedUserData.telefono,
        tipo_documento: userFromResponse.tipo_documento || sanitizedUserData.tipo_documento,
        numero_documento: userFromResponse.numero_documento || sanitizedUserData.numero_documento,
        fecha_registro: userFromResponse.fecha_registro || new Date().toISOString()
      };

      console.log('👤 USERS CONTEXT: Agregando usuario al estado local:', userWithEstado);
      addUser(userWithEstado);

      toast({
        title: "¡Éxito!",
        description: "Usuario creado correctamente",
        variant: "default"
      });

      return userWithEstado;
    } catch (error) {
      console.error('Error creando usuario:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al crear usuario",
        variant: "destructive"
      });
      throw error;
    }
  }, [addUser, toast]);

  // Actualizar usuario
  const updateUserComplete = useCallback(async (id, userData) => {
    try {
      const response = await usersApiService.updateUser(id, userData);
      const userActualizado = response.data.data;

      // Actualizar en la lista local
      updateUser(userActualizado);

      toast({
        title: "¡Éxito!",
        description: "Usuario actualizado correctamente",
        variant: "default"
      });

      return userActualizado;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al actualizar usuario",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateUser, toast]);

  // Eliminar usuario
  const removeUser = useCallback(async (id) => {
    try {
      await usersApiService.deleteUser(id);

      // Remover de la lista local
      deleteUser(id);

      toast({
        title: "¡Éxito!",
        description: "Usuario eliminado correctamente",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error al eliminar usuario",
        variant: "destructive"
      });
      throw error;
    }
  }, [deleteUser, toast]);

  // Obtener usuario por ID
  const getUserById = useCallback(async (id) => {
    try {
      const response = await usersApiService.getUserById(id);
      return response.data.data;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  }, []);

  // Cargar datos iniciales solo si hay autenticación Y el usuario es administrador
  useEffect(() => {
    // Solo cargar si hay un token de autenticación, isAuthenticated Y tiene permisos administrativos
    const token = localStorage.getItem('inmotech_access_token') || sessionStorage.getItem('inmotech_access_token');
    const isAdmin = user?.roles?.some(rol => rol === 'Super Administrador' || rol === 'Administrador') ||
                    user?.es_administrativo === true;

    if (token && isAuthenticated && isAdmin) {
      loadUsers();
    } else {
      setLoading(false);
      // Limpiar usuarios si el usuario actual no tiene permisos
      if (!isAdmin) {
        setUsers([]);
        setError(null);
      }
    }
  }, [loadUsers, isAuthenticated, user]);

  const value = {
    users,
    loading,
    error,
    loadUsers,
    addUser,
    updateUser,
    deleteUser,
    changeUserStatus,
    createUser,
    updateUserComplete,
    removeUser,
    getUserById
  };

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
};
