import React, { useState } from 'react';
import { Building2, Search, Eye, Edit, FileText, Plus, Filter, X, Home, Building, MapPin, DollarSign, User, UserPlus, Trash2, Calendar, Clock } from 'lucide-react';
import DashboardLayout from '../../../../shared/components/dashboard/Layout/DashboardLayout';

// Datos de ejemplo con fichas técnicas
const SAMPLE_DATA = [
  {
    id: 1,
    registro: 'INM-2024-001',
    titulo: 'Apartamento moderno en El Poblado',
    direccion: 'Carrera 43A #12-45, El Poblado',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2500000,
    ciudad: 'Medellín',
    estado: 'Disponible',
    comodidades: [
      { nombre: 'Habitaciones', cantidad: 3, seleccionada: true },
      { nombre: 'Baños', cantidad: 2, seleccionada: true },
      { nombre: 'Parqueaderos', cantidad: 1, seleccionada: true }
    ],
    propietario: { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '3001234567' },
    fichasTecnicas: [
      {
        id: 1,
        fecha: '2024-10-01',
        version: 1,
        cambios: 'Creación inicial'
      }
    ]
  },
  {
    id: 2,
    registro: 'INM-2024-002',
    titulo: 'Casa campestre con piscina',
    direccion: 'Calle 10 #32-15, Laureles',
    tipo: 'Casa',
    operacion: 'Venta',
    precio: 450000000,
    ciudad: 'Medellín',
    estado: 'En proceso de venta',
    comodidades: [
      { nombre: 'Habitaciones', cantidad: 4, seleccionada: true },
      { nombre: 'Baños', cantidad: 3, seleccionada: true }
    ],
    propietario: { id: 2, nombre: 'María González', email: 'maria@email.com', telefono: '3009876543' },
    fichasTecnicas: [
      {
        id: 1,
        fecha: '2024-09-15',
        version: 1,
        cambios: 'Creación inicial'
      }
    ]
  }
];

// Comodidades predefinidas según tipo de inmueble
const COMODIDADES_POR_TIPO = {
  Casa: ['Habitaciones', 'Baños', 'Parqueaderos', 'Cocina integral', 'Sala-comedor', 'Patio', 'Jardín', 'Lavandería', 'Balcón'],
  Apartamento: ['Habitaciones', 'Baños', 'Parqueaderos', 'Cocina integral', 'Balcón', 'Zona de lavandería', 'Ascensor', 'Portería'],
  Apartaestudio: ['Baños', 'Parqueaderos', 'Cocina integral', 'Balcón', 'Zona de lavandería', 'Ascensor', 'Portería'],
  Finca: ['Habitaciones', 'Baños', 'Parqueaderos', 'Cocina', 'Piscina', 'Kiosco', 'Establos', 'Cultivos', 'Lago'],
  Lote: ['Área construible', 'Servicios públicos', 'Acceso vehicular', 'Documentación al día'],
  Oficina: ['Baños', 'Parqueaderos', 'Recepción', 'Sala de juntas', 'Cocina', 'Aire acondicionado', 'Internet']
};

// Propietarios de ejemplo
const PROPIETARIOS_EJEMPLO = [
  { id: 1, nombre: 'Juan Carlos Pérez García', email: 'juan.perez@email.com', telefono: '3001234567' },
  { id: 2, nombre: 'María González López', email: 'maria.gonzalez@email.com', telefono: '3009876543' },
  { id: 3, nombre: 'Pedro Luis Martínez', email: 'pedro.martinez@email.com', telefono: '3005556789' }
];

