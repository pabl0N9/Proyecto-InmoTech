import React, { useState, useEffect } from "react";

export default function BuyerForm({ onSubmit, onClose, nextId, initialData }) {
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
    const formTitle = isEditing ? "Editar Comprador" : "Registro de Comprador";
    const buttonText = isEditing ? "Actualizar Comprador" : "Guardar Comprador";

    // ... (useEffect, validateNameField, validateField, handleChange, handleSubmit, isButtonDisabled se mantienen iguales)
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

    const requiredFields = [
        "documento",
        "primerNombre",
        "primerApellido",
        "correo",
        "telefono",
    ];

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

    const validateField = (name, value) => {
        const isRequired = requiredFields.includes(name);

        if (isRequired && value.trim() === "") {
            return "Este campo es obligatorio.";
        }
        if (!isRequired && value.trim() === "") {
            return "";
        }

        switch (name) {
            case "documento":
                if (!/^\d+$/.test(value)) return "Solo se permiten números.";
                if (value.length < 5) return "Debe tener al menos 5 dígitos.";
                break;

            case "primerNombre":
            case "segundoNombre":
            case "primerApellido":
            case "segundoApellido":
                return validateNameField(value, isRequired);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: validateField(name, value),
        }));
    };

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

        if (!isFormValid) {
             console.error("Formulario no válido. Revise los errores.");
             return;
        }

        if (onSubmit) onSubmit(formData);
        if (onClose) onClose();
    };

    const isButtonDisabled =
        Object.values(errors).some((err) => err) ||
        requiredFields.some((field) => !formData[field].trim());

    return (
        // 🔑 Contenedor del Fondo/Overlay:
        // 'fixed inset-0' asegura 100% de alto/ancho de la ventana.
        // 'z-[100]' asegura que esté por encima de todo.
        // 'flex items-center justify-center' asegura el centrado vertical y horizontal.
        <div 
            className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[100] p-4" 
            onClick={onClose}
        >
            {/* Contenedor del Formulario (Centrado en el Overlay) */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-8 relative transform transition-all duration-300 scale-100 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    aria-label="Cerrar formulario"
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition duration-150 text-xl font-bold p-1"
                >
                    &times;
                </button>

                {/* Título */}
                <h2 className="text-2xl font-extrabold text-center text-purple-700 mb-6 border-b-2 border-purple-100 pb-3">
                    {formTitle}
                </h2>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo de documento y Documento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Tipo de documento */}
                        <div>
                            <label htmlFor="tipoDocumento" className="block text-sm font-semibold text-gray-700 mb-1">
                                Tipo documento
                            </label>
                            <select
                                id="tipoDocumento"
                                name="tipoDocumento"
                                value={formData.tipoDocumento}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-purple-500 focus:border-purple-500 transition duration-150 shadow-sm"
                            >
                                <option value="CC">Cédula de Ciudadanía (CC)</option>
                                <option value="CE">Cédula de Extranjería (CE)</option>
                                <option value="NIT">NIT</option>
                            </select>
                        </div>
                        
                        {/* Documento */}
                        <div className="md:col-span-2">
                            <label htmlFor="documento" className="block text-sm font-semibold text-gray-700 mb-1">
                                # Documento <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="documento"
                                type="text"
                                name="documento"
                                value={formData.documento}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-2.5 bg-gray-50 transition duration-150 shadow-sm ${
                                    errors.documento
                                        ? "border-red-500 ring-2 ring-red-200"
                                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                }`}
                                placeholder="Ej: 1020304050"
                            />
                            {errors.documento && <p className="text-red-500 text-xs mt-1 font-medium">{errors.documento}</p>}
                        </div>
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
                                <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
                                    {label}
                                </label>
                                <input
                                    id={id}
                                    type="text"
                                    name={id}
                                    value={formData[id]}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg p-2.5 bg-gray-50 transition duration-150 shadow-sm ${
                                        errors[id]
                                            ? "border-red-500 ring-2 ring-red-200"
                                            : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                    }`}
                                    placeholder={placeholder}
                                />
                                {errors[id] && <p className="text-red-500 text-xs mt-1 font-medium">{errors[id]}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Correo y Teléfono en una sola fila para ocupar el ancho (grid-cols-2) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                        {/* Correo */}
                        <div>
                            <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-1">
                                Correo <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="correo"
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-2.5 bg-gray-50 transition duration-150 shadow-sm ${
                                    errors.correo
                                        ? "border-red-500 ring-2 ring-red-200"
                                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                }`}
                                placeholder="ejemplo@dominio.com"
                            />
                            {errors.correo && <p className="text-red-500 text-xs mt-1 font-medium">{errors.correo}</p>}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-1">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="telefono"
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-2.5 bg-gray-50 transition duration-150 shadow-sm ${
                                    errors.telefono
                                        ? "border-red-500 ring-2 ring-red-200"
                                        : "border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                }`}
                                placeholder="Ej: 3001234567"
                            />
                            {errors.telefono && <p className="text-red-500 text-xs mt-1 font-medium">{errors.telefono}</p>}
                        </div>
                    </div>

                    {/* Botón guardar */}
                    <button
                        type="submit"
                        disabled={isButtonDisabled}
                        className={`text-white px-4 py-3 rounded-lg w-full font-bold transition duration-200 shadow-lg mt-6 ${
                            isButtonDisabled
                                ? "bg-gray-400 cursor-not-allowed shadow-none"
                                : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transform hover:scale-[1.005]"
                        }`}
                    >
                        {buttonText}
                    </button>
                </form>
            </div>
        </div>
    );
}