import React, { useState, useEffect } from "react";

export default function TenantForm({ onSubmit, onClose, nextId, initialData }) {
  // Estado del formulario
  const [formData, setFormData] = useState({
    id: nextId,
    tipoDocumento: "CC",
    documento: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    correo: "",
    telefono: "",
  });

  const [errors, setErrors] = useState({});

  const isEditing = !!initialData;
  const formTitle = isEditing ? "Editar Arrendatario" : "Registro de Arrendatario";
  const buttonText = isEditing ? "Actualizar Arrendatario" : "Guardar Arrendatario";

  // Cargar datos iniciales cuando edito
  useEffect(() => {
    setFormData(
      initialData || {
        id: nextId,
        tipoDocumento: "CC",
        documento: "",
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        correo: "",
        telefono: "",
      }
    );
    setErrors({});
  }, [initialData, nextId]);

  // Campos obligatorios
  const requiredFields = [
    "documento",
    "primerNombre",
    "primerApellido",
    "correo",
    "telefono",
  ];

  // Validar campos de nombres
  const validateNameField = (value, isRequired = false) => {
    if (isRequired && value.trim() === "") {
      return "Este campo es obligatorio.";
    }
    if (value.trim() === "") return "";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
      return "Solo se permiten letras y espacios.";
    }
    return "";
  };

  // Validar campo genérico
  const validateField = (name, value) => {
    if (requiredFields.includes(name) && value.trim() === "") {
      return "Este campo es obligatorio.";
    }

    switch (name) {
      case "documento":
        if (!/^\d+$/.test(value)) return "Solo se permiten números.";
        if (value.length < 8) return "Debe tener al menos 8 caracteres.";
        break;

      case "primerNombre":
      case "segundoNombre":
      case "primerApellido":
      case "segundoApellido":
        return validateNameField(value, ["primerNombre", "primerApellido"].includes(name));

      case "correo":
        if (!/^.+@.+\..+$/.test(value)) {
          return "Debe ser un correo electrónico válido.";
        }
        break;

      case "telefono":
        if (!/^\d+$/.test(value)) return "Solo se permiten números.";
        if (value.length < 7) return "Debe tener al menos 7 dígitos.";
        break;

      default:
        return "";
    }

    return "";
  };

  // Manejo de cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validación en vivo
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

  // Envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    let formErrors = {};
    let isFormValid = true;

    Object.keys(formData).forEach((name) => {
      if (name !== "tipoDocumento" && name !== "id") {
        const error = validateField(name, formData[name]);
        if (error) {
          formErrors[name] = error;
          isFormValid = false;
        }
      }
    });

    setErrors(formErrors);

    if (!isFormValid) return;

    if (onSubmit) onSubmit(formData);
    if (onClose) onClose();
  };

  // Deshabilitar botón si hay errores o campos requeridos vacíos
  const isButtonDisabled =
    Object.values(errors).some((err) => err) ||
    requiredFields.some((field) => !formData[field].trim());

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar formulario"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition duration-150"
        >
          ✖
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold text-center text-purple-700 mb-4 border-b pb-2">
          {formTitle}
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de documento */}
          <div>
            <label htmlFor="tipoDocumento" className="block font-medium text-gray-700">
              Tipo documento
            </label>
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-purple-500 focus:border-purple-500 transition duration-150"
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="NIT">NIT</option>
            </select>
          </div>

          {/* Documento */}
          <div>
            <label htmlFor="documento" className="block font-medium text-gray-700">
              # Documento <span className="text-red-500">*</span>
            </label>
            <input
              id="documento"
              type="text"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2 transition duration-150 ${
                errors.documento
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              }`}
              placeholder="Ej: 1020304050"
            />
            {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "primerNombre", label: "Primer Nombre *", placeholder: "Ej: Juan" },
              { id: "segundoNombre", label: "Segundo Nombre", placeholder: "Ej: David (opcional)" },
              { id: "primerApellido", label: "Primer Apellido *", placeholder: "Ej: Pérez" },
              { id: "segundoApellido", label: "Segundo Apellido", placeholder: "Ej: Serna (opcional)" },
            ].map(({ id, label, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block font-medium text-gray-700">
                  {label}
                </label>
                <input
                  id={id}
                  type="text"
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  className={`w-full border rounded-lg p-2 transition duration-150 ${
                    errors[id]
                      ? "border-red-500 ring-red-500"
                      : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  }`}
                  placeholder={placeholder}
                />
                {errors[id] && <p className="text-red-500 text-sm mt-1">{errors[id]}</p>}
              </div>
            ))}
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="correo" className="block font-medium text-gray-700">
              Correo <span className="text-red-500">*</span>
            </label>
            <input
              id="correo"
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2 transition duration-150 ${
                errors.correo
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              }`}
              placeholder="ejemplo@dominio.com"
            />
            {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block font-medium text-gray-700">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              id="telefono"
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2 transition duration-150 ${
                errors.telefono
                  ? "border-red-500 ring-red-500"
                  : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              }`}
              placeholder="Ej: 3001234567"
            />
            {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`text-white px-4 py-2 rounded-lg w-full font-semibold transition duration-200 shadow-md ${
              isButtonDisabled
                ? "bg-gray-400 cursor-not-allowed shadow-none"
                : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
            }`}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}
