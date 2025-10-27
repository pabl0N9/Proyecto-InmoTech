import React, { useRef, useLayoutEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { Clock, User, MapPin } from 'lucide-react';

const AppointmentCard = ({
  appointment,
  isDragging = false,
  onClick,
  className = '',
  ...props
}) => {
  const cardRef = useRef(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  // Measure card size for overlay centering
  useLayoutEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDndDragging,
  } = useDraggable({
    id: `appointment-${appointment.id_cita || appointment.id}`,
    data: {
      type: 'appointment',
      appointment,
      size: cardSize,
    },
    disabled: isDragging,
  });

  const getStatusColor = (status) => {
    const colors = {
      programada: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmada: 'bg-green-100 text-green-800 border-green-200',
      completada: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200',
      're agendada': 'bg-orange-100 text-orange-800 border-orange-200',
      solicitada: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
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
  
  // Extraer datos de objetos anidados
  const cliente = appointment.cliente || {};
  const servicio = appointment.servicio || {};

  const clienteNombre = cliente.nombre_completo && cliente.apellido_completo
    ? `${cliente.nombre_completo} ${cliente.apellido_completo}`
    : cliente.nombre_completo || 'Cliente no especificado';

  const servicioNombre = servicio.nombre_servicio || 'Servicio no especificado';
  const hora = formatTime(appointment.hora_inicio || appointment.hora || '');
  const fechaCita = appointment.fecha_cita || appointment.fecha || '';

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`
        p-2 rounded-lg border text-xs cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-sm select-none
        ${getStatusColor(appointment.estado)}
        ${isDndDragging ? 'opacity-50' : ''}
        ${className}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Cita con ${clienteNombre} para ${servicioNombre} el ${fechaCita} a las ${hora}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      {...props}
    >
      {/* ✅ CORREGIDO: Usar variable hora */}
      <div className="flex items-center gap-1 mb-1">
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span className="font-medium truncate">{hora}</span>
      </div>
      
      {/* ✅ CORREGIDO: Usar variable clienteNombre */}
      <div className="flex items-center gap-1 mb-1">
        <User className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{clienteNombre}</span>
      </div>
      
      {/* ✅ CORREGIDO: Usar variable servicioNombre */}
      <div className="flex items-center gap-1">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{servicioNombre}</span>
      </div>
    </motion.div>
  );
};

export default AppointmentCard;
