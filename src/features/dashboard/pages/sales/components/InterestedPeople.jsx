import React from "react";
import { FaEdit, FaEye, FaFileAlt, FaTimes } from "react-icons/fa";

export default function InterestedPeopleTable({ onClose }) {
  const people = [
    {
      id: 1,
      registro: "110010123456",
      inmueble: "Casa",
      nombre: "Juan Carlos Jaramillo Sossa",
      fecha: "22/05/2025",
      valor: "15.000.000$",
      estado: "Pagado",
    },
    {
      id: 2,
      registro: "760010789012",
      inmueble: "Apartamento",
      nombre: "Pablo Camargo Buitrago",
      fecha: "10/02/2025",
      valor: "32.500.000$",
      estado: "Pendiente",
    },
    {
      id: 3,
      registro: "050010345678",
      inmueble: "Apartaestudio",
      nombre: "Fernando Andres Patiño Sepulveda",
      fecha: "15/07/2025",
      valor: "28.000.000$",
      estado: "Debe",
    },
  ];

  const renderEstado = (estado) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    if (estado === "Pagado") return <span className={`${base} bg-green-100 text-green-700`}>{estado}</span>;
    if (estado === "Pendiente") return <span className={`${base} bg-yellow-100 text-yellow-700`}>{estado}</span>;
    return <span className={`${base} bg-red-100 text-red-700`}>{estado}</span>;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Caja del modal */}
      <div
        className="relative z-[10000] w-11/12 md:w-4/5 lg:w-3/4 max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con X */}
        <div className="flex items-center justify-between px-5 py-3 bg-blue-600 text-white rounded-t-2xl">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🧑 Personas interesadas
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabla */}
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 bg-gray-100">
                <th className="p-3">ID</th>
                <th className="p-3">Registro Inmobiliario</th>
                <th className="p-3">Tipo de inmueble</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.registro}</td>
                  <td className="p-3">{p.inmueble}</td>
                  <td className="p-3">{p.nombre}</td>
                  <td className="p-3">{p.fecha}</td>
                  <td className="p-3 font-semibold">{p.valor}</td>
                  <td className="p-3">{renderEstado(p.estado)}</td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                      <FaEdit />
                    </button>
                    <button className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                      <FaEye />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                      <FaFileAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
