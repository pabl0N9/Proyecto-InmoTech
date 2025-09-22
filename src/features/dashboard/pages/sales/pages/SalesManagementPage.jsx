import React, { useState } from "react";
import { FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import DashboardLayout from "../../../../../shared/components/dashboard/Layout/DashboardLayout";
import "../../../../../shared/styles/globals.css";

export function SalesManagementPage() {
  const [ventas] = useState([
    { id: 1, registro: "110010123456", tipo: "Casa",
      comprador: "Juan Carlos Jaramillo Sossa", fecha: "22/05/2025",
      valor: "15.000.000$", estado: "Pagado" },
    { id: 2, registro: "760010789012", tipo: "Apartamento",
      comprador: "Pablo Camargo Buitrago", fecha: "10/02/2025",
      valor: "32.500.000$", estado: "Pendiente" },
    { id: 3, registro: "050010345678", tipo: "Apartaestudio",
      comprador: "Fernando Andres Patiño Sepulveda", fecha: "15/07/2025",
      valor: "28.000.000$", estado: "Debe" },
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
      <div className="sales-page">
        <header className="sales-header">
          <h1 className="sales-title">Gestión de ventas</h1>
          <div className="sales-btn-group">
            <button className="sales-btn">
              <FaUsers /> Personas interesadas
            </button>
            <button className="sales-btn">
              <FaPlus /> Crear venta
            </button>
          </div>
        </header>

        <input
          type="text"
          placeholder="Buscar ventas..."
          className="sales-search"
        />

        <div className="sales-table-wrapper">
          <div className="sales-table-header">
            <span className="mr-2">🏠</span> Lista de ventas
          </div>
          <table className="sales-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Registro Inmobiliario</th>
                <th>Tipo de inmueble</th>
                <th>Nombre comprador</th>
                <th>Fecha</th>
                <th>Valor</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.registro}</td>
                  <td>{v.tipo}</td>
                  <td>{v.comprador}</td>
                  <td>{v.fecha}</td>
                  <td>{v.valor}</td>
                  <td>
                    <span className={estadoClass(v.estado)}>{v.estado}</span>
                  </td>
                  <td>
                    <button className="icon-btn">
                      <FaEdit />
                    </button>
                    <button className="icon-btn delete">
                      <FaTrash />
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
