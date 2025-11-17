import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Briefcase, FileText, CheckCircle, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import StepIndicator from '../StepIndicator';
import PersonalStep from './steps/PersonalStep';
import LaboralStep from './steps/LaboralStep';
import RoleStep from './steps/RoleStep';
import SummaryStep from './steps/SummaryStep';
import { useToast } from '../../../../shared/hooks/use-toast';
import { useAdministrativos } from '../../../../shared/contexts/AdministrativosContext';

const SERVICIO_MAP = {
  "Visita a Propiedad": 1,
  "Avalúos": 2,
  "Gestión de Alquileres": 3,
  "Asesoría Legal": 4,
};


const CreateAdministrativoModal = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Paso 1: Información Personal
    tipoDocumento: '',
    numeroDocumento: '',
    nombreCompleto: '',
    apellidoCompleto: '',
    email: '',
    telefono: '',
    password: '',

    // Paso 2: Información Laboral
    fechaIngreso: '',
    cargo: '',
    departamento: '',

    // Paso 3: Rol
    rol: '',

    // Paso 4: Resumen
    estado: 'programada'
  });
  const [errors, setErrors] = useState({});
  const { toast } = useToast();
  const { createAdministrativo } = useAdministrativos();
  const contentRef = useRef(null);

  // Scroll to top when step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  const steps = [
    { number: 1, title: 'Información Personal', icon: User },
    { number: 2, title: 'Información Laboral', icon: Briefcase },
    { number: 3, title: 'Rol Administrativo', icon: Users },
    { number: 4, title: 'Resumen', icon: CheckCircle }
  ];

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

  // Función para validar nombre completo
  const validateNombre = (nombre) => {
    if (!nombre.trim()) return 'El nombre completo es requerido';
    if (nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (nombre.trim().length > 100) return 'El nombre no puede tener más de 100 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre.trim())) return 'El nombre solo puede contener letras y espacios';
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

  // Función para validar teléfono colombiano
  const validateTelefono = (telefono) => {
    if (!telefono.trim()) return 'El teléfono es requerido';
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+57|57)?[3][0-9]{9}$/.test(telefonoLimpio)) {
      return 'El teléfono debe tener formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)';
    }
    return '';
  };

  // Función para validar contraseña
  const validatePassword = (password) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número';
    }
    return '';
  };



  // Función para validar fecha de ingreso
  const validateFechaIngreso = (fecha) => {
    if (!fecha) return 'La fecha de ingreso es requerida';
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada > hoy) return 'La fecha de ingreso no puede ser futura';
    return '';
  };

  // Función para validar cargo
  const validateCargo = (cargo) => {
    if (cargo && cargo.length > 100) return 'El cargo no puede tener más de 100 caracteres';
    return '';
  };

  // Función para validar departamento
  const validateDepartamento = (departamento) => {
    if (departamento && departamento.length > 100) return 'El departamento no puede tener más de 100 caracteres';
    return '';
  };



  // Función para validar rol
  const validateRol = (rol) => {
    if (!rol) return 'Debe seleccionar un rol administrativo';
    return '';
  };

  const validateStep = (step) => {
    let newErrors = {};

    switch (step) {
      case 1:
        newErrors.tipoDocumento = validateTipoDocumento(formData.tipoDocumento);
        newErrors.numeroDocumento = validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento);
        newErrors.nombreCompleto = validateNombre(formData.nombreCompleto);
        newErrors.apellidoCompleto = validateNombre(formData.apellidoCompleto);
        newErrors.email = validateEmail(formData.email);
        newErrors.telefono = validateTelefono(formData.telefono);
        newErrors.password = validatePassword(formData.password);
        break;
      case 2:
        newErrors.fechaIngreso = validateFechaIngreso(formData.fechaIngreso);
        newErrors.cargo = validateCargo(formData.cargo);
        newErrors.departamento = validateDepartamento(formData.departamento);
        break;
      case 3:
        newErrors.rol = validateRol(formData.rol);
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canProceedToNextStep = (step) => {
    switch (step) {
      case 1:
        const step1Errors = {
          tipoDocumento: validateTipoDocumento(formData.tipoDocumento),
          numeroDocumento: validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento),
          nombreCompleto: validateNombre(formData.nombreCompleto),
          apellidoCompleto: validateNombre(formData.apellidoCompleto),
          email: validateEmail(formData.email),
          telefono: validateTelefono(formData.telefono),
          password: validatePassword(formData.password)
        };
        return formData.tipoDocumento &&
               formData.numeroDocumento.trim() &&
               formData.nombreCompleto.trim() &&
               formData.apellidoCompleto.trim() &&
               formData.email.trim() &&
               formData.telefono.trim() &&
               formData.password &&
               Object.keys(step1Errors).every(key => !step1Errors[key]);
      case 2:
        const step2Errors = {
          fechaIngreso: validateFechaIngreso(formData.fechaIngreso),
          cargo: validateCargo(formData.cargo),
          departamento: validateDepartamento(formData.departamento)
        };
        return formData.fechaIngreso &&
               Object.keys(step2Errors).every(key => !step2Errors[key]);
      case 3:
        const step3Errors = {
          rol: validateRol(formData.rol)
        };
        return formData.rol &&
               Object.keys(step3Errors).every(key => !step3Errors[key]);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNextStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
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
    allErrors = { ...allErrors, ...{
      tipoDocumento: validateTipoDocumento(formData.tipoDocumento),
      numeroDocumento: validateNumeroDocumento(formData.numeroDocumento, formData.tipoDocumento),
      nombreCompleto: validateNombre(formData.nombreCompleto),
      apellidoCompleto: validateNombre(formData.apellidoCompleto),
      email: validateEmail(formData.email),
      telefono: validateTelefono(formData.telefono),
      password: validatePassword(formData.password)
    } };
    // Validate step 2
    allErrors = { ...allErrors, ...{
      fechaIngreso: validateFechaIngreso(formData.fechaIngreso),
      cargo: validateCargo(formData.cargo),
      departamento: validateDepartamento(formData.departamento)
    } };
    // Validate step 3
    allErrors = { ...allErrors, ...{ rol: validateRol(formData.rol) } };
    setErrors(allErrors);
    return Object.values(allErrors).every(error => !error);
  };

  const handleSubmit = async () => {
    console.log('🚀 INICIO handleSubmit'); // ✅ AGREGAR ESTA LÍNEA
    
    if (validateAllSteps()) {
      console.log('✅ Validación exitosa, preparando datos...'); // ✅ AGREGAR ESTA LÍNEA
      
      try {
        // Limpiar teléfono de formato antes de enviar
        const telefonoLimpio = formData.telefono.replace(/[\s\-\(\)\+]/g, '');
                
        // Preparar los datos para el backend según la estructura esperada
        const administrativoData = {
          tipo_documento: formData.tipoDocumento,
          numero_documento: formData.numeroDocumento.replace(/[\s\-\.]/g, ''), // Limpiar documento también
          nombre_completo: formData.nombreCompleto.trim(),
          apellido_completo: formData.apellidoCompleto.trim(),
          email: formData.email.trim().toLowerCase(),
          telefono: telefonoLimpio, // ✅ Teléfono limpio
          password: formData.password,

          fecha_ingreso: formData.fechaIngreso,
          cargo: formData.cargo ? formData.cargo.trim() : null,
          departamento: formData.departamento ? formData.departamento.trim() : null,

          id_rol: parseInt(formData.rol)
        };
  
        // ✅ AGREGAR CONSOLE.LOG DETALLADO
        console.log("📤 Datos preparados para crear administrativo:", administrativoData);
        console.log('🔍 Validación de campos obligatorios:');
        console.log('- tipo_documento:', administrativoData.tipo_documento);
        console.log('- numero_documento:', administrativoData.numero_documento);
        console.log('- nombre_completo:', administrativoData.nombre_completo);
        console.log('- apellido_completo:', administrativoData.apellido_completo);
        console.log('- email:', administrativoData.email);
        console.log('- telefono:', administrativoData.telefono);
        console.log('- password:', administrativoData.password ? '✅ (existe)' : '❌ (falta)');

        console.log('- fecha_ingreso:', administrativoData.fecha_ingreso);
        console.log('- id_rol:', administrativoData.id_rol);
  
        // ✅ Crear el administrativo usando createAdministrativo
        await createAdministrativo(administrativoData);
  
        toast({
          title: "¡Administrativo creado exitosamente!",
          description: "El administrativo ha sido registrado correctamente.",
          variant: "default"
        });
  
        handleClose();
      } catch (error) {
        console.error("Error al crear administrativo:", error);
        toast({
          title: "Error al crear el administrativo",
          description: error.message || "No se pudo registrar el administrativo. Por favor, intenta nuevamente.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Campos requeridos",
        description: "Por favor corrige los errores antes de crear el administrativo",
        variant: "destructive"
      });
    }
  };
  
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      tipoDocumento: '',
      numeroDocumento: '',
      nombreCompleto: '',
      apellidoCompleto: '',
      email: '',
      telefono: '',
      password: '',
      codigoEmpleado: '',
      fechaIngreso: '',
      cargo: '',
      departamento: '',

      rol: '',
      estado: 'programada'
    });
    setErrors({});
    onClose();
  };

  const updateFormData = (field, value) => {
    let cleanedValue = value;

    // Formatear automáticamente el teléfono si es el campo de teléfono
    if (field === 'telefono') {
      // El formateo ya se aplica directamente en PersonalStep con Smart
      // Aquí dejamos el valor tal cual
    }
    setFormData(prev => ({ ...prev, [field]: cleanedValue }));

    // Validación en tiempo real
    const newErrors = { ...errors };

    switch (field) {
      case 'tipoDocumento':
        newErrors.tipoDocumento = validateTipoDocumento(cleanedValue);
        // Revalidar número de documento cuando cambie el tipo
        if (formData.numeroDocumento) {
          newErrors.numeroDocumento = validateNumeroDocumento(formData.numeroDocumento, cleanedValue);
        }
        break;
      case 'numeroDocumento':
        newErrors.numeroDocumento = validateNumeroDocumento(cleanedValue, formData.tipoDocumento);
        break;
      case 'nombreCompleto':
      case 'apellidoCompleto':
        newErrors[field] = validateNombre(cleanedValue);
        break;
      case 'email':
        newErrors.email = validateEmail(cleanedValue);
        break;
      case 'telefono':
        newErrors.telefono = validateTelefono(cleanedValue);
        break;
      case 'password':
        newErrors.password = validatePassword(cleanedValue);
        break;

      case 'fechaIngreso':
        newErrors.fechaIngreso = validateFechaIngreso(cleanedValue);
        break;
      case 'cargo':
        newErrors.cargo = validateCargo(cleanedValue);
        break;
      case 'departamento':
        newErrors.departamento = validateDepartamento(cleanedValue);
        break;
      case 'rol':
        newErrors.rol = validateRol(cleanedValue);
        break;
    }

    setErrors(newErrors);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalStep
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <LaboralStep
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <RoleStep
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <SummaryStep formData={formData} />
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
              <h2 className="text-2xl font-bold text-slate-800">Nuevo Administrativo</h2>
              <p className="text-slate-600 mt-1">Registra un nuevo miembro del personal administrativo</p>
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
                  Crear Administrativo
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

export default CreateAdministrativoModal;
