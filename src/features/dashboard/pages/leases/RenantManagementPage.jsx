import React, { useState, useRef } from "react";
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { FaUserPlus, FaEye, FaEdit, FaTrash, FaSearch, FaHome, FaCalendar, FaDollarSign } from "react-icons/fa";
import { Plus, Search, Filter, Eye, Edit, Trash2, Home, Calendar, DollarSign, Users } from 'lucide-react';
import RenantForm from "../../components/leases/RenantForm";
import EditRenantForm from "../../components/leases/EditRenantForm";
import ViewRenant from "../../components/leases/ViewRenant"; 
import "../../../../shared/styles/globals.css";

export function RenantManagementPage() {
  const [arriendos, setArriendos] = useState([
    {
      id: 1,
      tipoDocInquilino: "CC",
      numeroDocInquilino: "1036000001",
      primerNombreInquilino: "Juan",
      primerApellidoInquilino: "Pérez",
      telefonoInquilino: "3001111111",
      correoInquilino: "juan.perez@example.com",
      tipoDocCodeudor: "CC",
      numeroDocCodeudor: "70000001",
      primerNombreCodeudor: "Ana",
      primerApellidoCodeudor: "Gómez",
      telefonoCodeudor: "3002222222",
      correoCodeudor: "ana.gomez@example.com",
      estabilidadLaboral: "Empleado",
      tipoInmueble: "Casa",
      registroInmobiliario: "110010123456",
      nombreInmueble: "Casa Moderna",
      area: 120,
      habitaciones: 3,
      banos: 2,
      departamento: "Antioquia",
      ciudad: "Medellín",
      barrio: "Poblado",
      estrato: 5,
      direccion: "Carrera 40 # 10-25",
      precioInmueble: "250.000.000 $",
      fechaInicio: "22/05/2025",
      fechaFinal: "22/05/2026",
      fechaCobro: 27,
      precio: "2.500.000 $",
      estado: "Pagado",
      fechaLimite: "27/05/2025",
      valorMensual: "2.500.000 $",
    },
    {
      id: 2,
      tipoDocInquilino: "CE",
      numeroDocInquilino: "80000002",
      primerNombreInquilino: "Carlos",
      primerApellidoInquilino: "Vásquez",
      telefonoInquilino: "3003333333",
      correoInquilino: "carlos.v@example.com",
      tipoDocCodeudor: "NIT",
      numeroDocCodeudor: "900000000-1",
      primerNombreCodeudor: "Empresa",
      primerApellidoCodeudor: "XYZ",
      telefonoCodeudor: "6045555555",
      correoCodeudor: "info@xyz.com",
      estabilidadLaboral: "Independiente",
      tipoInmueble: "Apartamento",
      registroInmobiliario: "760010789012",
      nombreInmueble: "Apartamento Central",
      area: 75,
      habitaciones: 2,
      banos: 1,
      departamento: "Valle del Cauca",
      ciudad: "Cali",
      barrio: "Granada",
      estrato: 4,
      direccion: "Calle 10 # 5-10",
      precioInmueble: "150.000.000 $",
      fechaInicio: "10/10/2025",
      fechaFinal: "10/10/2026",
      fechaCobro: 15,
      precio: "3.000.000 $",
      estado: "Pendiente",
      fechaLimite: "15/10/2025",
      valorMensual: "3.000.000 $",
    },
  ]);

  const idCounter = useRef(arriendos.length + 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRent, setEditingRent] = useState(null);
  const [viewingRent, setViewingRent] = useState(null);

  // CREAR NUEVO
  const handleNewRent = (newRentData) => {
    const nuevoArriendo = {
      id: idCounter.current++,
      ...newRentData,
      precioInmueble: `${Number(newRentData.precioInmueble).toLocaleString("es-CO")} $`,
      precio: `${Number(newRentData.precio).toLocaleString("es-CO")} $`,
      valorMensual: `${Number(newRentData.precio).toLocaleString("es-CO")} $`,
      estado: "Pendiente de inicio",
    };

    setArriendos((prev) => [...prev, nuevoArriendo]);
    setShowForm(false);
    setEditingRent(null);
  };

  // EDITAR EXISTENTE
  const handleEditSave = (updatedRent) => {
    const actualizado = {
      ...updatedRent,
      precioInmueble: `${Number(updatedRent.precioInmueble).toLocaleString("es-CO")} $`,
      precio: `${Number(updatedRent.precio).toLocaleString("es-CO")} $`,
      valorMensual: `${Number(updatedRent.precio).toLocaleString("es-CO")} $`,
    };

    setArriendos((prev) =>
      prev.map((r) => (r.id === updatedRent.id ? { ...r, ...actualizado } : r))
    );
    setShowForm(false);
    setEditingRent(null);
  };

  const handleEditClick = (rent) => {
    setEditingRent(rent);
    setShowForm(true);
  };

  // 🗑️ ELIMINAR
  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      setArriendos((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const filteredRents =
    searchTerm.trim() === ""
      ? arriendos
      : arriendos.filter((r) => {
          const lower = searchTerm.toLowerCase();
          return (
            r.registroInmobiliario.includes(searchTerm) ||
            r.tipoInmueble.toLowerCase().includes(lower) ||
            r.estado.toLowerCase().includes(lower) ||
            r.fechaInicio.includes(searchTerm) ||
            r.fechaFinal.includes(searchTerm) ||
            r.primerNombreInquilino.toLowerCase().includes(lower) ||
            r.primerApellidoInquilino.toLowerCase().includes(lower) ||
            r.numeroDocInquilino.includes(searchTerm) ||
            r.correoInquilino.toLowerCase().includes(lower)
          );
        });

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "Pagado":
      case "Activo":
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-400">{estado}</span>;
      case "Pendiente":
      case "Pendiente de inicio":
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-400">{estado}</span>;
      case "Debe":
      case "Finalizado":
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-400">{estado}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">{estado}</span>;
    }
  };

  // Calcular estadísticas
  const stats = {
    total: filteredRents.length,
    activos: filteredRents.filter(r => r.estado === 'Pagado' || r.estado === 'Activo').length,
    pendientes: filteredRents.filter(r => r.estado === 'Pendiente' || r.estado === 'Pendiente de inicio').length,
    totalMensual: filteredRents.reduce((sum, r) => {
      const valor = parseFloat(r.valorMensual.replace(/[^\d]/g, '')) || 0;
      return sum + valor;
    }, 0)
  };

  // 🔑 --- FUNCIONES PARA RENDERIZAR MODALES CON PORTAL ---
  const renderFormModal = () => {
    if (!showForm) return null;

    const modalContent = editingRent ? (
      <EditRenantForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingRent(null);
        }}
        onSubmit={handleEditSave}
        initialData={editingRent}
      />
    ) : (
      <RenantForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingRent(null);
        }}
        onSubmit={handleNewRent}
      />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  const renderViewModal = () => {
    if (!viewingRent) return null;

    const modalContent = (
      <ViewRenant renant={viewingRent} onClose={() => setViewingRent(null)} />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* HEADER CON NUEVO ESTILO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestión de Arriendos</h1>
            <p className="text-slate-600 mt-1">Administra todos los contratos de arrendamiento de tus propiedades</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingRent(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nuevo Arriendo
          </motion.button>
        </motion.div>

        {/* STATS CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Arriendos</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-400 rounded-lg p-3">
                <Home className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Activos/Pagados</p>
                <p className="text-2xl font-bold mt-1">{stats.activos}</p>
              </div>
              <div className="bg-green-400 rounded-lg p-3">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold mt-1">{stats.pendientes}</p>
              </div>
              <div className="bg-yellow-400 rounded-lg p-3">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Ingreso Mensual</p>
                <p className="text-lg font-bold mt-1">${(stats.totalMensual / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-purple-400 rounded-lg p-3">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* SEARCH AND FILTERS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        >
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar arrendatario por nombre, apellido, doc, reg. inmobiliario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-sm bg-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </motion.button>
          </div>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* TABLA CON NUEVO ESTILO - SIN COLUMNA ID */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* CABECERA DE TABLA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                📑 Lista de Arriendos ({filteredRents.length} {filteredRents.length === 1 ? "resultado" : "resultados"})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-slate-700 font-semibold text-sm border-b">Inquilino</th>
                    <th className="px-4 py-3 text-center text-slate-700 font-semibold text-sm border-b">Inmueble</th>
                    <th className="px-4 py-3 text-center text-slate-700 font-semibold text-sm border-b">Registro</th>
                    <th className="px-4 py-3 text-center text-slate-700 font-semibold text-sm border-b">Inicio / Fin</th>
                    <th className="px-4 py-3 text-center text-slate-700 font-semibold text-sm border-b">Valor Mensual</th>
                    <th className="px-4 py-3 text-center text-slate-700 font-semibold text-sm border-b">Estado</th>
                    <th className="px-4 py-3 text-center text-slate-700 font-semibold text-sm border-b">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRents.length > 0 ? (
                    filteredRents.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        {/* INQUILINO */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 justify-center">
                            <div className="bg-blue-100 rounded-lg p-2">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-center">
                              <strong className="text-slate-800 block">{r.primerNombreInquilino} {r.primerApellidoInquilino}</strong>
                              <p className="text-sm text-slate-500">{r.correoInquilino}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* INMUEBLE */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <Home className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">{r.tipoInmueble}</span>
                          </div>
                        </td>
                        
                        {/* REGISTRO */}
                        <td className="px-4 py-3 text-center text-slate-600 text-sm">{r.registroInmobiliario}</td>
                        
                        {/* FECHAS */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-slate-700">{r.fechaInicio}</span>
                            <span className="text-xs text-slate-500">a {r.fechaFinal}</span>
                          </div>
                        </td>
                        
                        {/* VALOR MENSUAL */}
                        <td className="px-4 py-3 text-center font-semibold text-purple-700">{r.valorMensual}</td>
                        
                        {/* ESTADO */}
                        <td className="px-4 py-3 text-center">{getEstadoBadge(r.estado)}</td>
                        
                        {/* ACCIONES */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Editar arriendo"
                              className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-lg hover:bg-green-50"
                              onClick={() => handleEditClick(r)}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Ver arriendo"
                              className="text-sky-600 hover:text-sky-800 transition-colors p-1 rounded-lg hover:bg-sky-50"
                              onClick={() => setViewingRent(r)}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Eliminar arriendo"
                              className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-lg hover:bg-red-50"
                              onClick={() => handleDelete(r.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-slate-500 border-b"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Home className="w-8 h-8 text-slate-400" />
                          <p>No se encontraron arriendos.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODALES CON PORTAL */}
      {renderFormModal()}
      {renderViewModal()}
    </>
  );
}