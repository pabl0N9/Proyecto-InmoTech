import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Edit, Trash2, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import StatsCard from '../../components/StatsCard';
import AdministrativosTable from '../../components/administrativos/AdministrativosTable';
import CreateAdministrativoModal from '../../components/administrativos/CreateAdministrativoModal';
import ViewAdministrativoModal from '../../components/administrativos/ViewAdministrativoModal';
import EditAdministrativoModal from '../../components/administrativos/EditAdministrativoModal';
import DeleteConfirmModal from '../../../../shared/components/modals/DeleteConfirmModal';
import StatusChangeConfirmModal from '../../../../shared/components/modals/StatusChangeConfirmModal';
import ConfirmationDialog from '../../../../shared/components/ui/ConfirmationDialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../shared/components/ui/select';
import { useToast } from '../../../../shared/hooks/use-toast';
import { useAdministrativos } from '../../../../shared/contexts/AdministrativosContext';
import administrativosApiService from '../../../../shared/services/administrativosApiService';

const AdministrativosPage = () => {
  const {
    administrativos,
    loading,
    createAdministrativo,
    updateAdministrativoComplete,
    removeAdministrativo,
    changeEstadoAdministrativo
  } = useAdministrativos();

  const [filteredAdministrativos, setFilteredAdministrativos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [selectedAdministrativo, setSelectedAdministrativo] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [loadingStatusChanges, setLoadingStatusChanges] = useState(new Set());
  const { toast } = useToast();

  // Filtrar administrativos
  useEffect(() => {
    let filtered = Array.isArray(administrativos) ? administrativos : [];

    if (searchTerm) {
      filtered = filtered.filter(admin => {
        const fullName = `${admin.persona?.nombre_completo || ''} ${admin.persona?.apellido_completo || ''}`.toLowerCase().trim();
        const email = (admin.persona?.correo || '').toLowerCase();
        const employeeCode = (admin.codigo_empleado || '').toLowerCase();
        const department = (admin.departamento || '').toLowerCase();

        return fullName.includes(searchTerm.toLowerCase()) ||
               email.includes(searchTerm.toLowerCase()) ||
               employeeCode.includes(searchTerm.toLowerCase()) ||
               department.includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'Todos los estados') {
      filtered = filtered.filter(admin => admin.estado_laboral === statusFilter);
    }

    setFilteredAdministrativos(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, administrativos]);

  // Calcular estadísticas
  const administrativosArray = Array.isArray(administrativos) ? administrativos : [];
  const stats = {
    total: administrativosArray.length,
    activos: administrativosArray.filter(a => a.estado_laboral === 'Activo').length,
    inactivos: administrativosArray.filter(a => a.estado_laboral === 'Inactivo').length,
    suspendidos: administrativosArray.filter(a => a.estado_laboral === 'Suspendido').length,
    retirados: administrativosArray.filter(a => a.estado_laboral === 'Retirado').length,
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdministrativos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAdministrativos.length / itemsPerPage);

  const handleCreateAdministrativo = async (newAdministrativo) => {
    try {
      await createAdministrativo(newAdministrativo);
      setIsCreateModalOpen(false);
      toast({
        title: "¡Administrativo creado exitosamente!",
        description: "El administrativo ha sido registrado correctamente.",
        variant: "default"
      });
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  const handleEditAdministrativo = async (updatedAdministrativo) => {
    try {
      await updateAdministrativoComplete(selectedAdministrativo.id_administrativo, updatedAdministrativo);
      setIsEditModalOpen(false);
      setSelectedAdministrativo(null);
    } catch (error) {
      // Error ya manejado en el contexto
    }
  };

  const handleDeleteAdministrativo = async () => {
    if (selectedAdministrativo) {
      try {
        await removeAdministrativo(selectedAdministrativo.id_administrativo);
        setIsDeleteModalOpen(false);
        setSelectedAdministrativo(null);
      } catch (error) {
        // Error ya manejado en el contexto
      }
    }
  };

  const handleViewAdministrativo = (administrativo) => {
    setSelectedAdministrativo(administrativo);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (administrativo) => {
    setSelectedAdministrativo(administrativo);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (administrativo) => {
    setSelectedAdministrativo(administrativo);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChangeRequest = (administrativo, newStatus) => {
    const estadoNombre = administrativosApiService.mapIdToEstado(newStatus);
    setSelectedAdministrativo(administrativo);
    setPendingStatusChange({ administrativoId: administrativo.id_administrativo, newStatus: estadoNombre });
    setLoadingStatusChanges(prev => new Set(prev).add(administrativo.id_administrativo));
    setIsStatusChangeModalOpen(true);
  };

  const handleStatusChangeConfirm = async () => {
    if (pendingStatusChange) {
      try {
        await changeEstadoAdministrativo(
          selectedAdministrativo.id_administrativo,
          pendingStatusChange.newStatus
        );

        setLoadingStatusChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(pendingStatusChange.administrativoId);
          return newSet;
        });

        setIsStatusChangeModalOpen(false);
        setSelectedAdministrativo(null);
        setPendingStatusChange(null);

        toast({
          title: "¡Estado actualizado exitosamente!",
          description: `El estado laboral ha sido cambiado a ${getStatusLabel(pendingStatusChange.newStatus)}.`,
          variant: "default"
        });
      } catch (error) {
        setLoadingStatusChanges(prev => {
          const newSet = new Set(prev);
          newSet.delete(pendingStatusChange.administrativoId);
          return newSet;
        });

        toast({
          title: "Error",
          description: "No se pudo cambiar el estado del administrativo",
          variant: "destructive"
        });
      }
    }
  };

  const handleActivateRequest = (administrativo) => {
    setSelectedAdministrativo(administrativo);
    setIsActivateDialogOpen(true);
  };

  const handleDeactivateRequest = (administrativo) => {
    setSelectedAdministrativo(administrativo);
    setIsDeactivateDialogOpen(true);
  };

  const handleActivateAdministrativo = async () => {
    if (selectedAdministrativo) {
      try {
        await changeEstadoAdministrativo(selectedAdministrativo.id_administrativo, 'Activo');
        setIsActivateDialogOpen(false);
        setSelectedAdministrativo(null);
        const fullName = `${selectedAdministrativo.persona?.nombre_completo || ''} ${selectedAdministrativo.persona?.apellido_completo || ''}`.trim();
        toast({
          title: "¡Administrativo activado exitosamente!",
          description: `El administrativo ${fullName} ha sido activado.`,
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo activar el administrativo",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeactivateAdministrativo = async () => {
    if (selectedAdministrativo) {
      try {
        await changeEstadoAdministrativo(selectedAdministrativo.id_administrativo, 'Inactivo');
        setIsDeactivateDialogOpen(false);
        setSelectedAdministrativo(null);
        const fullName = `${selectedAdministrativo.persona?.nombre_completo || ''} ${selectedAdministrativo.persona?.apellido_completo || ''}`.trim();
        toast({
          title: "¡Administrativo desactivado exitosamente!",
          description: `El administrativo ${fullName} ha sido desactivado.`,
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo desactivar el administrativo",
          variant: "destructive"
        });
      }
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'Activo': 'Activo',
      'Inactivo': 'Inactivo',
      'Suspendido': 'Suspendido',
      'Retirado': 'Retirado'
    };
    return statusLabels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestión de Administrativos</h1>
          <p className="text-slate-600 mt-1">Administra todos los empleados administrativos</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Nuevo Administrativo
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatsCard
          title="Total Administrativos"
          value={stats.total}
          icon={UserCheck}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          textColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="Activos"
          value={stats.activos}
          icon={UserCheck}
          color="bg-gradient-to-r from-green-500 to-green-600"
          textColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatsCard
          title="Inactivos"
          value={stats.inactivos}
          icon={UserX}
          color="bg-gradient-to-r from-yellow-500 to-yellow-600"
          textColor="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatsCard
          title="Suspendidos"
          value={stats.suspendidos}
          icon={AlertTriangle}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          textColor="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatsCard
          title="Retirados"
          value={stats.retirados}
          icon={UserX}
          color="bg-gradient-to-r from-red-500 to-red-600"
          textColor="text-red-600"
          bgColor="bg-red-50"
        />
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
      >
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Buscar por nombre, email, código o departamento..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <div className="flex gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los estados"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los estados">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activos</SelectItem>
                <SelectItem value="Inactivo">Inactivos</SelectItem>
                <SelectItem value="Suspendido">Suspendidos</SelectItem>
                <SelectItem value="Retirado">Retirados</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <AdministrativosTable
          administrativos={currentItems}
          onView={handleViewAdministrativo}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChangeRequest}
          onActivate={handleActivateRequest}
          onDeactivate={handleDeactivateRequest}
          loadingStatusChanges={loadingStatusChanges}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </motion.div>

      {/* Modals */}
      <CreateAdministrativoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAdministrativo}
      />

      <ViewAdministrativoModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        administrativo={selectedAdministrativo}
      />

      <EditAdministrativoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        administrativo={selectedAdministrativo}
        onSubmit={handleEditAdministrativo}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAdministrativo}
        title="Eliminar Administrativo"
        message={`¿Estás seguro de que deseas eliminar al administrativo ${selectedAdministrativo?.persona?.primer_nombre || ''} ${selectedAdministrativo?.persona?.primer_apellido || ''}? Esta acción no se puede deshacer.`}
      />

      <StatusChangeConfirmModal
        isOpen={isStatusChangeModalOpen}
        onClose={() => {
          setLoadingStatusChanges(prev => {
            const newSet = new Set(prev);
            if (pendingStatusChange?.administrativoId) {
              newSet.delete(pendingStatusChange.administrativoId);
            }
            return newSet;
          });
          setIsStatusChangeModalOpen(false);
          setSelectedAdministrativo(null);
          setPendingStatusChange(null);
        }}
        onConfirm={handleStatusChangeConfirm}
        title="Confirmar Cambio de Estado"
        message="¿Estás seguro de que deseas cambiar el estado laboral de este administrativo?"
        currentStatus={selectedAdministrativo?.estado_laboral}
        newStatus={pendingStatusChange?.newStatus}
        administrativoInfo={
          selectedAdministrativo
            ? {
                nombre: `${selectedAdministrativo.persona?.nombre_completo || ''} ${selectedAdministrativo.persona?.apellido_completo || ''}`.trim(),
                codigo: selectedAdministrativo.codigo_empleado,
                cargo: selectedAdministrativo.cargo,
                departamento: selectedAdministrativo.departamento
              }
            : null
        }
      />

      {/* Confirmation Dialogs for Activate/Deactivate */}
      <ConfirmationDialog
        isOpen={isActivateDialogOpen}
        onClose={() => {
          setIsActivateDialogOpen(false);
          setSelectedAdministrativo(null);
        }}
        onConfirm={handleActivateAdministrativo}
        title="Activar Administrativo"
        message={`¿Estás seguro de que deseas activar al administrativo ${selectedAdministrativo?.persona?.primer_nombre || ''} ${selectedAdministrativo?.persona?.primer_apellido || ''}?`}
        confirmText="Activar"
        cancelText="Cancelar"
        variant="success"
      />

      <ConfirmationDialog
        isOpen={isDeactivateDialogOpen}
        onClose={() => {
          setIsDeactivateDialogOpen(false);
          setSelectedAdministrativo(null);
        }}
        onConfirm={handleDeactivateAdministrativo}
        title="Desactivar Administrativo"
        message={`¿Estás seguro de que deseas desactivar al administrativo ${selectedAdministrativo?.persona?.primer_nombre || ''} ${selectedAdministrativo?.persona?.primer_apellido || ''}?`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default AdministrativosPage;
