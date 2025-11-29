import React, { useState, useEffect } from 'react'
import { ReportsHeader } from './ReportsHeader'
import { ReportsTable } from './ReportsTable'
import CreateReportModal from '../../components/reports/CreateReportModal'
import ViewReportModal from '../../components/reports/ViewReportModal'
import { motion, AnimatePresence } from 'framer-motion'
import { useReports } from '../../../../shared/contexts/ReportsContext.jsx'
import { useAuth } from '../../../../shared/contexts/AuthContext'
import reportesInmobiliariosService from '../../services/reportesInmobiliarios.service'
import authService from '../../../../shared/services/authService'

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const { createReport, updateReport, deleteReport } = useReports()
  const { user } = useAuth()

  // Estado para datos reales del backend
  const [dbReports, setDbReports] = useState([])
  const [dbLoading, setDbLoading] = useState(true)
  const [dbError, setDbError] = useState(null)

  // Función reutilizable para cargar desde la base de datos
  const fetchReports = async () => {
    setDbLoading(true)
    setDbError(null)
    try {
      const data = await reportesInmobiliariosService.listarReportes()
      const rows = Array.isArray(data) ? data : (data?.data || [])
      const mapped = rows.map((r) => ({
        id: `J${String(r.id_reporte ?? r.id ?? '').toString().padStart(3, '0')}`,
        referencia: r.id_reporte ?? r.id ?? '',
        ubicacion: r.inmueble_ciudad || '',
        tipoInmueble: r.inmueble_categoria || '',
        propietario: r.reporta_nombre || '',
        tipoReporte: r.tipo_reporte || '',
        fecha: r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleDateString('es-ES') : '',
        estado: r.estado || 'Pendiente',
      }))
      setDbReports(mapped)
    } catch (err) {
      setDbError(err?.message || 'Error al cargar reportes')
      setDbReports([])
    } finally {
      setDbLoading(false)
    }
  }

  // Cargar desde la base de datos al montar
  useEffect(() => {
    fetchReports()
  }, [])

  // Filtrar reportes (solo los del backend)
  const filteredReports = dbReports.filter(report =>
    Object.values(report).some(value =>
      (value ?? '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleNewReport = () => {
    setSelectedReport(null)
    setIsCreateModalOpen(true)
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setIsViewModalOpen(true)
  }

  const handleEditReport = (report) => {
    setSelectedReport(report)
    setIsEditModalOpen(true)
  }

  // Helper: normaliza estado a valores aceptados por el backend
  const normalizeEstado = (raw) => {
    const s = String(raw || '').toLowerCase().trim()
    if (s === 'pendiente') return 'Pendiente'
    if (s === 'en proceso' || s === 'en_proceso' || s === 'enproceso') return 'En Proceso'
    if (s === 'completado' || s === 'completo') return 'Completado'
    return 'Pendiente'
  }

  const handleCreateReport = async (reportData) => {
    try {
      const personaId = Number(user?.id_persona ?? user?.id)

      const payload = {
        id_inmueble: Number(reportData.id_inmueble),
        tipo_reporte: reportData.tipoReporte?.trim(),
        estado: normalizeEstado(reportData.estado),
        descripcion: reportData.descripcion?.trim() || 'Sin descripción',
        id_persona_reporta: personaId,
        seguimiento_general: reportData.seguimientoGeneral?.trim() || ''
      }

      if (!payload.id_inmueble || !payload.tipo_reporte || !payload.id_persona_reporta) {
        setDbError('Faltan campos: id_inmueble, tipo_reporte o no hay usuario autenticado.')
        return
      }

      await reportesInmobiliariosService.crearReporte(payload, payload.seguimiento_general)
      setIsCreateModalOpen(false)
      // Refresh the reports list immediately after creation
      await fetchReports()
    } catch (err) {
      setDbError(`Error al crear el reporte: ${err?.message || 'desconocido'}`)
    }
  }

  const handleUpdateReport = async (reportData) => {
    // Obtener ID real del backend (numérico) desde referencia o id_reporte
    const backendId = Number(
      reportData.id_reporte ??
      selectedReport?.referencia ??
      (reportData.id || '').toString().replace(/\D/g, '')
    )
    if (!backendId) {
      setDbError('No se pudo determinar el ID del reporte para actualizar.')
      return
    }

    // Solo enviar campos aceptados por el PATCH validator
    const patchPayload = {
      estado: normalizeEstado(reportData.estado),
      descripcion: reportData.descripcion || '',
      seguimiento_general: reportData.seguimientoGeneral || ''
    }

    await reportesInmobiliariosService.actualizarReporte(
      backendId,
      patchPayload,
      patchPayload.seguimiento_general
    )
    setIsEditModalOpen(false)
    setSelectedReport(null)
    await fetchReports()
  }

  const handleDeleteReport = async (reportToDelete) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      const backendId = Number(
        reportToDelete.id_reporte ??
        reportToDelete.referencia ??
        (reportToDelete.id || '').toString().replace(/\D/g, '')
      )
      if (!backendId) {
        setDbError('No se pudo determinar el ID del reporte para eliminar.')
        return
      }
      await reportesInmobiliariosService.eliminarReporte(backendId)
      await fetchReports()
    }
  }

  function handleDownloadReportPDF(report) {
    // Función auxiliar para obtener la clase CSS del estado
    function getStatusClass(estado) {
      switch (estado) {
        case 'Completado':
          return 'status-completado';
        case 'En proceso':
          return 'status-proceso';
        case 'Cotizando':
          return 'status-cotizando';
        case 'Sin novedades':
          return 'status-sin-novedades';
        case 'Pendiente':
          return 'status-cotizando';
        case 'Finalizado':
          return 'status-completado';
        default:
          return 'status-sin-novedades';
      }
    }

    // Función para generar la sección de rubros
    function generateRubrosSection(rubros) {
      if (!rubros || rubros.length === 0) {
        return '<p class=\'info-value\'>No hay rubros registrados</p>';
      }

      return rubros.map((rubro, index) => `
        <div class='rubro-item'>
          <div class='rubro-header'>
            <h4 class='rubro-title'>${index + 1}. ${rubro.nombre}</h4>
            <span class='status ${getStatusClass(rubro.estado)}'>${rubro.estado}</span>
          </div>
          <div class='rubro-description'>${rubro.descripcion || 'Sin descripción'}</div>
          
          ${rubro.seguimientos && rubro.seguimientos.length > 0 ? `
            <div class='seguimientos-section'>
              <h5 class='seguimientos-title'>Seguimientos:</h5>
              ${rubro.seguimientos.map((seg, segIndex) => `
                <div class='seguimiento-item'>
                  <div class='seguimiento-header'>
                    <span class='seguimiento-number'>${segIndex + 1}.</span>
                    <span class='seguimiento-desc'>${seg.descripcion}</span>
                    <span class='status ${getStatusClass(seg.estado)}'>${seg.estado}</span>
                  </div>
                  <div class='seguimiento-details'>
                    <span class='detail-item'><strong>Responsable:</strong> ${seg.responsable || 'No asignado'}</span>
                    <span class='detail-item'><strong>Fecha:</strong> ${seg.fecha || 'Sin fecha'}</span>
                    ${seg.subSeguimientos ? `<span class='detail-item'><strong>Sub-seguimientos:</strong> ${seg.subSeguimientos}</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p class=\'no-seguimientos\'>Sin seguimientos registrados</p>'}
        </div>
      `).join('');
    }

    // Función para generar la sección de archivos
    function generateArchivosSection(archivos) {
      if (!archivos || archivos.length === 0) {
        return '<p class=\'info-value\'>No hay archivos adjuntos</p>';
      }

      return `
        <div class='archivos-list'>
          ${archivos.map((archivo, index) => `
            <div class='archivo-item'>
              <span class='archivo-number'>${index + 1}.</span>
              <span class='archivo-name'>${archivo.nombre || `Archivo ${index + 1}`}</span>
              <span class='archivo-type'>(${archivo.tipo || 'Tipo desconocido'})</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Función para generar la sección de imágenes
    function generateImagenesSection(imagenes) {
      if (!imagenes || imagenes.length === 0) {
        return '<p class=\'info-value\'>No hay imágenes adjuntas</p>';
      }

      return `
        <div class='imagenes-list'>
          ${imagenes.map((imagen, index) => `
            <div class='imagen-item'>
              <span class='imagen-number'>${index + 1}.</span>
              <span class='imagen-name'>${imagen.nombre || `Imagen ${index + 1}`}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Crear el contenido HTML completo para el PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset='UTF-8'>
        <title>Reporte ${report.id} - ${report.tipoReporte}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .report-id {
            font-size: 16px;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #3b82f6;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-item {
            margin-bottom: 15px;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
            display: block;
            margin-bottom: 5px;
          }
          .info-value {
            color: #6b7280;
            margin-left: 10px;
          }
          .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-completado {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-proceso {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .status-cotizando {
            background-color: #fef3c7;
            color: #92400e;
          }
          .status-sin-novedades {
            background-color: #f3f4f6;
            color: #374151;
          }
          .rubro-item {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f9fafb;
          }
          .rubro-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .rubro-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin: 0;
          }
          .rubro-description {
            color: #6b7280;
            margin-bottom: 15px;
            font-style: italic;
          }
          .seguimientos-section {
            border-top: 1px solid #d1d5db;
            padding-top: 15px;
          }
          .seguimientos-title {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
          }
          .seguimiento-item {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 10px;
          }
          .seguimiento-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
          }
          .seguimiento-number {
            font-weight: bold;
            color: #3b82f6;
          }
          .seguimiento-desc {
            flex: 1;
            font-weight: 500;
          }
          .seguimiento-details {
            display: flex;
            gap: 20px;
            font-size: 12px;
            color: #6b7280;
          }
          .detail-item {
            white-space: nowrap;
          }
          .no-seguimientos {
            color: #9ca3af;
            font-style: italic;
            margin: 10px 0;
          }
          .archivos-list, .imagenes-list {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
          }
          .archivo-item, .imagen-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .archivo-item:last-child, .imagen-item:last-child {
            border-bottom: none;
          }
          .archivo-number, .imagen-number {
            font-weight: bold;
            color: #3b82f6;
            min-width: 20px;
          }
          .archivo-name, .imagen-name {
            flex: 1;
            font-weight: 500;
          }
          .archivo-type {
            color: #6b7280;
            font-size: 12px;
          }
          .description-section {
            background-color: #f9fafb;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
            page-break-inside: avoid;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class='header'>
          <div class='logo'>InmoTech</div>
          <div class='report-title'>Reporte de ${report.tipoReporte}</div>
          <div class='report-id'>ID: ${report.id} | Referencia: ${report.referencia || report.id}</div>
        </div>

        <div class='section'>
          <div class='section-title'>📋 Información Básica del Reporte</div>
          <div class='info-grid'>
            <div class='info-item'>
              <span class='info-label'>📍 Ubicación:</span>
              <span class='info-value'>${report.ubicacion}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>🏢 Tipo de Inmueble:</span>
              <span class='info-value'>${report.tipoInmueble}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>👤 Propietario:</span>
              <span class='info-value'>${report.propietario}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>📅 Fecha de Creación:</span>
              <span class='info-value'>${report.fecha}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>🔧 Tipo de Reporte:</span>
              <span class='info-value'>${report.tipoReporte}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>📊 Estado Actual:</span>
              <span class='status ${getStatusClass(report.estado)}'>${report.estado}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>👷 Responsable:</span>
              <span class='info-value'>${report.responsable || 'No asignado'}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>🔗 Referencia:</span>
              <span class='info-value'>${report.referencia || report.id}</span>
            </div>
          </div>
        </div>

        ${report.descripcion ? `
        <div class='section'>
          <div class='section-title'>📝 Descripción del Reporte</div>
          <div class='description-section'>
            ${report.descripcion}
          </div>
        </div>
        ` : ''}

        ${report.seguimientoGeneral ? `
        <div class='section'>
          <div class='section-title'>📈 Seguimiento General</div>
          <div class='description-section'>
            ${report.seguimientoGeneral}
          </div>
        </div>
        ` : ''}

        <div class='section'>
          <div class='section-title'>🔨 Rubros del Proyecto</div>
          ${generateRubrosSection(report.rubros)}
        </div>

        <div class='section'>
          <div class='section-title'>📎 Archivos Adjuntos</div>
          ${generateArchivosSection(report.archivos)}
        </div>

        <div class='section'>
          <div class='section-title'>🖼️ Imágenes del Proyecto</div>
          ${generateImagenesSection(report.imagenes)}
        </div>

        <div class='section'>
          <div class='section-title'>📊 Resumen del Proyecto</div>
          <div class='info-grid'>
            <div class='info-item'>
              <span class='info-label'>Total de Rubros:</span>
              <span class='info-value'>${report.rubros ? report.rubros.length : 0}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>Rubros Activos:</span>
              <span class='info-value'>${report.rubros ? report.rubros.filter(r => r.activo !== false).length : 0}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>Total de Seguimientos:</span>
              <span class='info-value'>${report.rubros ? report.rubros.reduce((total, rubro) => total + (rubro.seguimientos ? rubro.seguimientos.length : 0), 0) : 0}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>Archivos Adjuntos:</span>
              <span class='info-value'>${report.archivos ? report.archivos.length : 0}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>Imágenes:</span>
              <span class='info-value'>${report.imagenes ? report.imagenes.length : 0}</span>
            </div>
            <div class='info-item'>
              <span class='info-label'>Fecha de Generación:</span>
              <span class='info-value'>${new Date().toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        <div class='footer'>
          <p><strong>Documento generado automáticamente</strong></p>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES')} | Hora: ${new Date().toLocaleTimeString('es-ES')}</p>
          <p>InmoTech - Sistema de Gestión de Reportes de Inmuebles</p>
          <p>Este documento contiene información confidencial del reporte ${report.id}</p>
        </div>
      </body>
      </html>
    `;

    // Crear una nueva ventana para el PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego abrir el diálogo de impresión
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      
      // Cerrar la ventana después de un breve delay
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  }

  const handleDownloadExcel = () => {}

  return (
    <div className='space-y-6'>
      {dbLoading && <div className='p-4 text-slate-600'>Cargando reportes…</div>}
      {dbError && <div className='p-4 text-red-600'>{dbError}</div>}

      <ReportsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewReport={handleNewReport}
        onDownloadPDF={handleDownloadReportPDF}
        onDownloadExcel={handleDownloadExcel}
        reports={filteredReports}
      />

      <ReportsTable
        reports={filteredReports}
        onView={handleViewReport}
        onEdit={handleEditReport}
        onDownloadPDF={handleDownloadReportPDF}
      />

      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReport}
        submitLabel='Crear Reporte'
      />

      <CreateReportModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedReport(null)
        }}
        onSubmit={handleUpdateReport}
        initialData={selectedReport}
        submitLabel='Actualizar Reporte'
      />

      <ViewReportModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedReport(null)
        }}
        report={selectedReport}
        onEdit={handleEditReport}
      />
    </div>
  )
}

export default Reports
