import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

// Lista de campos que deben ser obligatorios según la solicitud del usuario (INCLUYE INQUILINO, CODEUDOR, INMUEBLE Y CONTRATO)
const requiredFields = [
    // Inquilino
    "tipoDocInquilino", "numeroDocInquilino", "primerNombreInquilino",
    "primerApellidoInquilino", "telefonoInquilino", "correoInquilino",
    // Codeudor
    "tipoDocCodeudor", "numeroDocCodeudor", "primerNombreCodeudor",
    "primerApellidoCodeudor", "telefonoCodeudor", "correoCodeudor",
    "estabilidadLaboral",
    // Inmueble (Todos los campos excepto Garaje)
    "tipoInmueble", "registroInmobiliario", "nombreInmueble", "area", 
    "habitaciones", "banos", "departamento", "ciudad", "barrio", "estrato", 
    "direccion", "precioInmueble",
    // Contrato
    "fechaInicio", "fechaFinal", "fechaCobro", "precio", "estado",
];

export default function RenantForm({ onClose, onSubmit }) {
    const [step, setStep] = useState(1);
    // Estado para manejar los errores en línea. Usa { fieldName: errorMessage }
    const [errors, setErrors] = useState({});
    const [submissionState, setSubmissionState] = useState({
        isSubmitting: false,
        error: null
    });
    const arrendatarioAutoFillFields = useMemo(
        () => [
            "primerNombreArrendatario",
            "segundoNombreArrendatario",
            "primerApellidoArrendatario",
            "segundoApellidoArrendatario",
            "correoArrendatario",
            "telefonoArrendatario"
        ],
        []
    );
    const [arrendatarioLookupState, setArrendatarioLookupState] = useState({
        loading: false,
        message: "",
        error: null
    });
    const arrendatarioLookupTimeoutRef = useRef(null);
    const arrendatarioLookupRequestId = useRef(0);
    const manuallyEditedArrendatarioFieldsRef = useRef(new Set());
    const totalSteps = 4;

    const initial = {
        tipoDocInquilino: "", numeroDocInquilino: "", primerNombreInquilino: "", segundoNombreInquilino: "",
        primerApellidoInquilino: "", segundoApellidoInquilino: "", correoInquilino: "", telefonoInquilino: "",

        tipoDocCodeudor: "", numeroDocCodeudor: "", primerNombreCodeudor: "", segundoNombreCodeudor: "",
        primerApellidoCodeudor: "", segundoApellidoCodeudor: "", correoCodeudor: "", telefonoCodeudor: "",
        estabilidadLaboral: "",

        tipoInmueble: "", registroInmobiliario: "", nombreInmueble: "", area: "", habitaciones: "", banos: "",
        departamento: "", ciudad: "", barrio: "", estrato: "", direccion: "", precioInmueble: "", garaje: false,

        fechaInicio: "", fechaFinal: "", fechaCobro: "", precio: "", estado: "",
    };

    // refs para mantener TODOS los valores sin causar re-renders en cada letra
    const valuesRef = useRef({ ...initial });
    // Ref para mantener los valores formateados visibles en los inputs, si son diferentes del valor numérico
    const displayValuesRef = useRef({ ...initial });
    const elRefs = useRef({});
    const errorFocusTimeout = useRef(null); // Usado para enfocar el primer campo con error

    // Constantes para los nombres de los campos de documento
    const NUMERO_DOC_INQ = "numeroDocInquilino";
    const NUMERO_DOC_COD = "numeroDocCodeudor";

    // Lista de campos que deben ser estrictamente numéricos (solo dígitos)
    const strictNumericFields = [
        "area", "habitaciones", "banos", "estrato", "precioInmueble", "precio"
    ];
    
    // Campos que requieren formato de miles
    const currencyFields = ["precioInmueble", "precio"];

    // Campos agrupados por paso para la validación de 'Siguiente'
    const stepFields = {
        1: [
            "tipoDocInquilino", NUMERO_DOC_INQ, "primerNombreInquilino", "segundoNombreInquilino",
            "primerApellidoInquilino", "segundoApellidoInquilino", "correoInquilino", "telefonoInquilino",
        ],
        2: [
            "tipoDocCodeudor", NUMERO_DOC_COD, "primerNombreCodeudor", "segundoNombreCodeudor",
            "primerApellidoCodeudor", "segundoApellidoCodeudor", "correoCodeudor", "telefonoCodeudor",
            "estabilidadLaboral",
        ],
        3: [
            "tipoInmueble", "registroInmobiliario", "nombreInmueble", "area", "habitaciones", "banos",
            "departamento", "ciudad", "barrio", "estrato", "direccion", "precioInmueble", "garaje"
        ],
        4: ["fechaInicio", "fechaFinal", "fechaCobro", "precio", "estado"],
    };

    const getLabel = (name) => {
        const labels = {
            tipoDocInquilino: "Tipo de Documento", numeroDocInquilino: "Número de Documento", primerNombreInquilino: "Primer Nombre",
            segundoNombreInquilino: "Segundo Nombre", primerApellidoInquilino: "Primer Apellido", segundoApellidoInquilino: "Segundo Apellido",
            correoInquilino: "Correo Electrónico", telefonoInquilino: "Teléfono", tipoDocCodeudor: "Tipo de Documento Codeudor",
            numeroDocCodeudor: "Número de Documento Codeudor", primerNombreCodeudor: "Primer Nombre Codeudor",
            segundoNombreCodeudor: "Segundo Nombre Codeudor", primerApellidoCodeudor: "Primer Apellido Codeudor",
            segundoApellidoCodeudor: "Segundo Apellido Codeudor", correoCodeudor: "Correo Electrónico Codeudor",
            telefonoCodeudor: "Teléfono Codeudor", estabilidadLaboral: "Estabilidad Económica", tipoInmueble: "Tipo de Inmueble",
            registroInmobiliario: "Registro Inmobiliario", nombreInmueble: "Nombre del Inmueble", area: "Área (m²)",
            habitaciones: "Número de Habitaciones", banos: "Número de Baños", departamento: "Departamento",
            ciudad: "Ciudad", barrio: "Barrio", estrato: "Estrato", direccion: "Dirección", precioInmueble: "Precio del Inmueble",
            garaje: "Garaje", fechaInicio: "Fecha de Inicio", fechaFinal: "Fecha de Finalización", fechaCobro: "Fecha de Cobro",
            precio: "Precio del Arriendo", estado: "Estado del Arriendo",
        };
        return labels[name] ?? name;
    };

    // Función para obtener la clase de estilo (incluyendo el resaltado de error)
    const getFieldClass = useCallback((fieldName) => {
        const errorClass = errors[fieldName] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
        return `w-full p-3 border rounded-lg focus:outline-none transition duration-150 ${errorClass}`;
    }, [errors]);

    // Lista de campos que deben contener solo letras (y acentos/espacios)
    const nameFields = [
        "primerNombreInquilino", "segundoNombreInquilino", "primerApellidoInquilino", "segundoApellidoInquilino",
        "primerNombreCodeudor", "segundoNombreCodeudor", "primerApellidoCodeudor", "segundoApellidoCodeudor",
    ];

    // Lista de campos que deben contener solo números (documentos, min 8)
    const docFields = [
        NUMERO_DOC_INQ, NUMERO_DOC_COD,
    ];

    // Lista de campos que deben contener solo números (teléfonos)
    const phoneFields = [
        "telefonoInquilino", "telefonoCodeudor",
    ];

    // Lista de campos que deben contener un @
    const emailFields = [
        "correoInquilino", "correoCodeudor",
    ];
    
    // --- UTILITY: Formatea un número con separadores de miles ---
    const formatNumberWithThousandsSeparator = (value) => {
        if (!value) return "";
        // 1. Limpiar el valor de cualquier separador no numérico
        const cleanValue = value.replace(/[^0-9]/g, '');
        if (cleanValue === "") return "";
        
        // 2. Formatear con separador de miles (usando punto para Colombia)
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

        if (el.type === "checkbox") {
            el.checked = !!valuesRef.current[name];
        } else {
            if (displayValuesRef.current[name] !== undefined) {
                try { el.value = displayValuesRef.current[name]; } catch (err) { /* ignore */ }
            }
        }
    };

    const resetArrendatarioManualFields = () => {
        manuallyEditedArrendatarioFieldsRef.current.clear();
    };

    const applyArrendatarioData = useCallback((renant) => {
        if (!renant) return;

        const replacements = {
            primerNombreArrendatario: renant.primerNombre || "",
            segundoNombreArrendatario: renant.segundoNombre || "",
            primerApellidoArrendatario: renant.primerApellido || "",
            segundoApellidoArrendatario: renant.segundoApellido || "",
            correoArrendatario: renant.correo || "",
            telefonoArrendatario: renant.telefono || ""
        };

        arrendatarioAutoFillFields.forEach((field) => {
            if (manuallyEditedArrendatarioFieldsRef.current.has(field)) return;
            const value = replacements[field] || "";
            valuesRef.current[field] = value;
            displayValuesRef.current[field] = value;
            const el = elRefs.current[field];
            if (el) {
                el.value = value;
            }
        });

        setErrors((prev) => {
            const next = { ...prev };
            arrendatarioAutoFillFields.forEach((field) => {
                delete next[field];
            });
            return next;
        });
    }, [arrendatarioAutoFillFields]);

    const cleanDocument = (value = "") => value.toString().replace(/[^0-9]/g, "").trim();

    const fetchArrendatarioByDocument = useCallback(async () => {
        const tipoDocumento = (valuesRef.current.tipoDocArrendatario || "").trim();
        const numeroDocumento = cleanDocument(valuesRef.current.numeroDocArrendatario);

        if (!tipoDocumento || !numeroDocumento) {
            setArrendatarioLookupState({ loading: false, message: "", error: null });
            return;
        }

        const documentError = validateDocument(tipoDocumento, numeroDocumento);
        if (documentError) {
            setArrendatarioLookupState({
                loading: false,
                message: "",
                error: documentError
            });
            return;
        }

        arrendatarioLookupRequestId.current += 1;
        const requestId = arrendatarioLookupRequestId.current;

        setArrendatarioLookupState({ loading: true, message: "", error: null });

        try {
            const results = await renantsApiService.getAll({
                tipo_documento: tipoDocumento,
                numero_documento: numeroDocumento
            });

            if (arrendatarioLookupRequestId.current !== requestId) return;

            const matchingRenant = results.find((renant) => {
                const storedDoc = cleanDocument(renant.documento);
                return (
                    storedDoc === numeroDocumento &&
                    (renant.tipoDocumento || "").toString().trim() === tipoDocumento
                );
            });

            if (matchingRenant) {
                applyArrendatarioData(matchingRenant);
                setArrendatarioLookupState({
                    loading: false,
                    message: "Datos completados automáticamente.",
                    error: null
                });
            } else {
                setArrendatarioLookupState({
                    loading: false,
                    message: "",
                    error: "No encontramos un arrendatario con ese documento."
                });
            }
        } catch (error) {
            if (arrendatarioLookupRequestId.current !== requestId) return;
            setArrendatarioLookupState({
                loading: false,
                message: "",
                error: error?.message || "No fue posible buscar el arrendatario."
            });
        }
    }, [applyArrendatarioData]);

    const triggerArrendatarioLookup = useCallback(
        (delay = 400) => {
            if (arrendatarioLookupTimeoutRef.current) {
                clearTimeout(arrendatarioLookupTimeoutRef.current);
            }
            arrendatarioLookupTimeoutRef.current = setTimeout(() => {
                fetchArrendatarioByDocument();
            }, delay);
        },
        [fetchArrendatarioByDocument]
    );

    useEffect(() => {
        return () => {
            if (arrendatarioLookupTimeoutRef.current) {
                clearTimeout(arrendatarioLookupTimeoutRef.current);
            }
        };
    }, []);

    // handler que NO hace setState, solo actualiza ref (sin re-render)
    const handleInputChange = (e) => {
        let { name, type, value, checked } = e.target;
        let cleanValue = value;

        if (type === "checkbox") {
            valuesRef.current[name] = checked;
        } else {
            // Si es un campo de moneda, limpiamos el valor antes de guardarlo en valuesRef
            if (currencyFields.includes(name)) {
                cleanValue = value.replace(/[^0-9]/g, ''); // Solo dígitos
                const formattedValue = formatNumberWithThousandsSeparator(cleanValue);
                
                // Actualizar el valor a mostrar en el input (lo que ve el usuario)
                displayValuesRef.current[name] = formattedValue;
                e.target.value = formattedValue; // Forzar la actualización visual
            } else {
                displayValuesRef.current[name] = value;
            }
            
            // Guardar siempre el valor LIMPIO (solo dígitos si es numérico con formato) o el valor original
            valuesRef.current[name] = cleanValue;
        }

        // Limpieza de error en vivo al escribir, solo si ya existía un error
        if (errors[name] && cleanValue.length === 0) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (arrendatarioAutoFillFields.includes(name) && type !== "checkbox") {
            manuallyEditedArrendatarioFieldsRef.current.add(name);
        }

        if (name === "tipoDocArrendatario" || name === NUMERO_DOC_ARR) {
            resetArrendatarioManualFields();
            setArrendatarioLookupState((prev) => {
                if (!prev.loading && !prev.message && !prev.error) return prev;
                return { loading: false, message: "", error: null };
            });
            triggerArrendatarioLookup();
        }
    };

    // --- FUNCIONES DE VALIDACIÓN DE FORMATO ---
    const isValidName = (value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value);
    const isValidNumeric = (value) => /^\d*$/.test(value); // Solo dígitos (0-9)
    const isValidEmail = (value) => value.includes('@');

    // Handler para verificar obligatoriedad, longitud y formato al salir del campo
    const handleInputBlur = (e) => {
        const { name } = e.target;
        // Tomamos el valor limpio de la ref, no del e.target.value (que podría estar formateado)
        const value = valuesRef.current[name] || ""; 
        
        let errorMessage = null;
        const minLengthDoc = 8;
        const isRequired = requiredFields.includes(name);
        const conflictErrorMsg = "El número de documento del Inquilino no puede ser igual al del Codeudor.";

        setErrors(prev => {
            const newErrors = { ...prev };

            // 1. Validar OBLIGATORIO
            if (isRequired && !value.trim() && name !== 'garaje') { 
                 errorMessage = "Este campo es obligatorio.";
            }

            // 2. Validar formato y longitud (solo si no hay un error de obligatoriedad y el campo tiene valor)
            if (!errorMessage && value.trim()) {
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
                    errorMessage = `El correo electrónico debe contener un '@'.`;
                } else if (strictNumericFields.includes(name) && !isValidNumeric(value)) { 
                    errorMessage = `Solo se permiten números enteros.`;
                }
            }

            // 3. Validar CONFLICTO DE DOCUMENTO (solo si es un campo de documento y no tiene otro error más grave)
            if (!errorMessage && docFields.includes(name)) {
                const otherDocName = name === NUMERO_DOC_INQ ? NUMERO_DOC_COD : NUMERO_DOC_INQ;
                const otherDocValue = valuesRef.current[otherDocName] || "";
                
                if (value.trim() && otherDocValue.trim() && value === otherDocValue) {
                    errorMessage = conflictErrorMsg;
                    // Si hay conflicto, actualiza el error en el otro campo inmediatamente
                    if (newErrors[otherDocName] !== conflictErrorMsg) {
                         newErrors[otherDocName] = conflictErrorMsg;
                    }
                } else if (newErrors[otherDocName] === conflictErrorMsg) {
                    // Si el otro campo tenía el error de conflicto, lo limpiamos
                    delete newErrors[otherDocName];
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
        
        // 1. Iterar sobre los campos del paso actual o todos para validaciones individuales
        for (const fieldName of fieldsToCheck) {
            // Siempre usamos el valor LIMPIO de valuesRef para la validación
            const value = valuesRef.current[fieldName] || "";
            let error = null;

            const isRequired = requiredFields.includes(fieldName);
            
            // A. Validación de Obligatoriedad
            if (isRequired && !value.toString().trim() && fieldName !== 'garaje') { 
                error = "Este campo es obligatorio.";
            } 
            
            // B. Validación de Obligatoriedad y > 0 para números estrictos
            if (isRequired && strictNumericFields.includes(fieldName)) {
                 if (!value.toString().trim() || parseFloat(value) <= 0 || isNaN(parseFloat(value))) {
                     error = "Este campo es obligatorio";
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
                 // Limpiar el error si el campo es válido (pero no tocar el error de CONFLICTO si ya existe)
                 const isConflictError = currentErrors[fieldName] === "El número de documento del Inquilino no puede ser igual al del Codeudor.";
                 if (!isConflictError) {
                    delete currentErrors[fieldName];
                 }
            }
        }
        
        // 2. Validación de CONFLICTO DE DOCUMENTO (Cross-field validation)
        const docInqValue = valuesRef.current[NUMERO_DOC_INQ] || "";
        const docCodValue = valuesRef.current[NUMERO_DOC_COD] || "";
        const conflictErrorMsg = "El número de documento del Inquilino no puede ser igual al del Codeudor.";

        if (docInqValue.trim() && docCodValue.trim() && docInqValue === docCodValue) {
            
            const fieldNames = [NUMERO_DOC_INQ, NUMERO_DOC_COD];

            for (const name of fieldNames) {
                if (fieldsToCheck.includes(name)) {
                    if (!currentErrors[name] || currentErrors[name] === conflictErrorMsg) {
                        currentErrors[name] = conflictErrorMsg;
                        hasError = true;
                        if (!firstErrorField) firstErrorField = name;
                    }
                }
            }
            
        } else {
            // Si son diferentes, limpiamos el error de conflicto de ambos campos, sin tocar otros errores (obligatorio/formato)
            if (currentErrors[NUMERO_DOC_INQ] === conflictErrorMsg) {
                 delete currentErrors[NUMERO_DOC_INQ];
            }
            if (currentErrors[NUMERO_DOC_COD] === conflictErrorMsg) {
                 delete currentErrors[NUMERO_DOC_COD];
            }
        }

        // Re-evaluar firstErrorField en caso de que se haya limpiado o establecido un error cruzado
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
        // Validar solo los campos del paso actual, asegurando incluir ambos documentos si son relevantes
        let fieldsToValidate = stepFields[step].filter(f => f !== 'garaje' || requiredFields.includes('garaje'));
        
        // Añadir el campo de documento cruzado para validar el conflicto al cambiar de paso 1 a 2
        if (step === 1 && (valuesRef.current[NUMERO_DOC_COD] || "").trim()) {
            if (!fieldsToValidate.includes(NUMERO_DOC_COD)) fieldsToValidate.push(NUMERO_DOC_COD);
        }
        if (step === 2 && valuesRef.current[NUMERO_DOC_INQ].trim()) {
            if (!fieldsToValidate.includes(NUMERO_DOC_INQ)) fieldsToValidate.push(NUMERO_DOC_INQ);
        }
        
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submissionState.isSubmitting) return;
        
        // En el envío final, validamos TODOS los campos obligatorios
        const allFieldsToValidate = Object.values(stepFields)
            .flat()
            .filter(f => f !== 'garaje' || requiredFields.includes('garaje'));
        const { currentErrors, hasError, firstErrorField } = runValidation(allFieldsToValidate);

        setErrors(currentErrors);

        if (hasError) {
            // Determinar a qué paso debe volver para mostrar el error
            let targetStep = 1;
            if (stepFields[2].includes(firstErrorField)) targetStep = 2;
            else if (stepFields[3].includes(firstErrorField)) targetStep = 3;
            else if (stepFields[4].includes(firstErrorField)) targetStep = 4;
            
            setStep(targetStep);
            
            // Enfocar el primer campo con error
            if (errorFocusTimeout.current) clearTimeout(errorFocusTimeout.current);
            errorFocusTimeout.current = setTimeout(() => {
                const el = elRefs.current[firstErrorField];
                if (el) el.focus();
            }, 50);
            
            return; // Bloquea el envío
        }

        setSubmissionState({ isSubmitting: true, error: null });
        const rawValues = { ...valuesRef.current };

        try {
            // 1️⃣ Asegurar ARRRENDATARIO (crear o reutilizar)
            const arrendatarioPayload = buildArrendatarioPayload(rawValues);
            let renant;

            try {
                // Intentar crear el arrendatario
                renant = await renantsApiService.create(arrendatarioPayload);
            } catch (error) {
                const duplicateMsg = "ya esta registrada como arrendatario";
                if (error?.message?.toLowerCase().includes(duplicateMsg)) {
                    // Ya existe → lo buscamos y reutilizamos
                    const tipoDocumento = (rawValues.tipoDocArrendatario || "").trim();
                    const numeroDocumento = cleanDocument(rawValues.numeroDocArrendatario);

                    const existing = await renantsApiService.getAll({
                        tipo_documento: tipoDocumento,
                        numero_documento: numeroDocumento
                    });

                    const matched = existing?.[0];
                    if (!matched) {
                        throw error; // no pudimos recuperarlo, dejamos que caiga al catch general
                    }
                    renant = matched;
                } else {
                    throw error;
                }
            }

            // 2️⃣ Crear ARRIENDO ligado al arrendatario obtenido/creado
            const arriendoPayload = buildArriendoPayload(rawValues, renant);
            const arriendoCreated = await arriendoApiService.crearArriendo(arriendoPayload);

            // 3️⃣ Notificar al padre → RenantManagementPage hará fetchArriendos()
            await onSubmit?.({
                renant,
                arriendo: arriendoCreated,
                formData: rawValues
            });

            setSubmissionState({ isSubmitting: false, error: null });
            onClose?.();
            console.log("Formulario Enviado:", { renant, arriendoCreated });

        } catch (error) {
            console.error(error);
            setSubmissionState({
                isSubmitting: false,
                error: error?.message || "No fue posible crear el arriendo"
            });
        }
    };

    // Field: componente auxiliar
    const Field = ({ name, as = "input", options = [], placeholder, type = "text" }) => {
        const label = getLabel(name);
        const errorMessage = errors[name];
        const isRequired = requiredFields.includes(name);

        // Determinar el tipo de campo
        const isDocField = docFields.includes(name);
        const isPhoneField = phoneFields.includes(name);
        const isEmailField = emailFields.includes(name);
        const isStrictNumeric = strictNumericFields.includes(name); // Para los nuevos campos estrictamente numéricos
        const isNameField = nameFields.includes(name);

        // Determinar si necesita validación en blur (incluye los requeridos para feedback inmediato)
        const needsBlurValidation = isDocField || isNameField || isPhoneField || isEmailField || isRequired || isStrictNumeric;
        const onBlurHandler = needsBlurValidation ? handleInputBlur : undefined;
        
        // Establecer el tipo de input para sugerir teclado numérico
        let inputType = type;
        if (isDocField || isPhoneField || isStrictNumeric) {
            if (type !== 'date' && type !== 'email') {
                inputType = "tel";
            }
        }
        else if (isEmailField) {
            inputType = "email";
        }

        if (type === "checkbox") {
            return (
                <label htmlFor={name} className="col-span-3 flex items-center gap-2 text-sm font-semibold text-gray-700 mt-2">
                    <input
                        id={name}
                        name={name}
                        ref={setElRef(name)}
                        type="checkbox"
                        defaultChecked={!!initial[name]}
                        onChange={handleInputChange}
                        className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{label} {isRequired && <span className="text-red-500 ml-1">*</span>}</span>
                </label>
            );
        }

        const LabelContent = (
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
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

    return (
        // 🔑 Fondo del modal con desenfoque - CAMBIO PRINCIPAL
        <div 
            className="fixed inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm z-50 p-4"
            onClick={onClose}
        >
            {/* Contenido principal del modal */}
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header con estilo del banner */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear Arriendo</h2>
                    <p className="text-gray-600 text-sm">Complete la información del nuevo contrato de arrendamiento</p>
                </div>

                {/* Botón cerrar con estilo azul */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-blue-600 transition duration-150 p-1 rounded-full"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Barra de progreso */}
                <div className="mb-6">
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Paso {step} de {totalSteps}:{" "}
                        {step === 1 ? "Datos del Inquilino" : step === 2 ? "Datos del Codeudor" : step === 3 ? "Datos del Inmueble" : "Datos del Contrato y Pago"}
                        {" "} (Campos obligatorios marcados con *)
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-6">
                        
                        {/* PASO 1 */}
                        {step === 1 && (
                            <div>
                                <h3 className="text-lg font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">
                                    Datos del Inquilino
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <Field
                                        name="tipoDocInquilino"
                                        as="select"
                                        options={[
                                            { value: "CC", label: "Cédula de Ciudadanía (CC)" },
                                            { value: "CE", label: "Cédula de Extranjería (CE)" },
                                            { value: "NIT", label: "NIT" },
                                        ]}
                                    />
                                    <Field name={NUMERO_DOC_INQ} placeholder="Mínimo 8 dígitos. Solo números." />
                                    <Field name="primerNombreInquilino" placeholder="Solo letras y espacios." />
                                    <Field name="segundoNombreInquilino" placeholder="Solo letras y espacios. (Opcional)" />
                                    <Field name="primerApellidoInquilino" placeholder="Solo letras y espacios." />
                                    <Field name="segundoApellidoInquilino" placeholder="Solo letras y espacios. (Opcional)" />
                                    <Field name="correoInquilino" placeholder="Debe contener un @" type="email" />
                                    <Field name="telefonoInquilino" placeholder="Solo números. Ej: 3001234567" />
                                </div>
                                <div className="mt-2 space-y-1 text-xs">
                                    {arrendatarioLookupState.loading && (
                                        <p className="text-slate-500">Buscando arrendatario existente...</p>
                                    )}
                                    {arrendatarioLookupState.message && (
                                        <p className="text-green-600">{arrendatarioLookupState.message}</p>
                                    )}
                                    {arrendatarioLookupState.error && (
                                        <p className="text-red-600">{arrendatarioLookupState.error}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* PASO 2 */}
                        {step === 2 && (
                            <div>
                                <h3 className="text-lg font-bold text-green-800 mb-4 pb-2 border-b border-green-200">
                                    Datos del Codeudor
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <Field
                                        name="tipoDocCodeudor"
                                        as="select"
                                        options={[
                                            { value: "CC", label: "Cédula de Ciudadanía (CC)" },
                                            { value: "CE", label: "Cédula de Extranjería (CE)" },
                                            { value: "NIT", label: "NIT" },
                                        ]}
                                    />
                                    <Field name={NUMERO_DOC_COD} placeholder="Mínimo 8 dígitos. Solo números." />
                                    <Field name="primerNombreCodeudor" placeholder="Solo letras y espacios." />
                                    <Field name="segundoNombreCodeudor" placeholder="Solo letras y espacios. (Opcional)" />
                                    <Field name="primerApellidoCodeudor" placeholder="Solo letras y espacios." />
                                    <Field name="segundoApellidoCodeudor" placeholder="Solo letras y espacios. (Opcional)" />
                                    <Field name="correoCodeudor" placeholder="Debe contener un @" type="email" />
                                    <Field name="telefonoCodeudor" placeholder="Solo números. Ej: 3009876543" />
                                    <Field name="estabilidadLaboral" placeholder="Ej: 5 años" />
                                </div>
                            </div>
                        )}

                        {/* PASO 3 */}
                        {step === 3 && (
                            <div>
                                <h3 className="text-lg font-bold text-yellow-800 mb-4 pb-2 border-b border-yellow-200">
                                    Datos del Inmueble
                                </h3>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                                    <Field
                                        name="tipoInmueble"
                                        as="select"
                                        options={[
                                            { value: "Casa", label: "Casa" },
                                            { value: "Apartamento", label: "Apartamento" },
                                            { value: "Apartaestudio", label: "Apartaestudio" },
                                        ]}
                                    />
                                    <Field name="registroInmobiliario" placeholder="Ej: 12345-ABC" />
                                    <Field name="nombreInmueble" placeholder="Ej: Edificio Central" />
                                    <Field name="area" placeholder="Ej: 75. Solo números enteros mayores a 0." />
                                    <Field name="habitaciones" placeholder="Ej: 3. Solo números enteros mayores a 0." />
                                    <Field name="banos" placeholder="Ej: 2. Solo números enteros mayores a 0." />
                                    <Field name="departamento" placeholder="Ej: Antioquia" />
                                    <Field name="ciudad" placeholder="Ej: Medellín" />
                                    <Field name="barrio" placeholder="Ej: El Poblado" />
                                    <Field name="estrato" placeholder="Ej: 4. Solo números enteros mayores a 0." />
                                    <Field name="direccion" placeholder="Ej: Calle 10 # 45-20" />
                                    <Field name="precioInmueble" placeholder="Ej: 1.500.000 (Solo números enteros mayores a 0)." />
                                    <Field name="garaje" type="checkbox" />
                                </div>
                            </div>
                        )}

                        {/* PASO 4 */}
                        {step === 4 && (
                            <div>
                                <h3 className="text-lg font-bold text-purple-800 mb-4 pb-2 border-b border-purple-200">
                                    Datos del Contrato y Pago
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    <Field name="fechaInicio" type="date" />
                                    <Field name="fechaFinal" type="date" />
                                    <Field name="fechaCobro" type="date" />
                                    <Field name="precio" placeholder="Ej: 1.500.000 (Solo números enteros mayores a 0)." />
                                    <Field
                                        name="estado"
                                        as="select"
                                        options={[
                                            { value: "Activo", label: "Activo" },
                                            { value: "Proceso", label: "Pendiente de inicio" },
                                            { value: "Inactivo", label: "Finalizado" },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Controles de navegación */}
                    <div className="flex justify-between pt-6 mt-6">
                        {step > 1 && (
                            <button 
                                type="button" 
                                onClick={prevStep} 
                                className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition duration-150 transform hover:scale-[1.02]"
                            >
                                Anterior
                            </button>
                        )}

                        {step < totalSteps && (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className={`px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-400/50 hover:bg-blue-700 transition duration-150 transform hover:scale-[1.02] ${step > 1 ? "ml-auto" : "w-full"}`}
                            >
                                Siguiente
                            </button>
                        )}

                        {step === totalSteps && (
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-lg shadow-green-400/50 hover:bg-green-700 transition duration-150 transform hover:scale-[1.02] ml-auto"
                            >
                                {submissionState.isSubmitting ? "Creando..." : "Crear Arriendo"}
                            </button>
                        )}
                    </div>
                    {submissionState.error && (
                        <p className="mt-3 text-sm text-red-600">{submissionState.error}</p>
                    )}
                </form>
            </div>
        </div>
    );
}
