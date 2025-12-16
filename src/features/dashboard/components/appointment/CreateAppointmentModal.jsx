import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, FileText, CheckCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

import StepIndicator from '../StepIndicator';
import CustomerStep from './steps/CustomerStep';
import DateTimeStep from './steps/DateTimeStep';
import DetailsStep from './steps/DetailsStep';
import SummaryStep from './steps/SummaryStep';

import { useToast } from '../../../../shared/hooks/use-toast';
import { formatPhoneNumber } from '../../../../shared/utils/phoneFormatter';
import { useAppointments } from '../../../../shared/contexts/AppointmentContext';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { apiClient } from '../../../../shared/services/api.config';
import citaApiService from '../../../../shared/services/citaApiService';
import { inmueblesAPI } from '../../../../shared/services/propertyApidervice';

const SERVICIO_MAP = {
  'Visita a Propiedad': 1,
  'Avaluos': 2,
  'Gestion de Alquileres': 3,
  'Asesoria Legal': 4,
};

const ESTADO_MAP = {
  solicitada: 1,
  programada: 2,
  confirmada: 3,
};

const CreateAppointmentModal = ({ isOpen, onClose, onSubmit, preselectedDate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fecha: '',
    hora: '',
    servicio: '',
    propiedad: '',
    notas: '',
    estado: 'solicitada',
  });
  const [errors, setErrors] = useState({});
  const [isSearchingPerson, setIsSearchingPerson] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  const { toast } = useToast();
  const { createAppointment } = useAppointments();
  const { user } = useAuth();
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  useEffect(() => {
    if (isOpen && preselectedDate) {
      setFormData((prev) => ({ ...prev, fecha: preselectedDate }));
    }
  }, [isOpen, preselectedDate]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!isOpen) return;
      setPropertiesLoading(true);
      try {
        const { items } = await inmueblesAPI.getInmuebles(1, 50);
        setProperties(items || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setPropertiesLoading(false);
      }
    };
    fetchProperties();
  }, [isOpen]);

  const steps = [
    { number: 1, title: 'Cliente', icon: User },
    { number: 2, title: 'Fecha y Hora', icon: Calendar },
    { number: 3, title: 'Detalles', icon: FileText },
    { number: 4, title: 'Resumen', icon: CheckCircle },
  ];

  const validateNombre = (nombre) => {
    if (!nombre.trim()) return 'El nombre del cliente es requerido';
    if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (nombre.trim().length > 100) return 'El nombre no puede tener mas de 100 caracteres';
    if (!/^[a-zA-Z\\s]+$/.test(nombre.trim())) return 'El nombre solo puede contener letras y espacios';
    return '';
  };

  const validateTelefono = (telefono) => {
    if (!telefono.trim()) return 'El telefono es requerido';
    // Limpiar espacios, guiones y parentesis
    const telefonoLimpio = telefono.replace(/[()\\s-]/g, '');
    if (!/^(\\+57|57)?[3][0-9]{9}$/.test(telefonoLimpio)) {
      return 'El telefono debe tener formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'El email es requerido';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Ingresa un email valido';
    if (email.length > 254) return 'El email es demasiado largo';
    return '';
  };

  const validateTipoDocumento = (tipoDocumento) => {
    if (!tipoDocumento) return 'El tipo de documento es requerido';
    return '';
  };

  const validateNumeroDocumento = (numeroDocumento, tipoDocumento) => {
    if (!numeroDocumento.trim()) return 'El numero de documento es requerido';
    const numeroLimpio = numeroDocumento.replace(/[.\\s-]/g, '');
    switch (tipoDocumento) {
      case 'CC':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) return 'La cedula debe tener entre 8 y 10 digitos';
        break;
      case 'CE':
        if (!/^[0-9]{6,10}$/.test(numeroLimpio)) return 'La cedula de extranjeria debe tener entre 6 y 10 digitos';
        break;
      case 'NIT':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) return 'El NIT debe tener entre 8 y 10 digitos';
        break;
      case 'PASAPORTE':
        if (numeroLimpio.length < 6 || numeroLimpio.length > 20) return 'El pasaporte debe tener entre 6 y 20 caracteres';
        if (!/^[A-Za-z0-9]+$/.test(numeroLimpio)) return 'El pasaporte solo puede contener letras y numeros';
        break;
      case 'TI':
        if (!/^[0-9]{10,11}$/.test(numeroLimpio)) return 'La tarjeta de identidad debe tener 10 u 11 digitos';
        break;
      default:
        return 'Tipo de documento no valido';
    }
    return '';
  };

  const validateFecha = (fecha) => {
    if (!fecha) return 'La fecha es requerida';
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaSeleccionada < hoy) return 'No se pueden agendar citas en fechas pasadas';
    return '';
  };

  const validateHora = (hora) => {
    if (!hora) return 'La hora es requerida';
    const amMatches = hora.match(/\\b(am|AM)\\b/g);
    const pmMatches = hora.match(/\\b(pm|PM)\\b/g);
    const totalSuffixes = (amMatches ? amMatches.length : 0) + (pmMatches ? pmMatches.length : 0);
    if (totalSuffixes > 1) return 'La hora no puede tener multiples sufijos AM/PM';

    const isPM = /\\s*pm$/i.test(hora);
    const isAM = /\\s*am$/i.test(hora);
    const horaLimpia = hora.replace(/\\s*(am|pm)$/i, '');
    let [horas, minutos] = horaLimpia.split(':').map(Number);
    if (isNaN(horas) || isNaN(minutos)) return 'Formato de hora invalido';
    if (isPM && horas < 12) horas += 12;
    if (isAM && horas === 12) horas = 0;
    const horaDecimal = horas + minutos / 60;
    if (horaDecimal < 8 || horaDecimal >= 18) return 'Las citas solo se pueden agendar entre las 8:00 am y las 6:00 pm';
    if (minutos !== 0 && minutos !== 30) return 'Solo intervalos de 30 minutos (ej: 8:00, 8:30, 9:00)';
    return '';
  };

  const validateServicio = (servicio) => {
    if (!servicio || servicio.trim() === '') return 'El servicio es requerido';
    const servicios = ['Avaluos', 'Gestion de Alquileres', 'Asesoria Legal', 'Visita a Propiedad'];
    if (!servicios.includes(servicio)) return 'Selecciona un servicio valido de la lista';
    return '';
  };

  const buscarPersonaAutomaticamente = async (tipoDocumento, numeroDocumento) => {
    if (!tipoDocumento || !numeroDocumento || numeroDocumento.length < 5) return;
    const errorDocumento = validateNumeroDocumento(numeroDocumento, tipoDocumento);
    if (errorDocumento) return;

    setIsSearchingPerson(true);
    try {
      const response = await apiClient.get('/citas/buscar-persona', {
        params: {
          tipo_documento: tipoDocumento,
          // limpiar espacios, guiones y puntos
          numero_documento: numeroDocumento.replace(/[.\\s-]/g, ''),
        },
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });

      const persona = response.data?.data || response.data || response;
      if (persona && (persona.nombre_completo || persona.correo || persona.telefono)) {
        let telefonoFormateado = persona.telefono || '';
        if (telefonoFormateado) {
          telefonoFormateado = formatPhoneNumber(telefonoFormateado, '', false);
        }

        const primerNombre = persona.primer_nombre || '';
        const segundoNombre = persona.segundo_nombre || '';
        const primerApellido = persona.primer_apellido || '';
        const segundoApellido = persona.segundo_apellido || '';
        const nombreCompletoReconstruido = [primerNombre, segundoNombre].filter(Boolean).join(' ').trim();
        const apellidoCompletoReconstruido = [primerApellido, segundoApellido].filter(Boolean).join(' ').trim();

        setFormData((prev) => ({
          ...prev,
          nombre: nombreCompletoReconstruido || persona.nombre_completo || prev.nombre,
          apellido: apellidoCompletoReconstruido || persona.apellido_completo || prev.apellido,
          telefono: telefonoFormateado || prev.telefono,
          email: persona.correo || prev.email,
        }));

        toast({
          title: 'Datos encontrados',
          description: 'Se han completado los campos con la informacion existente.',
          variant: 'default',
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast({
          title: 'Error al buscar informacion',
          description: 'No se pudo verificar si el documento existe. Continua ingresando los datos manualmente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSearchingPerson(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        newErrors.nombre = validateNombre(formData.nombre);
        newErrors.apellido = validateNombre(formData.apellido);
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
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceedToNextStep = (step) => {
    switch (step) {
      case 1: {
        const step1Errors = {
          nombre: validateNombre(formData.nombre),
          apellido: validateNombre(formData.apellido),
          telefono: validateTelefono(formData.telefono),
          email: validateEmail(formData.email),
          tipoDocumento: validateTipoDocumento(formData.tipoDocumento),
          numeroDocumento: validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento),
        };
        return (
          formData.nombre.trim() &&
          formData.apellido.trim() &&
          formData.telefono.trim() &&
          formData.email.trim() &&
          formData.tipoDocumento &&
          formData.numeroDocumento.trim() &&
          Object.values(step1Errors).every((msg) => !msg)
        );
      }
      case 2: {
        const step2Errors = {
          fecha: validateFecha(formData.fecha),
          hora: validateHora(formData.hora),
        };
        return formData.fecha && formData.hora && Object.values(step2Errors).every((msg) => !msg);
      }
      case 3: {
        const step3Errors = { servicio: validateServicio(formData.servicio) };
        return formData.servicio && Object.values(step3Errors).every((msg) => !msg);
      }
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    } else {
      validateStep(currentStep);
      toast({
        title: 'Campos requeridos',
        description: 'Por favor corrige los errores antes de continuar',
        variant: 'destructive',
      });
    }
  };

  const handlePrev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateAllSteps = () => {
    const allErrors = {
      nombre: validateNombre(formData.nombre),
      apellido: validateNombre(formData.apellido),
      telefono: validateTelefono(formData.telefono),
      email: validateEmail(formData.email),
      tipoDocumento: validateTipoDocumento(formData.tipoDocumento),
      numeroDocumento: validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento),
      fecha: validateFecha(formData.fecha),
      hora: validateHora(formData.hora),
      servicio: validateServicio(formData.servicio),
    };
    setErrors(allErrors);
    return Object.values(allErrors).every((msg) => !msg);
  };

  const formatHoraParaAPI = (hora) => {
    if (!hora) return '09:00';
    const horaLimpia = hora.toLowerCase().replace(/\\s+/g, '');
    const isPM = horaLimpia.includes('pm');
    const isAM = horaLimpia.includes('am');
    let [horas, minutos] = horaLimpia.replace(/am|pm/g, '').split(':').map(Number);
    if (isPM && horas !== 12) horas += 12;
    if (isAM && horas === 12) horas = 0;
    return `${String(horas).padStart(2, '0')}:${String(minutos || 0).padStart(2, '0')}`;
  };

  const calcularHoraFin = (horaInicio) => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    let horaFin = horas;
    let minutosFin = minutos + 30;
    if (minutosFin >= 60) {
      horaFin += 1;
      minutosFin = 0;
    }
    return `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (validateAllSteps()) {
      handleConfirmAppointment();
    } else {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor corrige los errores antes de crear la cita',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmAppointment = async () => {
    setIsCreatingAppointment(true);
    try {
      const idServicio = SERVICIO_MAP[formData.servicio] || 1;
      if (idServicio === 1) {
        const horaInicio24h = formatHoraParaAPI(formData.hora);
        const disponibilidadData = { fecha_cita: formData.fecha, id_servicio: idServicio };
        const horariosDisponibles = await citaApiService.obtenerHorariosDisponibles(disponibilidadData);
        if (!horariosDisponibles.includes(horaInicio24h)) {
          toast({
            title: 'Horario no disponible',
            description: `El horario ${formData.hora} para el dia ${formData.fecha} ya fue ocupado. Por favor selecciona otro horario.`,
            variant: 'destructive',
          });
          setCurrentStep(2);
          return;
        }
      }

      const horaInicio24h = formatHoraParaAPI(formData.hora);
      const horaFin24h = calcularHoraFin(horaInicio24h);
      const idEstadoCita = ESTADO_MAP[formData.estado] || 1;
      const idAgenteAsignado =
        (formData.estado === 'programada' || formData.estado === 'confirmada') && user?.id ? user.id : null;

      const citaData = {
        tipo_documento: formData.tipoDocumento,
        numero_documento: formData.numeroDocumento,
        nombre_completo: formData.nombre,
        apellido_completo: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        fecha_cita: formData.fecha,
        hora_inicio: horaInicio24h,
        hora_fin: horaFin24h,
        id_servicio: idServicio,
        id_estado_cita: idEstadoCita,
        id_agente_asignado: idAgenteAsignado,
        id_usuario_creador: user?.id || null,
        observaciones: formData.notas || null,
      };

      const nuevaCita = await createAppointment(citaData);

      if (nuevaCita && formData.estado === 'confirmada') {
        toast({
          title: 'Integraciones activadas',
          description: 'La cita se agrego al calendario y se programaron recordatorios.',
          variant: 'default',
        });
      }

      toast({
        title: 'Cita creada exitosamente',
        description: 'La cita ha sido agendada correctamente.',
        variant: 'default',
      });

      handleClose();
    } catch (error) {
      console.error('Error al crear cita:', error);
      toast({
        title: 'Error al crear la cita',
        description: 'No se pudo crear la cita. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      tipoDocumento: '',
      numeroDocumento: '',
      fecha: '',
      hora: '',
      servicio: '',
      propiedad: '',
      notas: '',
      estado: 'solicitada',
    });
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    let cleanedValue = value;
    if (field === 'hora' && value) {
      const amMatches = value.match(/\\b(am|AM)\\b/g);
      const pmMatches = value.match(/\\b(pm|PM)\\b/g);
      const totalSuffixes = (amMatches ? amMatches.length : 0) + (pmMatches ? pmMatches.length : 0);
      if (totalSuffixes > 1) {
        const lastAM = amMatches && amMatches.length > 0 ? amMatches[amMatches.length - 1] : null;
        const lastPM = pmMatches && pmMatches.length > 0 ? pmMatches[pmMatches.length - 1] : null;
        let cleaned = value.replace(/\\s*\\b(am|pm)\\b/gi, '');
        if (lastPM) cleaned += ' ' + lastPM.toLowerCase();
        else if (lastAM) cleaned += ' ' + lastAM.toLowerCase();
        cleanedValue = cleaned.trim();
      }
    }

    setFormData((prev) => ({ ...prev, [field]: cleanedValue }));
    const newErrors = { ...errors };

    switch (field) {
      case 'cliente':
        newErrors.cliente = validateNombre(cleanedValue);
        break;
      case 'telefono':
        newErrors.telefono = validateTelefono(cleanedValue);
        break;
      case 'email':
        newErrors.email = validateEmail(cleanedValue);
        break;
      case 'tipoDocumento':
        newErrors.tipoDocumento = validateTipoDocumento(cleanedValue);
        if (formData.numeroDocumento) {
          newErrors.numeroDocumento = validateNumeroDocumento(formData.numeroDocumento, cleanedValue);
        }
        if (formData.numeroDocumento.trim().length >= 5) {
          if (window.customerSearchTimeout) clearTimeout(window.customerSearchTimeout);
          window.customerSearchTimeout = setTimeout(() => {
            buscarPersonaAutomaticamente(cleanedValue, formData.numeroDocumento);
          }, 300);
        }
        break;
      case 'numeroDocumento':
        newErrors.numeroDocumento = validateNumeroDocumento(cleanedValue, formData.tipoDocumento);
        if (formData.tipoDocumento && cleanedValue.trim().length >= 5) {
          if (window.customerSearchTimeout) clearTimeout(window.customerSearchTimeout);
          window.customerSearchTimeout = setTimeout(() => {
            buscarPersonaAutomaticamente(formData.tipoDocumento, cleanedValue);
          }, 500);
        }
        break;
      case 'fecha':
        newErrors.fecha = validateFecha(cleanedValue);
        break;
      case 'hora':
        newErrors.hora = validateHora(cleanedValue);
        break;
      case 'servicio':
        newErrors.servicio = validateServicio(cleanedValue);
        break;
      default:
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
            isSearchingPerson={isSearchingPerson}
          />
        );
      case 2:
        return <DateTimeStep formData={formData} errors={errors} updateFormData={updateFormData} />;
      case 3:
        return (
          <DetailsStep
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            properties={properties}
            propertiesLoading={propertiesLoading}
          />
        );
      case 4:
        return <SummaryStep formData={formData} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
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

          <div className="px-6 py-4 border-b border-slate-200">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          <div
            ref={contentRef}
            className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 min-h-0 ${
              currentStep === 1 ? 'p-6 pb-2' : 'p-6'
            }`}
          >
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

          <div
            className={`flex items-center justify-between border-t border-slate-200 bg-slate-50 flex-shrink-0 ${
              currentStep === 1 ? 'p-4 pt-3' : 'p-6'
            }`}
          >
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
                  disabled={isCreatingAppointment}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isCreatingAppointment ? 'Creando...' : 'Crear Cita'}
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
