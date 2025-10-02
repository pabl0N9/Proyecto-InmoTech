import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  CreditCard,
  Hash,
  Phone,
  Mail,
  Calendar,
  Clock,
  MessageSquare,
  MapPin,
  Home,
  DollarSign,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatPhoneNumber } from '../../../shared/utils/phoneFormatter';
import { useToast } from '../../../shared/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../shared/components/ui/select';

const PropertyVisitModal = ({ isOpen, onClose, property, onSubmit }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    tipoDocumento: '',
    numeroDocumento: '',
    telefono: '',
    email: '',
    fecha: '',
    hora: '',
    mensaje: ''
  });
  const [errors, setErrors] = useState({});
  const [prevPhone, setPrevPhone] = useState('');

  const { toast } = useToast();

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const availableHours = [
    '08:00 am', '08:30 am', '09:00 am', '09:30 am', '10:00 am', '10:30 am',
    '11:00 am', '11:30 am', '02:00 pm', '02:30 pm', '03:00 pm', '03:30 pm',
    '04:00 pm', '04:30 pm', '05:00 pm', '05:30 pm'
  ];

  const tiposDocumento = [
    { value: 'Cédula de Ciudadanía', label: 'Cédula de Ciudadanía (CC)' },
    { value: 'Cédula de Extranjería', label: 'Cédula de Extranjería (CE)' },
    { value: 'NIT', label: 'NIT' },
    { value: 'Pasaporte', label: 'Pasaporte' },
    { value: 'Tarjeta de Identidad', label: 'Tarjeta de Identidad (TI)' }
  ];

  const tipoDocumentoMap = {
    'Cédula de Ciudadanía': 'CC',
    'Cédula de Extranjería': 'CE',
    'NIT': 'NIT',
    'Pasaporte': 'Pasaporte',
    'Tarjeta de Identidad': 'TI'
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Deshabilitar domingos (día 0)
      const isDisabled = date < today || date.getDay() === 0;
      
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled,
        isToday: date.toDateString() === today.toDateString(),
        isSunday: date.getDay() === 0
      });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    return days;
  };

  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Función para validar nombre completo (igual que dashboard)
  const validateNombre = (nombre) => {
    if (!nombre.trim()) return 'El nombre del cliente es requerido';
    if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (nombre.trim().length > 100) return 'El nombre no puede tener más de 100 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre.trim())) return 'El nombre solo puede contener letras y espacios';
    return '';
  };

  // Función para validar teléfono colombiano (igual que dashboard)
  const validateTelefono = (telefono) => {
    if (!telefono.trim()) return 'El teléfono es requerido';
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+57|57)?[3][0-9]{9}$/.test(telefonoLimpio)) {
      return 'El teléfono debe tener formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)';
    }
    return '';
  };

  // Función para validar email (igual que dashboard)
  const validateEmail = (email) => {
    if (!email.trim()) return 'El email es requerido';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Ingresa un email válido';
    if (email.length > 254) return 'El email es demasiado largo';
    return '';
  };

  // Función para validar tipo de documento (igual que dashboard)
  const validateTipoDocumento = (tipoDocumento) => {
    if (!tipoDocumento) return 'El tipo de documento es requerido';
    return '';
  };

  // Función para validar número de documento (igual que dashboard)
