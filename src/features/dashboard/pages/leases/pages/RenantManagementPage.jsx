import React, { useState } from "react";
import { FaUser, FaPlus, FaEdit, FaEye } from "react-icons/fa";
import DashboardLayout from "../../../../../shared/components/dashboard/Layout/DashboardLayout";
import "../../../../../shared/styles/globals.css";

export function RenantManagementPage() {
  const [arriendos] = useState([
    {
      id: 1,
      registroInmobiliario: "110010123456",
      tipoInmueble: "Casa",
      fechaInicio: "22/05/2025",
      fechaFinal: "22/05/2026",
      fechaLimite: "27/05/2025",
      valorMensual: "2.500.000 $",
      estado: "Pagado",
    },
    {
      id: 2,
      registroInmobiliario: "760010789012",
      tipoInmueble: "Apartamento",
      fechaInicio: "10/10/2025",
      fechaFinal: "10/10/2026",
      fechaLimite: "15/10/2025",
      valorMensual: "3.000.000 $",
      estado: "Pendiente", // corregido
    },
    {
      id: 3,
      registroInmobiliario: "050010345678",
      tipoInmueble: "Apartaestudio",
      fechaInicio: "15/07/2025",
      fechaFinal: "15/07/2026",
      fechaLimite: "20/07/2025",
      valorMensual: "5.450.000 $",
      estado: "Debe",
    },
  ]);

  const estadoClass = (estado) => {
    switch (estado) {
      case "Pagado": return "estado pagado";
      case "Pendiente": return "estado pendiente";
      case "Debe": return "estado debe";
      default: return "estado";
    }
  };

  return (
    <DashboardLayout>
      <div className="rent-page">
        {/* Encabezado */}
        <header className="rent-header">
          <h1 className="rent-title">Gestión de arriendos</h1>
          <button className="rent-btn">
            <FaPlus className="mr-1" /> Crear arriendo
          </button>
        </header>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar arriendo..."
          className="rent-search"
        />

        {/* Tabla */}
        <div className="rent-table-wrapper">
          <div className="rent-table-header bg-blue-600 text-white flex items-center p-2 rounded-t-md">
            <FaUser className="mr-2" /> Lista de arriendos
          </div>
          <table className="w-full border-collapse bg-white shadow-md rounded-b-lg overflow-hidden">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-2 text-center">ID</th>
                <th className="px-4 py-2 text-center">Registro inmobiliario</th>
                <th className="px-4 py-2 text-center">Tipo de inmueble</th>
                <th className="px-4 py-2 text-center">Fecha inicio</th>
                <th className="px-4 py-2 text-center">Fecha final</th>
                <th className="px-4 py-2 text-center">Fecha límite</th>
                <th className="px-4 py-2 text-center">Valor mensual</th>
                <th className="px-4 py-2 text-center">Estado</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {arriendos.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-center">{c.id}</td>
                  <td className="px-4 py-2 text-center">{c.registroInmobiliario}</td>
                  <td className="px-4 py-2 text-center">{c.tipoInmueble}</td>
                  <td className="px-4 py-2 text-center">{c.fechaInicio}</td>
                  <td className="px-4 py-2 text-center">{c.fechaFinal}</td>
                  <td className="px-4 py-2 text-center">{c.fechaLimite}</td>
                  <td className="px-4 py-2 text-center">{c.valorMensual}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={estadoClass(c.estado)}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center flex gap-3 justify-center">
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
      </div>
    </DashboardLayout>
  );
}
