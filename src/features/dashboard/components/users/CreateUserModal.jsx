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
    } finally {
      setLoading(false);
    }
  };

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
  );
};

export default CreateUserModal;
