import React, { useState } from "react";
import { FaUser, FaPlus, FaEdit, FaEye } from "react-icons/fa";
import DashboardLayout from "../../../../../shared/components/dashboard/Layout/DashboardLayout";
import "../../../../../shared/styles/globals.css";

export function LeasesManagementPage() {
  const [arrendatarios] = useState([
    { id: 1, tipo: "CC", documento: "11.111.111",
      nombre: "Juan Carlos Jaramillo Sossa",
      correo: "FerCarSossa@gmail.com",
      telefono: "3123278776" },
    { id: 2, tipo: "CC", documento: "10.101.010",
      nombre: "Pablo Camargo Buitrago",
      correo: "BuitragoPablo@gmail.com",
      telefono: "3123225634" },
    { id: 3, tipo: "CC", documento: "12.121.212",
      nombre: "Fernando Andres Patiño Sepulveda",
      correo: "AndresSepulveda@gmail.com",
      telefono: "3004587808" },
  ]);

  return (
    <DashboardLayout>
      <div className="rent-page">
        {/* Encabezado */}
        <header className="rent-header">
          <h1 className="rent-title">Gestión de arrendario</h1>
          <button className="rent-btn">
            <FaPlus className="mr-1" /> Crear arrendatario
          </button>
        </header>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar arrendatario..."
          className="rent-search"
        />

        {/* Tabla */}
        <div className="rent-table-wrapper">
          <div className="rent-table-header">
            <FaUser className="mr-2" /> Lista de arrendatarios
          </div>
          <table className="rent-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo documento</th>
                <th># Documento</th>
                <th>Nombre completo</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {arrendatarios.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.tipo}</td>
                  <td>{a.documento}</td>
                  <td>{a.nombre}</td>
                  <td><a href={`mailto:${a.correo}`}>{a.correo}</a></td>
                  <td>{a.telefono}</td>
                  <td>
                    <button className="icon-btn">
                      <FaEdit />
                    </button>
                    <button className="icon-btn">
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
