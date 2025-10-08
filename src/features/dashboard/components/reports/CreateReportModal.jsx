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
  FileText,
  ClipboardList as ClipboardListIcon
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
      expandido: true,
      activo: true, // Nuevo campo para soft delete
      fechaAnulacion: null // Fecha cuando se anuló
    };
    setRubros(prev => [...prev, nuevoRubro]);
  };

  // Editar rubro
  const editarRubro = (id, field, value) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === id ? { ...rubro, [field]: value } : rubro
    ));
  };

  // Anular/Reactivar rubro (soft delete)
  const toggleRubroActivo = (id) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === id 
        ? { 
            ...rubro, 
            activo: !rubro.activo,
            fechaAnulacion: !rubro.activo ? null : new Date().toISOString()
          } 
        : rubro
    ));
  };

  // Eliminar rubro permanentemente (solo para rubros nuevos sin guardar)
  const eliminarRubroPermanente = (id) => {
    const rubro = rubros.find(r => r.id === id);
    if (rubro && !rubro.nombre.trim()) {
      // Solo eliminar si es un rubro vacío recién creado
      setRubros(prev => prev.filter(rubro => rubro.id !== id));
    }
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
      estado: 'pendiente',
      activo: true,
      fechaAnulacion: null
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

  // Anular/Reactivar seguimiento (soft delete)
  const toggleSeguimientoActivo = (rubroId, seguimientoId) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === rubroId 
        ? {
            ...rubro,
            seguimientos: rubro.seguimientos.map(seg => 
              seg.id === seguimientoId 
                ? { 
                    ...seg, 
                    activo: !seg.activo,
                    fechaAnulacion: !seg.activo ? null : new Date().toISOString()
                  } 
                : seg
            )
          }
        : rubro
    ));
  };

  // Eliminar seguimiento permanentemente (solo para seguimientos nuevos sin guardar)
  const eliminarSeguimientoPermanente = (rubroId, seguimientoId) => {
    setRubros(prev => prev.map(rubro => 
      rubro.id === rubroId 
        ? {
            ...rubro,
            seguimientos: rubro.seguimientos.filter(seg => seg.id !== seguimientoId)
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

  // Filtrar rubros activos para mostrar
  const rubrosVisibles = rubros.filter(rubro => rubro.activo !== false);
  const rubrosAnulados = rubros.filter(rubro => rubro.activo === false);

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
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {initialData ? 'Editar Reporte' : 'Crear Nuevo Reporte'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {formData.fechaCreacion}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
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
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Apartaestudio">Apartaestudio</SelectItem>
                        <SelectItem value="Local">Local</SelectItem>
                        <SelectItem value="Finca">Finca</SelectItem>
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
                  <UploadIcon className="w-5 h-5 mr-2 text-blue-600" />
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
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
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
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Rubros del Proyecto
                  </h3>
                  <Button
                    type="button"
                    onClick={agregarRubro}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Agregar Rubro
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Rubros Activos */}
                  {rubrosVisibles.map((rubro) => (
                    <div key={rubro.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() => toggleRubro(rubro.id)}
                          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                        >
                          {rubro.expandido ? (
                            <ChevronDownIcon className="w-4 h-4" />
                          ) : (
                            <ChevronRightIcon className="w-4 h-4" />
                          )}
                          <span className="font-medium">
                            {rubro.nombre || 'Nuevo Rubro'}
                          </span>
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          {initialData && (
                            <Button
                              type="button"
                              onClick={() => toggleRubroActivo(rubro.id)}
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                              Anular
                            </Button>
                          )}
                          {!initialData && !rubro.nombre.trim() && (
                            <button
                              type="button"
                              onClick={() => eliminarRubroPermanente(rubro.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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

                          {/* Seguimientos del rubro */}
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                <ClipboardListIcon className="w-4 h-4 mr-2 text-blue-600" />
                                Seguimientos del Rubro
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {rubro.seguimientos.filter(seg => seg.activo !== false).length}
                                </Badge>
                              </h4>
                              <Button
                                type="button"
                                onClick={() => agregarSeguimientoRubro(rubro.id)}
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs px-3 py-1"
                              >
                                <PlusIcon className="w-3 h-3 mr-1" />
                                Nuevo Seguimiento
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              {rubro.seguimientos.filter(seg => seg.activo !== false).map((seguimiento, index) => (
                                <div key={seguimiento.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  {/* Header del seguimiento */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-blue-600">#{index + 1}</span>
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">Seguimiento {index + 1}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {initialData && (
                                        <Button
                                          type="button"
                                          onClick={() => toggleSeguimientoActivo(rubro.id, seguimiento.id)}
                                          size="sm"
                                          variant="outline"
                                          className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs px-2 py-1"
                                        >
                                          <XCircleIcon className="w-3 h-3 mr-1" />
                                          Anular
                                        </Button>
                                      )}
                                      {!initialData && !seguimiento.descripcion.trim() && (
                                        <Button
                                          type="button"
                                          onClick={() => eliminarSeguimientoPermanente(rubro.id, seguimiento.id)}
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <TrashIcon className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Campos organizados en grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        <CalendarIcon className="w-3 h-3 inline mr-1" />
                                        Fecha
                                      </label>
                                      <Input
                                        type="date"
                                        value={seguimiento.fecha}
                                        onChange={(e) => editarSeguimientoRubro(rubro.id, seguimiento.id, 'fecha', e.target.value)}
                                        className="text-xs h-8"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Estado
                                      </label>
                                      <Select
                                        value={seguimiento.estado}
                                        onValueChange={(value) => editarSeguimientoRubro(rubro.id, seguimiento.id, 'estado', value)}
                                      >
                                        <SelectTrigger className="text-xs h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pendiente">
                                            <div className="flex items-center">
                                              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                                              Pendiente
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="en-proceso">
                                            <div className="flex items-center">
                                              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                                              En Proceso
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="completado">
                                            <div className="flex items-center">
                                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                              Completado
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Campo de responsable */}
                                  <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      <UserIcon className="w-3 h-3 inline mr-1" />
                                      Responsable
                                    </label>
                                    <Input
                                      value={seguimiento.responsable || ''}
                                      onChange={(e) => editarSeguimientoRubro(rubro.id, seguimiento.id, 'responsable', e.target.value)}
                                      placeholder="Nombre del responsable"
                                      className="text-xs h-8"
                                    />
                                  </div>

                                  {/* Descripción */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      <FileText className="w-3 h-3 inline mr-1" />
                                      Descripción
                                    </label>
                                    <Textarea
                                      value={seguimiento.descripcion}
                                      onChange={(e) => editarSeguimientoRubro(rubro.id, seguimiento.id, 'descripcion', e.target.value)}
                                      placeholder="Describe las actividades realizadas o por realizar..."
                                      rows={2}
                                      className="text-xs resize-none"
                                    />
                                  </div>

                                  {/* Indicador de estado visual */}
                                  <div className="mt-3 pt-2 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>Estado actual:</span>
                                      <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                          seguimiento.estado === 'completado' ? 'bg-green-400' :
                                          seguimiento.estado === 'en-proceso' ? 'bg-blue-400' : 'bg-yellow-400'
                                        }`}></div>
                                        <span className="capitalize">{seguimiento.estado || 'pendiente'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Indicador de progreso del rubro */}
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-gray-700">Progreso del rubro:</span>
                                  <span className="text-gray-600">
                                    {rubro.seguimientos.filter(seg => seg.activo !== false && seg.estado === 'completado').length} de {rubro.seguimientos.filter(seg => seg.activo !== false).length} completados
                                  </span>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${rubro.seguimientos.filter(seg => seg.activo !== false).length > 0 
                                        ? (rubro.seguimientos.filter(seg => seg.activo !== false && seg.estado === 'completado').length / rubro.seguimientos.filter(seg => seg.activo !== false).length) * 100 
                                        : 0}%`
                                    }}
                                  ></div>
                                </div>
                              </div>

                              {/* Seguimientos Anulados */}
                              {initialData && rubro.seguimientos.filter(seg => seg.activo === false).length > 0 && (
                                <div className="mt-3">
                                  <h5 className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                                    <XCircleIcon className="w-3 h-3 mr-1" />
                                    Seguimientos Anulados ({rubro.seguimientos.filter(seg => seg.activo === false).length})
                                  </h5>
                                  <div className="space-y-2">
                                    {rubro.seguimientos.filter(seg => seg.activo === false).map((seguimiento) => (
                                      <div key={seguimiento.id} className="bg-red-50 rounded p-3 opacity-60">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-600">{seguimiento.fecha}</span>
                                            <Badge variant="secondary" className="text-xs">
                                              {seguimiento.estado}
                                            </Badge>
                                            <span className="text-xs text-red-600">
                                              (Anulado: {new Date(seguimiento.fechaAnulacion).toLocaleDateString()})
                                            </span>
                                          </div>
                                          <Button
                                            type="button"
                                            onClick={() => toggleSeguimientoActivo(rubro.id, seguimiento.id)}
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 border-green-600 hover:bg-green-50 text-xs px-2 py-1"
                                          >
                                            Reactivar
                                          </Button>
                                        </div>
                                        <p className="text-xs text-gray-600 line-through">
                                          {seguimiento.descripcion || 'Sin descripción'}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Rubros Anulados */}
                  {rubrosAnulados.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                        <XCircleIcon className="w-4 h-4 mr-2" />
                        Rubros Anulados ({rubrosAnulados.length})
                      </h4>
                      <div className="space-y-2">
                        {rubrosAnulados.map((rubro) => (
                          <div key={rubro.id} className="bg-gray-100 border border-gray-300 rounded-lg p-3 opacity-60">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <XCircleIcon className="w-4 h-4 text-red-500" />
                                <div>
                                  <span className="font-medium text-gray-700 line-through">
                                    {rubro.nombre || 'Rubro sin nombre'}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    Anulado el {new Date(rubro.fechaAnulacion).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => toggleRubroActivo(rubro.id)}
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                Reactivar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rubrosVisibles.length === 0 && rubrosAnulados.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No hay rubros agregados</p>
                      <p className="text-sm">Haz clic en "Agregar Rubro" para comenzar</p>
                    </div>
                  )}
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
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
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