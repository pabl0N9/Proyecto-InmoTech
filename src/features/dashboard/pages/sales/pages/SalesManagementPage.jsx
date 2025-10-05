import React, { useState } from "react";
import { FaUsers, FaPlus, FaEye, FaChartBar } from "react-icons/fa";
import DashboardLayout from "../../../../../shared/components/dashboard/Layout/DashboardLayout";
import "../../../../../shared/styles/globals.css";
import SaleForm from "../components/SaleForm";
import PurchaseTrackingModal from "../components/SalesTracking";
import InterestedPeopleTable from "../components/InterestedPeople";
import ViewSaleModal from "../components/ViewSale"; // ✅ nuevo modal separado

// 🔹 Componente que da color según estado
const EstadoBadge = ({ estado }) => {
  let colorClass = "bg-gray-200 text-gray-700";

  switch (estado) {
    case "Pagado":
      colorClass = "bg-green-100 text-green-800 border border-green-400";
      break;
    case "Pendiente":
      colorClass = "bg-yellow-100 text-yellow-800 border border-yellow-400";
      break;
    case "Debe":
      colorClass = "bg-red-100 text-red-800 border border-red-400";
      break;
    default:
      colorClass = "bg-gray-200 text-gray-700";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}
    >
      {estado}
    </span>
  );
};

export function SalesManagementPage() {
  const [ventas, setVentas] = useState([
    {
      id: 1,
      registro: "110010123456",
      tipo: "Casa",
      comprador: "Juan Carlos Jaramillo Sossa",
      fecha: "22/05/2025",
      valor: "15.000.000$",
      estado: "Pagado",
      estadoSeguimiento: "Finalizado",
    },
    {
      id: 2,
      registro: "760010789012",
      tipo: "Apartamento",
      comprador: "Pablo Camargo Buitrago",
      fecha: "10/02/2025",
      valor: "32.500.000$",
      estado: "Pendiente",
      estadoSeguimiento: "Iniciado",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [trackingSale, setTrackingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInterestedPeople, setShowInterestedPeople] = useState(false);

  const nextId =
    ventas.length > 0 ? Math.max(...ventas.map((v) => v.id)) + 1 : 1;

  const handleViewClick = (sale) => {
    setViewingSale(sale);
  };

  const handleTrackingClick = (sale) => {
    setTrackingSale(sale);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSaveSale = (saleData) => {
    // Crear nueva venta
    const newSale = {
      id: nextId,
      registro: saleData.inmuebleRegistro,
      tipo: saleData.inmuebleTipo,
      comprador: saleData.compradorNombreCompleto,
      fecha: new Date().toLocaleDateString("es-CO"),
      valor: saleData.inmueblePrecio + "$",
      estado: "Pendiente",
      estadoSeguimiento: "Iniciado",

      // Guardar vendedor
      vendedorTipoDocumento: saleData.vendedorTipoDocumento,
      vendedorDocumento: saleData.vendedorDocumento,
      vendedorNombreCompleto: saleData.vendedorNombreCompleto,
      vendedorCorreo: saleData.vendedorCorreo,
      vendedorTelefono: saleData.vendedorTelefono,

      // Guardar comprador
      compradorTipoDocumento: saleData.compradorTipoDocumento,
      compradorDocumento: saleData.compradorDocumento,
      compradorNombreCompleto: saleData.compradorNombreCompleto,
      compradorCorreo: saleData.compradorCorreo,
      compradorTelefono: saleData.compradorTelefono,

      // Guardar inmueble
      inmuebleTipo: saleData.inmuebleTipo,
      inmuebleRegistro: saleData.inmuebleRegistro,
      inmuebleNombre: saleData.inmuebleNombre,
      inmuebleArea: saleData.inmuebleArea,
      inmuebleHabitaciones: saleData.inmuebleHabitaciones,
      inmuebleBanos: saleData.inmuebleBanos,
      inmueblePais: saleData.inmueblePais,
      inmuebleDepartamento: saleData.inmuebleDepartamento,
      inmuebleCiudad: saleData.inmuebleCiudad,
      inmuebleBarrio: saleData.inmuebleBarrio,
      inmuebleEstrato: saleData.inmuebleEstrato,
      inmuebleDireccion: saleData.inmuebleDireccion,
      inmueblePrecio: saleData.inmueblePrecio,
      inmuebleGaraje: saleData.inmuebleGaraje,
      inmuebleEstado: saleData.inmuebleEstado,
    };
    setVentas((prev) => [...prev, newSale]);
    handleCloseForm();
  };

  const handleUpdateTracking = (updatedSale) => {
    setVentas((prevVentas) =>
      prevVentas.map((v) =>
        v.id === updatedSale.id ? { ...v, ...updatedSale } : v
      )
    );
    setTrackingSale(null);
  };

  const filteredVentas = ventas.filter(
    (v) =>
      v.registro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.comprador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de ventas</h1>
          <div className="flex gap-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => setShowInterestedPeople(true)}
            >
              <FaUsers /> Personas interesadas
            </button>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <FaPlus /> Crear venta
            </button>
          </div>
        </header>

        {/* 🔎 Input buscador */}
        <input
          type="text"
          placeholder="Buscar por registro, comprador o tipo..."
          className="w-full max-w-lg border border-gray-300 rounded-md p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Tabla */}
        <div className="shadow-md rounded-lg overflow-hidden">
          <div className="bg-blue-700 text-white font-semibold rounded-t-lg px-4 py-2 flex items-center gap-2">
            <span className="mr-2">🏠</span> Lista de ventas
          </div>
          <table className="w-full border-collapse bg-white">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-3 text-center">ID</th>
                <th className="px-4 py-3 text-center">Registro</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Comprador</th>
                <th className="px-4 py-3 text-center">Fecha</th>
                <th className="px-4 py-3 text-center">Valor</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentas.length > 0 ? (
                filteredVentas.map((v) => (
                  <tr key={v.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-center">{v.id}</td>
                    <td className="px-4 py-2 text-center">{v.registro}</td>
                    <td className="px-4 py-2 text-center">{v.tipo}</td>
                    <td className="px-4 py-2 text-center">{v.comprador}</td>
                    <td className="px-4 py-2 text-center">{v.fecha}</td>
                    <td className="px-4 py-2 text-center font-semibold">
                      {v.valor}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <EstadoBadge estado={v.estado} />
                    </td>
                    <td className="px-4 py-2 text-center flex gap-3 justify-center">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleViewClick(v)}
                      >
                        <FaEye />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-800"
                        onClick={() => handleTrackingClick(v)}
                      >
                        <FaChartBar />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Formularios y Modales */}
        {showForm && (
          <SaleForm onSubmit={handleSaveSale} onClose={handleCloseForm} />
        )}

        <ViewSaleModal
          sale={viewingSale}
          onClose={() => setViewingSale(null)}
        />

        {showInterestedPeople && (
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-5xl relative">
            <InterestedPeopleTable
              onClose={() => setShowInterestedPeople(false)}
            />
          </div>
        )}

        <PurchaseTrackingModal
          venta={trackingSale}
          onClose={() => setTrackingSale(null)}
          onUpdate={handleUpdateTracking}
        />
      </div>
    </DashboardLayout>
  );
}
