import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Loader2, Eye, EyeOff, CheckCircle2, XCircle, User, Mail, Phone, Lock } from 'lucide-react';
import PasswordValidator from '../../../../shared/components/ui/PasswordValidator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../shared/components/ui/select';
import { Input } from '../../../../shared/components/ui/input';

const CreateUserModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    nombre_completo: '',
    apellido_completo: '',
    correo: '',
    telefono: '',
    tipo_documento: '',
    numero_documento: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos antes de enviar
    Object.keys(formData).forEach(field => validateField(field, formData[field]));

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      // El teléfono se limpia y mantiene el formato colombiano esperado por el server
      telefono: formData.telefono.replace(/\D/g, '')
    };

    setLoading(true);

    try {
      await onSubmit(submitData);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Validar nombres (igual que PropertyVisitModal)
  const validateNombres = (nombres) => {
    if (!nombres.trim()) return "Los nombres son requeridos";
    if (nombres.trim().length < 2)
      return "Los nombres deben tener al menos 2 caracteres";
    if (nombres.trim().length > 50)
      return "Los nombres no pueden tener más de 50 caracteres";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombres.trim()))
      return "Los nombres solo pueden contener letras y espacios";
    return "";
  };

  // ✅ Validar apellidos (igual que PropertyVisitModal)
  const validateApellidos = (apellidos) => {
    if (!apellidos.trim()) return "Los apellidos son requeridos";
    if (apellidos.trim().length < 2)
      return "Los apellidos deben tener al menos 2 caracteres";
    if (apellidos.trim().length > 50)
      return "Los apellidos no pueden tener más de 50 caracteres";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(apellidos.trim()))
      return "Los apellidos solo pueden contener letras y espacios";
    return "";
  };

  // ✅ Validar teléfono colombiano (igual que PropertyVisitModal)
  const validateTelefono = (telefono) => {
    if (!telefono.trim()) return "El teléfono es requerido";
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, "");
    if (!/^(\+57|57)?[3][0-9]{9}$/.test(telefonoLimpio)) {
      return "El teléfono debe tener formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)";
    }
    return "";
  };

  // ✅ Validar email (igual que PropertyVisitModal)
  const validateEmail = (email) => {
    if (!email.trim()) return "El email es requerido";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return "Ingresa un email válido";
    if (email.length > 254) return "El email es demasiado largo";
    return "";
  };

  // ✅ Validar tipo de documento (igual que PropertyVisitModal)
  const validateTipoDocumento = (tipoDocumento) => {
    if (!tipoDocumento) return "El tipo de documento es requerido";
    return "";
  };

  // ✅ Validar número de documento (igual que PropertyVisitModal)
  const validateNumeroDocumento = (numeroDocumento, tipoDocumento) => {
    if (!numeroDocumento.trim()) return "El número de documento es requerido";

    const numeroLimpio = numeroDocumento.replace(/[\s.-]/g, "");

    switch (tipoDocumento) {
      case "CC":
      case "Cédula de Ciudadanía":
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
          return "La cédula debe tener entre 8 y 10 dígitos";
        }
        break;
      case "CE":
      case "Cédula de Extranjería":
        if (!/^[0-9]{6,10}$/.test(numeroLimpio)) {
          return "La cédula de extranjería debe tener entre 6 y 10 dígitos";
        }
        break;
      case "NIT":
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) {
          return "El NIT debe tener entre 8 y 10 dígitos";
        }
        break;
      case "PASAPORTE":
      case "Pasaporte":
        if (numeroLimpio.length < 6 || numeroLimpio.length > 20) {
          return "El pasaporte debe tener entre 6 y 20 caracteres";
        }
        if (!/^[A-Za-z0-9]+$/.test(numeroLimpio)) {
          return "El pasaporte solo puede contener letras y números";
        }
        break;
      case "TI":
      case "Tarjeta de Identidad":
        if (!/^[0-9]{10,11}$/.test(numeroLimpio)) {
          return "La tarjeta de identidad debe tener 10 u 11 dígitos";
        }
        break;
      default:
        return "Tipo de documento no válido";
    }

    return "";
  };

  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case 'nombre_completo':
        error = validateNombres(value);
        break;
      case 'apellido_completo':
        error = validateApellidos(value);
        break;
      case 'correo':
        error = validateEmail(value);
        break;
      case 'numero_documento':
        error = validateNumeroDocumento(value, formData.tipo_documento);
        break;
      case 'telefono':
        error = validateTelefono(value);
        break;
      case 'tipo_documento':
        error = validateTipoDocumento(value);
        break;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Crear Nuevo Usuario</h2>
                <p className="text-slate-600 mt-1">Ingresa la información del nuevo usuario</p>
              </div>
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

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Campos de documento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Tipo de documento
                  </label>
                  <div className="relative">
                    <Select
                      value={formData.tipo_documento}
                      onValueChange={(value) => handleSelectChange('tipo_documento', value)}
                    >
                      <SelectTrigger className="h-12 pl-12 pr-4 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200 w-full">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="NIT">NIT</SelectItem>
                        <SelectItem value="PAS">Pasaporte</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {validationErrors.tipo_documento && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.tipo_documento}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Número de documento
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={formData.numero_documento}
                      onChange={(e) => handleChange('numero_documento', e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="Tu número de documento"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {validationErrors.numero_documento && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.numero_documento}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Campos de nombre y apellido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Nombre completo
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.nombre_completo}
                      onChange={(e) => handleChange('nombre_completo', e.target.value)}
                      className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="Tu nombre completo"
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {validationErrors.nombre_completo && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.nombre_completo}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#00457B]" />
                    Apellido completo
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.apellido_completo}
                      onChange={(e) => handleChange('apellido_completo', e.target.value)}
                      className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="Tu apellido completo"
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {validationErrors.apellido_completo && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.apellido_completo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-[#00457B]" />
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      value={formData.correo}
                      onChange={(e) => handleChange('correo', e.target.value)}
                      className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="tu@email.com"
                    />
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {validationErrors.correo && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.correo}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-[#00457B]" />
                    Teléfono
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      placeholder="Tu número de teléfono"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                  {validationErrors.telefono && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.telefono}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-[#00457B]" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Indicador de fortaleza de contraseña */}
                {formData.password && (
                  <PasswordValidator password={formData.password} />
                )}

                <div className="space-y-2">
                  <label className="text-slate-700 font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-[#00457B]" />
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Indicador de coincidencia de contraseñas */}
                  {formData.password && formData.confirmPassword && (
                    <div className="flex items-center mt-2">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Las contraseñas coinciden</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-600">Las contraseñas no coinciden</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) || Object.keys(validationErrors).length > 0 || !formData.nombre_completo || !formData.apellido_completo || !formData.correo || !formData.tipo_documento || !formData.numero_documento || !formData.password || !formData.confirmPassword}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateUserModal;