// Función para obtener el color del estado
const getEstadoColor = (estado) => {
  const colores = {
    'Disponible': 'bg-green-100 text-green-800',
    'Vendido': 'bg-gray-100 text-gray-800',
    'Arrendado': 'bg-blue-100 text-blue-800',
    'En proceso de venta': 'bg-yellow-100 text-yellow-800',
    'En proceso de arrendamiento': 'bg-orange-100 text-orange-800'
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
};

// Función para obtener el color del punto indicador
const getEstadoDotColor = (estado) => {
  const colores = {
    'Disponible': 'bg-green-500',
    'Vendido': 'bg-gray-500',
    'Arrendado': 'bg-blue-500',
    'En proceso de venta': 'bg-yellow-500',
    'En proceso de arrendamiento': 'bg-orange-500'
  };
  return colores[estado] || 'bg-gray-500';
};

// Componente de búsqueda y filtros
const SearchBar = ({ searchTerm, setSearchTerm, filters, setFilters }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar inmueble por dirección, registro o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-3 text-sm flex-wrap">
        <div className="flex items-center gap-2 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtros:</span>
        </div>

        <select
          value={filters.estado}
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Vendido">Vendido</option>
          <option value="Arrendado">Arrendado</option>
          <option value="En proceso de venta">En proceso de venta</option>
          <option value="En proceso de arrendamiento">En proceso de arrendamiento</option>
        </select>

        <select
          value={filters.operacion}
          onChange={(e) => setFilters({ ...filters, operacion: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Todas">Todas las operaciones</option>
          <option value="Venta">Venta</option>
          <option value="Arriendo">Arriendo</option>
        </select>

        <select
          value={filters.tipo}
          onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Todos">Todos los tipos</option>
          <option value="Casa">Casa</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Apartaestudio">Apartaestudio</option>
          <option value="Finca">Finca</option>
          <option value="Lote">Lote</option>
          <option value="Oficina">Oficina</option>
        </select>
      </div>
    </div>
  );
};

// Modal genérico reutilizable con nuevo diseño
const ModalContainer = ({ isOpen, onClose, title, icon: Icon, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6" />}
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 px-8 py-5 bg-gray-50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Modal para visualizar detalles del inmueble
const VisualizarInmuebleModal = ({ isOpen, onClose, inmueble }) => {
  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Inmueble"
      icon={Eye}
      footer={
        <button
          onClick={onClose}
          className="w-full px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
        >
          Cerrar
        </button>
      }
    >
      {inmueble && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Información General</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Título</label>
                <p className="text-base text-gray-900 font-medium">{inmueble.titulo}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Registro</label>
                  <p className="text-base text-gray-900 font-mono font-medium">{inmueble.registro}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Tipo</label>
                  <p className="text-base text-gray-900 font-medium">{inmueble.tipo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Operación</label>
                  <p className="text-base text-gray-900 font-medium">{inmueble.operacion}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Precio</label>
                  <p className="text-base text-gray-900 font-medium">${inmueble.precio?.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Estado</label>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getEstadoColor(inmueble.estado)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${getEstadoDotColor(inmueble.estado)}`}></span>
                    {inmueble.estado}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Ciudad</label>
                  <p className="text-base text-gray-900 font-medium">{inmueble.ciudad}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Dirección</label>
                <p className="text-base text-gray-900 font-medium">{inmueble.direccion}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Comodidades</h3>
            <div className="grid grid-cols-2 gap-3">
              {inmueble.comodidades?.filter(c => c.seleccionada).map((comodidad, index) => (
                <div key={index} className="flex items-center justify-between gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                  <span className="text-sm text-gray-700 font-medium flex-1">{comodidad.nombre}</span>
                  <span className="ml-auto text-slate-600 font-semibold">{comodidad.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Propietario</h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nombre</label>
                <p className="text-base text-gray-900 font-medium">{inmueble.propietario?.nombre}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Email</label>
                <p className="text-base text-gray-900 font-medium">{inmueble.propietario?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Teléfono</label>
                <p className="text-base text-gray-900 font-medium">{inmueble.propietario?.telefono}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContainer>
  );
};

// Modal para ver fichas técnicas
const FichasTecnicasModal = ({ isOpen, onClose, inmueble, onVerFicha }) => {
  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Fichas Técnicas"
      icon={FileText}
      footer={
        <button
          onClick={onClose}
          className="w-full px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
        >
          Cerrar
        </button>
      }
    >
      {inmueble && (
        <div>
          <div className="mb-6 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Inmueble: <span className="font-semibold text-gray-900">{inmueble.titulo}</span></p>
            <p className="text-sm text-gray-600">Total de fichas: <span className="font-semibold text-gray-900">{inmueble.fichasTecnicas?.length || 0}</span></p>
          </div>

          <div className="space-y-3">
            {inmueble.fichasTecnicas?.map((ficha, index) => (
              <div key={ficha.id} className="border border-gray-200 rounded-lg p-4 hover:border-slate-400 hover:bg-slate-50 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">Versión {ficha.version}</span>
                      {index === 0 && (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                          Reciente
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{ficha.fecha}</span>
                    </div>
                    <p className="text-sm text-gray-700">{ficha.cambios}</p>
                  </div>
                  <button
                    onClick={() => onVerFicha(ficha)}
                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold whitespace-nowrap"
                  >
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ModalContainer>
  );
};

// Modal para ver una ficha técnica específica
const VerFichaTecnicaModal = ({ isOpen, onClose, inmueble, ficha }) => {
  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Técnica"
      icon={FileText}
      footer={
        <button
          onClick={onClose}
          className="w-full px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
        >
          Cerrar
        </button>
      }
    >
      {inmueble && ficha && (
        <div className="space-y-6">
          <div className="bg-slate-100 border-l-4 border-slate-600 rounded-lg p-4">
            <h3 className="text-base font-bold text-gray-900 mb-2">{inmueble.titulo}</h3>
            <p className="text-xs text-gray-600">Registro: {inmueble.registro}</p>
            <p className="text-xs text-gray-600 mt-1">Versión {ficha.version} - {ficha.fecha}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wide">Información del Inmueble</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Tipo</label>
                <p className="text-sm font-medium text-gray-900">{inmueble.tipo}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Operación</label>
                <p className="text-sm font-medium text-gray-900">{inmueble.operacion}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Precio</label>
                <p className="text-sm font-medium text-gray-900">${inmueble.precio?.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Estado</label>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getEstadoColor(inmueble.estado)}`}>
                  {inmueble.estado}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wide">Ubicación</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Ciudad</label>
                <p className="text-sm font-medium text-gray-900">{inmueble.ciudad}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Dirección</label>
                <p className="text-sm font-medium text-gray-900">{inmueble.direccion}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wide">Comodidades</h4>
            <div className="grid grid-cols-2 gap-3">
              {inmueble.comodidades?.filter(c => c.seleccionada).map((comodidad, index) => (
                <div key={index} className="flex items-center justify-between gap-3 bg-slate-50 rounded p-3 border border-slate-200">
                  <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                  <span className="text-sm text-gray-700 font-medium flex-1">{comodidad.nombre}</span>
                  <span className="ml-auto text-slate-600 font-bold">{comodidad.cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-4 uppercase tracking-wide">Propietario</h4>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Nombre</label>
                <p className="text-sm font-medium text-gray-900">{inmueble.propietario?.nombre}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Email</label>
                <p className="text-sm font-medium text-gray-900">{inmueble.propietario?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Teléfono</label>
                <p className="text-sm font-medium text-gray-900">{inmueble.propietario?.telefono}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContainer>
  );
};

// Componente de botones de acción
const ActionButtons = ({ onView, onEdit, onDocument }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onView}
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group relative"
      >
        <Eye className="w-5 h-5" />
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Ver detalle
        </span>
      </button>
      <button
        onClick={onEdit}
        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all group relative"
      >
        <Edit className="w-5 h-5" />
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Editar
        </span>
      </button>
      <button
        onClick={onDocument}
        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all group relative"
      >
        <FileText className="w-5 h-5" />
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Fichas técnicas
        </span>
      </button>
    </div>
  );
};

// Componente de paginación
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
        }`}
      >
        Anterior
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === page
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg font-medium transition-all ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
        }`}
      >
        Siguiente
      </button>
    </div>
  );
};

// Componente de tabla de inmuebles
const PropertyTable = ({ properties, onToggleStatus, onView, onEdit, onDocument }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registro</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dirección</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Operación</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Building2 className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">No se encontraron inmuebles</p>
                    <p className="text-sm text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">#{property.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">{property.registro}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{property.direccion}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {property.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{property.operacion}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(property.estado)}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${getEstadoDotColor(property.estado)}`}></span>
                      {property.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ActionButtons
                      onView={() => onView(property)}
                      onEdit={() => onEdit(property)}
                      onDocument={() => onDocument(property)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Modal para agregar/editar inmueble
const AgregarInmuebleModal = ({ isOpen, onClose, onSave, inmuebleEditar = null }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    tipoInmueble: 'Casa',
    tipoOperacion: 'Venta',
    precio: '',
    ciudad: '',
    direccion: '',
    estado: 'Disponible'
  });

  const [comodidades, setComodidades] = useState([]);
  const [nuevaComodidad, setNuevaComodidad] = useState('');
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState('');
  const [mostrarFormPropietario, setMostrarFormPropietario] = useState(false);
  const [nuevoPropietario, setNuevoPropietario] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  React.useEffect(() => {
    if (inmuebleEditar) {
      setFormData({
        titulo: inmuebleEditar.titulo || '',
        tipoInmueble: inmuebleEditar.tipo || 'Casa',
        tipoOperacion: inmuebleEditar.operacion || 'Venta',
        precio: inmuebleEditar.precio || '',
        ciudad: inmuebleEditar.ciudad || '',
        direccion: inmuebleEditar.direccion || '',
        estado: inmuebleEditar.estado || 'Disponible'
      });
      
      if (inmuebleEditar.comodidades) {
        setComodidades(inmuebleEditar.comodidades);
      }
      
      if (inmuebleEditar.propietario) {
        setPropietarioSeleccionado(inmuebleEditar.propietario.id || '');
      }
    } else {
      setFormData({
        titulo: '',
        tipoInmueble: 'Casa',
        tipoOperacion: 'Venta',
        precio: '',
        ciudad: '',
        direccion: '',
        estado: 'Disponible'
      });
      setComodidades([]);
      setPropietarioSeleccionado('');
      setMostrarFormPropietario(false);
      setNuevoPropietario({ nombre: '', email: '', telefono: '' });
    }
  }, [inmuebleEditar, isOpen]);

  React.useEffect(() => {
    if (!inmuebleEditar) {
      const comodidadesDefault = COMODIDADES_POR_TIPO[formData.tipoInmueble] || [];
      setComodidades(comodidadesDefault.map(c => ({ nombre: c, cantidad: 1, seleccionada: false })));
    }
  }, [formData.tipoInmueble, inmuebleEditar]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleComodidad = (index) => {
    const nuevasComodidades = [...comodidades];
    nuevasComodidades[index].seleccionada = !nuevasComodidades[index].seleccionada;
    setComodidades(nuevasComodidades);
  };

  const actualizarCantidadComodidad = (index, cantidad) => {
    const nuevasComodidades = [...comodidades];
    nuevasComodidades[index].cantidad = parseInt(cantidad) || 1;
    setComodidades(nuevasComodidades);
  };

  const agregarComodidadPersonalizada = () => {
    if (nuevaComodidad.trim()) {
      setComodidades([...comodidades, { nombre: nuevaComodidad, cantidad: 1, seleccionada: true }]);
      setNuevaComodidad('');
    }
  };

  const eliminarComodidad = (index) => {
    setComodidades(comodidades.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const comodidadesSeleccionadas = comodidades.filter(c => c.seleccionada);
    
    const inmuebleData = {
      ...formData,
      comodidades: comodidadesSeleccionadas,
      propietario: propietarioSeleccionado ? 
        PROPIETARIOS_EJEMPLO.find(p => p.id === parseInt(propietarioSeleccionado)) : 
        nuevoPropietario,
      id: inmuebleEditar?.id
    };
    
    onSave(inmuebleData, !!inmuebleEditar);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarComodidadPersonalizada();
    }
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={inmuebleEditar ? 'Editar Inmueble' : 'Agregar Nuevo Inmueble'}
      icon={Building2}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-semibold"
          >
            {inmuebleEditar ? 'Actualizar Inmueble' : 'Guardar Inmueble'}
          </button>
        </div>
      }
    >
      <form className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Información Básica</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Título del Inmueble *</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                placeholder="Ej: Casa moderna en El Poblado"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Tipo de Inmueble *</label>
                <select
                  name="tipoInmueble"
                  value={formData.tipoInmueble}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                >
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Apartaestudio">Apartaestudio</option>
                  <option value="Finca">Finca</option>
                  <option value="Lote">Lote</option>
                  <option value="Oficina">Oficina</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Tipo de Operación *</label>
                <select
                  name="tipoOperacion"
                  value={formData.tipoOperacion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                >
                  <option value="Venta">Venta</option>
                  <option value="Arriendo">Arriendo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Estado *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Arrendado">Arrendado</option>
                  <option value="En proceso de venta">En proceso de venta</option>
                  <option value="En proceso de arrendamiento">En proceso de arrendamiento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Precio *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Ciudad *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                  placeholder="Ej: Medellín"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">Dirección *</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                placeholder="Ej: Carrera 43A #12-45"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Comodidades</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              {comodidades.map((comodidad, index) => (
                <div
                  key={index}
                  className={`relative flex items-center gap-2 p-3 rounded border transition-all text-sm ${
                    comodidad.seleccionada ? 'border-slate-500 bg-slate-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={comodidad.seleccionada}
                    onChange={() => toggleComodidad(index)}
                    className="w-4 h-4 text-slate-600 rounded focus:ring-2 focus:ring-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="font-medium text-gray-700 cursor-pointer truncate text-xs">
                      {comodidad.nombre}
                    </label>
                    {comodidad.seleccionada && (
                      <input
                        type="number"
                        min="1"
                        value={comodidad.cantidad}
                        onChange={(e) => actualizarCantidadComodidad(index, e.target.value)}
                        className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-600"
                        placeholder="Cant."
                      />
                    )}
                  </div>
                  {!COMODIDADES_POR_TIPO[formData.tipoInmueble]?.includes(comodidad.nombre) && (
                    <button
                      type="button"
                      onClick={() => eliminarComodidad(index)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaComodidad}
              onChange={(e) => setNuevaComodidad(e.target.value)}
              placeholder="Agregar comodidad personalizada..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
              onKeyPress={handleKeyPress}
            />
            <button
              type="button"
              onClick={agregarComodidadPersonalizada}
              className="px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Propietario</h3>

          <div className="space-y-3">
            {!mostrarFormPropietario ? (
              <>
                <select
                  value={propietarioSeleccionado}
                  onChange={(e) => setPropietarioSeleccionado(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                >
                  <option value="">Seleccionar propietario existente</option>
                  {PROPIETARIOS_EJEMPLO.map(prop => (
                    <option key={prop.id} value={prop.id}>
                      {prop.nombre} - {prop.email}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setMostrarFormPropietario(true)}
                  className="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-slate-600 hover:text-slate-600 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <UserPlus className="w-4 h-4" />
                  Crear nuevo propietario
                </button>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm">Nuevo Propietario</h4>
                  <button
                    type="button"
                    onClick={() => setMostrarFormPropietario(false)}
                    className="text-xs text-gray-600 hover:text-gray-900 font-semibold"
                  >
                    Cancelar
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Nombre completo *"
                  value={nuevoPropietario.nombre}
                  onChange={(e) => setNuevoPropietario({ ...nuevoPropietario, nombre: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                />

                <input
                  type="email"
                  placeholder="Email *"
                  value={nuevoPropietario.email}
                  onChange={(e) => setNuevoPropietario({ ...nuevoPropietario, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                />

                <input
                  type="tel"
                  placeholder="Teléfono *"
                  value={nuevoPropietario.telefono}
                  onChange={(e) => setNuevoPropietario({ ...nuevoPropietario, telefono: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </form>
    </ModalContainer>
  );
};

// Componente principal
const InmueblesDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    estado: 'Todos',
    operacion: 'Todas',
    tipo: 'Todos'
  });
  const [properties, setProperties] = useState(SAMPLE_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisualizarOpen, setModalVisualizarOpen] = useState(false);
  const [modalFichasOpen, setModalFichasOpen] = useState(false);
  const [modalFichaTecnicaOpen, setModalFichaTecnicaOpen] = useState(false);
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null);
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [inmuebleEditar, setInmuebleEditar] = useState(null);
  const itemsPerPage = 5;

  const handleToggleStatus = (id) => {
    setProperties(properties.map(property =>
      property.id === id
        ? { ...property, estado: property.estado === 'Activo' ? 'Inactivo' : 'Activo' }
        : property
    ));
  };

  const handleSaveInmueble = (inmuebleData, esEdicion) => {
    if (esEdicion) {
      setProperties(properties.map(prop => {
        if (prop.id === inmuebleData.id) {
          const nuevaFicha = {
            id: (prop.fichasTecnicas?.length || 0) + 1,
            fecha: new Date().toISOString().split('T')[0],
            version: (prop.fichasTecnicas?.length || 0) + 1,
            cambios: 'Actualización de información'
          };
          
          return {
            ...prop,
            titulo: inmuebleData.titulo,
            tipo: inmuebleData.tipoInmueble,
            operacion: inmuebleData.tipoOperacion,
            precio: parseInt(inmuebleData.precio),
            ciudad: inmuebleData.ciudad,
            direccion: inmuebleData.direccion,
            estado: inmuebleData.estado,
            comodidades: inmuebleData.comodidades,
            propietario: inmuebleData.propietario,
            fichasTecnicas: [nuevaFicha, ...(prop.fichasTecnicas || [])]
          };
        }
        return prop;
      }));
    } else {
      const nuevoInmueble = {
        id: properties.length + 1,
        registro: `INM-2024-${String(properties.length + 1).padStart(3, '0')}`,
        titulo: inmuebleData.titulo,
        direccion: inmuebleData.direccion,
        tipo: inmuebleData.tipoInmueble,
        operacion: inmuebleData.tipoOperacion,
        precio: parseInt(inmuebleData.precio),
        ciudad: inmuebleData.ciudad,
        estado: inmuebleData.estado,
        comodidades: inmuebleData.comodidades,
        propietario: inmuebleData.propietario,
        fichasTecnicas: [
          {
            id: 1,
            fecha: new Date().toISOString().split('T')[0],
            version: 1,
            cambios: 'Creación inicial'
          }
        ]
      };
      
      setProperties([...properties, nuevoInmueble]);
    }
  };

  const handleVerDetalle = (inmueble) => {
    setInmuebleSeleccionado(inmueble);
    setModalVisualizarOpen(true);
  };

  const handleEditar = (inmueble) => {
    setInmuebleEditar(inmueble);
    setIsModalOpen(true);
  };

  const handleVerFichas = (inmueble) => {
    setInmuebleSeleccionado(inmueble);
    setModalFichasOpen(true);
  };

  const handleVerFichaTecnica = (ficha) => {
    setFichaSeleccionada(ficha);
    setModalFichasOpen(false);
    setModalFichaTecnicaOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInmuebleEditar(null);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.registro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.titulo && property.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEstado = filters.estado === 'Todos' || property.estado === filters.estado;
    const matchesOperacion = filters.operacion === 'Todas' || property.operacion === filters.operacion;
    const matchesTipo = filters.tipo === 'Todos' || property.tipo === filters.tipo;

    return matchesSearch && matchesEstado && matchesOperacion && matchesTipo;
  });

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  return (
    <>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Inmuebles</h1>
                <p className="text-gray-600 mt-1">
                  Administra los inmuebles registrados para venta o alquiler
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setInmuebleEditar(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Agregar Inmueble
            </button>
          </div>

          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
          />

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">{filteredProperties.length}</span> resultados
              {filteredProperties.length > 0 && (
                <span className="ml-2 text-gray-400">
                  (Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)})
                </span>
              )}
            </p>
          </div>

          <PropertyTable
            properties={currentProperties}
            onToggleStatus={handleToggleStatus}
            onView={handleVerDetalle}
            onEdit={handleEditar}
            onDocument={handleVerFichas}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </DashboardLayout>

      <AgregarInmuebleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveInmueble}
        inmuebleEditar={inmuebleEditar}
      />

      <VisualizarInmuebleModal
        isOpen={modalVisualizarOpen}
        onClose={() => setModalVisualizarOpen(false)}
        inmueble={inmuebleSeleccionado}
      />

      <FichasTecnicasModal
        isOpen={modalFichasOpen}
        onClose={() => setModalFichasOpen(false)}
        inmueble={inmuebleSeleccionado}
        onVerFicha={handleVerFichaTecnica}
      />

      <VerFichaTecnicaModal
        isOpen={modalFichaTecnicaOpen}
        onClose={() => {
          setModalFichaTecnicaOpen(false);
          setModalFichasOpen(true);
        }}
        inmueble={inmuebleSeleccionado}
        ficha={fichaSeleccionada}
      />
    </>
  );
};

export default InmueblesDashboardPage;