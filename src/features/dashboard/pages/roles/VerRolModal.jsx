import React from "react";

const permissionGroups = [
  { key: "roles", label: "Roles" },
  { key: "gEmpleados", label: "G Empleados" },
  { key: "clientes", label: "Clientes" },
  { key: "usuarios", label: "Usuarios" },
  { key: "reporteInmuebles", label: "Reporte inmuebles" },
  { key: "inmuebles", label: "Inmuebles" },
  { key: "citas", label: "Citas" },
];

const permissionActions = ["crear", "editar", "eliminar", "ver"];

export default function VerRolModal({ isOpen, onClose, rol }) {
  if (!isOpen) return null;

  // Helper to check if a permission is granted
  const hasPermiso = (groupKey, actionKey) => {
    return rol?.permisos?.[groupKey]?.[actionKey] || false;
  };

  // Helper to get all permissions for a group
  const getPermisosGrupo = (groupKey) => {
    const permisos = rol?.permisos?.[groupKey] || {};
    return Object.entries(permisos)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);
  };

  // Estado activo
  const estadoActivo = rol?.estado;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[650px] relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Cerrar"
        >
          &#x2715;
        </button>

        <h2 className="text-xl font-bold mb-4">Ver rol</h2>

        {/* Nombre */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={rol?.nombre || ""}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Permission groups */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {permissionGroups.map(({ key, label }) => {
            const permisosActivos = getPermisosGrupo(key);
            const tienePermisos = permisosActivos.length > 0;
            
            return (
              <div
                key={key}
                className="border rounded p-3 flex flex-col gap-2 min-w-[150px]"
              >
                <div className="font-semibold flex items-center justify-between">
                  <span>{label}</span>
                  {/* Checkbox to indicate if any permissions granted */}
                  <input
                    type="checkbox"
                    checked={tienePermisos}
                    disabled
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>
                
                {/* Mostrar los permisos reales que tiene el usuario */}
                {tienePermisos ? (
                  <div className="text-sm">
                    <p className="font-medium mb-1">Permisos activos:</p>
                    <ul className="list-disc pl-5">
                      {permisosActivos.map(permiso => (
                        <li key={permiso} className="capitalize">{permiso}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Sin permisos</p>
                )}
              </div>
            );
          })}


          {/* Estado group */}
          <div className="border rounded p-3 flex flex-col gap-2 min-w-[150px] justify-center">
            <div className="font-semibold mb-2">Estado</div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={estadoActivo}
                disabled
                className="w-4 h-4 accent-blue-600"
              />
              <span>Activo</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-cyan-600 border border-cyan-600 px-4 py-1 rounded hover:bg-cyan-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
