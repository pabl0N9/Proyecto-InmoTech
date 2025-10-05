import React, { useRef, useState, useCallback } from "react";

// Lista de campos que deben ser obligatorios para la venta
const requiredFields = [
    // Cliente
    "tipoDocCliente", "numeroDocCliente", "primerNombreCliente", 
    "primerApellidoCliente", "telefonoCliente", "correoCliente",
    // Producto/Servicio
    "nombreProducto", "cantidad", 
    // Financiero
    "precioUnitario", "metodoPago", "fechaVenta", "estadoVenta",
];

// Nombres de los campos que requieren formato especial (Documento, Numérico, Moneda)
const NUMERO_DOC_CLI = "numeroDocCliente";

export default function SalesForm({ onClose, onSubmit }) {
    const [step, setStep] = useState(1);
    // Estado para manejar los errores en línea.
    const [errors, setErrors] = useState({});
    const totalSteps = 3; // Reducido a 3 pasos para el formulario de ventas

    const initial = {
        // Datos del Cliente
        tipoDocCliente: "", numeroDocCliente: "", primerNombreCliente: "", segundoNombreCliente: "",
        primerApellidoCliente: "", segundoApellidoCliente: "", correoCliente: "", telefonoCliente: "",

        // Detalles del Producto/Servicio
        nombreProducto: "", cantidad: "", referencia: "", descripcion: "",

        // Datos Financieros y Cierre
        precioUnitario: "", impuesto: "", metodoPago: "", fechaVenta: "", estadoVenta: "",
    };

    // refs para mantener TODOS los valores sin causar re-renders en cada letra
    const valuesRef = useRef({ ...initial });
    // Ref para mantener los valores formateados visibles en los inputs
    const displayValuesRef = useRef({ ...initial });
    const elRefs = useRef({});
    const errorFocusTimeout = useRef(null); 

    // Lista de campos que deben ser estrictamente numéricos (solo dígitos)
    const strictNumericFields = [
        "cantidad", "impuesto"
    ];
    
    // Campos que requieren formato de miles
    const currencyFields = ["precioUnitario"];

    // Campos agrupados por paso para la validación
    const stepFields = {
        1: [
            "tipoDocCliente", NUMERO_DOC_CLI, "primerNombreCliente", "segundoNombreCliente",
            "primerApellidoCliente", "segundoApellidoCliente", "correoCliente", "telefonoCliente",
        ],
        2: [
            "nombreProducto", "cantidad", "referencia", "descripcion",
        ],
        3: [
            "precioUnitario", "impuesto", "metodoPago", "fechaVenta", "estadoVenta"
        ],
    };

    const getLabel = (name) => {
        const labels = {
            tipoDocCliente: "Tipo de Documento", numeroDocCliente: "Número de Documento", primerNombreCliente: "Primer Nombre",
            segundoNombreCliente: "Segundo Nombre", primerApellidoCliente: "Primer Apellido", segundoApellidoCliente: "Segundo Apellido",
            correoCliente: "Correo Electrónico", telefonoCliente: "Teléfono",

            nombreProducto: "Nombre del Producto/Servicio", cantidad: "Cantidad", referencia: "Referencia/SKU",
            descripcion: "Descripción",

            precioUnitario: "Precio Unitario (COP)", impuesto: "Impuesto (%)", metodoPago: "Método de Pago", 
            fechaVenta: "Fecha de Venta", estadoVenta: "Estado de la Venta",
        };
        return labels[name] ?? name;
    };

    // Función para obtener la clase de estilo (incluyendo el resaltado de error)
    const getFieldClass = useCallback((fieldName) => {
        // Mantiene el color morado como foco y el rojo para error
        const errorClass = errors[fieldName] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500';
        // Aseguramos el uso de la fuente sans-serif y esquinas redondeadas
        return `w-full p-2 border rounded-md font-sans focus:outline-none transition duration-150 ${errorClass}`;
    }, [errors]);

    // Campos para validaciones de formato
    const nameFields = [
        "primerNombreCliente", "segundoNombreCliente", "primerApellidoCliente", "segundoApellidoCliente",
    ];
    const docFields = [ NUMERO_DOC_CLI ];
    const phoneFields = [ "telefonoCliente" ];
    const emailFields = [ "correoCliente" ];

    // --- UTILITY: Formatea un número con separadores de miles ---
    const formatNumberWithThousandsSeparator = (value) => {
        if (!value) return "";
        // 1. Limpiar el valor de cualquier separador no numérico
        const cleanValue = value.toString().replace(/[^0-9]/g, '');
        if (cleanValue === "") return "";
        
        // 2. Formatear con separador de miles (usando punto para Colombia - es-CO)
        const formatter = new Intl.NumberFormat('es-CO', { 
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return formatter.format(cleanValue);
    };

    const setElRef = (name) => (el) => {
        if (!el) return;
        elRefs.current[name] = el;
        if (valuesRef.current[name] === undefined || valuesRef.current[name] === null) {
            valuesRef.current[name] = initial[name] ?? "";
        }
        
        // Inicializar el valor de visualización si es un campo de moneda
        if (currencyFields.includes(name) && valuesRef.current[name]) {
            displayValuesRef.current[name] = formatNumberWithThousandsSeparator(valuesRef.current[name].toString());
        } else {
            displayValuesRef.current[name] = valuesRef.current[name];
        }

        // Sincronizar el valor inicial en el elemento del DOM
        if (el.type === "checkbox") {
            el.checked = !!valuesRef.current[name];
        } else {
            if (displayValuesRef.current[name] !== undefined) {
                try { el.value = displayValuesRef.current[name]; } catch (err) { /* ignore */ }
            }
        }
    };

    const handleInputChange = (e) => {
        let { name, type, value, checked } = e.target;
        let cleanValue = value;

        if (type === "checkbox") {
            valuesRef.current[name] = checked;
        } else {
            // Manejo de campos de moneda (ej: precioUnitario)
            if (currencyFields.includes(name)) {
                cleanValue = value.replace(/[^0-9]/g, ''); // Solo dígitos
                const formattedValue = formatNumberWithThousandsSeparator(cleanValue);
                
                displayValuesRef.current[name] = formattedValue;
                e.target.value = formattedValue; // Forzar la actualización visual
            } else {
                displayValuesRef.current[name] = value;
            }
            
            // Guardar siempre el valor LIMPIO (solo dígitos si es numérico con formato) o el valor original
            valuesRef.current[name] = cleanValue;
        }

        // Limpieza de error en vivo
        if (errors[name] && cleanValue.length > 0) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // --- FUNCIONES DE VALIDACIÓN DE FORMATO ---
    const isValidName = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value);
    const isValidNumeric = (value) => /^\d*$/.test(value); // Solo dígitos (0-9)
    const isValidEmail = (value) => value.includes('@') && /\S+@\S+\.\S+/.test(value);

    // Handler para verificar obligatoriedad, longitud y formato al salir del campo
    const handleInputBlur = (e) => {
        const { name } = e.target;
        // Tomamos el valor limpio de la ref
        const value = valuesRef.current[name] || ""; 
        
        let errorMessage = null;
        const minLengthDoc = 8;
        const isRequired = requiredFields.includes(name);

        setErrors(prev => {
            const newErrors = { ...prev };

            // 1. Validar OBLIGATORIO
            if (isRequired && !value.toString().trim()) { 
                errorMessage = "Este campo es obligatorio.";
            }

            // 2. Validar formato y longitud (solo si no hay un error de obligatoriedad y el campo tiene valor)
            if (!errorMessage && value.toString().trim()) {
                if (nameFields.includes(name) && !isValidName(value)) {
                    errorMessage = `Solo se permiten letras.`;
                } else if (docFields.includes(name)) {
                    if (!isValidNumeric(value)) {
                        errorMessage = `Solo se permiten números.`;
                    } else if (value.length < minLengthDoc) {
                        errorMessage = `Debe tener un mínimo de ${minLengthDoc} números.`;
                    }
                } else if (phoneFields.includes(name) && !isValidNumeric(value)) {
                    errorMessage = `Solo se permiten números.`;
                } else if (emailFields.includes(name) && !isValidEmail(value)) {
                    errorMessage = `El correo electrónico debe contener un '@' y ser válido.`;
                } else if (strictNumericFields.includes(name) && !isValidNumeric(value)) { 
                    errorMessage = `Solo se permiten números enteros.`;
                } else if (name === 'impuesto' && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
                    errorMessage = `El impuesto debe ser entre 0 y 100%.`;
                }
            }
            
            // Aplicar el error (si lo hay) o limpiar el error existente
            if (errorMessage) {
                newErrors[name] = errorMessage;
            } else {
                delete newErrors[name];
            }

            return newErrors;
        });
    };
    
    // --- LÓGICA DE VALIDACIÓN CENTRAL ---
    const runValidation = (fieldsToCheck) => {
        let currentErrors = { ...errors };
        let hasError = false;
        let firstErrorField = null;
        const minLengthDoc = 8;
        
        for (const fieldName of fieldsToCheck) {
            const value = valuesRef.current[fieldName] || "";
            let error = null;

            const isRequired = requiredFields.includes(fieldName);
            
            // A. Validación de Obligatoriedad
            if (isRequired && !value.toString().trim()) { 
                error = "Este campo es obligatorio.";
            } 
            
            // B. Validación de Obligatoriedad y > 0 para números estrictos/moneda
            if (isRequired && (strictNumericFields.includes(fieldName) || currencyFields.includes(fieldName))) {
                 if (!value.toString().trim() || parseFloat(value) <= 0 || isNaN(parseFloat(value))) {
                     error = "Este campo es obligatorio y debe ser mayor a 0.";
                 }
            }

            // C. Validación de Formato (usa el valor limpio)
            if (!error && value.toString().trim()) {
                if (nameFields.includes(fieldName) && !isValidName(value)) {
                    error = `Solo se permiten letras, espacios y acentos.`;
                } else if (docFields.includes(fieldName)) {
                    if (!isValidNumeric(value)) {
                        error = `Solo se permiten dígitos.`;
                    } else if (value.length < minLengthDoc) {
                        error = `Debe tener un mínimo de ${minLengthDoc} dígitos.`;
                    }
                } else if (phoneFields.includes(fieldName) && !isValidNumeric(value)) {
                    error = `Solo se permiten dígitos.`;
                } else if (emailFields.includes(fieldName) && !isValidEmail(value)) {
                    error = `Debe contener un '@' y ser válido.`;
                } else if (strictNumericFields.includes(fieldName) && !isValidNumeric(value)) { 
                    error = `Solo se permiten números enteros.`;
                } else if (fieldName === 'impuesto' && value.trim() && (parseFloat(value) < 0 || parseFloat(value) > 100)) {
                    error = `El impuesto debe ser entre 0 y 100%.`;
                }
            }
            
            // D. Actualizar el estado de errores
            if (error) {
                currentErrors[fieldName] = error;
                hasError = true;
                if (!firstErrorField) {
                    firstErrorField = fieldName;
                }
            } else {
                delete currentErrors[fieldName];
            }
        }
        
        // Re-evaluar firstErrorField
        if (!firstErrorField) {
            for (const fieldName of fieldsToCheck) {
                if (currentErrors[fieldName]) {
                    firstErrorField = fieldName;
                    break;
                }
            }
        }
        
        return { currentErrors, hasError, firstErrorField };
    };

    const handleNextStep = () => {
        const fieldsToValidate = stepFields[step];
        
        const { currentErrors, hasError, firstErrorField } = runValidation(fieldsToValidate);

        setErrors(currentErrors);

        if (hasError) {
            // Enfocar el primer campo con error
            if (errorFocusTimeout.current) clearTimeout(errorFocusTimeout.current);
            errorFocusTimeout.current = setTimeout(() => {
                const el = elRefs.current[firstErrorField];
                if (el) el.focus();
            }, 50);
            return; // Bloquea el avance
        }

        // Si no hay errores, avanza al siguiente paso
        setStep((s) => Math.min(s + 1, totalSteps));
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // En el envío final, validamos TODOS los campos obligatorios
        const allFieldsToValidate = Object.values(stepFields).flat();
        const { currentErrors, hasError, firstErrorField } = runValidation(allFieldsToValidate);

        setErrors(currentErrors);

        if (hasError) {
            // Determinar a qué paso debe volver para mostrar el error
            let targetStep = 1;
            if (stepFields[2].includes(firstErrorField)) targetStep = 2;
            else if (stepFields[3].includes(firstErrorField)) targetStep = 3;
            
            setStep(targetStep);
            
            // Enfocar el primer campo con error
            if (errorFocusTimeout.current) clearTimeout(errorFocusTimeout.current);
            errorFocusTimeout.current = setTimeout(() => {
                const el = elRefs.current[firstErrorField];
                if (el) el.focus();
            }, 50);
            
            return; // Bloquea el envío
        }

        // Si no hay errores, se procede con el envío
        const payload = { ...valuesRef.current };
        if (onSubmit) onSubmit(payload);
        onClose?.();
        console.log("Formulario de Venta Enviado:", payload);
    };

    // Field: componente auxiliar reutilizando el estilo
    const Field = ({ name, as = "input", options = [], placeholder, type = "text" }) => {
        const label = getLabel(name);
        const errorMessage = errors[name];
        const isRequired = requiredFields.includes(name);

        const isDocField = docFields.includes(name);
        const isPhoneField = phoneFields.includes(name);
        const isEmailField = emailFields.includes(name);
        const isStrictNumeric = strictNumericFields.includes(name) || currencyFields.includes(name);
        const isNameField = nameFields.includes(name);

        const needsBlurValidation = isDocField || isNameField || isPhoneField || isEmailField || isRequired || isStrictNumeric || name === 'impuesto';
        const onBlurHandler = needsBlurValidation ? handleInputBlur : undefined;
        
        // Establecer el tipo de input para sugerir teclado numérico
        let inputType = type;
        if ((isDocField || isPhoneField || isStrictNumeric) && type !== 'date' && type !== 'email') {
            inputType = "tel";
        } else if (isEmailField) {
            inputType = "email";
        }

        const LabelContent = (
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1 font-sans">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
        );

        if (as === "select") {
            return (
                <div>
                    {LabelContent}
                    <select
                        id={name}
                        name={name}
                        ref={setElRef(name)}
                        className={getFieldClass(name)} 
                        defaultValue={initial[name] ?? ""}
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                    >
                        <option value="">Seleccione...</option>
                        {options.map((op) => (
                            <option key={op.value} value={op.value}>
                                {op.label}
                            </option>
                        ))}
                    </select>
                    {errorMessage && (
                        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                    )}
                </div>
            );
        }
        
        if (as === "textarea") {
            return (
                <div className="col-span-2">
                    {LabelContent}
                    <textarea
                        id={name}
                        name={name}
                        ref={setElRef(name)}
                        className={getFieldClass(name) + " h-24 resize-none"} 
                        placeholder={placeholder}
                        defaultValue={(displayValuesRef.current[name] || initial[name]) ?? ""} 
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                    />
                    {errorMessage && (
                        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                    )}
                </div>
            );
        }

        return (
            <div>
                {LabelContent}
                <input
                    id={name}
                    name={name}
                    ref={setElRef(name)}
                    className={getFieldClass(name)} 
                    type={inputType}
                    placeholder={placeholder}
                    defaultValue={(displayValuesRef.current[name] || initial[name]) ?? ""} 
                    onChange={handleInputChange}
                    onBlur={onBlurHandler} 
                />
                {errorMessage && (
                    <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                )}
            </div>
        );
    };

    // Cálculo del total
    const precio = parseFloat(valuesRef.current.precioUnitario) || 0;
    const cantidad = parseFloat(valuesRef.current.cantidad) || 0;
    const subtotal = precio * cantidad;
    const impuestoTasa = (parseFloat(valuesRef.current.impuesto) || 0) / 100;
    const valorImpuesto = subtotal * impuestoTasa;
    const total = subtotal + valorImpuesto;

    const formattedTotal = formatNumberWithThousandsSeparator(total);
    const formattedSubtotal = formatNumberWithThousandsSeparator(subtotal);
    const formattedImpuesto = formatNumberWithThousandsSeparator(valorImpuesto);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex justify-center items-center z-50 overflow-y-auto font-sans">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 relative my-8">
                {/* Botón de cierre: Estilo consistente */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-purple-600 p-2 rounded-full hover:bg-purple-50 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-3">Registro de Venta</h2>

                {/* Barra de progreso */}
                <div className="mb-6">
                    <div className="w-full bg-purple-200 h-2 rounded-full">
                        <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300 shadow-md"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                    <p className="text-sm text-purple-700 font-semibold mt-2">
                        Paso {step} de {totalSteps}:{" "}
                        {step === 1 ? "Datos del Cliente" : step === 2 ? "Detalles del Producto" : "Cierre y Pago"}
                        {" "} (Campos obligatorios marcados con *)
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* PASO 1: Datos del Cliente */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Datos del Cliente</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <Field
                                    name="tipoDocCliente"
                                    as="select"
                                    options={[
                                        { value: "CC", label: "Cédula de Ciudadanía (CC)" },
                                        { value: "CE", label: "Cédula de Extranjería (CE)" },
                                        { value: "NIT", label: "NIT" },
                                    ]}
                                />
                                <Field name={NUMERO_DOC_CLI} placeholder="Mínimo 8 dígitos. Solo números." />
                                <Field name="primerNombreCliente" placeholder="Primer Nombre" />
                                <Field name="segundoNombreCliente" placeholder="Segundo Nombre (Opcional)" />
                                <Field name="primerApellidoCliente" placeholder="Primer Apellido" />
                                <Field name="segundoApellidoCliente" placeholder="Segundo Apellido (Opcional)" />
                                <Field name="correoCliente" placeholder="ejemplo@dominio.com" type="email" />
                                <Field name="telefonoCliente" placeholder="Ej: 3001234567" />
                            </div>
                        </div>
                    )}

                    {/* PASO 2: Detalles del Producto/Servicio */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Detalles del Producto/Servicio</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <Field name="nombreProducto" placeholder="Ej: Consultoría de Software" />
                                <Field name="cantidad" placeholder="Solo números enteros mayores a 0." />
                                <Field name="referencia" placeholder="Opcional. Ej: SKU-001" />
                                <Field name="descripcion" as="textarea" placeholder="Descripción detallada del producto o servicio." />
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Cierre y Pago */}
                    {step === 3 && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Datos Financieros y Cierre</h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                                <Field name="precioUnitario" placeholder="Valor sin formato. Se aplicará formato de miles." />
                                <Field name="impuesto" placeholder="0 a 100. Ej: 19 (Opcional)" />
                                <Field
                                    name="metodoPago"
                                    as="select"
                                    options={[
                                        { value: "Transferencia", label: "Transferencia Bancaria" },
                                        { value: "Efectivo", label: "Efectivo" },
                                        { value: "Tarjeta", label: "Tarjeta de Crédito/Débito" },
                                        { value: "Otro", label: "Otro" },
                                    ]}
                                />
                                <Field name="fechaVenta" type="date" />
                                <Field
                                    name="estadoVenta"
                                    as="select"
                                    options={[
                                        { value: "Pendiente", label: "Pendiente de Pago" },
                                        { value: "Pagado", label: "Pagado y Cerrado" },
                                        { value: "Cancelado", label: "Cancelado" },
                                    ]}
                                />
                            </div>

                            {/* Resumen del Cálculo Financiero */}
                            <div className="p-4 bg-purple-50 border border-purple-300 rounded-lg shadow-inner text-gray-800">
                                <h4 className="text-lg font-bold mb-2 text-purple-800">Resumen de la Venta</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p className="font-medium">Subtotal:</p>
                                    <p className="text-right">$ {formattedSubtotal}</p>
                                    <p className="font-medium">Impuesto ({valuesRef.current.impuesto || 0}%):</p>
                                    <p className="text-right">$ {formattedImpuesto}</p>
                                    <div className="col-span-2 border-t border-purple-300 pt-2 flex justify-between font-extrabold text-base">
                                        <span>TOTAL A PAGAR:</span>
                                        <span className="text-purple-600">$ {formattedTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de Navegación (Pie del formulario) */}
                    <div className="pt-4 border-t mt-6 flex justify-between">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
                            >
                                Atrás
                            </button>
                        )}
                        <div className="flex-grow" /> {/* Espaciador */}
                        
                        {step < totalSteps && (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                // Estilo de botón morado y con sombra consistente
                                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-lg shadow-purple-200 hover:bg-purple-700 transition duration-150"
                            >
                                Siguiente
                            </button>
                        )}
                        
                        {step === totalSteps && (
                            <button
                                type="submit"
                                // Estilo de botón principal morado y con sombra consistente
                                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-lg shadow-purple-300 hover:bg-purple-700 transition duration-150"
                            >
                                Registrar Venta
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
