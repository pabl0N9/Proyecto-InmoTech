import React, { useState, useRef } from "react";
import { FaUserPlus, FaEye, FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import DashboardLayout from "../../../../../shared/components/dashboard/Layout/DashboardLayout";
import "../../../../../shared/styles/globals.css";
// Componentes Modales
import BuyerForm from "../components/BuyerForm";
import BuyerViewModal from "../components/BuyerView";

export function BuyersManagementPage() {
  // Estado inicial de los compradores (ahora con nombres separados)
  const [compradores, setCompradores] = useState([
    {
      id: 1,
      tipoDocumento: "CC",
      documento: "11.111.111",
      primerNombre: "Juan",
      segundoNombre: "Carlos",
      primerApellido: "Jaramillo",
      segundoApellido: "Sossa",
      correo: "FerCarSossa@gmail.com",
      telefono: "3123278776",
    },
    {
      id: 2,
      tipoDocumento: "CC",
      documento: "10.101.010",
      primerNombre: "Pablo",
      segundoNombre: "",
      primerApellido: "Camargo",
      segundoApellido: "Buitrago",
      correo: "BuitragoPablo@gmail.com",
      telefono: "3123225634",
    },
    {
      id: 3,
      tipoDocumento: "CC",
      documento: "12.121.212",
      primerNombre: "Fernando",
      segundoNombre: "Andres",
      primerApellido: "Patiño",
      segundoApellido: "Sepulveda",
      correo: "AndresSepulveda@gmail.com",
      telefono: "3004587808",
    },
  ]);

  // Contador seguro para IDs
  const idCounter = useRef(compradores.length + 1);

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [buyerToEdit, setBuyerToEdit] = useState(null);
  const [buyerToView, setBuyerToView] = useState(null);

  // --- FILTRO DE BÚSQUEDA ---
  const filteredBuyers =
    searchTerm.trim() === ""
      ? compradores
      : compradores.filter((buyer) => {
          const lowerCaseSearchTerm = searchTerm.toLowerCase();
          return (
            buyer.primerNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            (buyer.segundoNombre &&
              buyer.segundoNombre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            buyer.primerApellido.toLowerCase().includes(lowerCaseSearchTerm) ||
            (buyer.segundoApellido &&
              buyer.segundoApellido.toLowerCase().includes(lowerCaseSearchTerm)) ||
            buyer.documento.includes(searchTerm) ||
            buyer.correo.toLowerCase().includes(lowerCaseSearchTerm) ||
            buyer.telefono.includes(searchTerm)
          );
        });

  // --- HANDLERS ---
  const handleCloseForm = () => {
    setShowForm(false);
    setBuyerToEdit(null);
  };

  const handleCloseViewModal = () => {
    setBuyerToView(null);
  };

  const handleEditClick = (buyer) => {
    setBuyerToEdit(buyer);
    setShowForm(true);
  };

  const handleViewClick = (buyer) => {
    setBuyerToView(buyer);
  };

  const handleDeleteBuyer = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este comprador?")) {
      setCompradores((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleCreateBuyer = (data) => {
    const newBuyer = { ...data, id: idCounter.current++ };
    setCompradores((prev) => [...prev, newBuyer]);
    handleCloseForm();
  };

  const handleUpdateBuyer = (updatedBuyer) => {
    setCompradores((prev) =>
      prev.map((buyer) => (buyer.id === updatedBuyer.id ? updatedBuyer : buyer))
    );
    handleCloseForm();
  };

  const handleSubmit = buyerToEdit ? handleUpdateBuyer : handleCreateBuyer;

  // --- RENDERIZADO ---
  return (
    <DashboardLayout>
      <div className="buyers-page p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de compradores</h1>
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={() => {
              setBuyerToEdit(null);
              setShowForm(true);
            }}
          >
            <FaUserPlus /> Crear comprador
          </button>
        </header>

        {/* Barra de búsqueda */}
        <div className="relative w-full max-w-sm mb-6">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            aria-label="Buscar comprador"
            placeholder="Buscar comprador por nombre, apellido, doc, correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Lista */}
        <div className="bg-blue-700 text-white font-semibold rounded-t-lg px-4 py-2 flex items-center gap-2">
          <span>👥</span> Lista de compradores ({filteredBuyers.length}{" "}
          {filteredBuyers.length === 1 ? "resultado" : "resultados"})
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse bg-white shadow-md rounded-b-lg overflow-hidden">
            <thead className="bg-green-50">
              <tr>
                <th className="w-12 px-2 py-2 text-center">ID</th>
                <th className="w-20 px-2 py-2 text-center">Tipo doc</th>
                <th className="w-28 px-2 py-2 text-center">#Documento</th>
                <th className="w-28 px-2 py-2 text-center">Primer nombre</th>
                <th className="w-28 px-2 py-2 text-center">Segundo nombre</th>
                <th className="w-28 px-2 py-2 text-center">Primer apellido</th>
                <th className="w-28 px-2 py-2 text-center">Segundo apellido</th>
                <th className="w-48 px-2 py-2 text-center">Correo</th>
                <th className="w-32 px-2 py-2 text-center">Teléfono</th>
                <th className="w-24 px-2 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.length > 0 ? (
                filteredBuyers.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 text-center">{c.id}</td>
                    <td className="px-2 py-2 text-center">{c.tipoDocumento}</td>
                    <td className="px-2 py-2 text-center">{c.documento}</td>
                    <td className="px-2 py-2 text-center">{c.primerNombre}</td>
                    <td className="px-2 py-2 text-center">
                      {c.segundoNombre || "-"}
                    </td>
                    <td className="px-2 py-2 text-center">{c.primerApellido}</td>
                    <td className="px-2 py-2 text-center">
                      {c.segundoApellido || "-"}
                    </td>
                    <td className="px-2 py-2 text-center truncate">
                      <a
                        href={`mailto:${c.correo}`}
                        className="text-blue-600 underline"
                      >
                        {c.correo}
                      </a>
                    </td>
                    <td className="px-2 py-2 text-center">{c.telefono}</td>
                    <td className="px-2 py-2 text-center flex gap-2 justify-center">
                      <button
                        aria-label="Editar comprador"
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleEditClick(c)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        aria-label="Ver comprador"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleViewClick(c)}
                      >
                        <FaEye />
                      </button>
                      <button
                        aria-label="Eliminar comprador"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteBuyer(c.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No se encontraron compradores que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal CREAR/EDITAR */}
        {showForm && (
          <BuyerForm
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            nextId={idCounter.current}
            initialData={buyerToEdit}
          />
        )}

        {/* Modal VER */}
        {buyerToView && (
          <BuyerViewModal buyer={buyerToView} onClose={handleCloseViewModal} />
        )}
      </div>
    </DashboardLayout>
  );
}
