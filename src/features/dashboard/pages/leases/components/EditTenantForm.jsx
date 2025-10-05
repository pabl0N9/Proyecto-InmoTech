import React, { useState } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

export default function EditTenantForm({ tenant, onClose, onUpdate }) {
  const [formData, setFormData] = useState({ ...tenant });
  const [errors, setErrors] = useState({});

  if (!tenant) return null;

  // 🔹 Manejo de cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validación rápida por campo
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "Este campo es obligatorio" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 🔹 Guardar cambios
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    ["primerNombre", "primerApellido", "correo", "telefono"].forEach((field) => {
      if (!formData[field] || !formData[field].trim()) {
        newErrors[field] = "Este campo es obligatorio";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[550px] p-6 relative animate-fadeIn">
        {/* Botón cerrar */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
          onClick={onClose}
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-purple-700">
          Editar arrendatario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primer Nombre */}
          <div>
            <input
              type="text"
              name="primerNombre"
              value={formData.primerNombre}
              onChange={handleChange}
              placeholder="Primer Nombre"
              className="w-full border p-2 rounded"
            />
            {errors.primerNombre && (
              <p className="text-red-500 text-sm">{errors.primerNombre}</p>
            )}
          </div>

          {/* Primer Apellido */}
          <div>
            <input
              type="text"
              name="primerApellido"
              value={formData.primerApellido}
              onChange={handleChange}
              placeholder="Primer Apellido"
              className="w-full border p-2 rounded"
            />
            {errors.primerApellido && (
              <p className="text-red-500 text-sm">{errors.primerApellido}</p>
            )}
          </div>

          {/* Correo */}
          <div>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="Correo"
              className="w-full border p-2 rounded"
            />
            {errors.correo && (
              <p className="text-red-500 text-sm">{errors.correo}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className="w-full border p-2 rounded"
            />
            {errors.telefono && (
              <p className="text-red-500 text-sm">{errors.telefono}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FaSave /> Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