const validateNumeroDocumento = (numeroDocumento, tipoDocumento) => {
  if (!numeroDocumento.trim()) return 'El número de documento es requerido';

  const numeroLimpio = numeroDocumento.replace(/[\s\-\.]/g, '');

  switch (tipoDocumento) {
    case 'Cédula de Ciudadanía':
      if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
        return 'La cédula debe tener entre 8 y 10 dígitos';
      }
      break;
    case 'Cédula de Extranjería':
      if (!/^[0-9]{6,10}$/.test(numeroLimpio)) {
        return 'La cédula de extranjería debe tener entre 6 y 10 dígitos';
      }
      break;
    case 'NIT':
      if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
        return 'El NIT debe tener entre 8 y 10 dígitos';
      }
      break;
    case 'Pasaporte':
      if (numeroLimpio.length < 6 || numeroLimpio.length > 20) {
        return 'El pasaporte debe tener entre 6 y 20 caracteres';
      }
      if (!/^[A-Za-z0-9]+$/.test(numeroLimpio)) {
        return 'El pasaporte solo puede contener letras y números';
      }
      break;
    case 'Tarjeta de Identidad':
      if (!/^[0-9]{10,11}$/.test(numeroLimpio)) {
        return 'La tarjeta de identidad debe tener 10 u 11 dígitos';
      }
      break;
    default:
      return 'Tipo de documento no válido';
  }

  return '';
};

  // Función para validar fecha (igual que dashboard)
  const validateFecha = (fecha) => {
    if (!fecha) return 'La fecha es requerida';
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) return 'No se pueden agendar citas en fechas pasadas';
    return '';
  };

  // Función para validar hora (horario laboral como dashboard)
  const validateHora = (hora) => {
    if (!hora) return 'La hora es requerida';

    // Lista de horas válidas
    const validHours = [
      '08:00 am', '08:30 am', '09:00 am', '09:30 am', '10:00 am', '10:30 am',
      '11:00 am', '11:30 am', '02:00 pm', '02:30 pm', '03:00 pm', '03:30 pm',
      '04:00 pm', '04:30 pm', '05:00 pm', '05:30 pm'
    ];

    if (!validHours.includes(hora)) {
      return 'Las citas solo se pueden agendar entre las 8:00 am y las 6:00 pm';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar todos los campos usando las funciones del dashboard
    newErrors.nombreCompleto = validateNombre(formData.nombreCompleto);
    newErrors.telefono = validateTelefono(formData.telefono);
    newErrors.email = validateEmail(formData.email);
    newErrors.tipoDocumento = validateTipoDocumento(formData.tipoDocumento);
    newErrors.numeroDocumento = validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento);
    newErrors.fecha = validateFecha(formData.fecha);
    newErrors.hora = validateHora(formData.hora);

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const parseTime = (timeString) => {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);

    if (period === 'am' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'pm' && hour24 === 12) {
      hour24 = 0;
    }

    const date = new Date();
    date.setHours(hour24, parseInt(minutes), 0, 0);
    return date;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const citaData = {
        cliente: formData.nombreCompleto,
        telefono: formData.telefono,
        email: formData.email,
        fecha: formData.fecha,
        hora: formData.hora,
        propiedad: property?.title || 'Propiedad no especificada',
        notas: `Tipo de documento: ${tiposDocumento.find(t => t.value === formData.tipoDocumento)?.label}, Número: ${formData.numeroDocumento}. ${formData.mensaje ? 'Mensaje: ' + formData.mensaje : ''}`,
        estado: 'programada',
        tipoDocumento: tipoDocumentoMap[formData.tipoDocumento] || formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        mensaje: formData.mensaje
      };
      
      onSubmit(citaData);
      handleClose();
    } else {
      toast({
        title: "Por favor, corrige los errores",
        description: "Revisa los campos marcados en rojo y completa la información requerida.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setFormData({
      nombreCompleto: '',
      tipoDocumento: '',
      numeroDocumento: '',
      telefono: '',
      email: '',
      fecha: '',
      hora: '',
      mensaje: ''
    });
    setErrors({});
    onClose();
  };

  // Función para verificar si se puede proceder (similar a canProceedToNextStep del dashboard)
  const canSubmit = () => {
    const requiredFields = ['nombreCompleto', 'telefono', 'email', 'tipoDocumento', 'numeroDocumento', 'fecha', 'hora'];
    const hasAllRequired = requiredFields.every(field => formData[field].trim() !== '');

    if (!hasAllRequired) return false;

    // Verificar que no hay errores en los campos requeridos
    const newErrors = {};
    newErrors.nombreCompleto = validateNombre(formData.nombreCompleto);
    newErrors.telefono = validateTelefono(formData.telefono);
    newErrors.email = validateEmail(formData.email);
    newErrors.tipoDocumento = validateTipoDocumento(formData.tipoDocumento);
    newErrors.numeroDocumento = validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento);
    newErrors.fecha = validateFecha(formData.fecha);
    newErrors.hora = validateHora(formData.hora);

    return Object.keys(newErrors).every(key => !newErrors[key]);
  };

  // Función para validar campo específico en tiempo real
  const validateField = (field, value) => {
    switch (field) {
      case 'nombreCompleto':
        return validateNombre(value);
      case 'telefono':
        return validateTelefono(value);
      case 'email':
        return validateEmail(value);
      case 'tipoDocumento':
        return validateTipoDocumento(value);
      case 'numeroDocumento':
        return validateNumeroDocumento(value, formData.tipoDocumento);
      case 'fecha':
        return validateFecha(value);
      case 'hora':
        return validateHora(value);
      default:
        return '';
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validación en tiempo real
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Función para manejar el cambio del teléfono con formateo automático
  const handlePhoneChange = (e) => {
    const newValue = e.target.value;
    const formatted = formatPhoneNumber(newValue, prevPhone, false);
    setPrevPhone(formatted);
    updateFormData('telefono', formatted);
  };

  // Función para manejar el evento de teclado en el teléfono (backspace)
  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Backspace') {
      const formatted = formatPhoneNumber(
        formData.telefono.slice(0, -1),
        formData.telefono,
        true
      );
      setPrevPhone(formatted);
      updateFormData('telefono', formatted);
      e.preventDefault();
    }
  };

  const handleDateSelect = (day) => {
    if (day.isDisabled) return;
    
    const dateString = formatDateForInput(day.date);
    updateFormData('fecha', dateString);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentMonth);

  if (!isOpen || !property) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[95vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Agendar Visita a la Propiedad</h2>
                <p className="text-slate-600 mt-1">Programa tu visita personalizada</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row overflow-hidden flex-1 min-h-0">
            {/* Property Info Sidebar */}
            <div className="lg:w-1/3 bg-gradient-to-b from-slate-50 to-slate-100 p-6 border-r border-slate-200 flex-shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Home className="w-5 h-5" />
                  <span>Propiedad seleccionada</span>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{property.title}</h3>
                  
                  <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-bold text-green-600">{property.price}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center bg-slate-50 rounded-lg p-2">
                      <div className="font-semibold text-slate-800">{property.area}</div>
                      <div className="text-slate-500">Área</div>
                    </div>
                    <div className="text-center bg-slate-50 rounded-lg p-2">
                      <div className="font-semibold text-slate-800">{property.bedrooms}</div>
                      <div className="text-slate-500">Hab.</div>
                    </div>
                    <div className="text-center bg-slate-50 rounded-lg p-2">
                      <div className="font-semibold text-slate-800">{property.bathrooms}</div>
                      <div className="text-slate-500">Baños</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:w-2/3 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 min-h-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Información Personal
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tipo de Documento *
                      </label>
                      <Select value={formData.tipoDocumento} onValueChange={(value) => updateFormData('tipoDocumento', value)}>
                        <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white">
                          <SelectValue placeholder="Seleccionar tipo de documento" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposDocumento.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Número de Documento *
                      </label>
                      <input
                        type="text"
                        value={formData.numeroDocumento}
                        onChange={(e) => {
                          // Solo permitir números, espacios, puntos y guiones
                          const value = e.target.value;
                          const filteredValue = value.replace(/[^0-9\s\.\-]/g, '');
                          updateFormData('numeroDocumento', filteredValue);
                        }}
                        onKeyDown={(e) => {
                          // Prevenir entrada de letras
                          if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.numeroDocumento ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Número de documento"
                      />
                      {errors.numeroDocumento && (
                        <p className="text-red-500 text-sm mt-1">{errors.numeroDocumento}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.nombreCompleto}
                        onChange={(e) => updateFormData('nombreCompleto', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.nombreCompleto ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="Ingresa tu nombre completo"
                      />
                      {errors.nombreCompleto && (
                        <p className="text-red-500 text-sm mt-1">{errors.nombreCompleto}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={handlePhoneChange}
                        onKeyDown={handlePhoneKeyDown}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.telefono ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="+57 300 123 4567"
                      />
                      {errors.telefono && (
                        <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.email ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Date and Time Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Selecciona fecha y hora
                  </h3>

                  {/* Calendar */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                      </motion.button>
                      
                      <h4 className="text-lg font-semibold text-slate-800">
                        {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </h4>
                      
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                      </motion.button>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {daysOfWeek.map(day => (
                        <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((day, index) => {
                        const isSelected = formData.fecha === formatDateForInput(day.date);
                        
                        return (
                          <motion.button
                            key={index}
                            type="button"
                            whileHover={!day.isDisabled ? { scale: 1.05 } : {}}
                            whileTap={!day.isDisabled ? { scale: 0.95 } : {}}
                            onClick={() => handleDateSelect(day)}
                            disabled={day.isDisabled}
                            className={`
                              h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                              ${day.isDisabled 
                                ? 'text-slate-300 cursor-not-allowed' 
                                : 'text-slate-700 hover:bg-blue-50'
                              }
                              ${!day.isCurrentMonth ? 'text-slate-400' : ''}
                              ${day.isToday ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                              ${isSelected ? 'bg-blue-600 text-white' : ''}
                              ${day.isSunday && day.isCurrentMonth ? 'bg-red-50 text-red-400' : ''}
                            `}
                          >
                            {day.date.getDate()}
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        <span>Seleccionado</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-100 rounded"></div>
                        <span>Hoy</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-50 rounded"></div>
                        <span>No disponible</span>
                      </div>
                    </div>

                    {errors.fecha && (
                      <p className="text-red-500 text-sm mt-2">{errors.fecha}</p>
                    )}
                  </div>

                  {/* Time Selection */}
                  {formData.fecha && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock className="w-5 h-5" />
                        <h4 className="font-medium">Horarios disponibles</h4>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        {availableHours.map(hour => (
                          <motion.button
                            key={hour}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateFormData('hora', hour)}
                            className={`
                              py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                              ${formData.hora === hour
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
                              }
                            `}
                          >
                            {hour}
                          </motion.button>
                        ))}
                      </div>

                      {errors.hora && (
                        <p className="text-red-500 text-sm">{errors.hora}</p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Additional Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Mensaje Adicional
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) => updateFormData('mensaje', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                    placeholder="¿Hay algo específico que te gustaría saber sobre la propiedad?"
                  />
                </div>

                {/* Important Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Información importante</h4>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Te contactaremos en las próximas 2 horas para confirmar</li>
                        <li>• Duración aproximada: 30-45 minutos</li>
                        <li>• Puedes reagendar con 24 horas de anticipación</li>
                        <li>• Para visitas presenciales, lleva identificación</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium"
                  >
                    Agendar Visita
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PropertyVisitModal;
