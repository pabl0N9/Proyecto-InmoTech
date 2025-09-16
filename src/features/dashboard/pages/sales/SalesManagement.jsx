import React, { useState } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export function SalesManagement() {
  const [ventas] = useState([
    {
      id: 1,
      registro: "110010123456",
      tipo: "Casa",
      comprador: "Juan Carlos Jaramillo Sossa",
      fecha: "22/05/2025",
      valor: "15.000.000$",
      estado: "Pagado",
    },
    {
      id: 2,
      registro: "760010789012",
      tipo: "Apartamento",
      comprador: "Pablo Camargo Buitrago",
      fecha: "10/02/2025",
      valor: "32.500.000$",
      estado: "Pendiente",
    },
    {
      id: 3,
      registro: "050010345678",
      tipo: "Apartaestudio",
      comprador: "Fernando Andres Patiño Sepulveda",
      fecha: "15/07/2025",
      valor: "28.000.000$",
      estado: "Debe",
    },
  ]);

  const colorEstado = (estado) => {
    switch (estado) {
      case "Pagado": return "bg-green-200 text-green-800";
      case "Pendiente": return "bg-yellow-200 text-yellow-800";
      case "Debe": return "bg-red-200 text-red-800";
      default: return "";
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de ventas</h1>
        <div className="flex space-x-4">
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center">
            <FaUsers className="mr-1" /> Personas interesadas
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center">
            <FaPlus className="mr-1" /> Crear venta
          </button>
        </div>
      </header>

      <input
        type="text"
        placeholder="Buscar ventas..."
        className="w-full md:w-1/3 p-2 border rounded mb-4"
      />

      <div className="bg-white shadow rounded">
        <div className="bg-blue-700 text-white px-4 py-2 rounded-t font-semibold flex items-center">
          <span className="mr-2">🏠</span> Lista de ventas
        </div>
        <table className="w-full table-auto">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Registro Inmobiliario</th>
              <th className="px-4 py-2">Tipo de inmueble</th>
              <th className="px-4 py-2">Nombre comprador</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{v.id}</td>
                <td className="px-4 py-2">{v.registro}</td>
                <td className="px-4 py-2">{v.tipo}</td>
                <td className="px-4 py-2">{v.comprador}</td>
                <td className="px-4 py-2">{v.fecha}</td>
                <td className="px-4 py-2">{v.valor}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${colorEstado(v.estado)}`}>
                    {v.estado}
                  </span>
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button className="text-blue-500 hover:text-blue-700"><FaEdit /></button>
                  <button className="text-red-500 hover:text-red-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
