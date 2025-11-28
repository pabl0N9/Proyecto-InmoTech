import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Sparkles,
  Trophy,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { useToast } from "../../../shared/hooks/use-toast";
import usersApiService from "../../../shared/services/usersApiService";

// Nota: Necesitarás crear o adaptar estos componentes de UI para tu proyecto
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../shared/components/ui/select";

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  // Estados para validaciones en tiempo real
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null); // null = no verificado, true = disponible, false = ocupado
  const emailTimeoutRef = useRef(null); // Ref para debouncing de email

  const [formData, setFormData] = useState({
    tipo_documento: "",
    numero_documento: "",
    nombre_completo: "",
    apellido_completo: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    terminos: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/;

  // Funciones de validación
  const validateTipoDocumento = (tipo) => {
    if (!tipo) return 'El tipo de documento es obligatorio';
    const tiposValidos = ['CC', 'CE', 'NIT', 'PASAPORTE', 'TI'];
    if (!tiposValidos.includes(tipo)) return 'Tipo de documento inválido';
    return '';
  };

  const validateNumeroDocumento = (numero, tipo) => {
    if (!numero || !numero.trim()) return 'El número de documento es obligatorio';
    const numeroLimpio = numero.replace(/[\s\-\.]/g, '');

    switch (tipo) {
      case 'CC':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
          return 'La cédula debe tener entre 8 y 10 dígitos numéricos';
        }
        break;
      case 'CE':
        if (!/^[0-9]{6,10}$/.test(numeroLimpio)) {
          return 'La cédula de extranjería debe tener entre 6 y 10 dígitos numéricos';
        }
        break;
      case 'NIT':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
          return 'El NIT debe tener entre 8 y 10 dígitos numéricos';
        }
        break;
      case 'PASAPORTE':
        if (numeroLimpio.length < 6 || numeroLimpio.length > 20) {
          return 'El pasaporte debe tener entre 6 y 20 caracteres alfanuméricos';
        }
        if (!/^[A-Za-z0-9]+$/.test(numeroLimpio)) {
          return 'El pasaporte solo puede contener letras y números';
        }
        break;
      case 'TI':
        if (!/^[0-9]{10,11}$/.test(numeroLimpio)) {
          return 'La tarjeta de identidad debe tener 10 u 11 dígitos numéricos';
        }
        break;
      default:
        return 'Primero selecciona un tipo de documento';
    }
    return '';
  };

  const validateNombreCompleto = (nombre) => {
    if (!nombre || !nombre.trim()) return 'El nombre completo es obligatorio';
    const nombreTrim = nombre.trim();
    if (nombreTrim.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (nombreTrim.length > 50) return 'El nombre no puede tener más de 50 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombreTrim)) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return '';
  };

  const validateApellidoCompleto = (apellido) => {
    if (!apellido || !apellido.trim()) return 'El apellido completo es obligatorio';
    const apellidoTrim = apellido.trim();
    if (apellidoTrim.length < 2) return 'El apellido debe tener al menos 2 caracteres';
    if (apellidoTrim.length > 50) return 'El apellido no puede tener más de 50 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(apellidoTrim)) {
      return 'El apellido solo puede contener letras y espacios';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) return 'El correo electrónico es obligatorio';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Ingresa un correo electrónico válido';
    if (email.length > 254) return 'El correo electrónico es demasiado largo';
    return '';
  };

  const validateTelefono = (telefono) => {
    if (!telefono || !telefono.trim()) return 'El teléfono es obligatorio';
    // Formato colombiano: opcionalmente +57 o 57, luego 3 seguido de 9 dígitos
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    // Permitir formatos: +573XXXXXXXXX, 573XXXXXXXXX, o 3XXXXXXXXX
    if (!/(?:\+57|57)?3\d{9}$/.test(telefonoLimpio)) {
      return 'El teléfono debe seguir el formato colombiano (ej: +57 3XX XXX XXXX o 3XX XXX XXXX)';
    }
    // Verificar recuento de dígitos
    const digitosNumericos = telefonoLimpio.replace(/\D/g, '');
    if (telefonoLimpio.startsWith('+57') && digitosNumericos.length !== 12) {
      return 'Con prefijo +57 debe incluir exactamente 12 dígitos';
    }
    if (telefonoLimpio.includes('57') && !telefonoLimpio.startsWith('+') && digitosNumericos.length !== 11) {
      return 'Con prefijo 57 debe incluir exactamente 11 dígitos';
    }
    if (!telefonoLimpio.includes('57') && digitosNumericos.length !== 10) {
      return 'Sin prefijo internacional debe tener exactamente 10 dígitos';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password || !password.trim()) return 'La contraseña es obligatoria';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (password.length > 100) return 'La contraseña no puede exceder 100 caracteres';
    if (!PASSWORD_REGEX.test(password)) {
      return 'Debe incluir una minúscula, una mayúscula, un número y uno de @$!%*?&#';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword || !confirmPassword.trim()) return 'Confirma tu contraseña';
    if (confirmPassword !== password) return 'Las contraseñas no coinciden';
    return '';
  };

  const mapTipoDocumento = (tipo) => (tipo === 'PASAPORTE' ? 'PAS' : tipo);

  // Función para validar todos los campos
  const validateAllFields = () => {
    const errors = {
      tipo_documento: validateTipoDocumento(formData.tipo_documento),
      numero_documento: validateNumeroDocumento(formData.numero_documento, formData.tipo_documento),
      nombre_completo: validateNombreCompleto(formData.nombre_completo),
      apellido_completo: validateApellidoCompleto(formData.apellido_completo),
      email: validateEmail(formData.email),
      telefono: validateTelefono(formData.telefono),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
    };
    return errors;
  };

  // Función para verificar email con debouncing
  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !validateEmail(email)) {
      setEmailAvailable(null);
      return;
    }

    try {
      setCheckingEmail(true);
      const response = await usersApiService.verificarCorreoExistente(email);
      setEmailAvailable(!response.data.existe); // true si no existe (disponible)
    } catch (error) {
      console.error('Error verificando email:', error);
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  // Función para validar un campo específico y actualizar errores
  const validateField = (fieldName, value = null) => {
    const val = value !== null ? value : formData[fieldName];
    let error = '';

    switch (fieldName) {
      case 'tipo_documento':
        error = validateTipoDocumento(val);
        break;
      case 'numero_documento':
        error = validateNumeroDocumento(val, formData.tipo_documento);
        break;
      case 'nombre_completo':
        error = validateNombreCompleto(val);
        break;
      case 'apellido_completo':
        error = validateApellidoCompleto(val);
        break;
      case 'email':
        error = validateEmail(val);
        break;
      case 'telefono':
        error = validateTelefono(val);
        break;
      case 'password':
        error = validatePassword(val);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(val, formData.password);
        break;
    }

    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    if (name === "password") {
      setPasswordStrength({
        length: newValue.length >= 8,
        uppercase: /[A-Z]/.test(newValue),
        lowercase: /[a-z]/.test(newValue),
        number: /[0-9]/.test(newValue),
        special: /[^A-Za-z0-9]/.test(newValue),
      });
      validateField('password', newValue);
      if (formData.confirmPassword) {
        validateField('confirmPassword', formData.confirmPassword);
      }
    }

    if (name === 'confirmPassword') {
      validateField('confirmPassword', newValue);
    }

    // Validación en tiempo real con debouncing para email
    if (name === 'email') {
      // Limpiar timeout anterior
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }

      // Resetear estado
      setEmailAvailable(null);

      // Si el email tiene contenido, verificar formato y disponibilidad después de 500ms
      if (newValue && newValue.trim()) {
        emailTimeoutRef.current = setTimeout(() => {
          const emailError = validateEmail(newValue);
          if (!emailError) {
            // Email válido, verificar disponibilidad
            checkEmailAvailability(newValue);
          } else {
            // Email inválido, mostrar error de formato
            setEmailAvailable(false); // Esto activará el mensaje de error
          }
        }, 500);
      }

      validateField(name, newValue);
    }

    // Validación en tiempo real para teléfono
    if (name === 'telefono') {
      validateField(name, newValue);
    }

    // Revalidar número de documento si cambia el tipo
    if (name === 'numero_documento' && formData.tipo_documento) {
      if (newValue.length >= 5) { // Solo validar cuando haya suficientes caracteres
        validateField('numero_documento', newValue);
      }
    }
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    validateField(fieldName, value);

    // Si cambia el tipo de documento, revalidar el número si existe
    if (fieldName === 'tipo_documento' && formData.numero_documento) {
      validateField('numero_documento', formData.numero_documento);
    }
  };

  const handleBlur = (fieldName) => {
    // Validar al perder foco
    validateField(fieldName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateAllFields();
    const hasErrors = Object.values(validationErrors).some(msg => msg);
    if (hasErrors) {
      setFieldErrors(validationErrors);
      const firstErrorMessage = Object.values(validationErrors).find(msg => msg) || 'Corrige los campos señalados.';
      setError(firstErrorMessage);
      toast({
        title: "Revisa los datos",
        description: firstErrorMessage,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log('📝 Registrando nuevo usuario...');

      // Preparar datos para el registro
      const userData = {
        tipo_documento: mapTipoDocumento(formData.tipo_documento),
        numero_documento: formData.numero_documento,
        nombre_completo: formData.nombre_completo,
        apellido_completo: formData.apellido_completo,
        email: formData.email,
        telefono: formData.telefono,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };

      await register(userData);

      toast({
        title: "Verifica tu correo",
        description: "Te enviamos un enlace para confirmar tu correo en las proximas 24 horas.",
        variant: "success",
      });
      navigate("/login");

    } catch (error) {
      console.error('❌ Error en registro:', error);
      const errorMessage = error.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
      setError(errorMessage);
      toast({
        title: "Error en el registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };

  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return "Débil";
    if (score <= 3) return "Regular";
    if (score <= 4) return "Buena";
    return "Excelente";
  };

  return (
    <div className="flex flex-1 ">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00457B] via-[#0056A3] to-[#0066CC] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white mx-auto">
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight">
                Únete a la
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Revolución Inmobiliaria
                </span>
              </h1>
              <p className="text-lg text-blue-100">Más de 10,000 profesionales confían en nosotros</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Herramientas Premium</h3>
                  <p className="text-blue-100 text-sm">Acceso a todas las funciones</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-3 rounded-xl">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Soporte 24/7</h3>
                  <p className="text-blue-100 text-sm">Asistencia cuando la necesites</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">100% Seguro</h3>
                  <p className="text-blue-100 text-sm">Datos protegidos y encriptados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-300/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-orange-300/20 rounded-full blur-lg"></div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md space-y-8 min-h-[830px] flex flex-col justify-center">
          {/* Logo móvil */}
          <div className="lg:hidden text-center">
            <img src="/images/logo-matriz-sin-fondo-negro.png" alt="Matriz Inmobiliaria" width={210} height={50} className="mx-auto" />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Crea tu cuenta</h2>
            <p className="text-gray-600">Comienza tu viaje inmobiliario hoy mismo</p>
          </div>

          {/* Formulario principal */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              {/* Campos de documento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo_documento" className="text-gray-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Tipo de documento
                  </Label>
                  <div className="relative">
                    <Select
                      value={formData.tipo_documento}
                      onValueChange={(value) => handleSelectChange('tipo_documento', value)}
                    >
                      <SelectTrigger className={`h-12 pl-12 pr-4 rounded-xl border-2 transition-all duration-200 w-full ${fieldErrors.tipo_documento ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#00457B] focus:ring-[#00457B]'}`}>
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="NIT">NIT</SelectItem>
                        <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors.tipo_documento && (
                      <div className="flex items-center mt-1 text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">{fieldErrors.tipo_documento}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_documento" className="text-gray-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Número de documento
                  </Label>
                  <div className="relative">
                    <Input
                      id="numero_documento"
                      name="numero_documento"
                      placeholder="Número de documento"
                      className={`h-12 pl-12 rounded-xl border-2 transition-all duration-200 ${fieldErrors.numero_documento ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#00457B] focus:ring-[#00457B]'}`}
                      value={formData.numero_documento}
                      onChange={handleChange}
                      onBlur={() => handleBlur('numero_documento')}
                      maxLength={formData.tipo_documento === 'PASAPORTE' ? 20 : formData.tipo_documento === 'TI' ? 11 : 10}
                      required
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {fieldErrors.numero_documento && (
                    <div className="flex items-center mt-1 text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{fieldErrors.numero_documento}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campos de nombre y apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_completo" className="text-gray-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <Input
                      id="nombre_completo"
                      name="nombre_completo"
                      placeholder="Tu nombre completo"
                      className={`h-12 pl-12 rounded-xl border-2 transition-all duration-200 ${fieldErrors.nombre_completo ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#00457B] focus:ring-[#00457B]'}`}
                      value={formData.nombre_completo}
                      onChange={handleChange}
                      onBlur={() => handleBlur('nombre_completo')}
                      maxLength={50}
                      required
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {fieldErrors.nombre_completo && (
                    <div className="flex items-center mt-1 text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{fieldErrors.nombre_completo}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido_completo" className="text-gray-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Apellido completo
                  </Label>
                  <div className="relative">
                    <Input
                      id="apellido_completo"
                      name="apellido_completo"
                      placeholder="Tu apellido completo"
                      className={`h-12 pl-12 rounded-xl border-2 transition-all duration-200 ${fieldErrors.apellido_completo ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#00457B] focus:ring-[#00457B]'}`}
                      value={formData.apellido_completo}
                      onChange={handleChange}
                      onBlur={() => handleBlur('apellido_completo')}
                      maxLength={50}
                      required
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {fieldErrors.apellido_completo && (
                    <div className="flex items-center mt-1 text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{fieldErrors.apellido_completo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[#00457B]" />
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    className={`h-12 pl-12 pr-12 rounded-xl border-2 transition-all duration-200 ${fieldErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#00457B] focus:ring-[#00457B]'}`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    maxLength={254}
                    required
                  />
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  {/* Indicador de verificación */}
                  {checkingEmail && (
                    <Loader2 className="absolute right-4 top-3.5 h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  {!checkingEmail && emailAvailable !== null && (
                    emailAvailable ? (
                      <CheckCircle2 className="absolute right-4 top-3.5 h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="absolute right-4 top-3.5 h-5 w-5 text-red-500" />
                    )
                  )}
                </div>
                {fieldErrors.email && (
                  <div className="flex items-center mt-1 text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{fieldErrors.email}</span>
                  </div>
                )}
                {!checkingEmail && emailAvailable === false && !fieldErrors.email && (
                  <div className="flex items-center mt-1 text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Este correo electrónico ya está registrado</span>
                  </div>
                )}
                {!checkingEmail && emailAvailable === true && !fieldErrors.email && (
                  <div className="flex items-center mt-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span className="text-sm">Correo electrónico disponible</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-gray-700 font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[#00457B]" />
                  Teléfono
                </Label>
                <div className="relative">
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="Tu número de teléfono"
                    className={`h-12 pl-12 rounded-xl border-2 transition-all duration-200 ${fieldErrors.telefono ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-[#00457B] focus:ring-[#00457B]'}`}
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={() => handleBlur('telefono')}
                    maxLength={15} // Permitir hasta 15 caracteres para formatos con espacios y +57
                    required
                  />
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {fieldErrors.telefono && (
                  <div className="flex items-center mt-1 text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">{fieldErrors.telefono}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-[#00457B]" />
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Fortaleza de contraseña:</span>
                    <span
                      className={`text-sm font-semibold ${
                        getPasswordStrengthScore() <= 2
                          ? "text-red-600"
                          : getPasswordStrengthScore() <= 3
                            ? "text-yellow-600"
                            : getPasswordStrengthScore() <= 4
                              ? "text-blue-600"
                              : "text-green-600"
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(getPasswordStrengthScore() / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      {passwordStrength.length ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">8+ caracteres</span>
                    </div>
                    <div className="flex items-center">
                      {passwordStrength.uppercase ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">Mayúscula</span>
                    </div>
                    <div className="flex items-center">
                      {passwordStrength.number ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">Número</span>
                    </div>
                    <div className="flex items-center">
                      {passwordStrength.special ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className="text-gray-600">Símbolo</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-[#00457B]" />
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                )}
                {formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <div className="flex items-center mt-2 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Las contraseñas no coinciden</span>
                    </div>
                  )}
                {formData.password &&
                  formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <div className="flex items-center mt-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-sm">Las contraseñas coinciden</span>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <Checkbox
                id="terminos"
                name="terminos"
                checked={formData.terminos}
                onCheckedChange={(checked) => setFormData({ ...formData, terminos: checked })}
                className="h-5 w-5 mt-0.5 border-2 border-[#00457B] text-[#00457B] rounded-md"
                required
              />
              <Label htmlFor="terminos" className="text-gray-700 font-medium text-sm leading-relaxed">
                Acepto los{" "}
                <a href="/terminos" className="text-[#00457B] hover:text-[#003b69] font-semibold underline">
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="/privacidad" className="text-[#00457B] hover:text-[#003b69] font-semibold underline">
                  política de privacidad
                </a>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[#00457B] to-[#0056A3] hover:from-[#003b69] hover:to-[#004a8f] rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
              disabled={isLoading || !formData.terminos || formData.password !== formData.confirmPassword}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center justify-center text-white">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">     </span>
            </div>
          </div>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-[#00457B] font-semibold hover:text-[#003b69] transition-colors">
                Inicia sesión
              </a>
            </p>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Matriz Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


