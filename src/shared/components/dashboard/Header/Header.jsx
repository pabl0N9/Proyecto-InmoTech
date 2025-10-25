import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdNotifications, MdSearch, MdAccountCircle } from 'react-icons/md';
import NotificationDropdown from './NotificationDropdown';
import ViewAppointmentModal from '../../../../features/dashboard/components/appointment/ViewAppointmentModal';
import ConfirmationDialog from '../../../components/ui/ConfirmationDialog';
import { useAppointments } from '../../../contexts/AppointmentContext';
import { useToast } from '../../../hooks/use-toast';

const Header = () => {
  const { appointments, updateAppointment } = useAppointments();
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

  const handleAcceptAppointment = () => {
    if (selectedAppointment) {
      const updatedAppointment = {
        ...selectedAppointment,
        estado: 'confirmada'
      };
      updateAppointment(updatedAppointment);
      setIsAcceptDialogOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "¡Cita aceptada exitosamente!",
        description: `La cita con ${selectedAppointment.cliente} ha sido confirmada.`,
        variant: "default"
      });
    }
  };

  const handleRejectAppointment = () => {
    if (selectedAppointment) {
      const updatedAppointment = {
        ...selectedAppointment,
        estado: 'cancelada'
      };
      updateAppointment(updatedAppointment);
      setIsRejectDialogOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "¡Cita rechazada exitosamente!",
        description: `La cita con ${selectedAppointment.cliente} ha sido cancelada.`,
        variant: "default"
      });
    }
  };

  const handleViewAppointment = (appointment) => {
    // Abrir modal de vista de cita
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
    setIsNotificationOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex items-center justify-between px-6 relative"
    >
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-slate-800">Dashboard Principal</h2>
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
            <p className="font-medium text-slate-800">Juan Pérez</p>
            <p className="text-slate-500">Administrador</p>
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
        description={`¿Estás seguro de que deseas confirmar la cita con ${selectedAppointment?.cliente}?`}
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
        description={`¿Estás seguro de que deseas rechazar la cita con ${selectedAppointment?.cliente}?`}
        confirmText="Rechazar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </motion.header>
  );
};

export default Header;
