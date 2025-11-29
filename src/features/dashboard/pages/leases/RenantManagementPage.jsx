import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from 'react-dom';
import { FaUserPlus, FaEye, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import RenantForm from "../../components/leases/RenantForm";
import EditRenantForm from "../../components/leases/EditRenantForm";
import ViewRenant from "../../components/leases/ViewRenant"; 
import "../../../../shared/styles/globals.css";
import arriendoApiService from "../../../../shared/services/arriendoApiService";

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return `${numeric.toLocaleString("es-CO")} $`;
};

const mapApiArriendoToRow = (arriendo = {}) => {
  const inmueble = arriendo.Inmueble || arriendo.inmueble || {};
  const arrendatario = arriendo.Arrendatario || arriendo.arrendatario || {};
  const persona = arrendatario.persona || arrendatario.Persona || arrendatario || {};

  const nombreCompleto = persona.nombre_completo || "";
  const [primerNombre = "", segundoNombre = ""] = nombreCompleto.split(" ");
  const apellidos = persona.apellido_completo || "";
  const [primerApellido = "", segundoApellido = ""] = apellidos.split(" ");

  const valor = arriendo.valor_mensual || arriendo.valor_arriendo || arriendo.valor_arriendo_mensual || 0;
  const fechaInicio = arriendo.fecha_inicio || "";
  const fechaFin = arriendo.fecha_finalizacion || arriendo.fecha_fin || "";

  return {
    id: arriendo.id_arrendamiento || arriendo.id_arriendo || arriendo.id || Date.now(),
    tipoDocInquilino: persona.tipo_documento || "",
    numeroDocInquilino: persona.numero_documento || "",
    primerNombreInquilino: primerNombre,
    segundoNombreInquilino: segundoNombre,
    primerApellidoInquilino: primerApellido,
    segundoApellidoInquilino: segundoApellido,
    correoInquilino: persona.correo || "",
    telefonoInquilino: persona.telefono || "",
    tipoInmueble: inmueble.categoria || inmueble.tipo || "",
    registroInmobiliario: inmueble.registro_inmobiliario || inmueble.registro || "",
    nombreInmueble: inmueble.nombre || inmueble.titulo || "",
    area: inmueble.area_construida || inmueble.m2 || "",
    habitaciones: inmueble.habitaciones || "",
    banos: inmueble.banos || "",
    departamento: inmueble.departamento || "",
    ciudad: inmueble.ciudad || "",
    barrio: inmueble.barrio || "",
    estrato: inmueble.estrato || "",
    direccion: inmueble.direccion || "",
    precioInmueble: formatCurrency(inmueble.precio_arriendo || inmueble.precio || valor),
    fechaInicio: fechaInicio ? String(fechaInicio).slice(0, 10) : "",
    fechaFinal: fechaFin ? String(fechaFin).slice(0, 10) : "",
    fechaCobro: "",
    precio: formatCurrency(valor),
    estado: arriendo.estado || "Pendiente",
    fechaLimite: "",
    valorMensual: formatCurrency(valor),
  };
};

