import React from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin } from 'lucide-react';

const RescheduleConfirmModal = ({
  isOpen,
  onCancel,
  onConfirm,
  appointment,
  newDate
}) => {
  if (!isOpen) return null;

  // Función para convertir formato 24 horas a 12 horas con AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';

    // Si ya tiene AM/PM, devolver como está
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }

    // Convertir de formato 24 horas a 12 horas
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Full-screen blurred backdrop covering entire page */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden z-[101]"
      >
        <div className="p-6">
          {/* Header with icon */}
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Confirmar reagendado
            </h3>
            <p className="text-slate-600">
              Revisa los detalles antes de confirmar el cambio
            </p>
          </div>

          {/* Appointment details */}
          {appointment && (
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900">{appointment.cliente}</p>
                    <p className="text-sm text-slate-600">{appointment.telefono}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <p className="text-slate-700">{appointment.propiedad}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <p className="text-slate-700">{formatTime(appointment.hora)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date change info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Fecha actual</p>
              <p className="font-semibold text-slate-900 mb-3">
                {appointment ? (() => {
                  const [year, month, day] = appointment.fecha.split('-').map(Number);
                  const dateObj = new Date(year, month - 1, day);
                  return dateObj.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                })() : ''}
              </p>

              <div className="flex items-center justify-center mb-3">
                <div className="flex-1 h-px bg-blue-300"></div>
                <div className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                  Cambiar a
                </div>
                <div className="flex-1 h-px bg-blue-300"></div>
              </div>

              <p className="text-sm text-slate-600 mb-2">Nueva fecha</p>
              <p className="font-semibold text-blue-600">
                {newDate ? (() => {
                  const [year, month, day] = newDate.split('-').map(Number);
                  const dateObj = new Date(year, month - 1, day);
                  return dateObj.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                })() : ''}
              </p>
            </div>
          </div>

          {/* Confirmation message */}
          <div className="text-center mb-6">
            <p className="text-slate-700">
              ¿Estás seguro de que deseas reagendar esta cita?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Esta acción actualizará permanentemente la fecha de la cita.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              Confirmar reagendado
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default RescheduleConfirmModal;
