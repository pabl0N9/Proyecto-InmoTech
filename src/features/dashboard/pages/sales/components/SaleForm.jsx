import React, { useState } from "react";

export default function SaleForm({ onSubmit, onClose }) {
  const initialFormData = {
    vendedorTipoDocumento: "CC",
    vendedorDocumento: "",
    vendedorNombreCompleto: "",
    vendedorCorreo: "",
    vendedorTelefono: "",

    compradorTipoDocumento: "CC",
    compradorDocumento: "",
    compradorNombreCompleto: "",
    compradorCorreo: "",
    compradorTelefono: "",

    inmuebleTipo: "",
    inmuebleRegistro: "",
    inmuebleNombre: "",
    inmuebleArea: "",
    inmuebleHabitaciones: "",
    inmuebleBanos: "",
    inmueblePais: "Colombia",
    inmuebleDepartamento: "",
    inmuebleCiudad: "",
    inmuebleBarrio: "",
    inmuebleEstrato: "",
    inmuebleDireccion: "",
    inmueblePrecio: "", // guardamos sólo dígitos (raw)
    inmuebleGaraje: false,
    inmuebleEstado: "Disponible",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const requiredFields = [
    "vendedorDocumento",
    "vendedorNombreCompleto",
    "vendedorCorreo",
    "vendedorTelefono",
    "compradorDocumento",
    "compradorNombreCompleto",
    "compradorCorreo",
    "compradorTelefono",
    "inmuebleTipo",
    "inmuebleRegistro",
    "inmuebleNombre",
    "inmuebleArea",
    "inmuebleHabitaciones",
    "inmuebleBanos",
    "inmuebleDepartamento",
    "inmuebleCiudad",
    "inmuebleEstrato",
    "inmuebleDireccion",
    "inmueblePrecio",
  ];

  // Formatea para mostrar precio (recibe raw digits)
  const formatPriceForDisplay = (raw) => {
    if (!raw) return "";
    const n = parseInt(raw.replace(/\D/g, ""), 10);
    if (Number.isNaN(n)) return "";
    return new Intl.NumberFormat("es-CO").format(n);
  };

  // Validación por campo
  const validateField = (name, value) => {
    let error = "";

    // required
    if (
      requiredFields.includes(name) &&
      (value === "" || (typeof value === "string" && value.trim() === ""))
    ) {
      return "Este campo es obligatorio.";
    }

    // Sólo validar **número de documento** (no el tipo)
    if (name === "vendedorDocumento" || name === "compradorDocumento") {
      if (value.length > 0 && !/^\d+$/.test(value)) {
        error = "Solo se permiten números.";
      } else if (value.length > 0 && value.length < 8) {
        error = "Mínimo 8 dígitos.";
      }
    } else if (name.includes("NombreCompleto")) {
      if (value.length > 0 && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        error = "Solo se permiten letras y espacios.";
      }
    } else if (name.includes("Correo")) {
      if (value.length > 0 && !/^.+@.+\..+$/.test(value)) {
        error = "Debe ser un correo válido.";
      }
    } else if (name.includes("Telefono")) {
      if (value.length > 0 && !/^\d+$/.test(value)) {
        error = "Solo se permiten números.";
      }
    } else if (name === "inmuebleArea") {
      // Área: enteros > 0
      if (value !== "" && !/^\d+$/.test(value)) {
        error = "Debe ser un número entero.";
      } else if (value !== "" && parseInt(value, 10) <= 0) {
        error = "Debe ser mayor que 0.";
      }
    } else if (name === "inmueblePrecio") {
      // inmueblePrecio está guardado como raw digits string
      const raw = String(value).replace(/\D/g, "");
      if (raw === "" || isNaN(parseInt(raw, 10))) {
        error = "Debe ingresar un precio válido.";
      } else if (parseInt(raw, 10) <= 0) {
        error = "Debe ser mayor que 0.";
      }
    }

    return error;
  };

  // Helper para sanitizar valores numéricos en inputs
  const keepDigits = (v) => v.toString().replace(/\D/g, "");

  const handleChange = (e) => {
    const { name, value: rawValue, type, checked } = e.target;
    let value = type === "checkbox" ? checked : rawValue;

    // Sanitizar campos numéricos para evitar caracteres indeseados
    if (
      name === "vendedorDocumento" ||
      name === "compradorDocumento" ||
      name === "vendedorTelefono" ||
      name === "compradorTelefono" ||
      name === "inmuebleArea"
    ) {
      value = keepDigits(value);
    }

    // Precio: guardamos sólo dígitos en formData.inmueblePrecio
    if (name === "inmueblePrecio") {
      value = keepDigits(value); // raw digits
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos que nos interesan
    let formErrors = {};
    let isFormValid = true;

    Object.keys(formData).forEach((name) => {
      // Ignorar campos que no requieren validación estricta de formato
      if (
        name.includes("TipoDocumento") ||
        name === "inmueblePais" ||
        name === "inmuebleGaraje" ||
        name === "inmuebleEstado" ||
        name === "inmuebleBarrio"
      )
        return;

      const error = validateField(name, formData[name]);
      if (error) {
        formErrors[name] = error;
        isFormValid = false;
      }
    });

    // Validar que vendedor y comprador no sean la misma persona (documento y/o correo)
    const vendDoc = String(formData.vendedorDocumento || "").trim();
    const compDoc = String(formData.compradorDocumento || "").trim();
    const vendMail = String(formData.vendedorCorreo || "").trim().toLowerCase();
    const compMail = String(formData.compradorCorreo || "").trim().toLowerCase();

    if (vendDoc && compDoc && vendDoc === compDoc) {
      formErrors.compradorDocumento = "El comprador no puede tener el mismo documento que el vendedor.";
      isFormValid = false;
    }

    if (vendMail && compMail && vendMail === compMail) {
      formErrors.compradorCorreo = "El comprador no puede tener el mismo correo que el vendedor.";
      isFormValid = false;
    }

    setErrors(formErrors);

    if (!isFormValid) {
      console.error("Errores de validación:", formErrors);
      return;
    }

    // Preparar payload final: convertir area y precio a números
    const finalData = {
      ...formData,
      inmuebleArea: formData.inmuebleArea !== "" ? parseInt(formData.inmuebleArea, 10) : null,
      // inmueblePrecio guardado en raw digits; enviar como número
      inmueblePrecio:
        formData.inmueblePrecio !== "" ? parseInt(String(formData.inmueblePrecio).replace(/\D/g, ""), 10) : null,
    };

    console.log("Datos de venta enviados:", finalData);

    if (onSubmit) onSubmit(finalData);
    if (onClose) onClose();
  };

  const hasErrors = Object.values(errors).some((err) => err);
  const hasMissingRequiredFields = requiredFields.some(
    (name) =>
      !formData[name] || (typeof formData[name] === "string" && formData[name].trim() === "")
  );

  const inputClass = (name) =>
    `w-full rounded-md p-2 focus:outline-none focus:ring-2 transition duration-150 ${
      errors[name] ? "border-2 border-red-500 focus:ring-red-500" : "border border-gray-300 focus:ring-purple-500"
    }`;
  const labelClass = "block text-sm font-medium text-gray-700 mt-2";
  const requiredSpan = <span className="text-red-500">*</span>;
  const errorText = (name) =>
    errors[name] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[name]}</p>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto transform transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-semibold p-1 rounded-full hover:bg-gray-100"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">Crear venta</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del vendedor */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Datos del vendedor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="vendedorTipoDocumento" className={labelClass}>
                  Tipo de documento{requiredSpan}
                </label>
                <select
                  id="vendedorTipoDocumento"
                  name="vendedorTipoDocumento"
                  value={formData.vendedorTipoDocumento}
                  onChange={handleChange}
                  className={inputClass("vendedorTipoDocumento")}
                  required
                >
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                </select>
              </div>

              <div>
                <label htmlFor="vendedorDocumento" className={labelClass}>
                  Número de documento{requiredSpan}
                </label>
                <input
                  type="text"
                  id="vendedorDocumento"
                  name="vendedorDocumento"
                  value={formData.vendedorDocumento}
                  onChange={handleChange}
                  className={inputClass("vendedorDocumento")}
                  required
                  inputMode="numeric"
                />
                {errorText("vendedorDocumento")}
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="vendedorNombreCompleto" className={labelClass}>
                  Nombre completo{requiredSpan}
                </label>
                <input
                  type="text"
                  id="vendedorNombreCompleto"
                  name="vendedorNombreCompleto"
                  value={formData.vendedorNombreCompleto}
                  onChange={handleChange}
                  className={inputClass("vendedorNombreCompleto")}
                  required
                />
                {errorText("vendedorNombreCompleto")}
              </div>

              <div>
                <label htmlFor="vendedorCorreo" className={labelClass}>
                  Correo{requiredSpan}
                </label>
                <input
                  type="email"
                  id="vendedorCorreo"
                  name="vendedorCorreo"
                  value={formData.vendedorCorreo}
                  onChange={handleChange}
                  className={inputClass("vendedorCorreo")}
                  required
                />
                {errorText("vendedorCorreo")}
              </div>

              <div>
                <label htmlFor="vendedorTelefono" className={labelClass}>
                  Teléfono{requiredSpan}
                </label>
                <input
                  type="text"
                  id="vendedorTelefono"
                  name="vendedorTelefono"
                  value={formData.vendedorTelefono}
                  onChange={handleChange}
                  className={inputClass("vendedorTelefono")}
                  required
                  inputMode="tel"
                />
                {errorText("vendedorTelefono")}
              </div>
            </div>
          </section>

          <hr className="border-gray-300 my-6" />

          {/* Datos del comprador */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Datos del comprador</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="compradorTipoDocumento" className={labelClass}>
                  Tipo de documento{requiredSpan}
                </label>
                <select
                  id="compradorTipoDocumento"
                  name="compradorTipoDocumento"
                  value={formData.compradorTipoDocumento}
                  onChange={handleChange}
                  className={inputClass("compradorTipoDocumento")}
                  required
                >
                  <option value="CC">CC</option>
                  <option value="CE">CE</option>
                  <option value="NIT">NIT</option>
                </select>
              </div>

              <div>
                <label htmlFor="compradorDocumento" className={labelClass}>
                  Número de documento{requiredSpan}
                </label>
                <input
                  type="text"
                  id="compradorDocumento"
                  name="compradorDocumento"
                  value={formData.compradorDocumento}
                  onChange={handleChange}
                  className={inputClass("compradorDocumento")}
                  required
                  inputMode="numeric"
                />
                {errorText("compradorDocumento")}
              </div>

              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="compradorNombreCompleto" className={labelClass}>
                  Nombre completo{requiredSpan}
                </label>
                <input
                  type="text"
                  id="compradorNombreCompleto"
                  name="compradorNombreCompleto"
                  value={formData.compradorNombreCompleto}
                  onChange={handleChange}
                  className={inputClass("compradorNombreCompleto")}
                  required
                />
                {errorText("compradorNombreCompleto")}
              </div>

              <div>
                <label htmlFor="compradorCorreo" className={labelClass}>
                  Correo{requiredSpan}
                </label>
                <input
                  type="email"
                  id="compradorCorreo"
                  name="compradorCorreo"
                  value={formData.compradorCorreo}
                  onChange={handleChange}
                  className={inputClass("compradorCorreo")}
                  required
                />
                {errorText("compradorCorreo")}
              </div>

              <div>
                <label htmlFor="compradorTelefono" className={labelClass}>
                  Teléfono{requiredSpan}
                </label>
                <input
                  type="text"
                  id="compradorTelefono"
                  name="compradorTelefono"
                  value={formData.compradorTelefono}
                  onChange={handleChange}
                  className={inputClass("compradorTelefono")}
                  required
                  inputMode="tel"
                />
                {errorText("compradorTelefono")}
              </div>
            </div>
          </section>

          <hr className="border-gray-300 my-6" />

          {/* Datos del inmueble */}
          <section className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Datos del inmueble</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="inmuebleTipo" className={labelClass}>
                  Tipo de Inmueble{requiredSpan}
                </label>
                <select
                  id="inmuebleTipo"
                  name="inmuebleTipo"
                  value={formData.inmuebleTipo}
                  onChange={handleChange}
                  className={inputClass("inmuebleTipo")}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Lote">Lote</option>
                  <option value="Apartaestudio">Apartaestudio</option>
                </select>
                {errorText("inmuebleTipo")}
              </div>

              <div>
                <label htmlFor="inmuebleRegistro" className={labelClass}>
                  Registro Inmobiliario{requiredSpan}
                </label>
                <input
                  type="text"
                  id="inmuebleRegistro"
                  name="inmuebleRegistro"
                  value={formData.inmuebleRegistro}
                  onChange={handleChange}
                  className={inputClass("inmuebleRegistro")}
                  required
                />
                {errorText("inmuebleRegistro")}
              </div>

              <div className="col-span-2">
                <label htmlFor="inmuebleNombre" className={labelClass}>
                  Nombre del Inmueble{requiredSpan}
                </label>
                <input
                  type="text"
                  id="inmuebleNombre"
                  name="inmuebleNombre"
                  value={formData.inmuebleNombre}
                  onChange={handleChange}
                  className={inputClass("inmuebleNombre")}
                  required
                />
                {errorText("inmuebleNombre")}
              </div>

              <div>
                <label htmlFor="inmuebleArea" className={labelClass}>
                  Área (m²){requiredSpan}
                </label>
                <input
                  type="text"
                  id="inmuebleArea"
                  name="inmuebleArea"
                  value={formData.inmuebleArea}
                  onChange={handleChange}
                  className={inputClass("inmuebleArea")}
                  required
                  inputMode="numeric"
                  placeholder="Ej: 120"
                />
                {errorText("inmuebleArea")}
              </div>

              <div>
                <label htmlFor="inmuebleHabitaciones" className={labelClass}>
                  Habitaciones{requiredSpan}
                </label>
                <select
                  id="inmuebleHabitaciones"
                  name="inmuebleHabitaciones"
                  value={formData.inmuebleHabitaciones}
                  onChange={handleChange}
                  className={inputClass("inmuebleHabitaciones")}
                  required
                >
                  <option value="">#</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
                {errorText("inmuebleHabitaciones")}
              </div>

              <div>
                <label htmlFor="inmuebleBanos" className={labelClass}>
                  Baños{requiredSpan}
                </label>
                <select
                  id="inmuebleBanos"
                  name="inmuebleBanos"
                  value={formData.inmuebleBanos}
                  onChange={handleChange}
                  className={inputClass("inmuebleBanos")}
                  required
                >
                  <option value="">#</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
                {errorText("inmuebleBanos")}
              </div>

              <div>
                <label htmlFor="inmueblePais" className={labelClass}>
                  País{requiredSpan}
                </label>
                <select
                  id="inmueblePais"
                  name="inmueblePais"
                  value={formData.inmueblePais}
                  onChange={handleChange}
                  className={inputClass("inmueblePais")}
                  required
                >
                  <option value="Colombia">Colombia</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="inmuebleDepartamento" className={labelClass}>
                  Departamento{requiredSpan}
                </label>
                <input
                  type="text"
                  id="inmuebleDepartamento"
                  name="inmuebleDepartamento"
                  value={formData.inmuebleDepartamento}
                  onChange={handleChange}
                  className={inputClass("inmuebleDepartamento")}
                  required
                />
                {errorText("inmuebleDepartamento")}
              </div>

              <div>
                <label htmlFor="inmuebleCiudad" className={labelClass}>
                  Ciudad{requiredSpan}
                </label>
                <input
                  type="text"
                  id="inmuebleCiudad"
                  name="inmuebleCiudad"
                  value={formData.inmuebleCiudad}
                  onChange={handleChange}
                  className={inputClass("inmuebleCiudad")}
                  required
                />
                {errorText("inmuebleCiudad")}
              </div>

              <div>
                <label htmlFor="inmuebleBarrio" className={labelClass}>
                  Barrio
                </label>
                <input
                  type="text"
                  id="inmuebleBarrio"
                  name="inmuebleBarrio"
                  value={formData.inmuebleBarrio}
                  onChange={handleChange}
                  className={inputClass("inmuebleBarrio")}
                />
                {errorText("inmuebleBarrio")}
              </div>

              <div>
                <label htmlFor="inmuebleEstrato" className={labelClass}>
                  Estrato{requiredSpan}
                </label>
                <select
                  id="inmuebleEstrato"
                  name="inmuebleEstrato"
                  value={formData.inmuebleEstrato}
                  onChange={handleChange}
                  className={inputClass("inmuebleEstrato")}
                  required
                >
                  <option value="">#</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
                {errorText("inmuebleEstrato")}
              </div>

              <div className="col-span-2">
                <label htmlFor="inmuebleDireccion" className={labelClass}>
                  Dirección{requiredSpan}
                </label>
                <input
                  type="text"
                  id="inmuebleDireccion"
                  name="inmuebleDireccion"
                  value={formData.inmuebleDireccion}
                  onChange={handleChange}
                  className={inputClass("inmuebleDireccion")}
                  required
                />
                {errorText("inmuebleDireccion")}
              </div>

              <div>
                <label htmlFor="inmueblePrecio" className={labelClass}>
                  Precio (COP){requiredSpan}
                </label>
                <input
                  type="text"
                  id="inmueblePrecio"
                  name="inmueblePrecio"
                  value={formatPriceForDisplay(formData.inmueblePrecio)}
                  onChange={(e) =>
                    // onChange recibe un string con puntos o sin; extraemos los dígitos y delegamos
                    handleChange({
                      target: { name: "inmueblePrecio", value: e.target.value },
                    })
                  }
                  className={inputClass("inmueblePrecio")}
                  required
                  inputMode="numeric"
                  placeholder="Ej: 1.200.000"
                />
                {errorText("inmueblePrecio")}
              </div>

              <div className="flex items-center pt-4">
                <input
                  type="checkbox"
                  id="inmuebleGaraje"
                  name="inmuebleGaraje"
                  checked={formData.inmuebleGaraje}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="inmuebleGaraje" className="ml-2 block text-sm font-medium text-gray-700">
                  Garaje
                </label>
              </div>

              <div>
                <label htmlFor="inmuebleEstado" className={labelClass}>
                  Estado
                </label>
                <select
                  id="inmuebleEstado"
                  name="inmuebleEstado"
                  value={formData.inmuebleEstado}
                  onChange={handleChange}
                  className={inputClass("inmuebleEstado")}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Vendido">Vendido</option>
                  <option value="En trámite">En trámite</option>
                </select>
              </div>
            </div>
          </section>

          {/* Botones */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={hasErrors || hasMissingRequiredFields}
              className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                hasErrors || hasMissingRequiredFields
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              Guardar venta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
