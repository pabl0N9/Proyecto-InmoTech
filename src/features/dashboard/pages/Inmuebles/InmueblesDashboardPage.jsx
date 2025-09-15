import React, { useState } from "react";
import "./style/InmueblesDashboardPage.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import PropertyForm from "./components/PropertyForm";

export default function InmueblesPage() {
  const [inmuebles, setInmuebles] = useState([
    {
      id: 1,
      registro: "110010123456",
      direccion: "Cra 7 # 65-30",
      propietario: "Juan Andres Lopez",
      tipo: "Casa",
      operacion: "Venta",
      estado: "Vendido",
    },
    {
      id: 2,
      registro: "760010789012",
      direccion: "Cl 14 # 83-45",
      propietario: "Carlos Mario Montoya",
      tipo: "Apartamento",
      operacion: "Arriendo",
      estado: "Disponible",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const [showForm, setShowForm] = useState(false);

  const posiblesEstados = [
    "Disponible",
    "Arrendado",
    "Vendido",
    "Reportado",
    "En proceso de venta",
    "Reservado",
    "En mantenimiento",
  ];

  const updateEstado = (id, nuevoEstado) => {
    setInmuebles((prev) =>
      prev.map((inmueble) =>
        inmueble.id === id ? { ...inmueble, estado: nuevoEstado } : inmueble
      )
    );
  };



  const viewInmueble = (id) => {
    const inmueble = inmuebles.find(i => i.id === id);
    alert(`Visualizando inmueble: ${inmueble.registro} - ${inmueble.direccion}`);
  };

  const editInmueble = (id) => {
    const inmueble = inmuebles.find(i => i.id === id);
    alert(`Editando inmueble: ${inmueble.registro} - ${inmueble.direccion}`);
  };

  const viewPropietario = (id) => {
    const inmueble = inmuebles.find(i => i.id === id);
    const ownerInfo = inmueble.ownerInfo;
    if (ownerInfo) {
      alert(`Propietario: ${ownerInfo.primerNombre} ${ownerInfo.primerApellido}\nDocumento: ${ownerInfo.numeroDocumento}\nCorreo: ${ownerInfo.correo}`);
    } else {
      alert(`Propietario: ${inmueble.propietario}`);
    }
  };

  const filteredInmuebles = inmuebles.filter((inmueble) => {
    const query = searchQuery.toLowerCase();
    return (
      inmueble.registro.toLowerCase().includes(query) ||
      inmueble.direccion.toLowerCase().includes(query) ||
      inmueble.propietario.toLowerCase().includes(query) ||
      inmueble.tipo.toLowerCase().includes(query) ||
      inmueble.operacion.toLowerCase().includes(query) ||
      inmueble.estado.toLowerCase().includes(query)
    );
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Gestión de Inmuebles</h1>
            <p>Bienvenido al panel de control de inmuebles</p>
            <div className="search-container">
              <input
                type="text"
                placeholder="Buscar inmuebles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{backgroundColor: '#9333EA', color: 'white'}}>
            + Nuevo Inmueble
          </button>
        </header>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="modal-form">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Inmueble</DialogTitle>
            </DialogHeader>
            <PropertyForm
              onSubmit={(formData) => {
                const nuevo = {
                  id: inmuebles.length + 1,
                  registro: formData.registroInmobiliario,
                  direccion: formData.direccion,
                  propietario: `${formData.primerNombre} ${formData.primerApellido}`,
                  tipo: formData.tipoInmueble,
                  operacion: formData.tipoOperacion,
                  estado: "Disponible",
                  // Additional data can be stored as needed
                  ownerInfo: {
                    tipoDocumento: formData.tipoDocumento,
                    numeroDocumento: formData.numeroDocumento,
                    primerNombre: formData.primerNombre,
                    segundoNombre: formData.segundoNombre,
                    primerApellido: formData.primerApellido,
                    segundoApellido: formData.segundoApellido,
                    correo: formData.correo,
                    telefono: formData.telefono,
                  },
                  propertyInfo: {
                    tituloInmueble: formData.tituloInmueble,
                    area: formData.area,
                    precio: formData.precio,
                    banos: formData.banos,
                    habitaciones: formData.habitaciones,
                    pais: formData.pais,
                    estrato: formData.estrato,
                    ciudad: formData.ciudad,
                    departamento: formData.departamento,
                    barrio: formData.barrio,
                    garaje: formData.garaje,
                    cantidadGaraje: formData.cantidadGaraje,
                  },
                };
                setInmuebles([...inmuebles, nuevo]);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>

        <div className="dashboard-content">
          <div className="table-container">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registro Inmobiliario</th>
                  <th>Dirección</th>
                  <th>Propietario</th>
                  <th>Tipo</th>
                  <th>Operación</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInmuebles.map((inmueble) => (
                  <tr key={inmueble.id}>
                    <td>#{inmueble.id}</td>
                    <td>{inmueble.registro}</td>
                    <td>{inmueble.direccion}</td>
                    <td>{inmueble.propietario}</td>
                    <td>{inmueble.tipo}</td>
                    <td>{inmueble.operacion}</td>
                    <td>
                      <select
                        value={inmueble.estado}
                        onChange={(e) =>
                          updateEstado(inmueble.id, e.target.value)
                        }
                      >
                        {posiblesEstados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => viewInmueble(inmueble.id)}
                          title="Visualizar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => editInmueble(inmueble.id)}
                          title="Editar"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="btn-action btn-owner"
                          onClick={() => viewPropietario(inmueble.id)}
                          title="Ver Propietario"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
