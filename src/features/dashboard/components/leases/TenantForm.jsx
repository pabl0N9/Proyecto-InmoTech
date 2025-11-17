import React, { useEffect, useState } from "react";

const defaultFormData = {
  id: null,
  tipoDocumento: "CC",
  documento: "",
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  correo: "",
  telefono: "",
  observaciones: ""
};

const requiredFields = ["documento", "primerNombre", "primerApellido", "correo", "telefono"];
const numberRegex = /^\d+$/;

export default function TenantForm({
  onSubmit,
  onClose,
  nextId,
  initialData,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({ ...defaultFormData, id: nextId });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const isEditing = Boolean(initialData);
  const formTitle = isEditing ? "Editar Arrendatario" : "Registro de Arrendatario";
  const buttonText = isEditing ? "Actualizar Arrendatario" : "Guardar Arrendatario";

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      id: initialData?.id ?? nextId,
      ...initialData
    });
    setErrors({});
    setSubmitError(null);
  }, [initialData, nextId]);

  const validateNameField = (value, isRequired = false) => {
    const trimmed = value?.trim() ?? "";
    if (!trimmed) {
      return isRequired ? "Este campo es obligatorio." : "";
    }
    if (!/^[a-zA-Z\u00C0-\u017F\s']+$/.test(trimmed)) {
      return "Solo se permiten letras y espacios.";
    }
    return "";
  };

  const validateField = (name, value) => {
    const trimmed = typeof value === "string" ? value.trim() : value;

    if (requiredFields.includes(name) && !trimmed) {
      return "Este campo es obligatorio.";
    }

    switch (name) {
      case "documento":
        if (!trimmed) return "";
        if (!numberRegex.test(trimmed)) return "Solo se permiten numeros.";
        if (trimmed.length < 5) return "Debe tener al menos 5 digitos.";
        break;
      case "primerNombre":
      case "segundoNombre":
      case "primerApellido":
      case "segundoApellido":
        return validateNameField(value, ["primerNombre", "primerApellido"].includes(name));
      case "correo":
        if (!trimmed) return "";
        if (!/^.+@.+\..+$/.test(trimmed)) {
          return "Debe ser un correo electronico valido.";
        }
        break;
      case "telefono":
        if (!trimmed) return "";
        if (!numberRegex.test(trimmed)) return "Solo se permiten numeros.";
        if (trimmed.length < 7) return "Debe tener al menos 7 digitos.";
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError(null);

    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key === "id") return;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      setSubmitError(error.message || "No fue posible guardar el arrendatario.");
    }
  };

  const isButtonDisabled =
    isSubmitting ||
    Object.values(errors).some(Boolean) ||
    requiredFields.some((field) => !String(formData[field] ?? "").trim());

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative transform transition-all duration-300 scale-100 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar formulario"
          className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 transition duration-150 p-1 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{formTitle}</h2>
          <p className="text-gray-600 text-sm">
            {isEditing
              ? "Actualice la informacion del arrendatario"
              : "Complete la informacion requerida para registrar un nuevo arrendatario"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Datos personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tipoDocumento" className="block text-xs font-semibold text-gray-700 mb-1">
                  Tipo documento
                </label>
                <select
                  id="tipoDocumento"
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-sm text-sm text-gray-700 bg-white"
                >
                  <option value="CC">Cedula de Ciudadania (CC)</option>
                  <option value="CE">Cedula de Extranjeria (CE)</option>
                  <option value="NIT">NIT</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="TI">Tarjeta de Identidad (TI)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="documento" className="block text-xs font-semibold text-gray-700 mb-1">
                  # Documento <span className="text-red-500">*</span>
                </label>
                <input
                  id="documento"
                  type="text"
                  name="documento"
                  value={formData.documento}
                  onChange={handleChange}
                  className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                    errors.documento
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  placeholder="Ej: 1020304050"
                />
                {errors.documento && <p className="text-red-500 text-xs mt-1 font-medium">{errors.documento}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                { id: "primerNombre", label: "Primer Nombre *", placeholder: "Ej: Maria" },
                { id: "segundoNombre", label: "Segundo Nombre", placeholder: "Opcional" },
                { id: "primerApellido", label: "Primer Apellido *", placeholder: "Ej: Garcia" },
                { id: "segundoApellido", label: "Segundo Apellido", placeholder: "Opcional" }
              ].map(({ id, label, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    id={id}
                    type="text"
                    name={id}
                    value={formData[id]}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                      errors[id]
                        ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                    placeholder={placeholder}
                  />
                  {errors[id] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[id]}</p>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="correo" className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo <span className="text-red-500">*</span>
                </label>
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                    errors.correo
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  placeholder="ejemplo@dominio.com"
                />
                {errors.correo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.correo}</p>}
              </div>

              <div>
                <label htmlFor="telefono" className="block text-xs font-semibold text-gray-700 mb-1">
                  Telefono <span className="text-red-500">*</span>
                </label>
                <input
                  id="telefono"
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                    errors.telefono
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  placeholder="Ej: 3001234567"
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefono}</p>}
              </div>
            </div>
          </section>

          <section>
            <label htmlFor="observaciones" className="block text-xs font-semibold text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows={3}
              value={formData.observaciones}
              onChange={handleChange}
              className="w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Notas adicionales sobre el arrendatario"
            />
          </section>

          {submitError && (
            <p className="text-sm text-red-600 font-semibold">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`px-6 py-3 rounded-lg w-full font-bold transition duration-200 shadow-lg mt-2 ${
              isButtonDisabled
                ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-400/50 transform hover:scale-[1.02]"
            }`}
          >
            {isSubmitting ? "Guardando..." : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}
