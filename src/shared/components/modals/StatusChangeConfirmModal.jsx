import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

const StatusChangeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Cambio de Estado",
  message = "¿Estás seguro de que deseas cambiar el estado de esta cita?",
  currentStatus,
  newStatus,
  citaInfo
}) => {
  if (!isOpen) return null;

  const getStatusLabel = (status) => {
    const statusLabels = {
      programada: 'Programada',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      programada: 'text-yellow-600 bg-yellow-100',
      confirmada: 'text-green-600 bg-green-100',
      completada: 'text-purple-600 bg-purple-100',
      cancelada: 'text-red-600 bg-red-100'
    };
    return statusColors[status] || 'text-gray-600 bg-gray-100';
  };

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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 leading-relaxed mb-4">{message}</p>

            {citaInfo && (
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-slate-800 font-medium">{citaInfo.cliente}</div>
                <div className="text-sm text-slate-600">{citaInfo.propiedad}</div>
                <div className="text-sm text-slate-600">{citaInfo.fecha} - {citaInfo.hora}</div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
                  {getStatusLabel(currentStatus)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Estado actual</div>
              </div>

              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-slate-300"></div>
                <CheckCircle className="w-4 h-4 text-slate-400 mx-1" />
                <div className="w-4 h-0.5 bg-slate-300"></div>
              </div>

              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(newStatus)}`}>
                  {getStatusLabel(newStatus)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Nuevo estado</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar Cambio
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default StatusChangeConfirmModal;
