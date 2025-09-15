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

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Gestión de Inmuebles</h1>
            <p>Bienvenido al panel de control de inmuebles</p>
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
                {inmuebles.map((inmueble) => (
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
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => viewInmueble(inmueble.id)}
                          title="Visualizar"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => editInmueble(inmueble.id)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-owner"
                          onClick={() => viewPropietario(inmueble.id)}
                          title="Ver Propietario"
                        >
                          👤
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
