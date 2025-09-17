import React, { useState } from "react";

const modulesData = [
  { name: "Roles", permisos: ["Crear", "Editar", "Eliminar", "Ver"] },
  { name: "G Empleados", permisos: ["Crear", "Editar", "Eliminar", "Ver"] },
  { name: "Clientes", permisos: ["Crear", "Editar", "Eliminar", "Ver"] },
  { name: "Usuarios", permisos: ["Crear", "Editar", "Eliminar", "Ver"] },
  { name: "Reporte inmuebles", permisos: ["Crear", "Editar", "Eliminar", "Ver"] },
  { name: "Inmuebles", permisos: ["Crear", "Editar", "Eliminar", "Ver"] },
  { name: "Citas", permisos: ["Crear", "Editar", "Eliminar", "Ver"] },
];

export default function CrearRolModal({ isOpen, onClose, onSave }) {
  const [nombre, setNombre] = useState("");
  const [modules, setModules] = useState(
    modulesData.map((mod) => ({
      ...mod,
      enabled: true,
      permisosSeleccionados: [...mod.permisos], // Por defecto todos seleccionados
    }))
  );

  if (!isOpen) return null;

  const toggleModule = (index) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === index
          ? {
              ...mod,
              enabled: !mod.enabled,
              permisosSeleccionados: !mod.enabled ? [...mod.permisos] : [],
            }
          : mod
      )
    );
  };

  const togglePermiso = (index, permiso) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === index
          ? {
              ...mod,
              permisosSeleccionados: mod.permisosSeleccionados.includes(permiso)
                ? mod.permisosSeleccionados.filter((p) => p !== permiso)
                : [...mod.permisosSeleccionados, permiso],
            }
          : mod
      )
    );
  };

  const handleGuardar = () => {
    if (!nombre.trim()) {
      alert("El nombre del rol es obligatorio");
      return;
    }
    const nuevoRol = {
      id: Date.now().toString(),
      nombre,
      estado: true,
      permisos: modules.reduce((acc, mod) => {
        const key = mod.name.toLowerCase().replace(/\s+(\w)/g, (match, letter) => letter.toUpperCase());
        acc[key] = mod.enabled
          ? mod.permisosSeleccionados.reduce((permAcc, permiso) => {
              permAcc[permiso.toLowerCase()] = true;
              return permAcc;
            }, {})
          : {};
        return acc;
      }, {}),
    };
    onSave(nuevoRol);
    onClose();
    setNombre("");
    setModules(
      modulesData.map((mod) => ({
        ...mod,
        enabled: true,
        permisosSeleccionados: [...mod.permisos],
      }))
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4">Crear rol</h3>

        {/* Nombre */}
        <input
          type="text"
          placeholder="Nombre del rol"
          className="w-full border rounded-md p-2 mb-4"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        {/* Módulos */}
        <div className="grid grid-cols-2 gap-4">
          {modules.map((mod, index) => (
            <div
              key={mod.name}
              className="border rounded-lg shadow-sm p-3 relative"
            >
              {/* Header con checkbox */}
              <div className="flex justify-between items-center border-b pb-1 mb-2">
                <h4 className="font-medium">{mod.name}</h4>
                <input
                  type="checkbox"
                  checked={mod.enabled}
                  onChange={() => toggleModule(index)}
                  className="accent-purple-600 w-5 h-5"
                />
              </div>

              {/* Permisos */}
              <div className="flex flex-col gap-1">
                {mod.permisos.map((permiso) => (
                  <label key={permiso} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mod.permisosSeleccionados.includes(permiso)}
                      disabled={!mod.enabled}
                      onChange={() => togglePermiso(index, permiso)}
                      className="accent-purple-600"
                    />
                    {permiso}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            onClick={handleGuardar}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
