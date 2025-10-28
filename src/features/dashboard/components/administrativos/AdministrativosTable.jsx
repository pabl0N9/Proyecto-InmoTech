import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, Mail, Phone, Calendar, Building, DollarSign, Check, X } from 'lucide-react';
import { formatPhoneNumber } from '../../../../shared/utils/phoneFormatter';
import administrativosApiService from '../../../../shared/services/administrativosApiService';

const AdministrativosTable = ({
  administrativos,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onActivate,
  onDeactivate,
  loadingStatusChanges,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getStatusBadge = (estado) => {
    const statusConfig = {
      'Activo': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Activo'
      },
      'Inactivo': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Inactivo'
      },
      'Suspendido': {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Suspendido'
      },
      'Retirado': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Retirado'
      }
    };

    const config = statusConfig[estado] || statusConfig.Activo;

    return (
      <span
        className={`inline-flex w-[100px] min-w-0 flex-none items-center gap-1 px-1.5 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 truncate whitespace-nowrap justify-center ${config.bg} ${config.borderColor} ${config.text} ${estado === 'Retirado' ? 'opacity-60' : ''}`}
      >
        {config.label}
      </span>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return administrativosApiService.formatFecha(dateString);
  };

  const formatSalary = (salary) => {
    return administrativosApiService.formatSalario(salary);
  };

  // Helper para obtener el nombre completo
  const getFullName = (administrativo) => {
    if (!administrativo?.persona) return 'Sin nombre';

    const { nombre_completo, apellido_completo } = administrativo.persona;
    return `${nombre_completo || ''} ${apellido_completo || ''}`.trim() || 'Sin nombre';
  };

  // Helper para obtener el email
  const getEmail = (administrativo) => {
    return administrativo?.persona?.correo || '-';
  };

  // Helper para obtener el teléfono
  const getPhone = (administrativo) => {
    return administrativo?.persona?.telefono || '-';
  };

  // Helper para obtener el cargo
  const getPosition = (administrativo) => {
    return administrativo?.cargo || '-';
  };

  // Helper para obtener el departamento
  const getDepartment = (administrativo) => {
    return administrativo?.departamento || '-';
  };

  // Helper para obtener el código de empleado
  const getEmployeeCode = (administrativo) => {
    return administrativo?.codigo_empleado || '-';
  };

  // Helper para obtener la fecha de ingreso
  const getHireDate = (administrativo) => {
    return administrativo?.fecha_ingreso ? formatDate(administrativo.fecha_ingreso) : '-';
  };

  // Helper para obtener el salario
  const getSalary = (administrativo) => {
    return administrativo?.salario ? formatSalary(administrativo.salario) : '-';
  };

  // Componente para vista móvil
  const MobileAdministrativoCard = ({ administrativo }) => {
    const isRetired = administrativo.estado_laboral === 'Retirado';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg border border-slate-200 p-4 mb-4 ${isRetired ? 'opacity-60' : ''}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-slate-800">{getFullName(administrativo)}</h3>
            <p className="text-sm text-slate-600">{getEmployeeCode(administrativo)}</p>
          </div>
          {getStatusBadge(administrativo.estado_laboral)}
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4" />
            <span>{getEmail(administrativo)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4" />
            <span>{formatPhoneNumber(getPhone(administrativo))}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building className="w-4 h-4" />
            <span>{getPosition(administrativo)} - {getDepartment(administrativo)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>Ingreso: {getHireDate(administrativo)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="w-4 h-4" />
            <span>{getSalary(administrativo)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            key={`mobile-view-${administrativo.id_administrativo}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(administrativo)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </motion.button>
          <motion.button
            key={`mobile-edit-${administrativo.id_administrativo}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(administrativo)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </motion.button>
          <motion.button
            key={`mobile-delete-${administrativo.id_administrativo}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(administrativo)}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </motion.button>
          {administrativo.estado_laboral === 'Activo' ? (
            <motion.button
              key={`mobile-deactivate-${administrativo.id_administrativo}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDeactivate(administrativo)}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Desactivar
            </motion.button>
          ) : administrativo.estado_laboral !== 'Retirado' && (
            <motion.button
              key={`mobile-activate-${administrativo.id_administrativo}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onActivate(administrativo)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Activar
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Administrativo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cargo & Departamento
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Información Laboral
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {administrativos.map((administrativo, index) => {
                const isRetired = administrativo.estado_laboral === 'Retirado';

                return (
                  <motion.tr
                    key={administrativo.id_administrativo || `admin-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`hover:bg-slate-50 transition-colors ${isRetired ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{getFullName(administrativo)}</div>
                          <div className="text-sm text-slate-500">{getEmployeeCode(administrativo)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{getPosition(administrativo)}</div>
                      <div className="text-sm text-slate-500">{getDepartment(administrativo)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{getEmail(administrativo)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">{formatPhoneNumber(getPhone(administrativo))}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(administrativo.estado_laboral)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{getHireDate(administrativo)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">{getSalary(administrativo)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <motion.button
                          key={`view-${administrativo.id_administrativo}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onView(administrativo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          key={`edit-${administrativo.id_administrativo}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onEdit(administrativo)}
                          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          title="Editar administrativo"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          key={`delete-${administrativo.id_administrativo}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(administrativo)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar administrativo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                        {administrativo.estado_laboral === 'Activo' ? (
                          <motion.button
                            key={`deactivate-${administrativo.id_administrativo}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDeactivate(administrativo)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Desactivar administrativo"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        ) : administrativo.estado_laboral !== 'Retirado' && (
                          <motion.button
                            key={`activate-${administrativo.id_administrativo}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onActivate(administrativo)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activar administrativo"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4">
        {administrativos.map((administrativo, index) => (
          <MobileAdministrativoCard key={administrativo.id_administrativo || `mobile-admin-${index}`} administrativo={administrativo} />
        ))}
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

export default AdministrativosTable;
