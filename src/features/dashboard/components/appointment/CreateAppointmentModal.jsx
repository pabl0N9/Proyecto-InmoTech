import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, FileText, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import StepIndicator from '../StepIndicator';
import CustomerStep from './steps/CustomerStep';
import DateTimeStep from './steps/DateTimeStep';
import DetailsStepStep from './steps/DetailsStep';
import SummaryStepStep from './steps/SummaryStep';
import { useToast } from '../../../../shared/hooks/use-toast';
import { formatPhoneNumber } from '../../../../shared/utils/phoneFormatter';

const CreateAppointmentModal = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    cliente: '',
    telefono: '',
    email: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fecha: '',
    hora: '',
    servicio: '',
    notas: '',
    estado: 'programada'
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const contentRef = useRef(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const steps = [
    { number: 1, title: 'Cliente', icon: User },
    { number: 2, title: 'Fecha y Hora', icon: Calendar },
    { number: 3, title: 'Detalles', icon: FileText },
    { number: 4, title: 'Resumen', icon: CheckCircle }
  ];

  // Función para validar nombre completo
  const validateNombre = (nombre) => {
    if (!nombre.trim()) return 'El nombre del cliente es requerido';
    if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (nombre.trim().length > 100) return 'El nombre no puede tener más de 100 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre.trim())) return 'El nombre solo puede contener letras y espacios';
    return '';
  };

  // Función para validar teléfono colombiano
  const validateTelefono = (telefono) => {
    if (!telefono.trim()) return 'El teléfono es requerido';
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+57|57)?[3][0-9]{9}$/.test(telefonoLimpio)) {
      return 'El teléfono debe tener formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)';
    }
    return '';
  };

  // Función para validar email
  const validateEmail = (email) => {
    if (!email.trim()) return 'El email es requerido';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Ingresa un email válido';
    if (email.length > 254) return 'El email es demasiado largo';
    return '';
  };

  // Función para validar tipo de documento
  const validateTipoDocumento = (tipoDocumento) => {
    if (!tipoDocumento) return 'El tipo de documento es requerido';
    return '';
  };

  // Función para validar número de documento
  const validateNumeroDocumento = (numeroDocumento, tipoDocumento) => {
    if (!numeroDocumento.trim()) return 'El número de documento es requerido';

    const numeroLimpio = numeroDocumento.replace(/[\s\-\.]/g, '');

    switch (tipoDocumento) {
      case 'CC':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
          return 'La cédula debe tener entre 8 y 10 dígitos';
        }
        break;
      case 'CE':
        if (!/^[0-9]{6,10}$/.test(numeroLimpio)) {
          return 'La cédula de extranjería debe tener entre 6 y 10 dígitos';
        }
        break;
      case 'NIT':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
          return 'El NIT debe tener entre 8 y 10 dígitos';
        }
        break;
      case 'PASAPORTE':
        if (numeroLimpio.length < 6 || numeroLimpio.length > 20) {
          return 'El pasaporte debe tener entre 6 y 20 caracteres';
        }
        if (!/^[A-Za-z0-9]+$/.test(numeroLimpio)) {
          return 'El pasaporte solo puede contener letras y números';
        }
        break;
      case 'TI':
        if (!/^[0-9]{10,11}$/.test(numeroLimpio)) {
          return 'La tarjeta de identidad debe tener 10 u 11 dígitos';
        }
        break;
      default:
        return 'Tipo de documento no válido';
    }

    return '';
  };

  // Función para validar fecha
  const validateFecha = (fecha) => {
    if (!fecha) return 'La fecha es requerida';
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) return 'No se pueden agendar citas en fechas pasadas';
    return '';
  };

  // Función para validar hora (horario laboral)
  const validateHora = (hora) => {
    if (!hora) return 'La hora es requerida';

    // Detectar si es AM o PM
    const isPM = /\s*pm$/i.test(hora);
    const isAM = /\s*am$/i.test(hora);

    // Remover el sufijo ' am' o ' pm' antes de parsear
    const horaLimpia = hora.replace(/\s*(am|pm)$/i, '');
    let [horas, minutos] = horaLimpia.split(':').map(Number);

    // Verificar que la conversión fue exitosa
    if (isNaN(horas) || isNaN(minutos)) {
      return 'Formato de hora inválido';
    }

    // Convertir a formato 24 horas
    if (isPM && horas < 12) horas += 12;
    if (isAM && horas === 12) horas = 0;

    const horaDecimal = horas + (minutos / 60);

    // Horario laboral: 8:00 am - 6:00 PM
    if (horaDecimal < 8 || horaDecimal >= 18) {
      return 'Las citas solo se pueden agendar entre las 8:00 am y las 6:00 pm';
    }

    // Verificar que sea en intervalos de 30 minutos
    if (minutos !== 0 && minutos !== 30) {
      return 'Las citas solo se pueden agendar en intervalos de 30 minutos (ej: 8:00 am, 8:30 am, 9:00 am)';
    }

    return '';
  };

  // Función para validar servicio
  const validateServicio = (servicio) => {
    if (!servicio || servicio.trim() === '') {
      return 'El servicio es requerido';
    }

    const servicios = [
      'Avalúos',
      'Gestión de Alquileres',
      'Asesoría Legal'
    ];

    // Verificar que el servicio seleccionado existe en la lista
    if (!servicios.includes(servicio)) {
      return 'Selecciona un servicio válido de la lista';
    }

    return '';
  };

  const validateStep = (step) => {
    let newErrors = {};

    switch (step) {
      case 1:
        newErrors.cliente = validateNombre(formData.cliente);
        newErrors.telefono = validateTelefono(formData.telefono);
        newErrors.email = validateEmail(formData.email);
        newErrors.tipoDocumento = validateTipoDocumento(formData.tipoDocumento);
        newErrors.numeroDocumento = validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento);
        break;
      case 2:
        newErrors.fecha = validateFecha(formData.fecha);
        newErrors.hora = validateHora(formData.hora);
        break;
      case 3:
        newErrors.servicio = validateServicio(formData.servicio);
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceedToNextStep = (step) => {
    switch (step) {
      case 1:
        // Para el paso 1, verificar que los campos estén llenos (sin errores críticos)
        const step1Errors = {
          cliente: validateNombre(formData.cliente),
          telefono: validateTelefono(formData.telefono),
          email: validateEmail(formData.email),
          tipoDocumento: validateTipoDocumento(formData.tipoDocumento),
          numeroDocumento: validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento)
        };
        return formData.cliente.trim() &&
               formData.telefono.trim() &&
               formData.email.trim() &&
               formData.tipoDocumento &&
               formData.numeroDocumento.trim() &&
               Object.keys(step1Errors).every(key => !step1Errors[key]);
      case 2:
        // Para el paso 2, verificar fecha y hora
        const step2Errors = {
          fecha: validateFecha(formData.fecha),
          hora: validateHora(formData.hora)
        };
        return formData.fecha &&
               formData.hora &&
               Object.keys(step2Errors).every(key => !step2Errors[key]);
      case 3:
        const step3Errors = {
          servicio: validateServicio(formData.servicio)
        };
        return formData.servicio &&
               Object.keys(step3Errors).every(key => !step3Errors[key]);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      // Si no puede proceder, mostrar validación
      validateStep(currentStep);
      toast({
        title: "Campos requeridos",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive"
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateAllSteps = () => {
    let allErrors = {};
    // Validate step 1
    allErrors = { ...allErrors, ...{ cliente: validateNombre(formData.cliente), telefono: validateTelefono(formData.telefono), email: validateEmail(formData.email), tipoDocumento: validateTipoDocumento(formData.tipoDocumento), numeroDocumento: validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento) } };
    // Validate step 2
    allErrors = { ...allErrors, ...{ fecha: validateFecha(formData.fecha), hora: validateHora(formData.hora) } };
    // Validate step 3
    allErrors = { ...allErrors, ...{ servicio: validateServicio(formData.servicio) } };
    setErrors(allErrors);
    return Object.values(allErrors).every(error => !error);
  };

  const handleSubmit = () => {
    if (validateAllSteps()) {
      try {
        onSubmit(formData);
        toast({
          title: "¡Cita creada exitosamente!",
          description: "La cita ha sido agendada correctamente.",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error al crear la cita",
          description: "No se pudo crear la cita. Por favor, intenta nuevamente.",
          variant: "destructive"
        });
      }
      handleClose();
    } else {
      toast({
        title: "Campos requeridos",
        description: "Por favor corrige los errores antes de crear la cita",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      cliente: '',
      telefono: '',
      email: '',
      tipoDocumento: '',
      numeroDocumento: '',
      fecha: '',
      hora: '',
      servicio: '',
      notas: '',
      estado: 'programada'
    });
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    // Formatear automáticamente el teléfono si es el campo de teléfono
    if (field === 'telefono') {
      // El formateo ya se aplica directamente en CustomerStep con Smart
      // Aquí dejamos el valor tal cual
    }    
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validación en tiempo real
    const newErrors = { ...errors };

    switch (field) {
      case 'cliente':
        newErrors.cliente = validateNombre(value);
        break;
      case 'telefono':
        newErrors.telefono = validateTelefono(value);
        break;
      case 'email':
        newErrors.email = validateEmail(value);
        break;
      case 'tipoDocumento':
        newErrors.tipoDocumento = validateTipoDocumento(value);
        // Revalidar número de documento cuando cambie el tipo
        if (formData.numeroDocumento) {
          newErrors.numeroDocumento = validateNumeroDocumento(formData.numeroDocumento, value);
        }
        break;
      case 'numeroDocumento':
        newErrors.numeroDocumento = validateNumeroDocumento(value, formData.tipoDocumento);
        break;
      case 'fecha':
        newErrors.fecha = validateFecha(value);
        break;
      case 'hora':
        newErrors.hora = validateHora(value);
        break;
      case 'servicio':
        newErrors.servicio = validateServicio(value);
        break;
    }

    setErrors(newErrors);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerStep
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <DateTimeStep
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <DetailsStepStep
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <SummaryStepStep formData={formData} />
        );
      default:
        return null;
    }
  };

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
          onClick={handleClose}
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
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Nueva Cita</h2>
              <p className="text-slate-600 mt-1">Agenda una nueva cita con tu cliente</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </motion.button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-slate-200">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          {/* Content */}
          <div ref={contentRef} className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 min-h-0 ${currentStep === 1 ? 'p-6 pb-2' : 'p-6'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between border-t border-slate-200 bg-slate-50 flex-shrink-0 ${currentStep === 1 ? 'p-4 pt-3' : 'p-6'}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </motion.button>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </motion.button>

              {currentStep < 4 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Crear Cita
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateAppointmentModal;
