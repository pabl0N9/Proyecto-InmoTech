import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { DownloadIcon, FileTextIcon, FileSpreadsheetIcon, ChevronDownIcon } from 'lucide-react'

export function ReportsHeader({ searchTerm, onSearchChange, onNewReport, onDownloadPDF, onDownloadExcel, reports = [] }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleDownloadOption = (type) => {
    setIsDropdownOpen(false)
    if (type === 'pdf') {
      onDownloadPDF?.(reports)
    } else if (type === 'excel') {
      onDownloadExcel?.(reports)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
      
      <div className="flex w-full sm:w-auto gap-2 flex-wrap">
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Buscar reportes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Botón de descarga con dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            <span>Descargar Reporte</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </Button>
          
          {/* Menú desplegable */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleDownloadOption('pdf')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <FileTextIcon className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium">Descargar PDF</div>
                    <div className="text-xs text-gray-500">Formato de documento portable</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDownloadOption('excel')}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                >
                  <FileSpreadsheetIcon className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">Descargar Excel</div>
                    <div className="text-xs text-gray-500">Hoja de cálculo de Excel</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={onNewReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo reporte
        </Button>
      </div>
    </div>
  )
}