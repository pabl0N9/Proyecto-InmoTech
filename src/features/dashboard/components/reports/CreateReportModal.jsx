import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../shared/components/ui/button';
import { Input } from '../../../../shared/components/ui/input';
import { Textarea } from '../../../../shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../shared/components/ui/select';
import { Badge } from '../../../../shared/components/ui/badge';
import PropertyAutocomplete from '../../../../shared/components/ui/PropertyAutocomplete';
import { usePropertyAutocomplete } from '../../../../shared/hooks/usePropertyAutocomplete';
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
  ClipboardList as ClipboardListIcon,
  Building,
  AlertCircle
} from 'lucide-react';

const CreateReportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  submitLabel = 'Crear Reporte'
}) => {
  // Hook de autocompletado de propiedades
  const {
    searchTerm,
    setSearchTerm,
    filteredProperties,
    selectedProperty,
    selectProperty,
    clearSelection,
    searchByReference
  } = usePropertyAutocomplete();

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
  const [showPropertyInfo, setShowPropertyInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('cliente');

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
        // Si hay una referencia inicial, buscar la propiedad
        if (initialData.referencia) {
          setSearchTerm(initialData.referencia);
        }
      } else {
        setFormData(defaultFormData);
        setRubros([]);
        setImagenes([]);
        setArchivos([]);
        clearSelection();
      }
      setErrors({});
      setShowPropertyInfo(false);
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

  // Manejar selección de propiedad desde el autocompletado
  const handlePropertySelect = (property) => {
    const propertyData = selectProperty(property);
    
    // Actualizar los campos del formulario con los datos de la propiedad
    setFormData(prev => ({
      ...prev,
      ...propertyData
    }));

    // Mostrar información de la propiedad seleccionada
    setShowPropertyInfo(true);

    // Limpiar errores de los campos que se autocompletaron
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.ubicacion;
      delete newErrors.tipoInmueble;
      delete newErrors.referencia;
      delete newErrors.propietario;
      return newErrors;
    });
  };

  // Manejar cambio en el campo de referencia
  const handleReferenceChange = (value) => {
    setSearchTerm(value);
    handleChange('referencia', value);
    
    // Si el campo se vacía, limpiar la selección
    if (!value.trim()) {
      clearSelection();
      setShowPropertyInfo(false);
    }
  };

  // Manejar imágenes
  const handleImageUpload = (e) => {
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
  const handleFileUpload = (e) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
r4          transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-900/10 w-full max-w-5xl max-h-[85vh] overflow-hidden border-2 border-gray-200 mx-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Header Mejorado con estilo slate */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {initialData ? 'Editar Reporte' : 'Nuevo Reporte'}
              </h2>
              <p className="text-slate-600 mt-1">
                {initialData ? 'Modifica la información del reporte inmobiliario' : 'Crea un nuevo reporte inmobiliario detallado'}
              </p>
              <div className="flex gap-4 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-slate-600">{formData.fechaCreacion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-600">Estado: {formData.estado}</span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </motion.button>
          </div>

          {/* Content Reorganizado */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-center p-6">
              <form onSubmit={handleSubmit} className="w-full max-w-4xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna Izquierda - Información Principal */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Sección 1: Identificación de Propiedad */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Identificación de Propiedad
                      </h3>
                    </div>
                    
                    {/* Referencia del Inmueble - Destacado */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Referencia del Inmueble *
                      </label>
                      <PropertyAutocomplete
                        value={searchTerm}
                        onChange={handleReferenceChange}
                        onPropertySelect={handlePropertySelect}
                        onSearchChange={setSearchTerm}
                        filteredProperties={filteredProperties}
                        placeholder="Buscar por referencia (ej: J001) o nombre..."
                        className="w-full"
                        error={!!errors.referencia}
                      />
                      {errors.referencia && (
                        <p className="text-red-500 text-xs mt-1">{errors.referencia}</p>
                      )}
                    </div>

                    {/* Información de la propiedad seleccionada */}
                    {showPropertyInfo && selectedProperty && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Building className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-green-900 mb-2">
                              ✓ Propiedad Encontrada
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                              <p><span className="font-medium">Título:</span> {selectedProperty.title}</p>
                              <p><span className="font-medium">Área:</span> {selectedProperty.area}</p>
                              <p><span className="font-medium">Precio:</span> {selectedProperty.price}</p>
                              <p><span className="font-medium">Estado:</span> {selectedProperty.status}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              clearSelection();
                              setShowPropertyInfo(false);
                              setFormData(prev => ({
                                ...prev,
                                ubicacion: '',
                                tipoInmueble: '',
                                referencia: '',
                                propietario: ''
                              }));
                              setSearchTerm('');
                            }}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Grid de campos básicos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ubicación */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          Ubicación *
                          {selectedProperty && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Auto
                            </span>
                          )}
                        </label>
                        <Input
                          value={formData.ubicacion}
                          onChange={(e) => handleChange('ubicacion', e.target.value)}
                          placeholder="Ingrese la ubicación"
                          className={`${errors.ubicacion ? 'border-red-500' : ''} ${selectedProperty ? 'bg-green-50 border-green-300' : ''}`}
                          readOnly={!!selectedProperty}
                        />
                        {errors.ubicacion && (
                          <p className="text-red-500 text-xs mt-1">{errors.ubicacion}</p>
                        )}
                      </div>

                      {/* Tipo de Inmueble */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          Tipo de Inmueble *
                          {selectedProperty && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Auto
                            </span>
                          )}
                        </label>
                        <Select 
                          value={formData.tipoInmueble} 
                          onValueChange={(value) => handleChange('tipoInmueble', value)}
                          disabled={!!selectedProperty}
                        >
                          <SelectTrigger className={`${errors.tipoInmueble ? 'border-red-500' : ''} ${selectedProperty ? 'bg-green-50 border-green-300' : ''}`}>
                            <SelectValue placeholder="Seleccione el tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Casa">Casa</SelectItem>
                            <SelectItem value="Apartamento">Apartamento</SelectItem>
                            <SelectItem value="Apartaestudio">Apartaestudio</SelectItem>
                            <SelectItem value="Local">Local</SelectItem>
                            <SelectItem value="Finca">Finca</SelectItem>
                            <SelectItem value="Bodega">Bodega</SelectItem>
                            <SelectItem value="Oficina">Oficina</SelectItem>
                            <SelectItem value="Lote">Lote</SelectItem>
                            <SelectItem value="Edificio">Edificio</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.tipoInmueble && (
                          <p className="text-red-500 text-xs mt-1">{errors.tipoInmueble}</p>
                        )}
                      </div>

                      {/* Propietario */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          Propietario *
                          {selectedProperty && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Auto
                            </span>
                          )}
                        </label>
                        <Input
                          value={formData.propietario}
                          onChange={(e) => handleChange('propietario', e.target.value)}
                          placeholder="Nombre del propietario"
                          className={`${errors.propietario ? 'border-red-500' : ''} ${selectedProperty ? 'bg-green-50 border-green-300' : ''}`}
                          readOnly={!!selectedProperty}
                        />
                        {errors.propietario && (
                          <p className="text-red-500 text-xs mt-1">{errors.propietario}</p>
                        )}
                      </div>

                      {/* Tipo de Reporte */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Reporte *
                        </label>
                        <Input
                          value={formData.tipoReporte}
                          onChange={(e) => handleChange('tipoReporte', e.target.value)}
                          placeholder="Ej: Daño reparar, Techos, etc."
                          className={errors.tipoReporte ? 'border-red-500' : ''}
                        />
                        {errors.tipoReporte && (
                          <p className="text-red-500 text-xs mt-1">{errors.tipoReporte}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Descripción */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <FileText className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Descripción del Reporte
                      </h3>
                    </div>
                    
                    <Textarea
                      value={formData.descripcion}
                      onChange={(e) => handleChange('descripcion', e.target.value)}
                      placeholder="Descripción detallada del reporte..."
                      className="min-h-[120px] resize-none"
                      rows={5}
                    />
                  </div>
                </div>

                {/* Columna Derecha - Estado y Acciones */}
                <div className="space-y-6">
                  
                  {/* Estado del Reporte */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <AlertCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Estado
                      </h3>
                    </div>
                    
                    <Select 
                      value={formData.estado} 
                      onValueChange={(value) => handleChange('estado', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                            Pendiente
                          </div>
                        </SelectItem>
                        <SelectItem value="En proceso">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            En proceso
                          </div>
                        </SelectItem>
                        <SelectItem value="Completado">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Completado
                          </div>
                        </SelectItem>
                        <SelectItem value="Cancelado">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            Cancelado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Información Adicional */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Información del Reporte
                    </h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Fecha de creación:</span>
                        <span className="font-medium">{formData.fechaCreacion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hora:</span>
                        <span className="font-medium">{formData.horaCreacion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estado actual:</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                          formData.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                          formData.estado === 'En proceso' ? 'bg-blue-100 text-blue-800' :
                          formData.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {formData.estado || 'Sin definir'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Imágenes y Archivos - Ancho completo */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                
                {/* Imágenes */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Imágenes
                      </h3>
                    </div>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center space-x-2 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <UploadIcon className="w-4 h-4" />
                      <span>Subir</span>
                    </Button>
                  </div>
                  
                  {imagenes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {imagenes.map((imagen, index) => (
                        <div key={imagen.id} className="relative group">
                          <img
                            src={imagen.url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => eliminarImagen(imagen.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No hay imágenes</p>
                    </div>
                  )}
                </div>

                {/* Archivos */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FileIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Archivos
                      </h3>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <UploadIcon className="w-4 h-4" />
                      <span>Subir</span>
                    </Button>
                  </div>
                  
                  {archivos.length > 0 ? (
                    <div className="space-y-2">
                      {archivos.map((archivo, index) => (
                        <div key={archivo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <FileIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 truncate">
                              {archivo.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarArchivo(archivo.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      <FileIcon className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No hay archivos</p>
                    </div>
                  )}
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
          </div>

          {/* Footer - Siempre visible */}
          <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Campos obligatorios marcados con *
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6"
                >
                  <XCircleIcon className="w-4 h-4" />
                  <span>Cancelar</span>
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white flex items-center space-x-2 px-6 shadow-lg"
                >
                  <SaveIcon className="w-4 h-4" />
                  <span>{isSubmitting ? 'Guardando...' : submitLabel}</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateReportModal;