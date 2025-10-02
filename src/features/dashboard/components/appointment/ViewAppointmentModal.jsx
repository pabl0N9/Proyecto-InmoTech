import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Calendar, Clock, Home, FileText, MapPin, Hash } from 'lucide-react';

const ViewAppointmentModal = ({ isOpen, onClose, cita }) => {
  const contentRef = useRef(null);

  // Scroll to top when modal opens
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen || !cita) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    // Crear la fecha usando la zona horaria local del dispositivo
    const localDate = new Date(Number(year), Number(month) - 1, Number(day));
    return localDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };  


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

  
  const getStatusBadge = (estado) => {
    const statusConfig = {
      programada: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Programada'
      },
      confirmada: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Confirmada'
      },
      cancelada: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Cancelada'
      },
      completada: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Completada'
      }
    };

    const config = statusConfig[estado] || statusConfig.programada;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getDocumentTypeLabel = (tipoDocumento) => {
    const documentTypes = {
      'CC': 'Cédula de Ciudadanía',
      'CE': 'Cédula de Extranjería',
      'NIT': 'NIT',
      'PASAPORTE': 'Pasaporte',
      'TI': 'Tarjeta de Identidad'
    };
    return documentTypes[tipoDocumento] || tipoDocumento;
  };

  const formatDocumentInfo = (tipoDocumento, numeroDocumento) => {
    if (!tipoDocumento || !numeroDocumento) return 'No especificado';
    return `${getDocumentTypeLabel(tipoDocumento)} - ${numeroDocumento}`;
  };

  const infoItems = [
    {
      icon: User,
      label: 'Cliente',
      value: cita.cliente,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Hash,
      label: 'Documento',
      value: formatDocumentInfo(cita.tipoDocumento, cita.numeroDocumento),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: cita.telefono,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Mail,
      label: 'Email',
      value: cita.email,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Calendar,
      label: 'Fecha',
      value: formatDate(cita.fecha),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
      },
      {
      icon: Clock,
      label: 'Hora',
      value: formatTime(cita.hora),
      color: 'text-red-600',
      bgColor: 'bg-red-50'
      },
      {
      icon: Home,
      label: 'Propiedad',
      value: cita.propiedad,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Detalles de la Cita</h2>
              <p className="text-slate-600 mt-1">Información completa de la cita</p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(cita.estado)}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 min-h-0">
            <div className="space-y-6">
              {/* Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 rounded-xl border ${item.bgColor} border-opacity-50`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-600 mb-1">{item.label}</p>
                        <p className="text-slate-800 font-semibold">{item.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Notas */}
              {cita.notas && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-2">Notas Adicionales</p>
                      <p className="text-slate-800 leading-relaxed">{cita.notas}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Información Adicional */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <h4 className="font-semibold text-blue-800 mb-3">Información Adicional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">ID de Cita:</span>
                    <span className="text-blue-800 ml-2">#{cita.id}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Fecha de Creación:</span>
                    <span className="text-blue-800 ml-2">{formatDate(cita.fechaCreacion)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cerrar
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ViewAppointmentModal;
