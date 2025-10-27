import React from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin } from 'lucide-react';

const RescheduleConfirmModal = ({ isOpen, onCancel, onConfirm, appointment, newDate }) => {
  if (!isOpen || !appointment) return null;

  // ✅ CORREGIDO: Función para convertir formato ISO a 12 horas
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Manejar formato ISO (1970-01-01T06:00:00.000Z)
    if (timeString.includes('T') && timeString.includes('Z')) {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const isPM = hours >= 12;
        const hours12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        return `${hours12}:${String(minutes).padStart(2, '0')} ${isPM ? 'pm' : 'am'}`;
      }
    }
    
    // Clean multiple AM/PM suffixes for display safety
    let cleanedTime = timeString;
    const amMatches = timeString.match(/\b(am|AM)\b/g);
    const pmMatches = timeString.match(/\b(pm|PM)\b/g);
    const totalSuffixes = (amMatches ? amMatches.length : 0) + (pmMatches ? pmMatches.length : 0);

    if (totalSuffixes > 1) {
      const lastAM = amMatches && amMatches.length > 0 ? amMatches[amMatches.length - 1] : null;
      const lastPM = pmMatches && pmMatches.length > 0 ? pmMatches[pmMatches.length - 1] : null;
      cleanedTime = timeString.replace(/\s*\b(am|pm)\b/gi, '');
      
      if (lastPM) {
        cleanedTime += ' ' + lastPM.toLowerCase();
      } else if (lastAM) {
        cleanedTime += ' ' + lastAM.toLowerCase();
      }
      
      cleanedTime = cleanedTime.trim();
    }

    if (cleanedTime.includes('am') || cleanedTime.includes('pm') ||
        cleanedTime.includes('AM') || cleanedTime.includes('PM')) {
      return cleanedTime;
    }

    const [hours, minutes] = cleanedTime.split(':');
    const hour24 = parseInt(hours, 10);
    
    if (isNaN(hour24)) return cleanedTime;
    
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'pm' : 'am';

    return `${hour12}:${minutes} ${ampm}`;
  };

  // ✅ CORREGIDO: Extraer datos de objetos anidados
  const cliente = appointment.cliente || {};
  const servicio = appointment.servicio || {};
  const inmueble = appointment.inmueble || {};

  const clienteNombre = cliente.nombre_completo && cliente.apellido_completo
    ? `${cliente.nombre_completo} ${cliente.apellido_completo}`
    : cliente.nombre_completo || 'Cliente no especificado';

  const clienteTelefono = cliente.telefono || 'No especificado';
  const servicioNombre = servicio.nombre_servicio || 'Servicio no especificado';
  const inmuebleInfo = inmueble.direccion || 'Propiedad no especificada';
  
  // ✅ CORREGIDO: Usar fecha_cita en lugar de fecha
  const fechaActual = appointment.fecha_cita || appointment.fecha;
  const horaActual = formatTime(appointment.hora_inicio || appointment.hora || '');

  // ✅ CORREGIDO: Función para formatear fecha con validación
  const formatearFecha = (dateString) => {
    if (!dateString) return 'Fecha no especificada';
    
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      
      return dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Confirmar Reagendamiento
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instrucción */}
          <p className="text-gray-600 text-sm">
            Revisa los detalles antes de confirmar el cambio
          </p>

          {/* Información de la cita */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Cliente */}
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="font-semibold text-gray-900">{clienteNombre}</p>
              </div>
            </div>

            {/* Teléfono */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="font-semibold text-gray-900">{clienteTelefono}</p>
              </div>
            </div>

            {/* Servicio/Propiedad */}
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Servicio</p>
                <p className="font-semibold text-gray-900">{servicioNombre}</p>
              </div>
            </div>

            {/* Hora */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Hora</p>
                <p className="font-semibold text-gray-900">{horaActual}</p>
              </div>
            </div>
          </div>

          {/* Comparación de fechas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fecha actual */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-xs font-medium text-red-600 mb-2">Fecha actual</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatearFecha(fechaActual)}
              </p>
            </div>

            {/* Nueva fecha */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-medium text-green-600 mb-2">Nueva fecha</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatearFecha(newDate)}
              </p>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">¿Estás seguro de que deseas reagendar esta cita?</span>
              <br />
              Esta acción actualizará permanentemente la fecha de la cita.
            </p>
          </div>
        </div>

        {/* Footer - Botones */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Confirmar Reagendamiento
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default RescheduleConfirmModal;
