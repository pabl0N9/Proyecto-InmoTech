import React, { useState } from 'react';
import { Eye, Edit, X, Building2, User } from 'lucide-react';
import DashboardLayout from '../../../../shared/components/dashboard/Layout/DashboardLayout';
import OwnerForm from './components/ownerForm';

const PropertyOwnersManagement = () => {
  const [owners, setOwners] = useState([
    {
      id: 1,
      registro: 'PROP-2024-001',
      nombre: 'Juan Pérez García',
      documento: '1234567890',
      email: 'juan.perez@email.com',
      telefono: '+57 300 123 4567',
      ciudad: 'Medellín',
      direccion: 'Carrera 70 #45-23, El Poblado',
      estado: 'Activo',
      cantidadInmuebles: 3,
      inmuebles: [
        {
          titulo: 'Apartamento moderno en El Poblado',
          tipo: 'Apartamento',
          operacion: 'Arriendo',
          estado: 'Disponible',
          precio: '$2,500,000',
          ciudad: 'Medellín',
          direccion: 'Carrera 43A #12-45, El Poblado'
        },
        {
          titulo: 'Casa campestre con vista',
          tipo: 'Casa',
          operacion: 'Venta',
          estado: 'En proceso de venta',
          precio: '$450,000,000',
          ciudad: 'Envigado',
          direccion: 'Vereda Las Palmas, Km 3'
        },
        {
          titulo: 'Oficina centro empresarial',
          tipo: 'Oficina',
          operacion: 'Arriendo',
          estado: 'Disponible',
          precio: '$3,200,000',
          ciudad: 'Medellín',
          direccion: 'Calle 7 Sur #42-70, El Poblado'
        }
      ]
    },
    // ... resto de propietarios (igual que antes)
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos los estados');
  const [filterCantidad, setFilterCantidad] = useState('Todas las cantidades');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [alert, setAlert] = useState({
    show: false,
    type: '',
    message: ''
  });

  const [availableInmuebles] = useState([
    {
      id: 'INM-001',
      titulo: 'Apartamento nuevo en Sabaneta',
      tipo: 'Apartamento',
      operacion: 'Arriendo',
      estado: 'Disponible',
      precio: '$1,800,000',
      ciudad: 'Sabaneta',
      direccion: 'Carrera 45 #50-20'
    },
    // ... resto de inmuebles disponibles
  ]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.documento.includes(searchTerm) ||
                         owner.registro.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'Todos los estados' || owner.estado === filterEstado;
    const matchesCantidad = filterCantidad === 'Todas las cantidades' || 
                           (filterCantidad === '1' && owner.cantidadInmuebles === 1) ||
                           (filterCantidad === '2-3' && owner.cantidadInmuebles >= 2 && owner.cantidadInmuebles <= 3) ||
                           (filterCantidad === '4+' && owner.cantidadInmuebles >= 4);
    return matchesSearch && matchesEstado && matchesCantidad;
  });

  const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOwners = filteredOwners.slice(startIndex, endIndex);

  const openModal = (mode, owner = null) => {
    setModalMode(mode);
    setSelectedOwner(owner);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOwner(null);
  };

  const handleSubmitOwner = (formData, selectedInmuebles) => {
    if (modalMode === 'create') {
      const newOwner = {
        id: owners.length + 1,
        registro: `PROP-2024-${String(owners.length + 1).padStart(3, '0')}`,
        ...formData,
        cantidadInmuebles: selectedInmuebles.length,
        inmuebles: selectedInmuebles
      };
      setOwners([...owners, newOwner]);
      showAlert('success', `¡Propietario "${formData.nombre}" creado exitosamente!`);
    } else if (modalMode === 'edit') {
      setOwners(owners.map(owner => 
        owner.id === selectedOwner.id 
          ? { 
              ...owner, 
              ...formData, 
              cantidadInmuebles: selectedInmuebles.length,
              inmuebles: selectedInmuebles 
            }
          : owner
      ));
      showAlert('info', `Los cambios en "${formData.nombre}" se guardaron correctamente.`);
    }
    closeModal();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-2">
        {/* Alert */}
        {alert.show && (
          <div className="fixed top-4 right-4 z-[70] animate-slide-in">
            <div className={`rounded-lg shadow-lg p-3 flex items-start gap-2 max-w-sm text-sm ${
              alert.type === 'success' 
                ? 'bg-green-50 border-l-4 border-green-500' 
                : 'bg-blue-50 border-l-4 border-blue-500'
            }`}>
              <div className="flex-shrink-0">
                {alert.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  alert.type === 'success' ? 'text-green-800' : 'text-blue-800'
                }`}>
                  {alert.type === 'success' ? '¡Éxito!' : 'Información'}
                </h3>
                <p className={`text-xs mt-0.5 ${
                  alert.type === 'success' ? 'text-green-700' : 'text-blue-700'
                }`}>
                  {alert.message}
                </p>
              </div>
              <button
                onClick={() => setAlert({ show: false, type: '', message: '' })}
                className={`flex-shrink-0 rounded p-1 hover:bg-white/50 transition-colors ${
                  alert.type === 'success' ? 'text-green-500' : 'text-blue-500'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Gestión de Propietarios</h1>
              <p className="text-sm text-gray-600">Administra los propietarios registrados</p>
            </div>
          </div>
          <button
            onClick={() => openModal('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg transition-colors text-sm"
          >
            <span className="text-lg">+</span> Agregar Propietario
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar propietario por nombre, documento o registro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros:
            </span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Todos los estados</option>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
            <select
              value={filterCantidad}
              onChange={(e) => setFilterCantidad(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Todas las cantidades</option>
              <option value="1">1 inmueble</option>
              <option value="2-3">2-3 inmuebles</option>
              <option value="4+">4+ inmuebles</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-3 text-sm">
          <span className="text-blue-600 font-semibold">{filteredOwners.length}</span>
          <span className="text-gray-600"> resultados (Mostrando {startIndex + 1}-{Math.min(endIndex, filteredOwners.length)})</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registro</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contacto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inmuebles</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentOwners.map((owner, index) => (
                  <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">#{startIndex + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{owner.registro}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{owner.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{owner.documento}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="text-xs">{owner.email}</div>
                      <div className="text-xs text-gray-500">{owner.telefono}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-gray-500" />
                        <span className="font-semibold text-gray-900 text-sm">{owner.cantidadInmuebles}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        owner.estado === 'Activo' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {owner.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal('view', owner)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => openModal('edit', owner)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 p-3 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2 py-1 text-sm rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Owner Form Modal */}
      {modalOpen && (
        <OwnerForm
          isOpen={modalOpen}
          mode={modalMode}
          selectedOwner={selectedOwner}
          availableInmuebles={availableInmuebles}
          onClose={closeModal}
          onSubmit={handleSubmitOwner}
        />
      )}
    </DashboardLayout>
  );
};

export default PropertyOwnersManagement;

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);