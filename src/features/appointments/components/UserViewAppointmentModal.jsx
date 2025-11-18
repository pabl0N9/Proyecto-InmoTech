import React from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  X,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import citaApiService from '../../../shared/services/citaApiService';

const UserViewAppointmentModal = ({
  isOpen,
  onClose,
  appointment
}) => {
  if (!isOpen || !appointment) return null;

  const getStatusInfo = (status) => {
    const statusConfig = {
      'solicitada': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        label: 'Solicitada'
      },
      'confirmada': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
        label: 'Confirmada'
      },
      'programada': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Programada'
      },
      'completada': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: CheckCircle,
        label: 'Completada'
      },
      'cancelada': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Cancelada'
      },
      're agendada': {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: AlertCircle,
        label: 'Re Agendada'
      }
    };
    return statusConfig[status] || statusConfig['solicitada'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';

    try {
      if (dateString.includes('T')) {
        const parsed = new Date(dateString);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }

      const [year, month, day] = dateString.split('-').map(Number);
      if ([year, month, day].some((value) => Number.isNaN(value))) {
        return 'Fecha no disponible';
      }

      const normalized = new Date(year, (month || 1) - 1, day || 1);
      return normalized.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  const formatHora = (horaString) => {
    return citaApiService.formatHoraDesdeAPI(horaString);
  };

  const StatusIcon = getStatusInfo(appointment.estado).icon;
  const statusInfo = getStatusInfo(appointment.estado);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
        transition={{ duration: 0.3 }}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 50 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.4
          }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-sm">
                    Detalles de Cita
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Revisa toda la información completa
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Status and Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Cita #{appointment.userAppointmentNumber || appointment.id}
                </h3>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span>{statusInfo.label}</span>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Fecha</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 ml-8">
                    {formatDate(appointment.fecha_cita)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Hora</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 ml-8">
                    {appointment.hora_inicio ? formatHora(appointment.hora_inicio) : 'Por confirmar'}
                    {appointment.hora_fin && ` - ${formatHora(appointment.hora_fin)}`}
                  </p>
                </div>
              </div>

              {/* Property Information */}
              {appointment.inmueble && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Building className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-900">Propiedad</span>
                  </div>
                  <div className="ml-8 space-y-1">
                    <p className="text-gray-800 font-medium">
                      {appointment.inmueble.direccion}
                    </p>
                    {appointment.inmueble.departamento && appointment.inmueble.ciudad && (
                      <p className="text-sm text-gray-600">
                        {appointment.inmueble.ciudad}, {appointment.inmueble.departamento}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Agent Information */}
              {appointment.agente && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Agente Asignado</span>
                  </div>
                  <div className="ml-8 space-y-2">
                    <p className="text-gray-800 font-medium">
                      {appointment.agente.nombre_completo}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{appointment.agente.telefono || 'No disponible'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{appointment.agente.correo || 'No disponible'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Information */}
              {appointment.servicio && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-gray-900">Servicio Solicitado</span>
                  </div>
                  <div className="ml-8">
                    <p className="text-lg font-semibold text-gray-800">
                      {appointment.servicio.nombre_servicio}
                    </p>
                  </div>
                </div>
              )}

              {/* Observations */}
              {appointment.observaciones && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-2">Observaciones</p>
                      <p className="text-gray-700">{appointment.observaciones}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Reason (if cancelled) */}
              {appointment.motivo_cancelacion && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900 mb-2">Motivo de Cancelación</p>
                      <p className="text-red-800">{appointment.motivo_cancelacion}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default UserViewAppointmentModal;
