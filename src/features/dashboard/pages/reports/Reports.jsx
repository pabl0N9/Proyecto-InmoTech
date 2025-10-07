import React, { useState } from 'react'
import DashboardLayout from '../../../../shared/components/dashboard/Layout/DashboardLayout'
import { ReportsHeader } from './ReportsHeader'
import { ReportsTable } from './ReportsTable'
import { ReportViewer } from './ReportViewer'
import CreateReportModal from '../../components/reports/CreateReportModal'
import { motion, AnimatePresence } from 'framer-motion'

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('table')
  const [selectedReport, setSelectedReport] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [reports, setReports] = useState([
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
  ])

  // Función para generar ID único
  const generateReportId = () => {
    const prefix = 'J'
    const existingNumbers = reports
      .map(report => parseInt(report.id.replace(prefix, '')))
      .filter(num => !isNaN(num))
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
    return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`
  }

  // Filtrar reportes
  const filteredReports = reports.filter(report =>
    Object.values(report).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Handlers
  const handleNewReport = () => {
    setSelectedReport(null)
    setIsCreateModalOpen(true)
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setCurrentView('view')
  }

  const handleEditReport = (report) => {
    setSelectedReport(report)
    setIsEditModalOpen(true)
  }

  const handleCreateReport = (reportData) => {
    const newReport = {
      ...reportData,
      id: generateReportId(),
      fecha: new Date().toLocaleDateString('es-ES')
    }
    setReports(prevReports => [...prevReports, newReport])
    setIsCreateModalOpen(false)
  }

  const handleUpdateReport = (reportData) => {
    setReports(prevReports =>
      prevReports.map(report =>
        report.id === selectedReport.id ? { ...reportData, id: selectedReport.id } : report
      )
    )
    setIsEditModalOpen(false)
    setSelectedReport(null)
  }

  const handleDeleteReport = (reportToDelete) => {
    setReports(prevReports => prevReports.filter(report => report.id !== reportToDelete.id))
  }

  const handleBackToTable = () => {
    setCurrentView('table')
    setSelectedReport(null)
  }

  // Función para descargar PDF
  const handleDownloadPDF = (reportsData) => {
    try {
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reportes InmoTech</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
            .date { color: #666; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-proceso { background-color: #dbeafe; color: #1e40af; }
            .status-cotizando { background-color: #fef3c7; color: #92400e; }
            .status-sin-novedades { background-color: #f3f4f6; color: #374151; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">InmoTech - Reportes</div>
            <div class="date">Generado el: ${new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ubicación</th>
                <th>Tipo Inmueble</th>
                <th>Propietario</th>
                <th>Tipo Reporte</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${reportsData.map(report => `
                <tr>
                  <td>${report.id}</td>
                  <td>${report.ubicacion}</td>
                  <td>${report.tipoInmueble}</td>
                  <td>${report.propietario}</td>
                  <td>${report.tipoReporte}</td>
                  <td>${report.fecha}</td>
                  <td>${report.estado}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            Total de reportes: ${reportsData.length}
          </div>
        </body>
        </html>
      `

      // Crear y descargar el archivo
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reportes-inmotech-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error al generar PDF:', error)
    }
  }

  // Variantes de animación
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {currentView === 'table' && (
            <motion.div
              key="table"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <ReportsHeader
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNewReport={handleNewReport}
                onDownloadPDF={() => handleDownloadPDF(filteredReports)}
                totalReports={filteredReports.length}
              />
              <ReportsTable
                reports={filteredReports}
                onView={handleViewReport}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
              />
            </motion.div>
          )}

          {currentView === 'view' && selectedReport && (
            <motion.div
              key="view"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={handleBackToTable}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a reportes
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditReport(selectedReport)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                </div>
              </div>
              <ReportViewer report={selectedReport} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <CreateReportModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateReport}
          submitLabel="Crear Reporte"
        />

        <CreateReportModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedReport(null)
          }}
          onSubmit={handleUpdateReport}
          initialData={selectedReport}
          submitLabel="Actualizar Reporte"
        />
      </div>
    </DashboardLayout>
  )
}

export default Reports