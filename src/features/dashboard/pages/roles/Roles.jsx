import React, { useState, useEffect } from "react";
import CrearRolModal from "./CrearRolModal";
import EditarRolModal from "./EditarRolModal"; 
import VerRolModal from "./VerRolModal";
import "./Switch.css";
import DashboardLayout from "../../../../shared/components/dashboard/Layout/DashboardLayout";

// Componente Toast para notificaciones
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-md shadow-lg p-4 max-w-md ${
        type === "success"
          ? "bg-green-100 border-l-4 border-green-500 text-green-700"
          : "bg-red-100 border-l-4 border-red-500 text-red-700"
      }`}
    >
      <div className="flex items-center">
        <div className="py-1">
          {type === "success" ? (
            <svg
              className="fill-current h-6 w-6 text-green-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm5.293 7.293l-6 6c-.391.391-1.023.391-1.414 0l-3-3c-.391-.391-.391-1.023 0-1.414s1.023-.391 1.414 0L8.5 11.086l5.293-5.293c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414z" />
            </svg>
          ) : (
            <svg
              className="fill-current h-6 w-6 text-red-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm1 15H9v-2h2v2zm0-4H9V5h2v6z" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-bold">{type === "success" ? "Éxito" : "Error"}</p>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-gray-500 hover:text-gray-800"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

const RolesContent = () => {
  // Estado para el toast
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  // Función para mostrar el toast
  const showToast = (message, type = "success") => {
    setToast({
      visible: true,
      message,
      type,
    });
  };

  // Función para cerrar el toast
  const closeToast = () => {
    setToast({
      ...toast,
      visible: false,
    });
  };

  const [roles, setRoles] = useState([
    {
      id: "01",
      nombre: "Super Admin",
      estado: true,
      permisos: {
        gInmuebles: { crear: true, editar: true, eliminar: true, ver: true },
        gClientes: { crear: true, editar: true, eliminar: true, ver: true },
        gCitas: { crear: true, editar: true, eliminar: true, ver: true },
        gComprador: { crear: true, editar: true, eliminar: true, ver: true },
        gVentas: { crear: true, editar: true, eliminar: true, ver: true },
        gArrendatario: { crear: true, editar: true, eliminar: true, ver: true },
        gArriendos: { crear: true, editar: true, eliminar: true, ver: true },
        gReporteInmuebles: { crear: true, editar: true, eliminar: true, ver: true },
        usuarios: { crear: true, editar: true, eliminar: true, ver: true },
        roles: { crear: true, editar: true, eliminar: true, ver: true },
      },
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [verModalOpen, setVerModalOpen] = useState(false);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);

  const toggleEstado = (id) => {
    if (id === "01") {
      showToast("No se puede desactivar el rol de Super Admin", "error");
      return;
    }
    setRoles((prev) =>
      prev.map((rol) =>
        rol.id === id ? { ...rol, estado: !rol.estado } : rol
      )
    );
  };

  const handleEditar = (rol) => {
    setRolSeleccionado(rol);
    setEditarModalOpen(true);
  };

  const handleVer = (rol) => {
    setRolSeleccionado(rol);
    setVerModalOpen(true);
  };

  const handleEliminar = (id) => {
    if (id === "01") {
      showToast("No se puede eliminar el rol de Super Admin", "error");
      return;
    }

    const rolAEliminar = roles.find((rol) => rol.id === id);

    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar el rol "${rolAEliminar?.nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      setRoles((prev) => prev.filter((rol) => rol.id !== id));
      showToast(
        `El rol "${rolAEliminar?.nombre}" ha sido eliminado correctamente.`,
        "success"
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Toast de notificación */}
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {/* Super Admin Banner */}
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
        <div className="flex items-center">
          <div className="py-1">
            <svg
              className="fill-current h-6 w-6 text-blue-500 mr-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">Vista de Super Administrador</p>
            <p className="text-sm">
              Este es el rol principal del sistema con todos los permisos. Puedes
              crear nuevos roles según sea necesario.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Roles</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Nuevo rol
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mt-6">
        <table className="w-full border-collapse bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-center font-medium text-gray-500">
                Id
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Rol
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roles.map((rol) => (
              <tr
                key={rol.id}
                className={`hover:bg-gray-50 ${
                  rol.id === "01" ? "bg-blue-50 hover:bg-blue-100" : ""
                }`}
              >
                {/* ID */}
                <td className="px-4 py-3 font-medium text-gray-900 text-center">
                  {rol.id}
                </td>

                {/* Nombre rol */}
                <td className="px-4 py-3">
                  {rol.id === "01" ? (
                    <div className="flex items-center">
                      <span className="text-blue-600 font-semibold">
                        {rol.nombre}
                      </span>
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Protegido
                      </span>
                    </div>
                  ) : (
                    rol.nombre
                  )}
                </td>

                {/* Estado con switch horizontal */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-semibold ${
                        rol.estado ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {rol.estado ? "Activo" : "Inactivo"}
                    </span>
                    <label className="switch-container">
                      <input
                        type="checkbox"
                        checked={rol.estado}
                        disabled={rol.id === "01"}
                        onChange={() => toggleEstado(rol.id)}
                      />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-4">
                    {/* Editar */}
                    {rol.id !== "01" && (
                      <button
                        onClick={() => handleEditar(rol)}
                        className="text-green-600 hover:text-green-700 transition"
                        title="Editar rol"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Ver */}
                    <button
                      onClick={() => handleVer(rol)}
                      className="text-purple-600 hover:text-purple-700 transition"
                      title="Ver detalles del rol"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>

                    {/* Eliminar - No mostrar para Super Admin */}
                    {rol.id !== "01" && (
                      <button
                        onClick={() => handleEliminar(rol.id)}
                        className="text-red-600 hover:text-red-700 transition"
                        title="Eliminar rol"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      <CrearRolModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(nuevoRol) => {
          setRoles((prev) => {
            const maxId = prev.reduce((max, rol) => {
              const numId = parseInt(rol.id, 10);
              return numId > max ? numId : max;
            }, 0);
            const nextIdNum = maxId + 1;
            const nextId = nextIdNum < 10 ? `0${nextIdNum}` : `${nextIdNum}`;
            showToast(`El rol "${nuevoRol.nombre}" ha sido creado correctamente.`, "success");
            return [...prev, { ...nuevoRol, id: nextId }];
          });
        }}
      />

      {/* Modal Editar */}
      <EditarRolModal
        key={editarModalOpen ? "editing" : "closed"}
        isOpen={editarModalOpen}
        onClose={() => setEditarModalOpen(false)}
        rol={rolSeleccionado}
        onSave={(rolEditado) => {
          setRoles((prev) =>
            prev.map((rol) => (rol.id === rolEditado.id ? rolEditado : rol))
          );
          showToast(`El rol "${rolEditado.nombre}" ha sido editado correctamente.`, "success");
        }}
      />

      {/* Modal Ver */}
      <VerRolModal
        isOpen={verModalOpen}
        onClose={() => setVerModalOpen(false)}
        rol={rolSeleccionado}
      />
    </div>
  );
}

export default function Roles() {
  return (
    <DashboardLayout>
      <RolesContent />
    </DashboardLayout>
  );
}
