import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Building, Phone, Mail, AlertCircle, CheckCircle, XCircle, List, Grid, Eye, Edit, Trash2, Filter, BarChart3, TrendingUp, User, Sparkles, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { useToast } from '../../../shared/hooks/use-toast';
import { useAuth } from '../../../shared/contexts/AuthContext';
import citaApiService from '../../../shared/services/citaApiService';
import AppointmentCalendar from '../../../features/dashboard/components/appointment/AppointmentCalendar';
import UserCancelAppointmentModal from '../components/UserCancelAppointmentModal';
import UserEditAppointmentModal from '../components/UserEditAppointmentModal';
import UserViewAppointmentModal from '../components/UserViewAppointmentModal';
import UserCreateAppointmentModal from '../components/UserCreateAppointmentModal';
import UserRescheduleModal from '../components/UserRescheduleModal';

const UserAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointment: null });
  const [editModal, setEditModal] = useState({ isOpen: false, appointment: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, appointment: null });
  const [createModal, setCreateModal] = useState({ isOpen: true, preselectedDate: null });
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, appointment: null, newDate: null });
  const [filter, setFilter] = useState('todos');
  const [calendarKey, setCalendarKey] = useState(0); // Key to force calendar re-render
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadUserAppointments();
  }, []);

  const loadUserAppointments = async () => {
    try {
      setLoading(true);
      const data = await citaApiService.obtenerMisCitas();
      // Ordenar por fecha de creación para numeración secuencial
      const sortedData = data.sort((a, b) => new Date(a.fecha_creacion || 0) - new Date(b.fecha_creacion || 0));
      // Agregar numeración secuencial específica del usuario
      const dataWithSequentialIds = sortedData.map((appointment, index) => ({
        ...appointment,
        userAppointmentNumber: index + 1
      }));
      setAppointments(dataWithSequentialIds);
    } catch (error) {
      console.error('Error cargando citas:', error);
      toast({
        title: "Error al cargar citas",
        description: "No se pudieron cargar tus citas. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      'solicitada': {
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: AlertCircle,
        label: 'Solicitada'
      },
      'confirmada': {
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
        label: 'Confirmada'
      },
      'programada': {
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: 'Programada'
      },
      'completada': {
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: CheckCircle,
        label: 'Completada'
      },
      'cancelada': {
        color: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: XCircle,
        label: 'Cancelada'
      },
      're agendada': {
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: AlertCircle,
        label: 'Re Agendada'
      }
    };
    return statusConfig[status] || statusConfig['solicitada'];
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Fecha no disponible';
    }

    const [year, month, day] = dateString.split('-').map(Number);
    if ([year, month, day].some((value) => Number.isNaN(value))) {
      return 'Fecha no disponible';
    }

    const date = new Date(year, (month || 1) - 1, day || 1);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHora = (horaString) => {
    // Convertir hora API a formato legible
    return citaApiService.formatHoraDesdeAPI(horaString);
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'todos') return true;
    return appointment.estado === filter;
  });

  // Calculate statistics
  const stats = {
    total: appointments.length,
    solicitadas: appointments.filter(a => a.estado === 'solicitada').length,
    confirmadas: appointments.filter(a => a.estado === 'confirmada').length,
    programadas: appointments.filter(a => a.estado === 'programada').length,
    completadas: appointments.filter(a => a.estado === 'completada').length,
    canceladas: appointments.filter(a => a.estado === 'cancelada').length
  };

  const hasReachedEditionLimit = (appointment) => {
    if (!appointment) return false;
    const maxEdits = appointment.ediciones_maximas ?? 2;
    const usedEdits = appointment.ediciones_realizadas ?? 0;
    return usedEdits >= maxEdits;
  };

  // Handler for opening reschedule modal from drag & drop
  const handleOpenRescheduleModal = (appointment, newDate) => {
    if (hasReachedEditionLimit(appointment)) {
      toast({
        title: "Limite de ediciones alcanzado",
        description: `Esta cita ya uso las ${appointment?.ediciones_maximas ?? 2} ediciones permitidas.`,
        variant: "destructive"
      });
      return;
    }

    setRescheduleModal({
      isOpen: true,
      appointment,
      newDate
    });
  };

  // Handler functions for calendar actions
  const handleViewAppointment = (appointment) => {
    setViewModal({ isOpen: true, appointment });
  };

  const handleEditAppointment = (appointment) => {
    if (hasReachedEditionLimit(appointment)) {
      toast({
        title: "Limite de ediciones alcanzado",
        description: "No puedes volver a editar esta cita porque alcanzo el maximo permitido.",
        variant: "destructive"
      });
      return;
    }

    setEditModal({ isOpen: true, appointment });
  };

  const handleCancelAppointment = (appointment) => {
    setCancelModal({ isOpen: true, appointment });
  };

  const handleCreateAppointment = (dateString) => {
    setCreateModal({ isOpen: true, preselectedDate: dateString });
  };

  const handleRescheduleAppointment = async (appointmentId, rescheduleData) => {
    console.log('[INFO] handleRescheduleAppointment llamado con:', { appointmentId, rescheduleData });
try {
      if (!rescheduleData || typeof rescheduleData !== 'object') {
        throw new Error('Datos de reagendamiento invalidos');
      }

      const appointmentToUpdate = appointments.find(
        (appt) => (appt.id_cita || appt.id) === appointmentId
      );

      if (appointmentToUpdate && hasReachedEditionLimit(appointmentToUpdate)) {
        toast({
          title: "Limite de ediciones alcanzado",
          description: "No puedes reagendar esta cita nuevamente.",
          variant: "destructive"
        });
        return;
      }

      // Call API to reschedule appointment
      await citaApiService.reagendarMiCita(appointmentId, rescheduleData);

      // Refresh appointments after successful reschedule
      await loadUserAppointments();

      // Force calendar re-render
      setCalendarKey(prev => prev + 1);

      toast({
        title: "Cita reagendada",
        description: "La cita ha sido reagendada exitosamente.",
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error al reagendar",
        description: error.message || "No se pudo reagendar la cita. Intentalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  // API call handlers
  const performCancelAppointment = async (appointmentId, motivoCancelacion) => {
    try {
      // Cancel API call
      await citaApiService.cancelarCita(appointmentId, motivoCancelacion);

      // Refresh appointments
      await loadUserAppointments();

      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente.",
      });
    } catch (error) {
      console.error('Error canceling appointment:', error);
      throw error; // Re-throw to be handled by modal
    }
  };

  const performEditAppointment = async (appointmentId, updateData) => {
    try {
      // Edit API call
      await citaApiService.actualizarCita(appointmentId, updateData);

      // Refresh appointments
      await loadUserAppointments();

      // Force calendar re-render (in case date/time changed)
      setCalendarKey(prev => prev + 1);

      toast({
        title: "Cita actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (error) {
      console.error('Error editing appointment:', error);
      throw error; // Re-throw to be handled by modal
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-purple-100/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 shadow-xl shadow-blue-500/25">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent mb-4">
            Mis Citas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Aquí puedes ver todas las citas que has agendado en nuestro sistema
          </p>

          {/* Create Appointment Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <motion.button
              onClick={() => handleCreateAppointment(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold text-lg"
            >
              <Plus className="w-6 h-6" />
              Agendar Nueva Cita
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Upcoming Appointments Section */}
        {appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-2xl border border-blue-100 p-6 shadow-xl shadow-blue-500/10 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-blue-900">Próximas Citas</h2>
                      <p className="text-sm text-blue-700">Tus citas más cercanas en el tiempo</p>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAppointments
                    .filter(appointment => {
                      const appointmentDate = new Date(appointment.fecha_cita || appointment.fecha);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      appointmentDate.setHours(0, 0, 0, 0);
                      return appointmentDate >= today && appointment.estado !== 'cancelada' && appointment.estado !== 'completada';
                    })
                    .sort((a, b) => new Date(a.fecha_cita || a.fecha) - new Date(b.fecha_cita || b.fecha))
                    .slice(0, 3)
                    .map((appointment, index) => {
                      const statusInfo = getStatusInfo(appointment.estado);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {formatDate(appointment.fecha_cita)}
                              </span>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} shadow-sm`}>
                              <StatusIcon className="h-3 w-3" />
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-gray-600">
                                {appointment.hora_inicio ? formatHora(appointment.hora_inicio) : 'Por confirmar'}
                              </span>
                            </div>
                            {appointment.inmueble && (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-600 truncate">
                                  {appointment.inmueble.direccion}
                                </span>
                              </div>
                            )}
                            {appointment.agente && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-600 truncate">
                                  {appointment.agente.nombre_completo}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Statistics Cards */}
        {appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 text-center hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-xl"></div>
              <BarChart3 className="h-6 w-6 text-gray-600 mx-auto mb-2 relative z-10" />
              <div className="text-2xl font-bold text-gray-900 relative z-10">{stats.total}</div>
              <div className="text-sm text-gray-600 relative z-10">Total</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg shadow-blue-200/50 border border-blue-100 p-4 text-center hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-xl"></div>
              <AlertCircle className="h-6 w-6 text-blue-600 mx-auto mb-2 relative z-10" />
              <div className="text-2xl font-bold text-blue-700 relative z-10">{stats.solicitadas}</div>
              <div className="text-sm text-blue-600 relative z-10">Solicitadas</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg shadow-green-200/50 border border-green-100 p-4 text-center hover:shadow-xl hover:shadow-green-300/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-100 to-transparent rounded-full blur-xl"></div>
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2 relative z-10" />
              <div className="text-2xl font-bold text-green-700 relative z-10">{stats.confirmadas}</div>
              <div className="text-sm text-green-600 relative z-10">Confirmadas</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg shadow-yellow-200/50 border border-yellow-100 p-4 text-center hover:shadow-xl hover:shadow-yellow-300/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-100 to-transparent rounded-full blur-xl"></div>
              <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2 relative z-10" />
              <div className="text-2xl font-bold text-yellow-700 relative z-10">{stats.programadas}</div>
              <div className="text-sm text-yellow-600 relative z-10">Programadas</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg shadow-purple-200/50 border border-purple-100 p-4 text-center hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-xl"></div>
              <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2 relative z-10" />
              <div className="text-2xl font-bold text-purple-700 relative z-10">{stats.completadas}</div>
              <div className="text-sm text-purple-600 relative z-10">Completadas</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 text-center hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-xl"></div>
              <XCircle className="h-6 w-6 text-gray-600 mx-auto mb-2 relative z-10" />
              <div className="text-2xl font-bold text-gray-700 relative z-10">{stats.canceladas}</div>
              <div className="text-sm text-gray-600 relative z-10">Canceladas</div>
            </div>
          </motion.div>
        )}

        {/* Filters and View Toggle */}
        {appointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            {/* Filter */}
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-600" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las citas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-600" />
                      Todas las citas
                    </div>
                  </SelectItem>
                  <SelectItem value="solicitada">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      Solicitadas
                    </div>
                  </SelectItem>
                  <SelectItem value="confirmada">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Confirmadas
                    </div>
                  </SelectItem>
                  <SelectItem value="programada">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Programadas
                    </div>
                  </SelectItem>
                  <SelectItem value="completada">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                      Completadas
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelada">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Canceladas
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-xl shadow-gray-200/50 border border-white/20">
              <motion.div className="flex items-center relative" layout>
                <motion.button
                  onClick={() => setViewMode('list')}
                  className={`relative flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
                    viewMode === 'list'
                      ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <List className="w-4 h-4" />
                  Lista
                </motion.button>

                <motion.button
                  onClick={() => setViewMode('calendar')}
                  className={`relative flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm ${
                    viewMode === 'calendar'
                      ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Calendar className="w-4 h-4" />
                  Calendario
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Appointments Content */}
        {appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-16 bg-white rounded-2xl shadow-xl shadow-blue-500/10 border border-blue-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white to-indigo-50/20"></div>
            <div className="relative z-10">
              <motion.div
                className="mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              >
                <Calendar className="mx-auto h-20 w-20 text-blue-500 mb-6" />
              </motion.div>
              <motion.h3
                className="text-2xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                ¡No tienes citas agendadas aún!
              </motion.h3>
              <motion.p
                className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Es momento perfecto para agendar tu primera cita. Usa el botón "Agendar Nueva Cita" arriba para comenzar. ¡Te esperamos!
              </motion.p>
              <motion.div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 max-w-md mx-auto border border-blue-100 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 justify-center">
                  <Sparkles className="h-5 w-5" />
                  Servicios Disponibles
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Visita a Propiedad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Avalúos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Gestión de Alquileres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Asesoría Legal</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 max-h-[800px] overflow-y-auto relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-2xl"></div>
                <AppointmentCalendar
                  key={calendarKey}
                  citas={filteredAppointments}
                  userMode={true}
                  onViewAppointment={handleViewAppointment}
                  onEditAppointment={handleEditAppointment}
                  onDeleteAppointment={handleCancelAppointment}
                  onRescheduleAppointment={handleRescheduleAppointment}
                  onCreateAppointment={handleCreateAppointment}
                  onAcceptAppointment={() => {}}
                  onRejectAppointment={() => {}}
                  onOpenRescheduleModal={handleOpenRescheduleModal}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAppointments.map((appointment, index) => {
                  const StatusIcon = getStatusInfo(appointment.estado).icon;
                  const statusInfo = getStatusInfo(appointment.estado);
                  const editLimitReached = hasReachedEditionLimit(appointment);

                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.05,
                        type: "spring",
                        damping: 20,
                        stiffness: 100
                      }}
                      whileHover={{
                        y: -4,
                        scale: 1.01,
                        transition: { duration: 0.3 }
                      }}
                      className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
                    >
                      {/* Background gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-gray-50/30 opacity-50"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/20 to-transparent rounded-full blur-2xl"></div>

                      {/* Status ribbon */}
                      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-5 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                              <StatusIcon className="h-5 w-5 text-white drop-shadow-sm" />
                            </div>
                            <h3 className="text-xl font-bold text-white drop-shadow-sm">
                              Cita #{appointment.userAppointmentNumber}
                            </h3>
                          </div>
                          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm bg-white/10 border-white/20 shadow-sm ${statusInfo.color === 'bg-yellow-100 text-yellow-800 border-yellow-200' ? 'bg-yellow-500/20 border-yellow-400/30' : statusInfo.color === 'bg-blue-100 text-blue-800 border-blue-200' ? 'bg-blue-500/20 border-blue-400/30' : statusInfo.color === 'bg-green-100 text-green-800 border-green-200' ? 'bg-green-500/20 border-green-400/30' : statusInfo.color === 'bg-purple-100 text-purple-800 border-purple-200' ? 'bg-purple-500/20 border-purple-400/30' : statusInfo.color === 'bg-red-100 text-red-800 border-red-200' ? 'bg-red-500/20 border-red-400/30' : 'bg-orange-500/20 border-orange-400/30'}`}>
                            <StatusIcon className="h-4 w-4 text-white" />
                            <span className="text-white font-medium">{statusInfo.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="relative px-6 py-6">
                        {/* Ediciones counter */}
                        <div className="flex items-center justify-end mb-4">
                          <div className="bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 text-xs font-semibold px-3 py-2 rounded-full border border-orange-200 shadow-sm">
                            📝 Ediciones realizadas: {appointment.ediciones_realizadas || 0} / {appointment.ediciones_maximas || 2}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Date and Time */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="p-2 bg-blue-50 rounded-lg shadow-sm">
                                  <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Fecha</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {formatDate(appointment.fecha_cita)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="p-2 bg-blue-50 rounded-lg shadow-sm">
                                  <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Hora</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {appointment.hora_inicio ? formatHora(appointment.hora_inicio) : 'Por confirmar'}
                                  {appointment.hora_fin && ` - ${formatHora(appointment.hora_fin)}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Property and Agent */}
                          <div className="space-y-4">
                            {appointment.inmueble && (
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="p-2 bg-green-50 rounded-lg shadow-sm">
                                    <Building className="h-5 w-5 text-green-600" />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Propiedad</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {appointment.inmueble.direccion || 'Dirección no disponible'}
                                  </p>
                                  {appointment.inmueble.ciudad && appointment.inmueble.departamento && (
                                    <p className="text-xs text-gray-500">
                                      {appointment.inmueble.ciudad}, {appointment.inmueble.departamento}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {appointment.agente && (
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <span className="text-xs font-bold text-white">
                                      {appointment.agente.nombre_completo?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Agente Asignado</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {appointment.agente.nombre_completo}
                                  </p>
                                  {appointment.agente.telefono && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      <p className="text-xs text-gray-500">
                                        {appointment.agente.telefono}
                                      </p>
                                    </div>
                                  )}
                                  {appointment.agente.correo && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3 text-gray-400" />
                                      <p className="text-xs text-gray-500 truncate">
                                        {appointment.agente.correo}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {appointment.servicio && (
                          <div className="mt-6 pt-6 border-t border-gray-200 relative">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-50 rounded-lg shadow-sm">
                                <MapPin className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Servicio Solicitado</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {appointment.servicio.nombre_servicio}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {appointment.observaciones && (
                          <div className="mt-6 pt-6 border-t border-gray-200 relative">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Observaciones</p>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 shadow-inner border border-gray-100">
                              {appointment.observaciones}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="relative px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        <div className="flex gap-3 justify-end">
                          <motion.button
                            onClick={() => handleViewAppointment(appointment)}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 transition-all duration-300 font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </motion.button>

                          <motion.button
                            onClick={() => !editLimitReached && handleEditAppointment(appointment)}
                            whileHover={editLimitReached ? undefined : { scale: 1.05, y: -1 }}
                            whileTap={editLimitReached ? undefined : { scale: 0.95 }}
                            disabled={editLimitReached}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg shadow-amber-500/25 transition-all duration-300 font-medium ${
                              editLimitReached
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                            }`}
                          >
                            <Edit className="h-4 w-4" />
                            {editLimitReached ? 'Limite alcanzado' : 'Editar'}
                          </motion.button>

                          <motion.button
                            onClick={() => handleCancelAppointment(appointment)}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25 transition-all duration-300 font-medium"
                          >
                            <Trash2 className="h-4 w-4" />
                            Cancelar
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <UserCancelAppointmentModal
          isOpen={cancelModal.isOpen}
          onClose={() => setCancelModal({ isOpen: false, appointment: null })}
          appointment={cancelModal.appointment}
          onCancelAppointment={performCancelAppointment}
        />

        <UserEditAppointmentModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, appointment: null })}
          appointment={editModal.appointment}
          onEditAppointment={performEditAppointment}
        />

        <UserViewAppointmentModal
          isOpen={viewModal.isOpen}
          onClose={() => setViewModal({ isOpen: false, appointment: null })}
          appointment={viewModal.appointment}
        />

        <UserCreateAppointmentModal
          isOpen={createModal.isOpen}
          onClose={() => setCreateModal({ isOpen: false, preselectedDate: null })}
          preselectedDate={createModal.preselectedDate}
        />

        <UserRescheduleModal
          isOpen={rescheduleModal.isOpen}
          onClose={() => setRescheduleModal({ isOpen: false, appointment: null, newDate: null })}
          appointment={rescheduleModal.appointment}
          newDate={rescheduleModal.newDate}
          onConfirm={handleRescheduleAppointment}
        />
      </div>
    </div>
  );
};

export default UserAppointmentsPage;
