import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, FileIcon, ImageIcon, ChevronDownIcon, ChevronRightIcon, CheckIcon, UserIcon, CalendarIcon, SaveIcon, XCircleIcon } from 'lucide-react'

export function ReportForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel,
  submitLabel = 'Guardar Reporte',
  isSubmitting = false
}) {
  // Función para obtener la fecha actual en formato ISO
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Función para obtener fecha y hora actual en formato legible
  const getCurrentDateTime = () => {
    const now = new Date()
    return now.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' pm'
  }

  // Valores por defecto para el formulario
  const defaultFormData = {
    ubicacion: '',
    tipoInmueble: '',
    referencia: '',
    propietario: '',
    tipoReporte: '',
    descripcion: '',
    fecha: getCurrentDate(), // Fecha automática
    fechaCreacion: getCurrentDateTime(), // Fecha y hora de creación
    estado: 'En proceso',
    seguimientoGeneral: ''
  }

  // Estados del formulario
  const [formData, setFormData] = useState({...defaultFormData, ...(initialData || {})})
  const [rubros, setRubros] = useState((initialData && initialData.rubros) || [
    {
      id: 1,
      nombre: 'Baños',
      descripcion: 'Inspección y reparaciones de baños',
      estado: 'En proceso',
      seguimientos: [
        {
          id: 1,
          tipo: 'Iniciado',
          responsable: 'Admin',
          fecha: '19/03/2025 16:00 pm',
          descripcion: 'Visita del inmueble para identificar el reporte',
          subSeguimientos: 2
        },
        {
          id: 2,
          tipo: 'Cotizando',
          responsable: 'Admin',
          fecha: '19/03/2025 17:00 pm',
          descripcion: 'Citación a la inspección para negociar el anexo entre las partes',
          subSeguimientos: 0
        }
      ]
    },
    {
      id: 2,
      nombre: 'Ventanas',
      descripcion: 'Revisión y mantenimiento de ventanas',
      estado: 'Pendiente',
      seguimientos: []
    }
  ])
  const [imagenes, setImagenes] = useState([])
  const [archivos, setArchivos] = useState([])
  const [expandedRubros, setExpandedRubros] = useState({})
  const rubroInputRefs = useRef({})

  // Estados para seguimientos específicos
  const [seguimientos, setSeguimientos] = useState((initialData && initialData.seguimientos) || [])
  const [nuevoSeguimiento, setNuevoSeguimiento] = useState({
    responsable: '',
    estado: 'iniciado',
    descripcion: ''
  })

  // Función para obtener color del estado
  const getEstadoColor = (estado) => {
    const colores = {
      'iniciado': 'bg-blue-100 text-blue-800',
      'en-proceso': 'bg-yellow-100 text-yellow-800',
      'completado': 'bg-green-100 text-green-800',
      'pendiente': 'bg-gray-100 text-gray-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  // Función para agregar seguimiento
  const agregarSeguimientoReporte = () => {
    if (!nuevoSeguimiento.descripcion.trim() || !nuevoSeguimiento.responsable.trim()) {
      return
    }

    const nuevoSeg = {
      id: Date.now(),
      ...nuevoSeguimiento,
      fecha: getCurrentDateTime()
    }

    setSeguimientos(prev => [...prev, nuevoSeg])
    setNuevoSeguimiento({
      responsable: '',
      estado: 'iniciado',
      descripcion: ''
    })
  }

  // Función para eliminar seguimiento
  const eliminarSeguimientoReporte = (seguimientoId) => {
    setSeguimientos(prev => prev.filter(seg => seg.id !== seguimientoId))
  }

  // Actualizar el formulario si cambian los datos iniciales
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...defaultFormData, 
        ...initialData,
        // Asegurar que siempre tenga fecha actual si no viene en initialData
        fecha: initialData.fecha || getCurrentDate(),
        fechaCreacion: initialData.fechaCreacion || getCurrentDateTime()
      })
      setRubros((initialData && initialData.rubros) || rubros)
    }
  }, [initialData])

  // Manejadores de eventos
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const handleImagenes = useCallback((files) => {
    const imagenesArray = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      nombre: file.name
    }))
    setImagenes(prev => [...prev, ...imagenesArray])
  }, [])

  const handleArchivos = useCallback((files) => {
    const archivosArray = Array.from(files).map(file => ({
      file,
      nombre: file.name,
      tipo: file.type,
      tamaño: file.size
    }))
    setArchivos(prev => [...prev, ...archivosArray])
  }, [])

  const agregarRubro = () => {
    const nuevoRubro = {
      id: Date.now(),
      nombre: '',
      descripcion: '',
      estado: 'Pendiente',
      seguimientos: []
    }
    setRubros([...rubros, nuevoRubro])
    
    // Enfocar automáticamente el campo de nombre del nuevo rubro
    setTimeout(() => {
      if (rubroInputRefs.current[nuevoRubro.id]) {
        rubroInputRefs.current[nuevoRubro.id].focus()
      }
    }, 100)
  }

  const editarRubro = (id, campo, valor) => {
    setRubros(rubros.map(rubro => 
      rubro.id === id ? { ...rubro, [campo]: valor } : rubro
    ))
  }

  const eliminarRubro = (id) => {
    setRubros(rubros.filter(rubro => rubro.id !== id))
  }

  const agregarSeguimiento = (rubroId) => {
    const nuevoSeguimiento = {
      id: Date.now(),
      tipo: 'Iniciado',
      responsable: 'Admin',
      fecha: getCurrentDateTime(), // Fecha automática para seguimientos
      descripcion: '',
      subSeguimientos: 0
    }
    
    setRubros(rubros.map(rubro => 
      rubro.id === rubroId 
        ? { ...rubro, seguimientos: [...rubro.seguimientos, nuevoSeguimiento] }
        : rubro
    ))
  }

  const editarSeguimiento = (rubroId, seguimientoId, campo, valor) => {
    setRubros(rubros.map(rubro => 
      rubro.id === rubroId 
        ? {
            ...rubro,
            seguimientos: rubro.seguimientos.map(seg =>
              seg.id === seguimientoId ? { ...seg, [campo]: valor } : seg
            )
          }
        : rubro
    ))
  }

  const eliminarSeguimiento = (rubroId, seguimientoId) => {
    setRubros(rubros.map(rubro => 
      rubro.id === rubroId 
        ? {
            ...rubro,
            seguimientos: rubro.seguimientos.filter(seg => seg.id !== seguimientoId)
          }
        : rubro
    ))
  }

  const toggleRubro = (rubroId) => {
    setExpandedRubros(prev => ({
      ...prev,
      [rubroId]: !prev[rubroId]
    }))
  }

  // Obtener color del estado
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'en proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'iniciado':
        return 'bg-blue-100 text-blue-800'
      case 'cotizando':
        return 'bg-yellow-100 text-yellow-800'
      case 'completado':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Calcular resumen de progreso
  const calcularResumen = () => {
    const totalRubros = rubros.length
    const totalSeguimientos = rubros.reduce((acc, rubro) => acc + rubro.seguimientos.length, 0)
    const totalProcesos = rubros.reduce((acc, rubro) => {
      return acc + rubro.seguimientos.reduce((segAcc, seg) => segAcc + (seg.subSeguimientos || 0), 0)
    }, 0) + totalSeguimientos

    const pendientes = rubros.filter(r => r.estado === 'Pendiente').length
    const enProceso = rubros.filter(r => r.estado === 'En proceso').length

    return { 
      totalRubros, 
      totalSeguimientos, 
      totalProcesos: totalProcesos,
      pendientes, 
      enProceso 
    }
  }

  const resumen = calcularResumen()

  // Limpiar las URLs de vista previa cuando el componente se desmonte
  useEffect(() => {
    return () => {
      imagenes.forEach(imagen => {
        URL.revokeObjectURL(imagen.preview)
      })
    }
  }, [imagenes])

  // Manejar el envío del formulario
  const handleFormSubmit = () => {
    // Asegurar que la fecha esté actualizada al momento del envío
    const dataToSubmit = {
      ...formData,
      fecha: getCurrentDate(),
      fechaActualizacion: getCurrentDateTime(),
      rubros,
      imagenes,
      archivos,
      seguimientos // Agregar seguimientos al envío
    }
    onSubmit(dataToSubmit)
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header del formulario */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              📋 Seguimiento del Reporte
            </h2>
            {/* Mostrar la fecha de creación de forma informativa */}
            <p className="text-sm text-gray-500 mt-1">
              Creado el: {formData.fechaCreacion || getCurrentDateTime()}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Información básica del reporte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Ubicación
            </label>
            <Select value={formData.ubicacion} onValueChange={(value) => handleChange('ubicacion', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quito">Quito</SelectItem>
                <SelectItem value="guayaquil">Guayaquil</SelectItem>
                <SelectItem value="cuenca">Cuenca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Inmueble
            </label>
            <Select value={formData.tipoInmueble} onValueChange={(value) => handleChange('tipoInmueble', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="departamento">Departamento</SelectItem>
                <SelectItem value="terreno">Terreno</SelectItem>
                <SelectItem value="oficina">Oficina</SelectItem>
                <SelectItem value="local">Local Comercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia
            </label>
            <Input 
              type="text" 
              placeholder="Ej: Apto 502"
              value={formData.referencia}
              onChange={(e) => handleChange('referencia', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Dueño
            </label>
            <Input 
              type="text" 
              placeholder="Nombre del propietario"
              value={formData.propietario}
              onChange={(e) => handleChange('propietario', e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Reporte
            </label>
            <Input 
              type="text" 
              placeholder="Ej: Reparación integral apartamento"
              value={formData.tipoReporte}
              onChange={(e) => handleChange('tipoReporte', e.target.value)}
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <Textarea 
            placeholder="Descripción general del reporte..."
            rows={4}
            value={formData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
        </div>

        {/* Subir archivos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">Subir imágenes</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImagenes(e.target.files)}
              className="hidden"
              id="upload-images"
            />
            <label htmlFor="upload-images" className="cursor-pointer text-blue-600 hover:text-blue-800">
              Seleccionar archivos
            </label>
            {imagenes.length > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                {imagenes.length} imagen(es) seleccionada(s)
              </div>
            )}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <FileIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">Subir archivos</p>
            <input
              type="file"
              multiple
              onChange={(e) => handleArchivos(e.target.files)}
              className="hidden"
              id="upload-files"
            />
            <label htmlFor="upload-files" className="cursor-pointer text-blue-600 hover:text-blue-800">
              Seleccionar archivos
            </label>
            {archivos.length > 0 && (
              <div className="mt-3 text-sm text-gray-500">
                {archivos.length} archivo(s) seleccionado(s)
              </div>
            )}
          </div>
        </div>

        {/* Estado */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <Select value={formData.estado} onValueChange={(value) => handleChange('estado', value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En proceso">En proceso</SelectItem>
              <SelectItem value="Completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Seguimiento General */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 Seguimiento General
          </label>
          <Textarea
            placeholder="Escriba aquí el seguimiento general del reporte..."
            value={formData.seguimientoGeneral}
            onChange={(e) => handleChange('seguimientoGeneral', e.target.value)}
            className="w-full min-h-[120px] resize-y"
            rows={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            Este seguimiento aparecerá en todos los reportes como información general del proyecto.
          </p>
        </div>

        {/* Seguimientos Específicos */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Seguimientos del Reporte</h3>
            <Badge variant="outline" className="text-sm">
              {seguimientos.length} seguimiento{seguimientos.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Formulario para nuevo seguimiento */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <h4 className="text-md font-medium text-gray-800 mb-3">Agregar Nuevo Seguimiento</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👤 Responsable
                </label>
                <Input
                  placeholder="Nombre del responsable"
                  value={nuevoSeguimiento.responsable}
                  onChange={(e) => setNuevoSeguimiento(prev => ({ ...prev, responsable: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Estado
                </label>
                <Select 
                  value={nuevoSeguimiento.estado} 
                  onValueChange={(value) => setNuevoSeguimiento(prev => ({ ...prev, estado: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciado">Iniciado</SelectItem>
                    <SelectItem value="en-proceso">En Proceso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Descripción del Seguimiento
              </label>
              <Textarea
                placeholder="Describe el progreso, observaciones o acciones realizadas..."
                value={nuevoSeguimiento.descripcion}
                onChange={(e) => setNuevoSeguimiento(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={agregarSeguimientoReporte}
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                disabled={!nuevoSeguimiento.descripcion.trim() || !nuevoSeguimiento.responsable.trim()}
              >
                <CheckIcon className="w-4 h-4" />
                Guardar Seguimiento
              </Button>
            </div>
          </div>

          {/* Lista de seguimientos guardados */}
          {seguimientos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-800">Seguimientos Registrados</h4>
              {seguimientos.map((seguimiento) => (
                <div key={seguimiento.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getEstadoColor(seguimiento.estado)} text-xs`}>
                        {seguimiento.estado}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(seguimiento.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-gray-400" />
                      {seguimiento.responsable}
                    </p>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {seguimiento.descripcion}
                  </p>
                </div>
              ))}
            </div>
          )}

          {seguimientos.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No hay seguimientos registrados aún.</p>
              <p className="text-xs mt-1">Agrega el primer seguimiento usando el formulario de arriba.</p>
            </div>
          )}
        </div>

        {/* Responsable del Reporte */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👤 Responsable del Reporte
          </label>
          <Input
            placeholder="Nombre del responsable del reporte"
            value={formData.responsableReporte}
            onChange={(e) => handleChange('responsableReporte', e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Persona encargada de la elaboración y seguimiento de este reporte.
          </p>
        </div>

        {/* Rubros del Proyecto */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Rubros del Proyecto</h3>
            <Button 
              onClick={agregarRubro}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Agregar Rubro
            </Button>
          </div>

          <div className="space-y-4">
            {rubros.map((rubro) => (
              <div key={rubro.id} className="border border-gray-200 rounded-lg bg-white">
                {/* Header del rubro */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRubro(rubro.id)}
                        className="p-1"
                      >
                        {expandedRubros[rubro.id] ? 
                          <ChevronDownIcon className="w-4 h-4" /> : 
                          <ChevronRightIcon className="w-4 h-4" />
                        }
                      </Button>
                      <div>
                        <h4 className="font-medium text-gray-900">{rubro.nombre || 'Nuevo Rubro'}</h4>
                        <p className="text-sm text-gray-600">{rubro.descripcion}</p>
                      </div>
                      <Badge className={getStatusColor(rubro.estado)}>
                        {rubro.estado}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {rubro.seguimientos.length} seguimiento(s)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => eliminarRubro(rubro.id)}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Campos de edición del rubro */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Input
                        ref={(el) => rubroInputRefs.current[rubro.id] = el}
                        placeholder="Nombre del rubro"
                        value={rubro.nombre}
                        onChange={(e) => editarRubro(rubro.id, 'nombre', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Descripción"
                        value={rubro.descripcion}
                        onChange={(e) => editarRubro(rubro.id, 'descripcion', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Select 
                        value={rubro.estado} 
                        onValueChange={(value) => editarRubro(rubro.id, 'estado', value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="En proceso">En proceso</SelectItem>
                          <SelectItem value="Completado">Completado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Seguimientos del rubro */}
                {expandedRubros[rubro.id] && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-gray-900">Seguimientos</h5>
                      <Button 
                        onClick={() => agregarSeguimiento(rubro.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Agregar Seguimiento
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {rubro.seguimientos.map((seguimiento) => (
                        <div key={seguimiento.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge className={getTipoColor(seguimiento.tipo)}>
                                {seguimiento.tipo}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {seguimiento.responsable}
                              </span>
                              <span className="text-sm text-gray-500">
                                {seguimiento.fecha}
                              </span>
                              {seguimiento.subSeguimientos > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {seguimiento.subSeguimientos} sub-seguimiento(s)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <EditIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => eliminarSeguimiento(rubro.id, seguimiento.id)}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                            <div>
                              <Select 
                                value={seguimiento.tipo} 
                                onValueChange={(value) => editarSeguimiento(rubro.id, seguimiento.id, 'tipo', value)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Iniciado">Iniciado</SelectItem>
                                  <SelectItem value="Cotizando">Cotizando</SelectItem>
                                  <SelectItem value="En proceso">En proceso</SelectItem>
                                  <SelectItem value="Completado">Completado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Input
                                placeholder="Responsable"
                                value={seguimiento.responsable}
                                onChange={(e) => editarSeguimiento(rubro.id, seguimiento.id, 'responsable', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                placeholder="Fecha"
                                value={seguimiento.fecha}
                                onChange={(e) => editarSeguimiento(rubro.id, seguimiento.id, 'fecha', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Input
                                type="number"
                                placeholder="Sub-seguimientos"
                                value={seguimiento.subSeguimientos}
                                onChange={(e) => editarSeguimiento(rubro.id, seguimiento.id, 'subSeguimientos', parseInt(e.target.value) || 0)}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Textarea
                              placeholder="Descripción del seguimiento"
                              value={seguimiento.descripcion}
                              onChange={(e) => editarSeguimiento(rubro.id, seguimiento.id, 'descripcion', e.target.value)}
                              className="text-sm resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {rubro.seguimientos.length === 0 && (
                        <div className="text-center py-6 text-gray-500">
                          <p className="text-sm">No hay seguimientos para este rubro</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {rubros.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <p>No hay rubros agregados</p>
                <p className="text-sm">Haz clic en "Agregar Rubro" para comenzar</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen del Proyecto */}
        {rubros.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Proyecto</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{resumen.totalRubros}</div>
                <div className="text-sm text-gray-600">Rubros totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{resumen.totalSeguimientos}</div>
                <div className="text-sm text-gray-600">Seguimientos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{resumen.totalProcesos}</div>
                <div className="text-sm text-gray-600">Procesos totales</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Estados por rubro:</div>
                <div className="space-y-1">
                  <div className="text-orange-600">Pendiente: {resumen.pendientes}</div>
                  <div className="text-blue-600">En proceso: {resumen.enProceso}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            {isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ReportForm