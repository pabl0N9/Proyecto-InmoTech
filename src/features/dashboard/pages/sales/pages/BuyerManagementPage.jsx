import React, { useState } from "react";
import { FaUserPlus, FaEye, FaEdit } from "react-icons/fa";
import DashboardLayout from "../../../../../shared/components/dashboard/Layout/DashboardLayout";
import "../../../../../shared/styles/globals.css";

{/*Aqui se almaceneran los registros */}

export function BuyersManagementPage() {
  const compradores = useState([
    {
      id: 1,
      tipoDocumento: "CC",
      documento: "11.111.111",
      nombre: "Juan Carlos Jaramillo Sossa",
      correo: "FerCarSossa@gmail.com",
      telefono: "3123278776",
    },
    {
      id: 2,
      tipoDocumento: "CC",
      documento: "10.101.010",
      nombre: "Pablo Camargo Buitrago",
      correo: "BuitragoPablo@gmail.com",
      telefono: "3123225634",
    },
    {
      id: 3,
      tipoDocumento: "CC",
      documento: "12.121.212",
      nombre: "Fernando Andres Patiño Sepulveda",
      correo: "AndresSepulveda@gmail.com",
      telefono: "3004587808",
    },
  ]);

  return (
    <DashboardLayout>
      <div className="buyers-page p-6">
        {/* Título y botón crear */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de compradores</h1>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaUserPlus /> Crear comprador
          </button>
        </header>

        {/* Barra de búsqueda */}
        <input
          type="text"
          placeholder="Buscar comprador..."
          className="w-full max-w-sm border border-gray-300 rounded-md p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Encabezado de lista */}
        <div className="bg-blue-700 text-white font-semibold rounded-t-lg px-4 py-2 flex items-center gap-2">
          <span>👥</span> Lista de compradores
        </div>

        {/* Tabla */}
        <table className="w-full border-collapse bg-white shadow-md rounded-b-lg overflow-hidden">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-2 text-center">ID</th>
              <th className="px-4 py-2 text-center">Tipo documento</th>
              <th className="px-4 py-2 text-center">#Documento</th>
              <th className="px-4 py-2 text-center">Nombre completo</th>
              <th className="px-4 py-2 text-center">Correo</th>
              <th className="px-4 py-2 text-center">Teléfono</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compradores.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 text-center">{c.id}</td>
                <td className="px-4 py-2 text-center">{c.tipoDocumento}</td>
                <td className="px-4 py-2 text-center">{c.documento}</td>
                <td className="px-4 py-2 text-center">{c.nombre}</td>
                <td className="px-4 py-2 text-center text-blue-600 underline">{c.correo}</td>
                <td className="px-4 py-2 text-center">{c.telefono}</td>
                <td className="px-4 py-2 text-center flex gap-3">
                  <button className="text-green-600 hover:text-green-800">
                    <FaEdit />
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}