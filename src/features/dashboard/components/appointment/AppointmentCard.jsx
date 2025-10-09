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
    id: `appointment-${appointment.id}`,
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
      completada: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
      aria-label={`Cita con ${appointment.cliente} para ${appointment.servicio} el ${appointment.fecha} a las ${appointment.hora}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      {...props}
    >
      <div className="flex items-center gap-1 mb-1">
        <Clock className="w-3 h-3 flex-shrink-0" />
        <span className="font-medium truncate">{formatTime(appointment.hora)}</span>
      </div>
      <div className="flex items-center gap-1 mb-1">
        <User className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{appointment.cliente}</span>
      </div>
      <div className="flex items-center gap-1">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span className="truncate">{appointment.servicio}</span>
      </div>
    </motion.div>
  );
};

export default AppointmentCard;
