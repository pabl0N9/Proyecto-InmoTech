import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { formatPhoneNumber } from '../../../../shared/utils/phoneFormatter';
import StatusSelector from '../../../../shared/components/ui/StatusSelector';

const AppointmentTable = ({
  citas,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  loadingStatusChanges,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getStatusBadge = (estado) => {
    const statusConfig = {
      programada: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Programada'
      },
      confirmada: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Confirmada'
      },
      cancelada: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Cancelada'
      },
      completada: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Completada'
      }
    };

    const config = statusConfig[estado] || statusConfig.programada;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getStatusOptions = () => [
    { value: 'programada', label: 'Programada', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmada', label: 'Confirmada', color: 'bg-green-100 text-green-800' },
    { value: 'completada', label: 'Completada', color: 'bg-purple-100 text-purple-800' },
    { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDocumentTypeLabel = (tipoDocumento) => {
    const documentTypes = {
      'CC': 'Cédula de Ciudadanía',
      'CE': 'Cédula de Extranjería',
      'NIT': 'NIT',
      'PASAPORTE': 'Pasaporte',
      'TI': 'Tarjeta de Identidad'
    };
    return documentTypes[tipoDocumento] || tipoDocumento;
  };

  const formatDocumentInfo = (tipoDocumento, numeroDocumento) => {
    if (!tipoDocumento || !numeroDocumento) return '-';
    return `${tipoDocumento} ${numeroDocumento}`;
  };

  // Componente para vista móvil (cards)
  const AppointmentCard = ({ cita, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg border border-slate-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="space-y-3">
        {/* Header con cliente y acciones */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 text-lg">{cita.cliente}</h3>
            <p className="text-sm text-slate-600">{cita.email}</p>
          </div>
          <div className="flex space-x-2 ml-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onView(cita)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(cita)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="Editar cita"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(cita)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Eliminar cita"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Documento</p>
            <p className="text-sm text-slate-900">{formatDocumentInfo(cita.tipoDocumento, cita.numeroDocumento)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Contacto</p>
            <p className="text-sm text-slate-900">{formatPhoneNumber(cita.telefono)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha y Hora</p>
            <p className="text-sm font-medium text-slate-900">{formatDate(cita.fecha)}</p>
            <p className="text-sm text-slate-500">{cita.hora}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</p>
            <div className="mt-1">
              <StatusSelector
                value={cita.estado}
                loading={loadingStatusChanges?.has(cita.id)}
                onChange={(newStatus) => onStatusChange(cita, newStatus)}
              />
            </div>
          </div>
        </div>

        {/* Servicio */}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Servicio</p>
          <p className="text-sm text-slate-900 break-words">{cita.servicio}</p>
        </div>
      </div>
    </motion.div>
  );

  // Si no hay citas, mostrar mensaje
  if (citas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Lista de Citas</h3>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No hay citas agendadas</h3>
            <p className="text-slate-500 max-w-md">
              No se encontraron citas que coincidan con los filtros aplicados.
              Puedes crear una nueva cita o ajustar los filtros para ver más resultados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Mobile View - Cards */}
      <div className="block lg:hidden">
        <div className="p-4">
          {citas.map((cita, index) => (
            <AppointmentCard key={cita.id} cita={cita} index={index} />
          ))}
        </div>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Documento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha & Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Servicio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {citas.map((cita, index) => (
                <motion.tr
                  key={cita.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors duration-200"
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{cita.cliente}</div>
                      <div className="text-sm text-slate-500">{cita.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-900">
                      {formatDocumentInfo(cita.tipoDocumento, cita.numeroDocumento)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{formatDate(cita.fecha)}</div>
                      <div className="text-sm text-slate-500">{cita.hora}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-900 break-words">{cita.servicio}</div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusSelector
                      value={cita.estado}
                      loading={loadingStatusChanges?.has(cita.id)}
                      onChange={(newStatus) => onStatusChange(cita, newStatus)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-900">{formatPhoneNumber(cita.telefono)}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onView(cita)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(cita)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Editar cita"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(cita)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Eliminar cita"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-slate-600 hover:bg-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;

                return (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isCurrentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {page}
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-600 hover:bg-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTable;
