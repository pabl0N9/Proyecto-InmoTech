import React, { useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { EyeIcon, EditIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export function ReportsTable({ reports = [], onView, onEdit, onDownloadPDF }) {
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Datos de ejemplo basados en la imagen
  const defaultReports = [
    {
      id: 'J004',
      ubicacion: 'Los Ríos',
      tipoInmueble: 'Apartamento',
      referencia: 'J004',
      propietario: 'Dario Jaramillo',
      tipoReporte: 'Baño reparar',
      fecha: '19/03/2025',
      estado: 'En proceso'
    },
    {
      id: 'J002',
      ubicacion: 'San Jorge',
      tipoInmueble: 'Apartamento',
      referencia: 'J002',
      propietario: 'Esteban Jáuregui',
      tipoReporte: 'Techos',
      fecha: '19/03/2025',
      estado: 'Cotizando'
    },
    {
      id: 'J003',
      ubicacion: 'Azuay',
      tipoInmueble: 'Local',
      referencia: 'J003',
      propietario: 'Daniela Orellana',
      tipoReporte: 'Baños',
      fecha: '19/03/2025',
      estado: 'Sin novedades'
    },
    {
      id: 'J001',
      ubicacion: 'Los Ríos',
      tipoInmueble: 'PENT',
      referencia: 'J001',
      propietario: 'Paola Dávila',
      tipoReporte: 'Cocina',
      fecha: '19/03/2025',
      estado: 'Sin novedades'
    }
  ]

  const reportsData = reports.length > 0 ? reports : defaultReports

  // Función para obtener el color del estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'En proceso':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Cotizando':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Sin novedades':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Función para manejar el ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Función para ordenar los datos
  const sortedReports = [...reportsData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField]?.toString().toLowerCase() || ''
    const bValue = b[sortField]?.toString().toLowerCase() || ''
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue)
    } else {
      return bValue.localeCompare(aValue)
    }
  })

  // Lógica de paginación
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReports = sortedReports.slice(startIndex, endIndex)

  // Funciones de paginación
  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  // Resetear página cuando cambian los datos
  React.useEffect(() => {
    setCurrentPage(1)
  }, [sortedReports.length])

  // Componente para vista móvil (tarjetas)
  const MobileCard = ({ report }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">{report.id}</span>
          <Badge className={`${getStatusColor(report.estado)} border text-xs`}>
            {report.estado}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(report)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(report)}
            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1"
          >
            <EditIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownloadPDF?.(report)}
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1"
            title="Descargar PDF"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Ubicación:</span>
          <p className="font-medium text-gray-900 capitalize">{report.ubicacion}</p>
        </div>
        <div>
          <span className="text-gray-500">Tipo:</span>
          <p className="font-medium text-gray-900 capitalize">{report.tipoInmueble}</p>
        </div>
        <div>
          <span className="text-gray-500">Propietario:</span>
          <p className="font-medium text-gray-900">{report.propietario}</p>
        </div>
        <div>
          <span className="text-gray-500">Fecha:</span>
          <p className="font-medium text-gray-900">{report.fecha}</p>
        </div>
      </div>
      
      <div>
        <span className="text-gray-500 text-sm">Tipo de reporte:</span>
        <p className="font-medium text-gray-900 capitalize">{report.tipoReporte}</p>
      </div>
    </div>
  )

  // Componente para el encabezado de columna ordenable
  const SortableHeader = ({ field, children, className = "" }) => (
    <th 
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <span className="text-gray-400">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )

  return (
    <div className="bg-white shadow-sm rounded-lg">
      {/* Vista Desktop - Tabla optimizada */}
      <div className="hidden lg:block">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="id" className="w-16">ID</SortableHeader>
              <SortableHeader field="ubicacion" className="w-24">Ubicación</SortableHeader>
              <SortableHeader field="tipoInmueble" className="w-20">Tipo</SortableHeader>
              <SortableHeader field="propietario" className="w-32">Propietario</SortableHeader>
              <SortableHeader field="tipoReporte" className="w-28">Reporte</SortableHeader>
              <SortableHeader field="fecha" className="w-24">Fecha</SortableHeader>
              <SortableHeader field="estado" className="w-24">Estado</SortableHeader>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-4 text-sm font-medium text-gray-900">
                  {report.id}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  <div className="capitalize">{report.ubicacion}</div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900 capitalize">
                  {report.tipoInmueble}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {report.propietario}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  <div className="max-w-xs">
                    {report.tipoReporte}
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {report.fecha}
                </td>
                <td className="px-3 py-4">
                  <Badge className={`${getStatusColor(report.estado)} border text-xs`}>
                    {report.estado}
                  </Badge>
                </td>
                <td className="px-3 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(report)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                      title="Ver reporte"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(report)}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1"
                      title="Editar reporte"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadPDF?.(report)}
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1"
                      title="Descargar PDF"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Tablet - Tabla simplificada */}
      <div className="hidden md:block lg:hidden">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="id">ID</SortableHeader>
              <SortableHeader field="ubicacion">Ubicación</SortableHeader>
              <SortableHeader field="propietario">Propietario</SortableHeader>
              <SortableHeader field="estado">Estado</SortableHeader>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                  {report.id}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="capitalize">{report.ubicacion}</div>
                  <div className="text-xs text-gray-500 capitalize">{report.tipoReporte}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div>{report.propietario}</div>
                  <div className="text-xs text-gray-500">{report.fecha}</div>
                </td>
                <td className="px-4 py-4">
                  <Badge className={`${getStatusColor(report.estado)} border text-xs`}>
                    {report.estado}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView?.(report)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(report)}
                      className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadPDF?.(report)}
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 p-1"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Móvil - Tarjetas */}
      <div className="md:hidden space-y-4 p-4">
        {currentReports.map((report) => (
          <MobileCard key={report.id} report={report} />
        ))}
      </div>
      
      {/* Paginador - Responsive */}
      {sortedReports.length > 0 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <Button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{startIndex + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(endIndex, sortedReports.length)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{sortedReports.length}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => goToPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Estado vacío */}
      {sortedReports.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            No se encontraron reportes
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsTable