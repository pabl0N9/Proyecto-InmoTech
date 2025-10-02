import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Textarea } from '../../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/components/ui/select';
import { Badge } from '../../../../shared/components/ui/badge';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  UploadIcon, 
  FileIcon, 
  ImageIcon, 
  ChevronDownIcon, 
  ChevronRightIcon, 
  CheckIcon, 
  UserIcon, 
  CalendarIcon, 
  SaveIcon, 
  XCircleIcon,
  X,
  FileText
} from 'lucide-react';

const CreateReportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  submitLabel = 'Crear Reporte'
}) => {
  // Función para obtener la fecha actual en formato ISO
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Función para obtener fecha y hora actual en formato legible
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' pm';
  };

  // Valores por defecto para el formulario
  const defaultFormData = {
    ubicacion: '',
    tipoInmueble: '',
    referencia: '',
    propietario: '',
    tipoReporte: '',
    descripcion: '',
    fecha: getCurrentDate(),
    fechaCreacion: getCurrentDateTime(),
    estado: 'En proceso',
    seguimientoGeneral: ''
  };

  // Estados del formulario
  const [formData, setFormData] = useState({...defaultFormData, ...(initialData || {})});
  const [rubros, setRubros] = useState((initialData && initialData.rubros) || []);
  const [imagenes, setImagenes] = useState((initialData && initialData.imagenes) || []);
  const [archivos, setArchivos] = useState((initialData && initialData.archivos) || []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Referencias para los inputs de archivos
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({...defaultFormData, ...initialData});
        setRubros(initialData.rubros || []);
        setImagenes(initialData.imagenes || []);
        setArchivos(initialData.archivos || []);
      } else {
        setFormData(defaultFormData);
        setRubros([]);
        setImagenes([]);
        setArchivos([]);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Validar el formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.ubicacion.trim()) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }

    if (!formData.tipoInmueble.trim()) {
      newErrors.tipoInmueble = 'El tipo de inmueble es requerido';
    }

    if (!formData.referencia.trim()) {
      newErrors.referencia = 'La referencia es requerida';
    }

    if (!formData.propietario.trim()) {
      newErrors.propietario = 'El propietario es requerido';
    }

    if (!formData.tipoReporte.trim()) {
      newErrors.tipoReporte = 'El tipo de reporte es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar imágenes
  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));
    setImagenes(prev => [...prev, ...newImages]);
  };

  // Manejar archivos
  const handleArchivos = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setArchivos(prev => [...prev, ...newFiles]);
  };

  // Eliminar imagen
  const eliminarImagen = (id) => {
    setImagenes(prev => prev.filter(img => img.id !== id));
  };

  // Eliminar archivo
  const eliminarArchivo = (id) => {
    setArchivos(prev => prev.filter(file => file.id !== id));
  };

  // Agregar nuevo rubro
  const agregarRubro = () => {
    const nuevoRubro = {
      id: Date.now(),
      nombre: '',
      descripcion: '',
      seguimientos: [],
      expandido: true
    };
    setRubros(prev => [...prev, nuevoRubro]);
  };

  // Editar rubro
  const editarRubro = (id, field, value) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === id ? { ...rubro, [field]: value } : rubro
    ));
  };

  // Eliminar rubro
  const eliminarRubro = (id) => {
    setRubros(prev => prev.filter(rubro => rubro.id !== id));
  };

  // Toggle expandir rubro
  const toggleRubro = (id) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === id ? { ...rubro, expandido: !rubro.expandido } : rubro
    ));
  };

  // Agregar seguimiento a rubro
  const agregarSeguimientoRubro = (rubroId) => {
    const nuevoSeguimiento = {
      id: Date.now(),
      descripcion: '',
      fecha: getCurrentDate(),
      estado: 'pendiente'
    };
    
    setRubros(prev => prev.map(rubro => 
      rubro.id === rubroId 
        ? { ...rubro, seguimientos: [...rubro.seguimientos, nuevoSeguimiento] }
        : rubro
    ));
  };

  // Editar seguimiento de rubro
  const editarSeguimientoRubro = (rubroId, seguimientoId, field, value) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === rubroId 
        ? {
            ...rubro,
            seguimientos: rubro.seguimientos.map(seg => 
              seg.id === seguimientoId ? { ...seg, [field]: value } : seg
            )
          }
        : rubro
    ));
  };

  // Eliminar seguimiento de rubro
  const eliminarSeguimientoRubro = (rubroId, seguimientoId) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === rubroId 
        ? {
            ...rubro,
            seguimientos: rubro.seguimientos.filter(seg => seg.id !== seguimientoId)
          }
        : rubro
    ));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        ...formData,
        rubros,
        imagenes,
        archivos
      };

      await onSubmit(reportData);
      onClose();
    } catch (error) {
      console.error('Error al guardar reporte:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {initialData ? 'Editar Reporte' : 'Crear Nuevo Reporte'}
                  </h2>
                  <p className="text-teal-100 text-sm">
                    {formData.fechaCreacion}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-teal-600" />
                  Información Básica
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación *
                    </label>
                    <Input
                      value={formData.ubicacion}
                      onChange={(e) => handleChange('ubicacion', e.target.value)}
                      placeholder="Ingrese la ubicación"
                      className={errors.ubicacion ? 'border-red-500' : ''}
                    />
                    {errors.ubicacion && (
                      <p className="text-red-500 text-xs mt-1">{errors.ubicacion}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Inmueble *
                    </label>
                    <Select 
                      value={formData.tipoInmueble} 
                      onValueChange={(value) => handleChange('tipoInmueble', value)}
                    >
                      <SelectTrigger className={errors.tipoInmueble ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Local">Local</SelectItem>
                        <SelectItem value="Oficina">Oficina</SelectItem>
                        <SelectItem value="PENT">PENT</SelectItem>
                        <SelectItem value="Bodega">Bodega</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipoInmueble && (
                      <p className="text-red-500 text-xs mt-1">{errors.tipoInmueble}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referencia *
                    </label>
                    <Input
                      value={formData.referencia}
                      onChange={(e) => handleChange('referencia', e.target.value)}
                      placeholder="Ej: J001"
                      className={errors.referencia ? 'border-red-500' : ''}
                    />
                    {errors.referencia && (
                      <p className="text-red-500 text-xs mt-1">{errors.referencia}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Propietario *
                    </label>
                    <Input
                      value={formData.propietario}
                      onChange={(e) => handleChange('propietario', e.target.value)}
                      placeholder="Nombre del propietario"
                      className={errors.propietario ? 'border-red-500' : ''}
                    />
                    {errors.propietario && (
                      <p className="text-red-500 text-xs mt-1">{errors.propietario}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Reporte *
                    </label>
                    <Input
                      value={formData.tipoReporte}
                      onChange={(e) => handleChange('tipoReporte', e.target.value)}
                      placeholder="Ej: Baño reparar, Techos, etc."
                      className={errors.tipoReporte ? 'border-red-500' : ''}
                    />
                    {errors.tipoReporte && (
                      <p className="text-red-500 text-xs mt-1">{errors.tipoReporte}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <Select 
                      value={formData.estado} 
                      onValueChange={(value) => handleChange('estado', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En proceso">En proceso</SelectItem>
                        <SelectItem value="Cotizando">Cotizando</SelectItem>
                        <SelectItem value="Sin novedades">Sin novedades</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Descripción detallada del reporte..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Archivos e Imágenes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UploadIcon className="w-5 h-5 mr-2 text-teal-600" />
                  Archivos e Imágenes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Imágenes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        ref={imageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagenes}
                        className="hidden"
                      />
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Arrastra imágenes aquí o
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        Seleccionar Imágenes
                      </Button>
                    </div>

                    {imagenes.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {imagenes.map((imagen) => (
                          <div key={imagen.id} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="flex items-center space-x-2">
                              <ImageIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-sm truncate">{imagen.name}</span>
                              <span className="text-xs text-gray-500">
                                ({formatFileSize(imagen.size)})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarImagen(imagen.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Archivos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivos
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleArchivos}
                        className="hidden"
                      />
                      <FileIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Arrastra archivos aquí o
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Seleccionar Archivos
                      </Button>
                    </div>

                    {archivos.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {archivos.map((archivo) => (
                          <div key={archivo.id} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div className="flex items-center space-x-2">
                              <FileIcon className="w-4 h-4 text-green-500" />
                              <span className="text-sm truncate">{archivo.name}</span>
                              <span className="text-xs text-gray-500">
                                ({formatFileSize(archivo.size)})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => eliminarArchivo(archivo.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seguimiento General */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-teal-600" />
                  Seguimiento General
                </h3>
                
                <Textarea
                  value={formData.seguimientoGeneral}
                  onChange={(e) => handleChange('seguimientoGeneral', e.target.value)}
                  placeholder="Notas generales del seguimiento..."
                  rows={3}
                />
              </div>

              {/* Rubros del Proyecto */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <CheckIcon className="w-5 h-5 mr-2 text-teal-600" />
                    Rubros del Proyecto
                  </h3>
                  <Button
                    type="button"
                    onClick={agregarRubro}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Agregar Rubro</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {rubros.map((rubro) => (
                    <div key={rubro.id} className="bg-white rounded-lg border">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={() => toggleRubro(rubro.id)}
                            className="flex items-center space-x-2 text-left"
                          >
                            {rubro.expandido ? (
                              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="font-medium text-gray-800">
                              {rubro.nombre || 'Nuevo Rubro'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarRubro(rubro.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {rubro.expandido && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nombre del Rubro
                                </label>
                                <Input
                                  value={rubro.nombre}
                                  onChange={(e) => editarRubro(rubro.id, 'nombre', e.target.value)}
                                  placeholder="Ej: Plomería, Electricidad..."
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                              </label>
                              <Textarea
                                value={rubro.descripcion}
                                onChange={(e) => editarRubro(rubro.id, 'descripcion', e.target.value)}
                                placeholder="Descripción detallada del rubro..."
                                rows={2}
                              />
                            </div>

                            {/* Seguimientos del Rubro */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Seguimientos
                                </label>
                                <Button
                                  type="button"
                                  onClick={() => agregarSeguimientoRubro(rubro.id)}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center space-x-1"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                  <span>Agregar</span>
                                </Button>
                              </div>

                              <div className="space-y-2">
                                {rubro.seguimientos.map((seguimiento) => (
                                  <div key={seguimiento.id} className="bg-gray-50 p-3 rounded border">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                                      <div>
                                        <Input
                                          value={seguimiento.fecha}
                                          onChange={(e) => editarSeguimientoRubro(rubro.id, seguimiento.id, 'fecha', e.target.value)}
                                          type="date"
                                          className="text-xs"
                                        />
                                      </div>
                                      <div>
                                        <Select 
                                          value={seguimiento.estado} 
                                          onValueChange={(value) => editarSeguimientoRubro(rubro.id, seguimiento.id, 'estado', value)}
                                        >
                                          <SelectTrigger className="text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pendiente">Pendiente</SelectItem>
                                            <SelectItem value="en-proceso">En Proceso</SelectItem>
                                            <SelectItem value="completado">Completado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <button
                                          type="button"
                                          onClick={() => eliminarSeguimientoRubro(rubro.id, seguimiento.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <TrashIcon className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                    <Textarea
                                      value={seguimiento.descripcion}
                                      onChange={(e) => editarSeguimientoRubro(rubro.id, seguimiento.id, 'descripcion', e.target.value)}
                                      placeholder="Descripción del seguimiento..."
                                      rows={2}
                                      className="text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <XCircleIcon className="w-4 h-4" />
              <span>Cancelar</span>
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-2"
            >
              <SaveIcon className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : submitLabel}</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default CreateReportModal;