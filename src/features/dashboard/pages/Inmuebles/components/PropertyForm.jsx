import React, { useState } from "react";
import "../style/PropertyFormModal.css";

const PropertyForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Información del Dueño
    tipoDocumento: "",
    numeroDocumento: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    correo: "",
    telefono: "",

    // Información sobre el Inmueble
    tituloInmueble: "",
    tipoInmueble: "",
    tipoOperacion: "",
    registroInmobiliario: "",
    area: "",
    precio: "",
    banos: "",
    habitaciones: "",
    pais: "",
    estrato: "",
    ciudad: "",
    departamento: "",
    barrio: "",
    direccion: "",
    garaje: false,
    cantidadGaraje: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    const requiredFields = [
      'tipoDocumento', 'numeroDocumento', 'primerNombre', 'primerApellido',
      'correo', 'telefono', 'tipoInmueble', 'tipoOperacion', 'registroInmobiliario',
      'area', 'precio', 'banos', 'habitaciones', 'pais', 'estrato', 'ciudad',
      'departamento', 'barrio', 'direccion'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'Este campo es obligatorio';
      }
    });

    // Email validation
    if (formData.correo && !/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'Correo electrónico inválido';
    }

    // Numeric validations
    if (formData.area && isNaN(formData.area)) {
      newErrors.area = 'Debe ser un número';
    }
    if (formData.precio && isNaN(formData.precio)) {
      newErrors.precio = 'Debe ser un número';
    }
    if (formData.banos && isNaN(formData.banos)) {
      newErrors.banos = 'Debe ser un número';
    }
    if (formData.habitaciones && isNaN(formData.habitaciones)) {
      newErrors.habitaciones = 'Debe ser un número';
    }
    if (formData.estrato && isNaN(formData.estrato)) {
      newErrors.estrato = 'Debe ser un número';
    }
    if (formData.garaje && formData.cantidadGaraje && isNaN(formData.cantidadGaraje)) {
      newErrors.cantidadGaraje = 'Debe ser un número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="property-form-modal">
      <div className="form-sections">
        {/* Información del Dueño */}
        <div className="form-section">
          <h3 className="section-title">Información del Dueño</h3>
          <div className="form-columns">
            <div className="form-column">
              <div className="form-group">
                <label>Tipo de Documento *</label>
                <select
                  name="tipoDocumento"
                  value={formData.tipoDocumento}
                  onChange={handleChange}
                  className={errors.tipoDocumento ? 'error' : ''}
                >
                  <option value="">Seleccionar</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="CE">Cédula de Extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="PAS">Pasaporte</option>
                </select>
                {errors.tipoDocumento && <span className="error-message">{errors.tipoDocumento}</span>}
              </div>

              <div className="form-group">
                <label>Número de Documento *</label>
                <input
                  type="text"
                  name="numeroDocumento"
                  value={formData.numeroDocumento}
                  onChange={handleChange}
                  className={errors.numeroDocumento ? 'error' : ''}
                />
                {errors.numeroDocumento && <span className="error-message">{errors.numeroDocumento}</span>}
              </div>

              <div className="form-group">
                <label>Primer Nombre *</label>
                <input
                  type="text"
                  name="primerNombre"
                  value={formData.primerNombre}
                  onChange={handleChange}
                  className={errors.primerNombre ? 'error' : ''}
                />
                {errors.primerNombre && <span className="error-message">{errors.primerNombre}</span>}
              </div>

              <div className="form-group">
                <label>Segundo Nombre</label>
                <input
                  type="text"
                  name="segundoNombre"
                  value={formData.segundoNombre}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Primer Apellido *</label>
                <input
                  type="text"
                  name="primerApellido"
                  value={formData.primerApellido}
                  onChange={handleChange}
                  className={errors.primerApellido ? 'error' : ''}
                />
                {errors.primerApellido && <span className="error-message">{errors.primerApellido}</span>}
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label>Segundo Apellido</label>
                <input
                  type="text"
                  name="segundoApellido"
                  value={formData.segundoApellido}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Correo *</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={errors.correo ? 'error' : ''}
                />
                {errors.correo && <span className="error-message">{errors.correo}</span>}
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={errors.telefono ? 'error' : ''}
                />
                {errors.telefono && <span className="error-message">{errors.telefono}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Información sobre el Inmueble */}
        <div className="form-section">
          <h3 className="section-title">Información sobre el Inmueble</h3>
          <div className="form-columns">
            <div className="form-column">
              <div className="form-group">
                <label>Título del Inmueble</label>
                <input
                  type="text"
                  name="tituloInmueble"
                  value={formData.tituloInmueble}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Tipo de Inmueble *</label>
                <select
                  name="tipoInmueble"
                  value={formData.tipoInmueble}
                  onChange={handleChange}
                  className={errors.tipoInmueble ? 'error' : ''}
                >
                  <option value="">Seleccionar</option>
                  <option value="Casa">Casa</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Local">Local</option>
                  <option value="Finca">Finca</option>
                  <option value="Terreno">Terreno</option>
                </select>
                {errors.tipoInmueble && <span className="error-message">{errors.tipoInmueble}</span>}
              </div>

              <div className="form-group">
                <label>Tipo de Operación *</label>
                <select
                  name="tipoOperacion"
                  value={formData.tipoOperacion}
                  onChange={handleChange}
                  className={errors.tipoOperacion ? 'error' : ''}
                >
                  <option value="">Seleccionar</option>
                  <option value="Venta">Venta</option>
                  <option value="Arriendo">Arriendo</option>
                </select>
                {errors.tipoOperacion && <span className="error-message">{errors.tipoOperacion}</span>}
              </div>

              <div className="form-group">
                <label>Registro Inmobiliario *</label>
                <input
                  type="text"
                  name="registroInmobiliario"
                  value={formData.registroInmobiliario}
                  onChange={handleChange}
                  className={errors.registroInmobiliario ? 'error' : ''}
                />
                {errors.registroInmobiliario && <span className="error-message">{errors.registroInmobiliario}</span>}
              </div>

              <div className="form-group">
                <label>Área (m²) *</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={errors.area ? 'error' : ''}
                />
                {errors.area && <span className="error-message">{errors.area}</span>}
              </div>

              <div className="form-group">
                <label>Precio *</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className={errors.precio ? 'error' : ''}
                />
                {errors.precio && <span className="error-message">{errors.precio}</span>}
              </div>

              <div className="form-group">
                <label>Baños *</label>
                <input
                  type="number"
                  name="banos"
                  value={formData.banos}
                  onChange={handleChange}
                  className={errors.banos ? 'error' : ''}
                />
                {errors.banos && <span className="error-message">{errors.banos}</span>}
              </div>

              <div className="form-group">
                <label>Habitaciones *</label>
                <input
                  type="number"
                  name="habitaciones"
                  value={formData.habitaciones}
                  onChange={handleChange}
                  className={errors.habitaciones ? 'error' : ''}
                />
                {errors.habitaciones && <span className="error-message">{errors.habitaciones}</span>}
              </div>
            </div>

            <div className="form-column">
              <div className="form-group">
                <label>País *</label>
                <select
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className={errors.pais ? 'error' : ''}
                >
                  <option value="">Seleccionar</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.pais && <span className="error-message">{errors.pais}</span>}
              </div>

              <div className="form-group">
                <label>Estrato *</label>
                <select
                  name="estrato"
                  value={formData.estrato}
                  onChange={handleChange}
                  className={errors.estrato ? 'error' : ''}
                >
                  <option value="">Seleccionar</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
                {errors.estrato && <span className="error-message">{errors.estrato}</span>}
              </div>

              <div className="form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className={errors.ciudad ? 'error' : ''}
                />
                {errors.ciudad && <span className="error-message">{errors.ciudad}</span>}
              </div>

              <div className="form-group">
                <label>Departamento *</label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className={errors.departamento ? 'error' : ''}
                />
                {errors.departamento && <span className="error-message">{errors.departamento}</span>}
              </div>

              <div className="form-group">
                <label>Barrio *</label>
                <input
                  type="text"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleChange}
                  className={errors.barrio ? 'error' : ''}
                />
                {errors.barrio && <span className="error-message">{errors.barrio}</span>}
              </div>

              <div className="form-group">
                <label>Dirección *</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className={errors.direccion ? 'error' : ''}
                />
                {errors.direccion && <span className="error-message">{errors.direccion}</span>}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="garaje"
                    checked={formData.garaje}
                    onChange={handleChange}
                  />
                  Garaje
                </label>
              </div>

              {formData.garaje && (
                <div className="form-group">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    name="cantidadGaraje"
                    value={formData.cantidadGaraje}
                    onChange={handleChange}
                    className={errors.cantidadGaraje ? 'error' : ''}
                  />
                  {errors.cantidadGaraje && <span className="error-message">{errors.cantidadGaraje}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" onClick={handleSubmit} style={{backgroundColor: '#9333EA', color: 'white'}}>
          Agregar Inmueble
        </button>
      </div>
    </div>
  );
};

export default PropertyForm;
