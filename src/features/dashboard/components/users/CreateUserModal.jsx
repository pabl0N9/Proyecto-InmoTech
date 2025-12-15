<<<<<<< HEAD
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, XCircle, User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../shared/components/ui/select';
import { Input } from '../../../../shared/components/ui/input';

const initialForm = {
  nombre_completo: '',
  apellido_completo: '',
  correo: '',
  telefono: '',
  tipo_documento: '',
  numero_documento: '',
  password: '',
  confirmPassword: ''
};

const CreateUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = (data) => {
    const newErrors = {};

    if (!data.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre es obligatorio';
    if (!data.apellido_completo.trim()) newErrors.apellido_completo = 'El apellido es obligatorio';
    if (!data.correo.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.correo = 'Correo invalido';

    const telefonoLimpio = data.telefono.replace(/\D/g, '');
    if (telefonoLimpio.length < 10) newErrors.telefono = 'Telefono debe tener al menos 10 digitos';

    if (!data.tipo_documento) newErrors.tipo_documento = 'Seleccione un tipo de documento';
    if (!data.numero_documento.trim()) newErrors.numero_documento = 'Documento obligatorio';

    if (!data.password || data.password.length < 8) newErrors.password = 'Minimo 8 caracteres';
    if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate(formData);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        telefono: formData.telefono.replace(/\D/g, '')
      });
      setFormData(initialForm);
      onClose();
=======
import React, { useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Loader2, CheckCircle2, XCircle, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../shared/components/ui/select';
import { Input } from '../../../../shared/components/ui/input';
import usersApiService from '../../../../shared/services/usersApiService';

const CreateUserModal = ({ isOpen, onClose, onSubmit, serverErrors = {} }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    nombre_completo: '',
    apellido_completo: '',
    correo: '',
    telefono: '',
    tipo_documento: '',
    numero_documento: ''
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Estados para validaciones en tiempo real
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingDocument, setCheckingDocument] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null); // null = no verificado, true = disponible, false = ocupado
  const [documentAvailable, setDocumentAvailable] = useState(null);

  // Refs para debouncing
  const emailTimeoutRef = useRef(null);
  const documentTimeoutRef = useRef(null);

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
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const renderError = (field) =>
    errors[field] ? (
      <div className="flex items-center text-red-500 text-sm gap-1 mt-1">
        <AlertCircle size={14} /> <span>{errors[field]}</span>
      </div>
    ) : null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="text-primary" />
                <h2 className="text-xl font-semibold">Crear usuario</h2>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <User size={16} /> Nombre
                  </label>
                  <Input
                    value={formData.nombre_completo}
                    onChange={(e) => handleChange('nombre_completo', e.target.value)}
                    placeholder="Nombre completo"
                  />
                  {renderError('nombre_completo')}
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <User size={16} /> Apellido
                  </label>
                  <Input
                    value={formData.apellido_completo}
                    onChange={(e) => handleChange('apellido_completo', e.target.value)}
                    placeholder="Apellido completo"
                  />
                  {renderError('apellido_completo')}
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Mail size={16} /> Correo
                  </label>
                  <Input
                    type="email"
                    value={formData.correo}
                    onChange={(e) => handleChange('correo', e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                  {renderError('correo')}
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Phone size={16} /> Telefono
                  </label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="3001234567"
                  />
                  {renderError('telefono')}
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de documento</label>
                  <Select value={formData.tipo_documento} onValueChange={(v) => handleChange('tipo_documento', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cedula de Ciudadania</SelectItem>
                      <SelectItem value="CE">Cedula de Extranjeria</SelectItem>
                      <SelectItem value="NIT">NIT</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="PAS">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderError('tipo_documento')}
                </div>
                <div>
                  <label className="text-sm font-medium">Numero de documento</label>
                  <Input
                    value={formData.numero_documento}
                    onChange={(e) => handleChange('numero_documento', e.target.value)}
                    placeholder="Documento"
                  />
                  {renderError('numero_documento')}
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Lock size={16} /> Contraseña
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Minimo 8 caracteres"
                  />
                  {renderError('password')}
                </div>
                <div>
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Lock size={16} /> Confirmar contraseña
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Repite la contraseña"
                  />
                  {renderError('confirmPassword')}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-white flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Guardar
                </button>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <XCircle size={16} />
                  <span>Corrige los campos marcados en rojo.</span>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') || document.body
=======
  // Validaciones
  const validateTipoDocumento = (tipo) => {
    if (!tipo) return 'El tipo de documento es obligatorio';
    const tiposValidos = ['CC', 'CE', 'NIT', 'PASAPORTE', 'TI', 'PAS'];
    if (!tiposValidos.includes(tipo)) return 'Tipo de documento inválido';
    return '';
  };

  const validateNumeroDocumento = (numero, tipo) => {
    if (!numero || !numero.trim()) return 'El número de documento es obligatorio';
    const numeroLimpio = numero.replace(/[\s\-\.]/g, '');

    switch (tipo) {
      case 'CC':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) return 'La cédula debe tener entre 8 y 10 dígitos numéricos';
        break;
      case 'CE':
        if (!/^[0-9]{6,10}$/.test(numeroLimpio)) return 'La cédula de extranjería debe tener entre 6 y 10 dígitos numéricos';
        break;
      case 'NIT':
        if (!/^[0-9]{8,10}$/.test(numeroLimpio)) return 'El NIT debe tener entre 8 y 10 dígitos numéricos';
        break;
      case 'PAS':
      case 'PASAPORTE':
        if (numeroLimpio.length < 6 || numeroLimpio.length > 20) return 'El pasaporte debe tener entre 6 y 20 caracteres alfanuméricos';
        if (!/^[A-Za-z0-9]+$/.test(numeroLimpio)) return 'El pasaporte solo puede contener letras y números';
        break;
      case 'TI':
        if (!/^[0-9]{10,11}$/.test(numeroLimpio)) return 'La tarjeta de identidad debe tener 10 u 11 dígitos numéricos';
        break;
      default:
        return 'Primero selecciona un tipo de documento';
    }
    return '';
  };

  const validateNombreCompleto = (nombre) => {
    if (!nombre || !nombre.trim()) return 'El nombre completo es obligatorio';
    const t = nombre.trim();
    if (t.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (t.length > 50) return 'El nombre no puede tener más de 50 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(t)) return 'El nombre solo puede contener letras y espacios';
    return '';
  };

  const validateApellidoCompleto = (apellido) => {
    if (!apellido || !apellido.trim()) return 'El apellido completo es obligatorio';
    const t = apellido.trim();
    if (t.length < 2) return 'El apellido debe tener al menos 2 caracteres';
    if (t.length > 50) return 'El apellido no puede tener más de 50 caracteres';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(t)) return 'El apellido solo puede contener letras y espacios';
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
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    const digitosNumericos = telefonoLimpio.replace(/\D/g, '');
    if (telefonoLimpio.startsWith('+57')) {
      if (digitosNumericos.length !== 12 || !/^573\d{9}$/.test(digitosNumericos)) {
        return 'Con prefijo +57 debe tener formato +573XXXXXXXXX (12 dígitos totales)';
      }
    } else {
      if (digitosNumericos.length !== 10 || !/^3\d{9}$/.test(digitosNumericos)) {
        return 'Sin prefijo debe tener 10 dígitos comenzando con 3 (ej: 3001234567)';
      }
    }
    return '';
  };

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'nombre_completo':
        error = validateNombreCompleto(value);
        break;
      case 'apellido_completo':
        error = validateApellidoCompleto(value);
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
      default:
        break;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[field] = error; else delete newErrors[field];
      return newErrors;
    });
  };

  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !validateEmail(email)) {
      setEmailAvailable(null);
      return;
    }
    try {
      setCheckingEmail(true);
      const response = await usersApiService.verificarCorreoExistente(email);
      setEmailAvailable(!response.data.existe);
    } catch (error) {
      setEmailAvailable(null);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  const checkDocumentAvailability = useCallback(async (tipo, numero) => {
    if (!tipo || !numero || !validateNumeroDocumento(numero, tipo)) {
      setDocumentAvailable(null);
      return;
    }
    try {
      setCheckingDocument(true);
      const response = await usersApiService.verificarDocumentoExistente(tipo, numero);
      setDocumentAvailable(!response.data.existe);
    } catch (error) {
      setDocumentAvailable(null);
    } finally {
      setCheckingDocument(false);
    }
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'correo') {
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
      setEmailAvailable(null);
      if (value && value.trim()) {
        emailTimeoutRef.current = setTimeout(() => {
          const emailError = validateEmail(value);
          if (!emailError) checkEmailAvailability(value);
          else setEmailAvailable(false);
        }, 500);
      }
    }

    if (field === 'numero_documento' || field === 'tipo_documento') {
      if (documentTimeoutRef.current) clearTimeout(documentTimeoutRef.current);
      setDocumentAvailable(null);
      const numero = field === 'numero_documento' ? value : formData.numero_documento;
      const tipo = field === 'tipo_documento' ? value : formData.tipo_documento;
      if (numero && numero.trim() && tipo) {
        documentTimeoutRef.current = setTimeout(() => {
          const docError = validateNumeroDocumento(numero, tipo);
          if (!docError) checkDocumentAvailability(tipo, numero);
          else setDocumentAvailable(false);
        }, 500);
      }
    }
  };

  const handleBlur = (field) => validateField(field, formData[field]);

  const handleSelectChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
    if (field === 'tipo_documento' && formData.numero_documento && !validateNumeroDocumento(formData.numero_documento, value)) {
      if (documentTimeoutRef.current) clearTimeout(documentTimeoutRef.current);
      setDocumentAvailable(null);
      documentTimeoutRef.current = setTimeout(() => {
        checkDocumentAvailability(value, formData.numero_documento);
      }, 500);
    }
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
            {serverErrors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-600">
                  <XCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">{serverErrors.general}</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Documento */}
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
                      onBlur={() => handleBlur('tipo_documento')}
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
                      onBlur={() => handleBlur('numero_documento')}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="Tu número de documento"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={formData.tipo_documento === 'PAS' ? 20 : formData.tipo_documento === 'TI' ? 11 : 10}
                    />
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    {checkingDocument && (
                      <Loader2 className="absolute right-4 top-3.5 h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {!checkingDocument && documentAvailable !== null && (
                      documentAvailable ? (
                        <CheckCircle2 className="absolute right-4 top-3.5 h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="absolute right-4 top-3.5 h-5 w-5 text-red-500" />
                      )
                    )}
                  </div>
                  {validationErrors.numero_documento && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.numero_documento}</span>
                    </div>
                  )}
                  {!checkingDocument && documentAvailable === false && !validationErrors.numero_documento && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Este número de documento ya está registrado</span>
                    </div>
                  )}
                  {!checkingDocument && documentAvailable === true && !validationErrors.numero_documento && (
                    <div className="flex items-center mt-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-sm">Número de documento disponible</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nombre y apellido */}
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
                      onBlur={() => handleBlur('nombre_completo')}
                      className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="Tu nombre completo"
                      maxLength={50}
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
                      onBlur={() => handleBlur('apellido_completo')}
                      className="h-12 pl-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="Tu apellido completo"
                      maxLength={50}
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
                      onBlur={() => handleBlur('correo')}
                      className="h-12 pl-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#00457B] focus:ring-[#00457B] transition-all duration-200"
                      required
                      placeholder="tu@email.com"
                      maxLength={254}
                    />
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
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
                  {(validationErrors.correo || serverErrors.correo) && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{validationErrors.correo || serverErrors.correo}</span>
                    </div>
                  )}
                  {!checkingEmail && emailAvailable === false && !validationErrors.correo && !serverErrors.correo && (
                    <div className="flex items-center mt-1 text-red-600">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Este correo electrónico ya está registrado</span>
                    </div>
                  )}
                  {!checkingEmail && emailAvailable === true && !validationErrors.correo && !serverErrors.correo && (
                    <div className="flex items-center mt-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span className="text-sm">Correo electrónico disponible</span>
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
                      onBlur={() => handleBlur('telefono')}
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
              disabled={loading || Object.keys(validationErrors).length > 0 || !formData.nombre_completo || !formData.apellido_completo || !formData.correo || !formData.tipo_documento || !formData.numero_documento}
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
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
  );
};

export default CreateUserModal;
