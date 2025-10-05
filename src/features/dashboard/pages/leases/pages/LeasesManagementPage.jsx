import React, { useState, useRef } from "react";
import { FaUserPlus, FaEye, FaEdit, FaSearch, FaTrash } from "react-icons/fa";
import DashboardLayout from "../../../../../shared/components/dashboard/Layout/DashboardLayout";
import "../../../../../shared/styles/globals.css";

// ASUMO que estos componentes ya contienen la estructura del modal (fondo gris y z-index alto)
import LeasesPersonForm from "../components/TenantForm";
import ViewTenantModal from "../components/ViewTenantForm";

export function LeasesManagementPage() {
  const [arrendatarios, setArrendatarios] = useState([
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
      inmueblesArrendados: [
        {
          nombre: "Apartamento Laureles",
          m2: 80,
          hab: 3,
          baños: 2,
          registro: "REG-001",
          direccion: "Calle 45 #67-89",
          tipo: "Apartamento",
          estado: "Activo",
        },
      ],
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
      inmueblesArrendados: [],
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
      inmueblesArrendados: [],
    },
  ]);

  const idCounter = useRef(arrendatarios.length + 1);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState(null);
  const [tenantToView, setTenantToView] = useState(null);

  const filteredTenants =
    searchTerm.trim() === ""
      ? arrendatarios
      : arrendatarios.filter((t) => {
          const lower = searchTerm.toLowerCase();
          return (
            t.primerNombre.toLowerCase().includes(lower) ||
            (t.segundoNombre && t.segundoNombre.toLowerCase().includes(lower)) ||
            t.primerApellido.toLowerCase().includes(lower) ||
            (t.segundoApellido && t.segundoApellido.toLowerCase().includes(lower)) ||
            t.documento.includes(searchTerm) ||
            t.correo.toLowerCase().includes(lower) ||
            t.telefono.includes(searchTerm)
          );
        });

  const handleCloseForm = () => {
    setShowForm(false);
    setTenantToEdit(null);
  };

  const handleEditClick = (tenant) => {
    setTenantToEdit(tenant);
    setShowForm(true);
  };

  const handleViewClick = (tenant) => {
    setTenantToView(tenant);
  };

  const handleDeleteTenant = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este arrendatario?")) {
      setArrendatarios((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleCreateTenant = (data) => {
    const newTenant = { ...data, id: idCounter.current++, inmueblesArrendados: [] };
    setArrendatarios((prev) => [...prev, newTenant]);
    handleCloseForm();
  };

  const handleUpdateTenant = (updatedTenant) => {
    setArrendatarios((prev) =>
      prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t))
    );
    handleCloseForm();
  };

  const handleSubmit = tenantToEdit ? handleUpdateTenant : handleCreateTenant;

  return (
    <>
      <DashboardLayout>
        <div className="tenants-page p-6">
          {/* Header */}
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestión de arrendatarios</h1>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => {
                setTenantToEdit(null);
                setShowForm(true);
              }}
            >
              <FaUserPlus /> Crear arrendatario
            </button>
          </header>

          {/* Barra de búsqueda */}
          <div className="relative w-full max-w-sm mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar arrendatario por nombre, apellido, doc, correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Lista */}
          <div className="bg-blue-700 text-white font-semibold rounded-t-lg px-4 py-2 flex items-center gap-2">
            <span>🏠</span> Lista de arrendatarios ({filteredTenants.length}{" "}
            {filteredTenants.length === 1 ? "resultado" : "resultados"})
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
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="px-2 py-2 text-center">{t.id}</td>
                      <td className="px-2 py-2 text-center">{t.tipoDocumento}</td>
                      <td className="px-2 py-2 text-center">{t.documento}</td>
                      <td className="px-2 py-2 text-center">{t.primerNombre}</td>
                      <td className="px-2 py-2 text-center">{t.segundoNombre || "-"}</td>
                      <td className="px-2 py-2 text-center">{t.primerApellido}</td>
                      <td className="px-2 py-2 text-center">{t.segundoApellido || "-"}</td>
                      <td className="px-2 py-2 text-center truncate">
                        <a
                          href={`mailto:${t.correo}`}
                          className="text-blue-600 underline"
                        >
                          {t.correo}
                        </a>
                      </td>
                      <td className="px-2 py-2 text-center">{t.telefono}</td>
                      <td className="px-2 py-2 text-center flex gap-2 justify-center">
                        <button
                          aria-label="Editar arrendatario"
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handleEditClick(t)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          aria-label="Ver arrendatario"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewClick(t)}
                        >
                          <FaEye />
                        </button>
                        <button
                          aria-label="Eliminar arrendatario"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteTenant(t.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-4 py-4 text-center text-gray-500">
                      No se encontraron arrendatarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>

      {/* RENDERIZADO DE MODALES */}
      {/* Estos se renderizan fuera del DashboardLayout, pero dentro del fragmento (<>), */}
      {/* lo que permite que se coloquen encima del layout si tienen la clase z-50. */}
      
      {showForm && (
        <LeasesPersonForm
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          nextId={idCounter.current}
          initialData={tenantToEdit}
        />
      )}

      {tenantToView && (
        <ViewTenantModal tenant={tenantToView} onClose={() => setTenantToView(null)} />
      )}
    </>
  );
}