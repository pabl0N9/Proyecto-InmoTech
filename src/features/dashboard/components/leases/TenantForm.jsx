import React, { useEffect, useMemo, useState } from "react";
import { usePropertiesCatalog } from "../../../../shared/hooks/usePropertiesCatalog";

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
  idInmueble: "",
  fechaInicio: "",
  fechaFin: "",
  valorMensual: "",
  tipoGarantia: "",
  valorGarantia: "",
  descripcionGarantia: "",
  contactoEmergenciaNombre: "",
  contactoEmergenciaTelefono: "",
  contactoEmergenciaParentesco: "",
  observaciones: "",
  estado: "Activo"
};

const requiredFields = [
  "documento",
  "primerNombre",
  "primerApellido",
  "correo",
  "telefono",
  "idInmueble",
  "fechaInicio",
  "valorMensual"
];

const tenantStatuses = ["Activo", "Inactivo", "Moroso", "Proceso"];
const guaranteeTypes = ["Deposito", "Fiador", "Seguro", "Mixta"];
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

  const {
    properties,
    loading: loadingProperties,
    error: propertiesError,
    refetch
  } = usePropertiesCatalog(true);

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

  const propertyOptions = useMemo(() => {
    const baseOptions = properties.map((property) => ({
      value: String(property.id),
      label: property.label
    }));

    if (
      formData.idInmueble &&
      !baseOptions.find((option) => option.value === String(formData.idInmueble)) &&
      initialData?.inmueble
    ) {
      baseOptions.unshift({
        value: String(formData.idInmueble),
        label: initialData.inmueble.label || initialData.inmueble.registro || "Inmueble actual"
      });
    }

    return baseOptions;
  }, [properties, formData.idInmueble, initialData]);

  const validateNameField = (value, isRequired = false) => {
    if (!value?.trim()) {
      return isRequired ? "Este campo es obligatorio." : "";
    }

    if (!/^[a-zA-ZÁÉÍÓÚáéíóúÜüÑñ'\s]+$/.test(value)) {
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
        if (!numberRegex.test(trimmed)) return "Solo se permiten números.";
        if (trimmed.length < 5) return "Debe tener al menos 5 dígitos.";
        break;

      case "primerNombre":
      case "segundoNombre":
      case "primerApellido":
      case "segundoApellido":
        return validateNameField(value, ["primerNombre", "primerApellido"].includes(name));

      case "correo":
        if (!trimmed) return "";
        if (!/^.+@.+\..+$/.test(trimmed)) {
          return "Debe ser un correo electrónico válido.";
        }
        break;

      case "telefono":
      case "contactoEmergenciaTelefono":
        if (!trimmed) return "";
        if (!numberRegex.test(trimmed)) return "Solo se permiten números.";
        if (trimmed.length < 7) return "Debe tener al menos 7 dígitos.";
        break;

      case "valorMensual":
      case "valorGarantia":
        if (!trimmed) return "";
        if (Number(trimmed) <= 0) return "Debe ser un valor mayor a 0.";
        break;

      case "fechaInicio":
        if (!trimmed) return "";
        break;

      case "fechaFin":
        if (!trimmed || !formData.fechaInicio) return "";
        if (new Date(trimmed) <= new Date(formData.fechaInicio)) {
          return "La fecha fin debe ser posterior a la fecha inicio.";
        }
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

  const hasErrors = Object.values(errors).some(Boolean);
  const hasEmptyRequired = requiredFields.some((field) => !String(formData[field] ?? "").trim());
  const isButtonDisabled = isSubmitting || hasErrors || hasEmptyRequired;

  const selectedProperty = useMemo(() => {
    if (!formData.idInmueble) return null;
    return (
      properties.find((property) => String(property.id) === String(formData.idInmueble)) ||
      initialData?.inmueble ||
      null
    );
  }, [properties, formData.idInmueble, initialData]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative transform transition-all duration-300 scale-100 overflow-y-auto max-h-[90vh]"
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

        <div className="mb-6 pr-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{formTitle}</h2>
          <p className="text-gray-600 text-sm">
            {isEditing
              ? "Actualice la información del arrendatario y los detalles del contrato"
              : "Complete los datos solicitados para crear un nuevo arrendatario"}
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
                  <option value="CC">Cédula de Ciudadanía (CC)</option>
                  <option value="CE">Cédula de Extranjería (CE)</option>
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
                { id: "primerNombre", label: "Primer Nombre *", placeholder: "Ej: Laura" },
                { id: "segundoNombre", label: "Segundo Nombre", placeholder: "Opcional" },
                { id: "primerApellido", label: "Primer Apellido *", placeholder: "Ej: García" },
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
                  Teléfono <span className="text-red-500">*</span>
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Datos del arrendamiento</h3>
              {propertiesError && (
                <button
                  type="button"
                  onClick={refetch}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Reintentar carga de inmuebles
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="idInmueble" className="block text-xs font-semibold text-gray-700 mb-1">
                  Inmueble asociado <span className="text-red-500">*</span>
                </label>
                <select
                  id="idInmueble"
                  name="idInmueble"
                  value={formData.idInmueble}
                  onChange={handleChange}
                  disabled={loadingProperties}
                  className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                    errors.idInmueble
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                >
                  <option value="">
                    {loadingProperties ? "Cargando inmuebles..." : "Selecciona un inmueble"}
                  </option>
                  {propertyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.idInmueble && <p className="text-red-500 text-xs mt-1 font-medium">{errors.idInmueble}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fechaInicio" className="block text-xs font-semibold text-gray-700 mb-1">
                    Fecha inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fechaInicio"
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                      errors.fechaInicio
                        ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  />
                  {errors.fechaInicio && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fechaInicio}</p>}
                </div>

                <div>
                  <label htmlFor="fechaFin" className="block text-xs font-semibold text-gray-700 mb-1">
                    Fecha fin
                  </label>
                  <input
                    id="fechaFin"
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                      errors.fechaFin
                        ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  />
                  {errors.fechaFin && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fechaFin}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="valorMensual" className="block text-xs font-semibold text-gray-700 mb-1">
                  Valor mensual (COP) <span className="text-red-500">*</span>
                </label>
                <input
                  id="valorMensual"
                  type="number"
                  name="valorMensual"
                  value={formData.valorMensual}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                    errors.valorMensual
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  placeholder="Ej: 1800000"
                />
                {errors.valorMensual && <p className="text-red-500 text-xs mt-1 font-medium">{errors.valorMensual}</p>}
              </div>

              <div>
                <label htmlFor="tipoGarantia" className="block text-xs font-semibold text-gray-700 mb-1">
                  Tipo de garantía
                </label>
                <select
                  id="tipoGarantia"
                  name="tipoGarantia"
                  value={formData.tipoGarantia}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-sm text-sm text-gray-700 bg-white"
                >
                  <option value="">Selecciona una opción</option>
                  {guaranteeTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="valorGarantia" className="block text-xs font-semibold text-gray-700 mb-1">
                  Valor garantía (COP)
                </label>
                <input
                  id="valorGarantia"
                  type="number"
                  name="valorGarantia"
                  value={formData.valorGarantia}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                    errors.valorGarantia
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  placeholder="Opcional"
                />
                {errors.valorGarantia && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.valorGarantia}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="descripcionGarantia" className="block text-xs font-semibold text-gray-700 mb-1">
                  Descripción de la garantía
                </label>
                <textarea
                  id="descripcionGarantia"
                  name="descripcionGarantia"
                  rows={2}
                  value={formData.descripcionGarantia}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Detalles adicionales"
                />
              </div>

              <div>
                <label htmlFor="estado" className="block text-xs font-semibold text-gray-700 mb-1">
                  Estado del arrendatario
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-sm text-sm text-gray-700 bg-white"
                >
                  {tenantStatuses.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProperty && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                <p className="font-semibold text-gray-800">Resumen del inmueble</p>
                <p>{selectedProperty.registro || selectedProperty.label}</p>
                <p>{selectedProperty.direccion}</p>
                <p>
                  {selectedProperty.ciudad} {selectedProperty.departamento && `(${selectedProperty.departamento})`}
                </p>
                <p className="text-xs text-gray-500 mt-1">Estado: {selectedProperty.estado}</p>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Contacto de emergencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="contactoEmergenciaNombre" className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  id="contactoEmergenciaNombre"
                  type="text"
                  name="contactoEmergenciaNombre"
                  value={formData.contactoEmergenciaNombre}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label htmlFor="contactoEmergenciaTelefono" className="block text-xs font-semibold text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  id="contactoEmergenciaTelefono"
                  type="tel"
                  name="contactoEmergenciaTelefono"
                  value={formData.contactoEmergenciaTelefono}
                  onChange={handleChange}
                  className={`w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white ${
                    errors.contactoEmergenciaTelefono
                      ? "border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                  placeholder="Opcional"
                />
                {errors.contactoEmergenciaTelefono && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.contactoEmergenciaTelefono}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactoEmergenciaParentesco" className="block text-xs font-semibold text-gray-700 mb-1">
                  Parentesco
                </label>
                <input
                  id="contactoEmergenciaParentesco"
                  type="text"
                  name="contactoEmergenciaParentesco"
                  value={formData.contactoEmergenciaParentesco}
                  onChange={handleChange}
                  className="w-full p-2.5 border rounded-lg focus:outline-none transition duration-150 shadow-sm text-sm text-gray-700 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Opcional"
                />
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
              placeholder="Notas adicionales sobre el arrendatario o el contrato"
            />
          </section>

          {submitError && (
            <p className="text-sm text-red-600 font-semibold">
              {submitError}
            </p>
          )}

          {propertiesError && (
            <p className="text-sm text-yellow-700 font-medium">
              {propertiesError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`flex-1 px-4 py-3 font-semibold rounded-lg transition duration-150 ${
                isButtonDisabled
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-400/50 hover:bg-blue-700 transform hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? "Guardando..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