export function RenantManagementPage() {
  const [arriendos, setArriendos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRent, setEditingRent] = useState(null);
  const [viewingRent, setViewingRent] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const fetchArriendos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await arriendoApiService.obtenerArriendos();
      const list = response?.data?.data || response?.data || [];
      setArriendos(list.map(mapApiArriendoToRow));
      setStatusMessage(null);
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error?.message || "No fue posible cargar los arrendatarios"
      });
    } finally {
      setIsLoading(false);
    }
  }, [setStatusMessage]);

  useEffect(() => {
    fetchArriendos();
  }, [fetchArriendos]);

  // CREAR NUEVO
  const handleNewRent = ({ renant, formData }) => {
    // Solo refrescamos desde API; crear arrendatario no debe agregar a la lista de arriendos
    fetchArriendos();
    setShowForm(false);
    setEditingRent(null);
    setStatusMessage({ type: "success", message: "Arriendo sincronizado con la API" });
  };

  // EDITAR EXISTENTE
  const handleEditSave = (updatedRent) => {
    // Refrescamos desde API para evitar datos locales desfasados
    fetchArriendos();
    setShowForm(false);
    setEditingRent(null);
  };

  const handleEditClick = (rent) => {
    setEditingRent(rent);
    setShowForm(true);
  };

  // 🗑️ ELIMINAR
  const handleDelete = async (id) => {
    // No hay endpoint de borrado de arriendos en uso; removemos local y refrescamos
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    setArriendos((prev) => prev.filter((r) => r.id !== id));
    setStatusMessage({ type: "info", message: "Arriendo removido de la lista local. Refresca si persiste." });
  };

  const filteredRents =
    searchTerm.trim() === ""
      ? arriendos
      : arriendos.filter((r) => {
          const lower = searchTerm.toLowerCase();
          return (
            r.registroInmobiliario.includes(searchTerm) ||
            r.tipoInmueble.toLowerCase().includes(lower) ||
            r.estado.toLowerCase().includes(lower) ||
            r.fechaInicio.includes(searchTerm) ||
            r.fechaFinal.includes(searchTerm) ||
            r.primerNombreInquilino.toLowerCase().includes(lower) ||
            r.primerApellidoInquilino.toLowerCase().includes(lower) ||
            r.numeroDocInquilino.includes(searchTerm) ||
            r.correoInquilino.toLowerCase().includes(lower)
          );
        });

  const getEstadoBadge = (estado) => {
    let baseClass = "estado";

    switch (estado) {
      case "Pagado":
      case "Activo":
        return <span className={`${baseClass} pagado`}>{estado}</span>;
      case "Pendiente":
      case "Pendiente de inicio":
        return <span className={`${baseClass} pendiente`}>{estado}</span>;
      case "Debe":
      case "Finalizado":
        return <span className={`${baseClass} debe`}>{estado}</span>;
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
            {estado}
          </span>
        );
    }
  };

  // 🔑 --- FUNCIONES PARA RENDERIZAR MODALES CON PORTAL ---
  const renderFormModal = () => {
    if (!showForm) return null;

    const modalContent = editingRent ? (
      <EditRenantForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingRent(null);
        }}
        onSubmit={handleEditSave}
        initialData={editingRent}
      />
    ) : (
      <RenantForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingRent(null);
        }}
        onSubmit={handleNewRent}
      />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  const renderViewModal = () => {
    if (!viewingRent) return null;

    const modalContent = (
      <ViewRenant renant={viewingRent} onClose={() => setViewingRent(null)} />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  return (
    <>
      <div className="p-6">
        {/* HEADER CON ESTILO DEL BANNER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestión de arriendos
          </h1>
          <p className="text-gray-600 text-lg">
            Administra todos los contratos de arrendamiento de tus propiedades
          </p>
        </div>

        {/* CONTENEDOR SUPERIOR CON BOTÓN Y BÚSQUEDA */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-md">
            {/* BARRA DE BÚSQUEDA */}
            <div className="relative w-full">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar arrendatario por nombre, apellido, doc, reg. inmobiliario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition duration-150 shadow-sm"
              />
            </div>
          </div>
          
          {/* BOTÓN CON COLOR AZUL COMO EL BANNER */}
          <button
            onClick={() => {
              setEditingRent(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition duration-200 font-semibold"
          >
            <FaUserPlus className="text-lg" /> Crear arriendo
          </button>
        </div>

        {/* TABLA (MANTENIENDO LOS ESTILOS EXISTENTES QUE YA COINCIDEN) */}
        <div className="rent-table-wrapper rounded-xl shadow-lg">
          <div className="rent-table-header rounded-t-xl bg-blue-700">
            📑 Lista de arriendos ({filteredRents.length}{" "}
            {filteredRents.length === 1 ? "resultado" : "resultados"})
          </div>
          <div className="overflow-x-auto">
            <table className="rent-table w-full border-collapse bg-white rounded-b-lg overflow-hidden">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-3 py-3 text-center border-0">ID</th>
                  <th className="px-3 py-3 text-left border-0">Inquilino</th>
                  <th className="px-3 py-3 text-center border-0">Inmueble</th>
                  <th className="px-3 py-3 text-center border-0">Registro</th>
                  <th className="px-3 py-3 text-center border-0">Inicio / Fin</th>
                  <th className="px-3 py-3 text-center border-0">Valor Mensual</th>
                  <th className="px-3 py-3 text-center border-0">Estado</th>
                  <th className="px-3 py-3 text-center border-0">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRents.length > 0 ? (
                  filteredRents.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 border-t border-gray-200"
                    >
                      <td className="px-3 py-3 text-center border-0">{r.id}</td>
                      <td className="px-3 py-3 text-left font-medium text-gray-800 border-0">
                        {r.primerNombreInquilino} {r.primerApellidoInquilino}
                      </td>
                      <td className="px-3 py-3 text-center text-sm border-0">
                        {r.tipoInmueble}
                      </td>
                      <td className="px-3 py-3 text-center text-sm text-gray-600 border-0">
                        {r.registroInmobiliario}
                      </td>
                      <td className="px-3 py-3 text-center text-sm whitespace-nowrap border-0">
                        {r.fechaInicio} - {r.fechaFinal}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-gray-700 border-0">
                        {r.valorMensual}
                      </td>
                      <td className="px-3 py-3 text-center border-0">
                        {getEstadoBadge(r.estado)}
                      </td>
                      <td className="px-3 py-3 text-center flex gap-2 justify-center border-0">
                        <button
                          aria-label="Editar arrendatario"
                          className="text-green-600 hover:text-green-800 transition-colors"
                          onClick={() => handleEditClick(r)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          aria-label="Ver arrendatario"
                          className="text-sky-600 hover:text-sky-800 transition-colors"
                          onClick={() => setViewingRent(r)}
                        >
                          <FaEye />
                        </button>
                        <button
                          aria-label="Eliminar arrendatario"
                          className="text-red-600 hover:text-red-800 transition-colors"
                          onClick={() => handleDelete(r.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-6 text-center text-gray-500 border-0"
                    >
                      No se encontraron arriendos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALES CON PORTAL */}
      {renderFormModal()}
      {renderViewModal()}
    </>
  );
}
