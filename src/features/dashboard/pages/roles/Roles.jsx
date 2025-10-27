import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, Plus, Shield, ShieldCheck, Loader2, XCircle } from 'lucide-react';
import CrearRolModal from "./CrearRolModal";
import EditarRolModal from "./EditarRolModal";
import VerRolModal from "./VerRolModal";
import DeleteConfirmModal from "../../../../shared/components/modals/DeleteConfirmModal";
import ConfirmationDialog from "../../../../shared/components/ui/ConfirmationDialog";
import rolesApiService from "../../../../shared/services/rolesApiService";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import { useToast } from "../../../../shared/hooks/use-toast";
import "./Switch.css";

const RolesContent = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [verModalOpen, setVerModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);



  const cargarRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 Cargando roles para usuario administrativo:', user?.email);
      const rolesData = await rolesApiService.obtenerRoles();
      const rolesSorted = (rolesData || []).sort((a, b) => 
        parseInt(a.id, 10) - parseInt(b.id, 10)
      );
      setRoles(rolesSorted);
    } catch (err) {
      console.error('❌ Error al cargar roles:', err);
      setError('Error al cargar los roles desde el servidor.');
      toast({
        title: "Error al cargar roles",
        description: "No se pudieron obtener los roles desde el servidor.",
        variant: "destructive",
      });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };


  
  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
  
    const userIsAdmin = isAuthenticated && user?.es_administrativo;
    setIsAuthorized(userIsAdmin);
  
    if (userIsAdmin) {
      cargarRoles();
    } else {
      console.log('🚫 Acceso denegado: el usuario no es administrativo.');
      setLoading(false);
      setRoles([]);
    }
  }, [isAuthenticated, user, authLoading]);
  

  
  const handleCrearRol = async (nuevoRol) => {
    try {
      console.log('➕ Creando nuevo rol:', nuevoRol);
      const rolCreado = await rolesApiService.crearRol(nuevoRol);
      await cargarRoles();
      toast({
        title: "Rol creado exitosamente",
        description: `El rol "${rolCreado.nombre_rol}" ha sido creado correctamente.`,
      });
      setModalOpen(false);
    } catch (error) {
      console.error('❌ Error al crear rol:', error);
      toast({
        title: "Error al crear rol",
        description: error.message || "No se pudo crear el rol.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleActualizarRol = async (rolId, datosActualizados) => {
    try {
      console.log('✏️ Actualizando rol:', rolId, datosActualizados);
      await rolesApiService.actualizarRol(rolId, datosActualizados);
      await cargarRoles();
      toast({
        title: "Rol actualizado",
        description: "El rol ha sido actualizado correctamente.",
      });
      setEditarModalOpen(false);
      setRolSeleccionado(null);
    } catch (error) {
      console.error('❌ Error al actualizar rol:', error);
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el rol.",
        variant: "destructive",
      });
      throw error;
    }
  };


  const handleToggleEstadoRequest = (rol) => {
    if (rol.id == 1 || rol.id == 2) {
      toast({
        title: "Acción no permitida",
        description: "No se puede cambiar el estado de un rol protegido.",
        variant: "destructive",
      });
      return;
    }
    setRolSeleccionado(rol);
    setIsStatusChangeDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!rolSeleccionado) return;

    const rolActual = rolSeleccionado;
    const nuevoEstado = !rolActual.estado;

    try {
      await rolesApiService.actualizarRol(rolActual.id, { estado: nuevoEstado });
      await cargarRoles();
      toast({
        title: "Estado actualizado",
        description: `El rol "${rolActual.nombre}" ha sido ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`,
      });
    } catch (error) {
      console.error('Error al cambiar estado del rol:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo cambiar el estado del rol.",
        variant: "destructive",
      });
    } finally {
      setIsStatusChangeDialogOpen(false);
      setRolSeleccionado(null);
    }
  };

  const handleEditar = (rol) => {
    setRolSeleccionado(rol);
    setEditarModalOpen(true);
  };

  const handleVer = (rol) => {
    setRolSeleccionado(rol);
    setVerModalOpen(true);
  };

  const handleDeleteClick = (rol) => {
    if (rol.id == 1 || rol.id == 2) {
      toast({
        title: "Acción no permitida",
        description: "No se puede eliminar un rol protegido.",
        variant: "destructive",
      });
      return;
    }
    setRolSeleccionado(rol);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmEliminar = async () => {
    if (!rolSeleccionado) return;

    try {
      await rolesApiService.eliminarRol(rolSeleccionado.id);
      setRoles((prev) => prev.filter((rol) => rol.id !== rolSeleccionado.id));
      toast({
        title: "Rol eliminado",
        description: `El rol "${rolSeleccionado.nombre}" ha sido eliminado correctamente.`,
      });
    } catch (error) {
      console.error('Error al eliminar el rol:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el rol.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setRolSeleccionado(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="px-6 py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-slate-600">Cargando roles...</p>
        </div>
      );
    }

    if (!isAuthorized) {
      return (
        <div className="px-6 py-8 text-center">
          <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-600 font-medium mb-2">Acceso no autorizado</p>
          <p className="text-slate-500">No tienes los permisos necesarios para ver esta sección.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="px-6 py-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium mb-2">Error al cargar roles</p>
          <p className="text-slate-600">{error}</p>
        </div>
      );
    }

    if (roles.length === 0) {
      return (
        <div className="px-6 py-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 font-medium mb-2">No hay roles disponibles</p>
          <p className="text-slate-500">No se encontraron roles en el sistema.</p>
        </div>
      );
    }

    return (
      <>
        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roles.map((rol) => (
                  <motion.tr key={rol.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`hover:bg-slate-50 transition-colors ${(rol.id == 1 || rol.id == 2) ? "bg-blue-50 hover:bg-blue-100" : ""}`}>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-900">{rol.id}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(rol.id == 1 || rol.id == 2) ? (
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{rol.nombre}</span>
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Protegido</span>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-900">{rol.nombre}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${ (rol.id == 1 || rol.id == 2) || rol.estado ? "text-green-600" : "text-red-600" }`}>
                          {(rol.id == 1 || rol.id == 2) || rol.estado ? "Activo" : "Inactivo"}
                        </span>
                        <label className="switch-container relative">
                          <input type="checkbox" checked={(rol.id == 1 || rol.id == 2) ? true : rol.estado} disabled={rol.id == 1 || rol.id == 2} readOnly />
                          <span className="switch-slider"></span>
                          { !(rol.id == 1 || rol.id == 2) && (
                            <div 
                              className="absolute inset-0 cursor-pointer"
                              onClick={() => handleToggleEstadoRequest(rol)}
                            ></div>
                          )}
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleVer(rol)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles del rol"><Eye className="w-4 h-4" /></motion.button>
                        <motion.button
                          whileHover={{ scale: (rol.id == 1 || rol.id == 2) ? 1 : 1.05 }}
                          whileTap={{ scale: (rol.id == 1 || rol.id == 2) ? 1 : 0.95 }}
                          onClick={() => handleEditar(rol)}
                          disabled={rol.id == 1 || rol.id == 2}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Editar rol">
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: (rol.id == 1 || rol.id == 2) ? 1 : 1.05 }}
                          whileTap={{ scale: (rol.id == 1 || rol.id == 2) ? 1 : 0.95 }}
                          onClick={() => handleDeleteClick(rol)}
                          disabled={rol.id == 1 || rol.id == 2}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Eliminar rol">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-6">
          {roles.map((rol) => (
            <motion.div key={rol.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-lg border border-slate-200 p-4 mb-4 ${(rol.id == 1 || rol.id == 2) ? "bg-blue-50 border-blue-200" : ""}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  {(rol.id == 1 || rol.id == 2) ? (
                    <div className="flex items-center mb-1">
                      <Shield className="w-4 h-4 text-blue-600 mr-2" />
                      <h3 className="font-medium text-slate-800">{rol.nombre}</h3>
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Protegido</span>
                    </div>
                  ) : (
                    <h3 className="font-medium text-slate-800">{rol.nombre}</h3>
                  )}
                  <p className="text-sm text-slate-600">ID: {rol.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${(rol.id == 1 || rol.id == 2) || rol.estado ? "text-green-600" : "text-red-600"}`}>
                    {(rol.id == 1 || rol.id == 2) || rol.estado ? "Activo" : "Inactivo"}
                  </span>
                  <label className="switch-container relative">
                    <input type="checkbox" checked={(rol.id == 1 || rol.id == 2) ? true : rol.estado} disabled={rol.id == 1 || rol.id == 2} readOnly />
                    <span className="switch-slider"></span>
                    { !(rol.id == 1 || rol.id == 2) && (
                      <div 
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => handleToggleEstadoRequest(rol)}
                      ></div>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button onClick={() => handleVer(rol)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"><Eye className="w-4 h-4" />Ver</motion.button>
                <motion.button
                  onClick={() => handleEditar(rol)}
                  disabled={rol.id == 1 || rol.id == 2}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Edit className="w-4 h-4" />Editar
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteClick(rol)}
                  disabled={rol.id == 1 || rol.id == 2}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Trash2 className="w-4 h-4" />Eliminar
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-6 rounded-t-2xl">
        <div className="flex items-center">
          <div className="py-1"><ShieldCheck className="h-6 w-6 text-blue-500 mr-4" /></div>
          <div>
            <p className="font-bold">Vista de Super Administrador</p>
            <p className="text-sm">Este es el rol principal del sistema con todos los permisos. Puedes crear nuevos roles según sea necesario.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Roles</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Nuevo rol
          </motion.button>
        </div>
      </div>

      {renderContent()}

      <CrearRolModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onSubmit={handleCrearRol}
/>

<EditarRolModal
  isOpen={editarModalOpen}
  onClose={() => {
    setEditarModalOpen(false);
    setRolSeleccionado(null);
  }}
  rol={rolSeleccionado}
  onSubmit={handleActualizarRol}
/>

<VerRolModal
  isOpen={verModalOpen}
  onClose={() => {
    setVerModalOpen(false);
    setRolSeleccionado(null);
  }}
  rol={rolSeleccionado}
/>

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  onClose={() => {
    setIsDeleteModalOpen(false);
    setRolSeleccionado(null);
  }}
  onConfirm={handleConfirmEliminar}
  itemName={rolSeleccionado?.nombre || "este rol"}
/>

<ConfirmationDialog
  isOpen={isStatusChangeDialogOpen}
  onClose={() => {
    setIsStatusChangeDialogOpen(false);
    setRolSeleccionado(null);
  }}
  onConfirm={handleConfirmStatusChange}
  title={`${rolSeleccionado?.estado ? 'Desactivar' : 'Activar'} rol`}
  message={`¿Estás seguro de que deseas ${rolSeleccionado?.estado ? 'desactivar' : 'activar'} el rol "${rolSeleccionado?.nombre}"?`}
/>
    </div>
  );
}

export default function Roles() {
  return (
    <RolesContent />
  );
}
