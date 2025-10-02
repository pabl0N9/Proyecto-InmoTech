import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Grid3X3, List } from 'lucide-react';
import DashboardLayout from '../../../../shared/components/dashboard/Layout/DashboardLayout';
import SearchBar from '../../components/SearchBar';
import StatsCard from '../../components/StatsCard';
import AppointmentTable from '../../components/appointment/AppointmentTable';
import AppointmentCalendar from '../../components/appointment/AppointmentCalendar';
import CreateAppointmentModal from '../../components/appointment/CreateAppointmentModal';
import ViewAppointmentModal from '../../components/appointment/ViewAppointmentModal';
import EditAppointmentModal from '../../components/appointment/EditAppointmentModal';
import DeleteConfirmModal from '../../../../shared/components/modals/DeleteConfirmModal';
import StatusChangeConfirmModal from '../../../../shared/components/modals/StatusChangeConfirmModal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../shared/components/ui/select';
import { useToast } from '../../../../shared/hooks/use-toast';
import { useAppointments } from '../../../../shared/contexts/AppointmentContext';

const CitasPage = () => {
  const { appointments, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusChangeModalOpen, setIsStatusChangeModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const { toast } = useToast();

  // Filtrar citas
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(cita =>
        cita.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.propiedad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cita.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'Todos los estados') {
      filtered = filtered.filter(cita => cita.estado === statusFilter);
    }

    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(cita => cita.fecha === today);
    }

    setFilteredCitas(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter, appointments]);

  // Función para filtrar por citas de hoy
  const handleFilterToday = () => {
    setDateFilter(dateFilter === 'today' ? 'all' : 'today');
    setStatusFilter('Todos los estados'); // Reset status filter when filtering by date
    setSearchTerm(''); // Reset search when filtering by date
  };

  // Calcular estadísticas
  const stats = {
    total: appointments.length,
    programadas: appointments.filter(c => c.estado === 'programada').length,
    confirmadas: appointments.filter(c => c.estado === 'confirmada').length,
    canceladas: appointments.filter(c => c.estado === 'cancelada').length,
    completadas: appointments.filter(c => c.estado === 'completada').length
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCitas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCitas.length / itemsPerPage);

  const handleCreateCita = (newCita) => {
    const todayLocal = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD en hora local
    const citaWithId = {
      ...newCita,
      id: Date.now(),
      fechaCreacion: todayLocal
    };
    addAppointment(citaWithId);
    setIsCreateModalOpen(false);
    toast({
      title: "¡Cita creada exitosamente!",
      description: "La cita ha sido agendada correctamente.",
      variant: "default"
    });
  };
  
  const handleEditCita = (updatedCita) => {
    // Verificar que tenemos el ID correcto
    if (!updatedCita.id) {
      toast({
        title: "Error al actualizar",
        description: "No se pudo identificar la cita a actualizar.",
        variant: "destructive"
      });
      return;
    }

    updateAppointment(updatedCita);

    setIsEditModalOpen(false);
    setSelectedCita(null);
    toast({
      title: "¡Cita actualizada exitosamente!",
      description: "Los cambios han sido guardados correctamente.",
      variant: "default"
    });
  };

  const handleDeleteCita = () => {
    deleteAppointment(selectedCita.id);
    setIsDeleteModalOpen(false);
    setSelectedCita(null);
    toast({
      title: "¡Cita eliminada exitosamente!",
      description: "La cita ha sido eliminada del sistema.",
      variant: "default"
    });
  };

  const handleViewCita = (cita) => {
    setSelectedCita(cita);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (cita) => {
    setSelectedCita(cita);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (cita) => {
    setSelectedCita(cita);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChangeRequest = (cita, newStatus) => {
    setSelectedCita(cita);
    setPendingStatusChange({ citaId: cita.id, newStatus });
    setIsStatusChangeModalOpen(true);
  };

  const handleStatusChangeConfirm = () => {
    if (pendingStatusChange) {
      const updatedCita = {
        ...selectedCita,
        estado: pendingStatusChange.newStatus
      };
      updateAppointment(updatedCita);

      setIsStatusChangeModalOpen(false);
      setSelectedCita(null);
      setPendingStatusChange(null);

      toast({
        title: "¡Estado actualizado exitosamente!",
        description: `El estado de la cita ha sido cambiado a ${getStatusLabel(pendingStatusChange.newStatus)}.`,
        variant: "default"
      });
    }
  };

  const handleRescheduleAppointment = (appointmentId, newDate) => {
    const updatedCita = appointments.find(cita => cita.id === appointmentId);
    if (updatedCita) {
      updateAppointment({
        ...updatedCita,
        fecha: newDate
      });
    }

    toast({
      title: "¡Cita reagendada exitosamente!",
      description: `La cita ha sido movida a ${new Date(newDate).toLocaleDateString('es-ES')}.`,
      variant: "default"
    });
  };
  
  const getStatusLabel = (status) => {
    const statusLabels = {
      programada: 'Programada',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    return statusLabels[status] || status;
  };

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
            <h1 className="text-3xl font-bold text-slate-800">Gestión de Citas</h1>
            <p className="text-slate-600 mt-1">Administra todas las citas de tus clientes</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Nueva Cita
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
            title="Total Citas"
            value={stats.total}
            icon={Calendar}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            textColor="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatsCard
            title="Programadas"
            value={stats.programadas}
            icon={Clock}
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
            textColor="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatsCard
            title="Confirmadas"
            value={stats.confirmadas}
            icon={CheckCircle}
            color="bg-gradient-to-r from-green-500 to-green-600"
            textColor="text-green-600"
            bgColor="bg-green-50"
          />
          <StatsCard
            title="Canceladas"
            value={stats.canceladas}
            icon={XCircle}
            color="bg-gradient-to-r from-red-500 to-red-600"
            textColor="text-red-600"
            bgColor="bg-red-50"
          />
          <StatsCard
            title="Completadas"
            value={stats.completadas}
            icon={AlertCircle}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            textColor="text-purple-600"
            bgColor="bg-purple-50"
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
              placeholder="Buscar por cliente, propiedad o email..."
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
                  <SelectItem value="programada">Programadas</SelectItem>
                  <SelectItem value="confirmada">Confirmadas</SelectItem>
                  <SelectItem value="cancelada">Canceladas</SelectItem>
                  <SelectItem value="completada">Completadas</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFilterToday}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {dateFilter === 'today' ? 'Todas las fechas' : 'Citas de hoy'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-green-300'
              }`}
            >
              {viewMode === 'table' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
              {viewMode === 'table' ? 'Vista Calendario' : 'Vista Tabla'}
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {viewMode === 'table' ? (
            <AppointmentTable
              citas={currentItems}
              onView={handleViewCita}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onStatusChange={handleStatusChangeRequest}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          ) : (
            <AppointmentCalendar
              citas={filteredCitas}
              onViewAppointment={handleViewCita}
              onEditAppointment={handleEditClick}
              onDeleteAppointment={handleDeleteClick}
              onRescheduleAppointment={handleRescheduleAppointment}
              onCreateAppointment={() => setIsCreateModalOpen(true)}
            />
          )}
        </motion.div>

        {/* Modals */}
        <CreateAppointmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateCita}
        />

        <ViewAppointmentModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          cita={selectedCita}
        />

        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          cita={selectedCita}
          onSubmit={handleEditCita}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteCita}
          title="Eliminar Cita"
          message={`¿Estás seguro de que deseas eliminar la cita con ${selectedCita?.cliente}? Esta acción no se puede deshacer.`}
        />

        <StatusChangeConfirmModal
          isOpen={isStatusChangeModalOpen}
          onClose={() => {
            setIsStatusChangeModalOpen(false);
            setSelectedCita(null);
            setPendingStatusChange(null);
          }}
          onConfirm={handleStatusChangeConfirm}
          title="Confirmar Cambio de Estado"
          message="¿Estás seguro de que deseas cambiar el estado de esta cita?"
          currentStatus={selectedCita?.estado}
          newStatus={pendingStatusChange?.newStatus}
          citaInfo={selectedCita ? {
            cliente: selectedCita.cliente,
            propiedad: selectedCita.propiedad,
            fecha: selectedCita.fecha,
            hora: selectedCita.hora
          } : null}
        />
      </div>
  );
};

export default CitasPage;
