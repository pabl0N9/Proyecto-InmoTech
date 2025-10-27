import React, { useState } from 'react';
import { User, X, Mail, Phone, MapPin, Home, Building2, Eye } from 'lucide-react';

const OwnerForm = ({ 
  isOpen, 
  mode, 
  selectedOwner, 
  availableInmuebles, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    nombre: selectedOwner?.nombre || '',
    documento: selectedOwner?.documento || '',
    email: selectedOwner?.email || '',
    telefono: selectedOwner?.telefono || '',
    ciudad: selectedOwner?.ciudad || '',
    direccion: selectedOwner?.direccion || '',
    estado: selectedOwner?.estado || 'Activo'
  });

  const [selectedInmuebles, setSelectedInmuebles] = useState(selectedOwner?.inmuebles || []);
  const [showInmuebleModal, setShowInmuebleModal] = useState(false);
  const [inmuebleFormMode, setInmuebleFormMode] = useState('assign');
  const [newInmueble, setNewInmueble] = useState({
    titulo: '',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    estado: 'Disponible',
    precio: '',
    ciudad: '',
    direccion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData, selectedInmuebles);
  };

  const toggleInmuebleSelection = (inmueble) => {
    const isSelected = selectedInmuebles.some(i => i.id === inmueble.id);
    if (isSelected) {
      setSelectedInmuebles(selectedInmuebles.filter(i => i.id !== inmueble.id));
    } else {
      setSelectedInmuebles([...selectedInmuebles, inmueble]);
    }
  };

  const handleCreateInmueble = () => {
    const inmuebleWithId = {
      id: `INM-NEW-${Date.now()}`,
      ...newInmueble
    };
    setSelectedInmuebles([...selectedInmuebles, inmuebleWithId]);
    setNewInmueble({
      titulo: '',
      tipo: 'Apartamento',
      operacion: 'Arriendo',
      estado: 'Disponible',
      precio: '',
      ciudad: '',
      direccion: ''
    });
    setShowInmuebleModal(false);
  };

  const removeInmueble = (inmuebleId) => {
    setSelectedInmuebles(selectedInmuebles.filter(i => i.id !== inmuebleId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-slate-700 text-white p-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              {mode === 'view' ? 'Detalles del Propietario' : 
               mode === 'edit' ? 'Editar Propietario' : 
               'Agregar Nuevo Propietario'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4">
          {mode === 'view' ? (
            <ViewModeContent selectedOwner={selectedOwner} />
          ) : (
            <EditModeContent
              formData={formData}
              onInputChange={handleInputChange}
              mode={mode}
              selectedInmuebles={selectedInmuebles}
              onShowInmuebleModal={(mode) => {
                setInmuebleFormMode(mode);
                setShowInmuebleModal(true);
              }}
              onRemoveInmueble={removeInmueble}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors text-sm"
          >
            {mode === 'view' ? 'Cerrar' : 'Cancelar'}
          </button>
          {mode !== 'view' && (
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 font-medium transition-colors text-sm"
            >
              {mode === 'edit' ? 'Guardar Cambios' : 'Guardar Propietario'}
            </button>
          )}
        </div>
      </div>

      {/* Inmueble Modal */}
      {showInmuebleModal && (
        <InmuebleModal
          mode={inmuebleFormMode}
          availableInmuebles={availableInmuebles}
          selectedInmuebles={selectedInmuebles}
          newInmueble={newInmueble}
          onNewInmuebleChange={(e) => {
            const { name, value } = e.target;
            setNewInmueble(prev => ({ ...prev, [name]: value }));
          }}
          onToggleInmuebleSelection={toggleInmuebleSelection}
          onCreateInmueble={handleCreateInmueble}
          onClose={() => setShowInmuebleModal(false)}
        />
      )}
    </div>
  );
};

// Componente para modo visualización
const ViewModeContent = ({ selectedOwner }) => (
  <div className="space-y-4">
    {/* Información del Propietario */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Información del Propietario
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
            Registro
          </label>
          <p className="text-gray-900 font-medium text-sm">{selectedOwner?.registro}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
            Estado
          </label>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            selectedOwner?.estado === 'Activo' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {selectedOwner?.estado}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
          Nombre Completo
        </label>
        <p className="text-gray-900 font-medium text-sm">{selectedOwner?.nombre}</p>
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
          Documento de Identidad
        </label>
        <p className="text-gray-900 text-sm">{selectedOwner?.documento}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Email
          </label>
          <p className="text-gray-900 text-xs">{selectedOwner?.email}</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1 flex items-center gap-1">
            <Phone className="w-3 h-3" /> Teléfono
          </label>
          <p className="text-gray-900 text-xs">{selectedOwner?.telefono}</p>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Ciudad
        </label>
        <p className="text-gray-900 text-sm">{selectedOwner?.ciudad}</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1 flex items-center gap-1">
          <Home className="w-3 h-3" /> Dirección
        </label>
        <p className="text-gray-900 text-sm">{selectedOwner?.direccion}</p>
      </div>
    </div>

    {/* Inmuebles del Propietario */}
    <InmueblesSection selectedOwner={selectedOwner} />
  </div>
);

// Componente para modo edición/creación
const EditModeContent = ({
  formData,
  onInputChange,
  mode,
  selectedInmuebles,
  onShowInmuebleModal,
  onRemoveInmueble
}) => (
  <div className="space-y-3">
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
        Nombre Completo *
      </label>
      <input
        type="text"
        name="nombre"
        value={formData.nombre}
        onChange={onInputChange}
        placeholder="Ej: Juan Pérez García"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
        Documento de Identidad *
      </label>
      <input
        type="text"
        name="documento"
        value={formData.documento}
        onChange={onInputChange}
        placeholder="Ej: 1234567890"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          placeholder="ejemplo@email.com"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Teléfono *
        </label>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={onInputChange}
          placeholder="+57 300 123 4567"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
        Estado *
      </label>
      <select
        name="estado"
        value={formData.estado}
        onChange={onInputChange}
        disabled={mode === 'edit' && selectedInmuebles.length > 0}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option>Activo</option>
        <option>Inactivo</option>
      </select>
      {mode === 'edit' && selectedInmuebles.length > 0 && (
        <p className="text-xs text-amber-600 mt-1">
          ⚠️ No se puede cambiar a Inactivo mientras tenga inmuebles asignados
        </p>
      )}
    </div>

    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
        Ciudad *
      </label>
      <input
        type="text"
        name="ciudad"
        value={formData.ciudad}
        onChange={onInputChange}
        placeholder="Ej: Medellín"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
        Dirección *
      </label>
      <input
        type="text"
        name="direccion"
        value={formData.direccion}
        onChange={onInputChange}
        placeholder="Ej: Carrera 70 #45-23"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    {/* Sección de Inmuebles */}
    <div className="border-t border-gray-200 pt-3 mt-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Inmuebles Asignados ({selectedInmuebles.length})
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onShowInmuebleModal('assign')}
            className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            + Asignar Existente
          </button>
          <button
            type="button"
            onClick={() => onShowInmuebleModal('create')}
            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
          >
            + Crear Nuevo
          </button>
        </div>
      </div>

      {selectedInmuebles.length > 0 ? (
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {selectedInmuebles.map((inmueble) => (
            <div key={inmueble.id} className="bg-gray-50 border border-gray-200 rounded p-2 flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-xs">{inmueble.titulo}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {inmueble.tipo} · {inmueble.operacion} · {inmueble.precio}
                </p>
                <p className="text-xs text-gray-500">{inmueble.direccion}, {inmueble.ciudad}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveInmueble(inmueble.id)}
                className="ml-1 p-0.5 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded p-3 text-center">
          <Building2 className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600">No hay inmuebles asignados</p>
          <p className="text-xs text-gray-500">Asigna o crea inmuebles para este propietario</p>
        </div>
      )}
    </div>
  </div>
);

// Componente para sección de inmuebles
const InmueblesSection = ({ selectedOwner }) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        Inmuebles Registrados
      </h3>
      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
        {selectedOwner?.cantidadInmuebles} {selectedOwner?.cantidadInmuebles === 1 ? 'Inmueble' : 'Inmuebles'}
      </span>
    </div>

    <div className="space-y-2">
      {selectedOwner?.inmuebles?.map((inmueble, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm flex-1">{inmueble.titulo}</h4>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
              inmueble.estado === 'Disponible' 
                ? 'bg-green-100 text-green-700' 
                : inmueble.estado === 'Arrendado'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {inmueble.estado}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex items-center gap-1 text-xs">
              <Building2 className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">
                <span className="font-medium">Tipo:</span> {inmueble.tipo}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-700">
                <span className="font-medium">Operación:</span> {inmueble.operacion}
              </span>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">
                <span className="font-medium">Ubicación:</span> {inmueble.direccion}, {inmueble.ciudad}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-semibold uppercase">Precio</span>
              <span className="text-base font-bold text-blue-600">{inmueble.precio}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Componente para modal de inmuebles
const InmuebleModal = ({
  mode,
  availableInmuebles,
  selectedInmuebles,
  newInmueble,
  onNewInmuebleChange,
  onToggleInmuebleSelection,
  onCreateInmueble,
  onClose
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-3">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
      <div className="bg-slate-700 text-white p-4 flex items-center justify-between rounded-t-xl">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          <h2 className="text-lg font-semibold">
            {mode === 'assign' ? 'Asignar Inmueble Existente' : 'Crear Nuevo Inmueble'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-600 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        {mode === 'assign' ? (
          <div className="space-y-2">
            {availableInmuebles.filter(inmueble => 
              !selectedInmuebles.some(s => s.id === inmueble.id)
            ).length > 0 ? (
              availableInmuebles
                .filter(inmueble => !selectedInmuebles.some(s => s.id === inmueble.id))
                .map((inmueble) => (
                  <div
                    key={inmueble.id}
                    onClick={() => onToggleInmuebleSelection(inmueble)}
                    className="border border-gray-200 rounded p-3 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{inmueble.titulo}</h4>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Tipo:</span> {inmueble.tipo}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Operación:</span> {inmueble.operacion}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Ubicación:</span> {inmueble.direccion}, {inmueble.ciudad}
                        </p>
                        <p className="text-base font-bold text-blue-600 mt-1">{inmueble.precio}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ml-1 ${
                        inmueble.estado === 'Disponible' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {inmueble.estado}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-6">
                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No hay inmuebles disponibles para asignar</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Título del Inmueble *
              </label>
              <input
                type="text"
                name="titulo"
                value={newInmueble.titulo}
                onChange={onNewInmuebleChange}
                placeholder="Ej: Casa moderna en El Poblado"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Tipo de Inmueble *
                </label>
                <select
                  name="tipo"
                  value={newInmueble.tipo}
                  onChange={onNewInmuebleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Apartamento</option>
                  <option>Casa</option>
                  <option>Oficina</option>
                  <option>Local</option>
                  <option>Bodega</option>
                  <option>Consultorio</option>
                  <option>Finca</option>
                  <option>Lote</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Tipo de Operación *
                </label>
                <select
                  name="operacion"
                  value={newInmueble.operacion}
                  onChange={onNewInmuebleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Arriendo</option>
                  <option>Venta</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Estado *
                </label>
                <select
                  name="estado"
                  value={newInmueble.estado}
                  onChange={onNewInmuebleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Disponible</option>
                  <option>Arrendado</option>
                  <option>En proceso de venta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                  Precio *
                </label>
                <input
                  type="text"
                  name="precio"
                  value={newInmueble.precio}
                  onChange={onNewInmuebleChange}
                  placeholder="Ej: $2,500,000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Ciudad *
              </label>
              <input
                type="text"
                name="ciudad"
                value={newInmueble.ciudad}
                onChange={onNewInmuebleChange}
                placeholder="Ej: Medellín"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Dirección *
              </label>
              <input
                type="text"
                name="direccion"
                value={newInmueble.direccion}
                onChange={onNewInmuebleChange}
                placeholder="Ej: Carrera 43A #12-45"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 p-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 font-medium transition-colors text-sm"
        >
          Cancelar
        </button>
        {mode === 'create' && (
          <button
            onClick={onCreateInmueble}
            disabled={!newInmueble.titulo || !newInmueble.precio || !newInmueble.ciudad || !newInmueble.direccion}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 font-medium transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Crear y Asignar
          </button>
        )}
      </div>
    </div>
  </div>
);

export default OwnerForm;