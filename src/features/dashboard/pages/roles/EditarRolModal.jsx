import React, { useState, useEffect } from "react";

const permissionActions = ["Crear", "Editar", "Eliminar", "Ver"];

const permissionGroups = [
  { key: "gInmuebles", label: "G Inmuebles" },
  { key: "gClientes", label: "G Clientes" },
  { key: "gCitas", label: "G Citas" },
  { key: "gComprador", label: "G Comprador" },
  { key: "gVentas", label: "G Ventas" },
  { key: "gArrendatario", label: "G Arrendatario" },
  { key: "gArriendos", label: "G Arriendos" },
  { key: "gReporteInmuebles", label: "G Reporte Inmuebles" },
  { key: "usuarios", label: "Usuarios" },
  { key: "roles", label: "Roles" },
];

export default function EditarRolModal({ isOpen, onClose, rol, onSave }) {
  const [nombre, setNombre] = useState("");
  const [permisos, setPermisos] = useState({});

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre);
      // Initialize permisos state with all groups and actions set to false or from rol
      const initialPermisos = {};
      permissionGroups.forEach(({ key }) => {
        initialPermisos[key] = {};
        permissionActions.forEach((action) => {
          initialPermisos[key][action.toLowerCase()] =
            rol.permisos?.[key]?.[action.toLowerCase()] || false;
        });
      });
      setPermisos(initialPermisos);
    }
  }, [rol]);

  if (!isOpen) return null;

  const togglePermiso = (groupKey, actionKey) => {
    setPermisos((prev) => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        [actionKey]: !prev[groupKey][actionKey],
      },
    }));
  };

  const handleGuardar = () => {
    const rolEditado = {
      ...rol,
      nombre,
      permisos,
    };
    onSave(rolEditado);
    onClose();
  };

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

        <h2 className="text-xl font-bold mb-4">Editar rol</h2>

        {/* Nombre */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-300"
            placeholder="Escribe el nombre"
          />
        </div>

        {/* Permission groups */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {permissionGroups.map(({ key, label }) => (
            <div
              key={key}
              className="border rounded p-3 flex flex-col gap-2 min-w-[150px]"
            >
              <div className="font-semibold flex items-center justify-between">
                <span>{label}</span>
                {/* Checkbox to toggle all actions in group */}
                <input
                  type="checkbox"
                  checked={
                    permisos[key] &&
                    permissionActions.every(
                      (action) => permisos[key][action.toLowerCase()]
                    )
                  }
                  onChange={() => {
                    const allChecked =
                      permisos[key] &&
                      permissionActions.every(
                        (action) => permisos[key][action.toLowerCase()]
                      );
                    const updatedGroup = {};
                    permissionActions.forEach((action) => {
                      updatedGroup[action.toLowerCase()] = !allChecked;
                    });
                    setPermisos((prev) => ({
                      ...prev,
                      [key]: updatedGroup,
                    }));
                  }}
                  className="w-4 h-4 accent-blue-600"
                />
              </div>
              {permissionActions.map((action) => (
                <label
                  key={action}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={permisos[key]?.[action.toLowerCase()] || false}
                    onChange={() => togglePermiso(key, action.toLowerCase())}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span>{action}</span>
                </label>
              ))}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="text-cyan-600 border border-cyan-600 px-4 py-1 rounded hover:bg-cyan-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="bg-cyan-600 text-white px-4 py-1 rounded hover:bg-cyan-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
