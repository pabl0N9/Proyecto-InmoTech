import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import administrativosApiService from '../services/administrativosApiService';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

const AdministrativosContext = createContext(null);

export const useAdministrativos = () => {
  const context = useContext(AdministrativosContext);
  if (!context) {
    throw new Error('useAdministrativos debe ser usado dentro de un AdministrativosProvider');
  }
  return context;
};

export const AdministrativosProvider = ({ children }) => {
  const [administrativos, setAdministrativos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const loadAdministrativos = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await administrativosApiService.getAdministrativos(params);
      setAdministrativos(response.data.administrativos || []);
    } catch (err) {
      setError(err.message || 'Error al cargar administrativos');
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los administrativos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addAdministrativo = useCallback((nuevoAdministrativo) => {
    setAdministrativos((prev) => [...prev, nuevoAdministrativo]);
  }, []);

  const updateAdministrativo = useCallback((administrativoActualizado) => {
    setAdministrativos((prev) =>
      prev.map((admin) =>
        admin.id_administrativo === administrativoActualizado.id_administrativo
          ? administrativoActualizado
          : admin
      )
    );
  }, []);

  const deleteAdministrativo = useCallback((id) => {
    setAdministrativos((prev) => prev.filter((admin) => admin.id_administrativo !== id));
  }, []);

  const changeEstadoAdministrativo = useCallback(async (id, nuevoEstado, fechaRetiro = null) => {
    try {
      const estadoData = { estado_laboral: nuevoEstado };
      if (fechaRetiro) estadoData.fecha_retiro = fechaRetiro;

      await administrativosApiService.cambiarEstadoAdministrativo(id, estadoData);
      setAdministrativos((prev) =>
        prev.map((admin) =>
          admin.id_administrativo === id
            ? { ...admin, estado_laboral: nuevoEstado, fecha_retiro: fechaRetiro }
            : admin
        )
      );
      return true;
    } catch (err) {
      console.error('Error cambiando estado:', err);
      throw err;
    }
  }, []);

  const createAdministrativo = useCallback(async (adminData) => {
    try {
      const response = await administrativosApiService.createAdministrativo(adminData);
      const nuevoAdmin = response.data;
      addAdministrativo(nuevoAdmin);
      toast({
        title: 'Éxito',
        description: 'Administrativo creado correctamente',
        variant: 'default'
      });
      return nuevoAdmin;
    } catch (err) {
      console.error('Error creando administrativo:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al crear administrativo',
        variant: 'destructive'
      });
      throw err;
    }
  }, [addAdministrativo, toast]);

  const updateAdministrativoComplete = useCallback(async (id, adminData) => {
    try {
      const response = await administrativosApiService.updateAdministrativo(id, adminData);
      const adminActualizado = response.data.data;
      updateAdministrativo(adminActualizado);
      toast({
        title: 'Éxito',
        description: 'Administrativo actualizado correctamente',
        variant: 'default'
      });
      return adminActualizado;
    } catch (err) {
      console.error('Error actualizando administrativo:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al actualizar administrativo',
        variant: 'destructive'
      });
      throw err;
    }
  }, [updateAdministrativo, toast]);

  const removeAdministrativo = useCallback(async (id) => {
    try {
      await administrativosApiService.deleteAdministrativo(id);
      deleteAdministrativo(id);
      toast({
        title: 'Éxito',
        description: 'Administrativo eliminado correctamente',
        variant: 'default'
      });
      return true;
    } catch (err) {
      console.error('Error eliminando administrativo:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Error al eliminar administrativo',
        variant: 'destructive'
      });
      throw err;
    }
  }, [deleteAdministrativo, toast]);

  const getAdministrativoById = useCallback(async (id) => {
    try {
      const response = await administrativosApiService.getAdministrativoById(id);
      return response.data.data;
    } catch (err) {
      console.error('Error obteniendo administrativo:', err);
      throw err;
    }
  }, []);

  // Cargar datos iniciales solo si hay autenticación, feature habilitada y roles adecuados
  useEffect(() => {
    const flagEnabled = import.meta?.env?.VITE_ENABLE_ADMINISTRATIVOS === 'true';
    const hasRequiredRole = user?.roles?.some((role) => {
      if (typeof role === 'object') {
        return ['Super Administrador', 'Administrador'].includes(role.nombre_rol || role.rol || role.name);
      }
      return ['Super Administrador', 'Administrador'].includes(role);
    });

    if (isAuthenticated && flagEnabled && hasRequiredRole) {
      loadAdministrativos();
    } else {
      setLoading(false);
    }
  }, [loadAdministrativos, isAuthenticated, user]);

  const value = {
    administrativos,
    loading,
    error,
    loadAdministrativos,
    addAdministrativo,
    updateAdministrativo,
    deleteAdministrativo,
    changeEstadoAdministrativo,
    createAdministrativo,
    updateAdministrativoComplete,
    removeAdministrativo,
    getAdministrativoById
  };

  return <AdministrativosContext.Provider value={value}>{children}</AdministrativosContext.Provider>;
};
