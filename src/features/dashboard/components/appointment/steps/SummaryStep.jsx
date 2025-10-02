import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Clock, Home, FileText, CheckCircle, Hash } from 'lucide-react';

const SummaryStep = ({ formData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';

    // Solución simple: mostrar la fecha tal como viene del input
    // sin usar Date objects que causan problemas de zona horaria
    const [year, month, day] = dateString.split('-');

    // Crear arrays para los nombres de meses y días
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const weekdays = [
      'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
    ];

    // Calcular el día de la semana usando un algoritmo simple
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);

    // Algoritmo de Zeller simplificado para calcular el día de la semana
    let h = Math.floor((13 * (monthNum + 12 * Math.floor((monthNum + 1) / 12) - 1) +
                       5 * Math.floor(yearNum / 4) +
                       Math.floor(yearNum / 400) -
                       Math.floor(yearNum / 100)) / 5) + dayNum;

    // Ajustar para que funcione correctamente
    const monthAdjusted = monthNum < 3 ? monthNum + 12 : monthNum;
    const yearAdjusted = monthNum < 3 ? yearNum - 1 : yearNum;

    const weekdayIndex = (dayNum + Math.floor(2.6 * ((monthAdjusted + 1) % 12) - 0.2) +
                         yearAdjusted % 100 + Math.floor(yearAdjusted % 100 / 4) +
                         Math.floor(yearAdjusted / 400) - 2 * Math.floor(yearAdjusted / 100)) % 7;

    const weekday = weekdays[Math.abs(weekdayIndex) % 7];
    const monthName = months[parseInt(month) - 1];

    return `${weekday}, ${day} de ${monthName} de ${year}`;
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

  const infoItems = [
    {
      icon: User,
      label: 'Cliente',
      value: formData.cliente,
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: formData.telefono,
      color: 'text-green-600'
    },
    {
      icon: Mail,
      label: 'Email',
      value: formData.email,
      color: 'text-purple-600'
    },
    {
      icon: FileText,
      label: 'Tipo de Documento',
      value: getDocumentTypeLabel(formData.tipoDocumento),
      color: 'text-indigo-600'
    },
    {
      icon: Hash,
      label: 'Número de Documento',
      value: formData.numeroDocumento,
      color: 'text-slate-600'
    },
    {
      icon: Calendar,
      label: 'Fecha',
      value: formatDate(formData.fecha),
      color: 'text-orange-600'
    },
    {
      icon: Clock,
      label: 'Hora',
      value: formData.hora,
      color: 'text-red-600'
    },
    {
      icon: Home,
      label: 'Propiedad',
      value: formData.propiedad,
      color: 'text-indigo-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Resumen de la Cita</h3>
        <p className="text-slate-600">Revisa la información antes de crear la cita</p>
      </div>

      {/* Información Principal */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <p className="text-slate-800 font-semibold truncate">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4"
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">Estado:</span>
          {getStatusBadge(formData.estado)}
        </div>
      </motion.div>

      {/* Notas */}
      {formData.notas && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white border border-slate-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">Notas Adicionales</p>
              <p className="text-slate-800">{formData.notas}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirmación */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">¡Todo listo!</span>
        </div>
        <p className="text-green-700 text-sm">
          La cita será creada con la información mostrada arriba. Podrás editarla o cambiar su estado más tarde si es necesario.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SummaryStep;
