import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdNotifications, MdSearch, MdAccountCircle } from 'react-icons/md';
import NotificationDropdown from './NotificationDropdown';
import ViewAppointmentModal from '../../../../features/dashboard/components/appointment/ViewAppointmentModal';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';
import { useAppointments } from '../../../contexts/AppointmentContext';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../contexts/AuthContext';

const Header = () => {
  const { appointments, updateAppointmentStatus } = useAppointments();
  const { user } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const notificationButtonRef = useRef(null);
  const { toast } = useToast();

  // Filtrar citas solicitadas pendientes
  const pendingAppointments = Array.isArray(appointments) ? appointments.filter(cita => cita.estado === 'solicitada') : [];

  const handleAcceptAppointmentRequest = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAcceptDialogOpen(true);
    setIsNotificationOpen(false);
  };

  const handleRejectAppointmentRequest = (appointment) => {
    setSelectedAppointment(appointment);
    setIsRejectDialogOpen(true);
    setIsNotificationOpen(false);
  };

  const handleAcceptAppointment = async () => {
    if (selectedAppointment) {
      try {
        const appointmentId = selectedAppointment.id || selectedAppointment.id_cita;
        await updateAppointmentStatus(appointmentId, 2); // 2 = confirmada
        setIsAcceptDialogOpen(false);
        setSelectedAppointment(null);
        const clientName = typeof selectedAppointment.cliente === 'object'
          ? `${selectedAppointment.cliente.nombre_completo} ${selectedAppointment.cliente.apellido_completo}`.trim()
          : selectedAppointment.cliente;
        toast({
          title: "¡Cita aceptada exitosamente!",
          description: `La cita con ${clientName} ha sido confirmada.`,
          variant: "default"
        });
      } catch (error) {
        console.error('Error al aceptar cita:', error);
        toast({
          title: "Error al aceptar cita",
          description: "No se pudo confirmar la cita. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRejectAppointment = async () => {
    if (selectedAppointment) {
      try {
        const appointmentId = selectedAppointment.id || selectedAppointment.id_cita;
        await updateAppointmentStatus(appointmentId, 6); // 6 = cancelada
        setIsRejectDialogOpen(false);
        setSelectedAppointment(null);
        const clientName = typeof selectedAppointment.cliente === 'object'
          ? `${selectedAppointment.cliente.nombre_completo} ${selectedAppointment.cliente.apellido_completo}`.trim()
          : selectedAppointment.cliente;
        toast({
          title: "¡Cita rechazada exitosamente!",
          description: `La cita con ${clientName} ha sido cancelada.`,
          variant: "default"
        });
      } catch (error) {
        console.error('Error al rechazar cita:', error);
        toast({
          title: "Error al rechazar cita",
          description: "No se pudo cancelar la cita. Inténtalo de nuevo.",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewAppointment = (appointment) => {
    // Abrir modal de vista de cita
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
    setIsNotificationOpen(false);
  };

  // Función para obtener el nombre completo del usuario
  const getUserFullName = () => {
    if (!user) return 'Usuario';

    // Intentar diferentes campos para el nombre
    const firstName = user.nombre_completo || user.primer_nombre || user.nombres || '';
    const lastName = user.apellido_completo || user.primer_apellido || user.apellidos || '';

    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.email || 'Usuario';
  };

  // Función para obtener el rol principal del usuario
  const getUserRole = () => {
    if (!user || !user.roles) return 'Usuario';

    // Extraer nombres de roles (manejar tanto objetos como strings)
    const roleNames = user.roles.map(rol =>
      typeof rol === 'object' ? rol.nombre_rol : rol
    ).filter(Boolean);

    // Si es Super Administrador, mostrar eso
    if (roleNames.includes('Super Administrador')) {
      return 'Super Administrador';
    }

    // Si es Administrador
    if (roleNames.includes('Administrador')) {
      return 'Administrador';
    }

    // Mostrar el primer rol disponible
    return roleNames[0] || 'Usuario';
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between px-6 relative"
    >
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Bienvenido, {getUserFullName()}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-300 w-64"
          />
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        </div>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            ref={notificationButtonRef}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
          >
            <MdNotifications size={22} />
            {pendingAppointments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingAppointments.length}
              </span>
            )}
          </motion.button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={pendingAppointments}
            onAcceptAppointment={handleAcceptAppointmentRequest}
            onRejectAppointment={handleRejectAppointmentRequest}
            onViewAppointment={handleViewAppointment}
            triggerRef={notificationButtonRef}
          />
        </div>

        {/* User Profile */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl px-4 py-2 cursor-pointer border border-slate-200/60 hover:border-blue-300/60 transition-all duration-300"
        >
          <MdAccountCircle className="text-slate-600" size={24} />
          <div className="text-sm">
            <p className="font-medium text-slate-800">{getUserFullName()}</p>
            <p className="text-slate-500">{getUserRole()}</p>
          </div>
        </motion.div>
      </div>

      {/* View Appointment Modal */}
      <ViewAppointmentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAppointment(null);
        }}
        cita={selectedAppointment}
      />

      {/* Accept Appointment Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isAcceptDialogOpen}
        onClose={() => {
          setIsAcceptDialogOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleAcceptAppointment}
        title="Confirmar Cita"
        description={`¿Estás seguro de que deseas confirmar la cita con ${typeof selectedAppointment?.cliente === 'object' ? `${selectedAppointment.cliente.nombre_completo} ${selectedAppointment.cliente.apellido_completo}`.trim() : selectedAppointment?.cliente}?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="default"
      />

      {/* Reject Appointment Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isRejectDialogOpen}
        onClose={() => {
          setIsRejectDialogOpen(false);
          setSelectedAppointment(null);
        }}
        onConfirm={handleRejectAppointment}
        title="Rechazar Cita"
        description={`¿Estás seguro de que deseas rechazar la cita con ${typeof selectedAppointment?.cliente === 'object' ? `${selectedAppointment.cliente.nombre_completo} ${selectedAppointment.cliente.apellido_completo}`.trim() : selectedAppointment?.cliente}?`}
        confirmText="Rechazar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </motion.header>
  );
};

export default Header;