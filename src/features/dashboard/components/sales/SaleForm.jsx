import React, { useRef, useState, useCallback, useEffect } from "react";
import { buyersApiService } from "../../../../shared/services/buyersApiService";

// Lista de campos que deben ser obligatorios para el registro
const requiredFields = [
    // Vendedor
    "vendedorTipoDocumento", "vendedorDocumento", "vendedorNombreCompleto", "vendedorCorreo", "vendedorTelefono",
    // Comprador
    "compradorTipoDocumento", "compradorDocumento", "compradorNombreCompleto", "compradorCorreo", "compradorTelefono",
    // Inmueble
    "inmuebleTipo", "inmuebleRegistro", "inmuebleNombre", "inmuebleArea", "inmuebleHabitaciones", "inmuebleBanos",
    "inmueblePais", "inmuebleDepartamento", "inmuebleCiudad", "inmuebleDireccion", "inmuebleEstado",
    // Venta
    "fechaVenta", "medioPago", "inmueblePrecio",
];

// Nombres de los campos que requieren formato especial (Documento)
const VENDEDOR_DOC = "vendedorDocumento";
const COMPRADOR_DOC = "compradorDocumento";

const DOCUMENT_OPTIONS = [
    { value: "CC", label: "Cédula de Ciudadanía (CC)" },
    { value: "CE", label: "Cédula de Extranjería (CE)" },
    { value: "NIT", label: "NIT" },
    { value: "PASAPORTE", label: "Pasaporte" },
    { value: "TI", label: "Tarjeta de Identidad (TI)" },
];

const PAYMENT_OPTIONS = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia" },
    { value: "credito", label: "Crédito" },
    { value: "mixto", label: "Mixto" },
];

const BUYER_AUTOFILL_FIELDS = [
    "compradorNombreCompleto",
    "compradorCorreo",
    "compradorTelefono",
];

// Datos iniciales fuera del componente para evitar recreación
const defaultFormValues = {
    vendedorTipoDocumento: "CC",
    vendedorDocumento: "",
    vendedorNombreCompleto: "",
    vendedorCorreo: "",
    vendedorTelefono: "",
    compradorTipoDocumento: "CC",
    compradorDocumento: "",
    compradorPersonaId: "",
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
    inmueblePrecio: "",
    inmuebleGaraje: false,
    inmuebleEstado: "Disponible",
    fechaVenta: new Date().toISOString().slice(0, 10),
    medioPago: "efectivo",
};

export default function SalesForm({ onClose, onSubmit }) {
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [dirtyFields, setDirtyFields] = useState({});
    
    // SOLUCIÓN: Estado inicializado correctamente sin dependencias problemáticas
    const [formValues, setFormValues] = useState(defaultFormValues);
    
    const totalSteps = 4;

    const elRefs = useRef({});
    const errorFocusTimeout = useRef(null); 
    const buyerLookupTimeoutRef = useRef(null);
    const buyerLookupRequestId = useRef(0);
    const selectedBuyerRef = useRef(null);
    const manuallyEditedBuyerFieldsRef = useRef(new Set());
    const buyerDocumentSnapshotRef = useRef({
        tipo: "CC",
        numero: "",
    });
    const [buyerLookupState, setBuyerLookupState] = useState({
        loading: false,
        message: "",
        error: null,
    });

    useEffect(() => {
        return () => {
            if (buyerLookupTimeoutRef.current) {
                clearTimeout(buyerLookupTimeoutRef.current);
            }
            if (errorFocusTimeout.current) {
                clearTimeout(errorFocusTimeout.current);
            }
        };
    }, []);

    // Lista de campos que deben ser estrictamente numéricos (solo dígitos)
    const strictNumericFields = [
        "inmuebleArea", "inmuebleHabitaciones", "inmuebleBanos", "inmuebleEstrato"
    ];

    // Campos que requieren formato de miles (moneda)
    const currencyFields = ["inmueblePrecio"];

    // Campos para validaciones de formato
    const nameFields = [
        "vendedorNombreCompleto", "compradorNombreCompleto",
    ];
    const docFields = [ VENDEDOR_DOC, COMPRADOR_DOC ];
    const phoneFields = [ "vendedorTelefono", "compradorTelefono" ];
    const emailFields = [ "vendedorCorreo", "compradorCorreo" ];

    // Campos agrupados por paso para la validación
    const stepFields = {
        1: [
            "vendedorTipoDocumento", VENDEDOR_DOC, "vendedorNombreCompleto", 
            "vendedorCorreo", "vendedorTelefono",
        ],
        2: [
            "compradorTipoDocumento", COMPRADOR_DOC, "compradorNombreCompleto", 
            "compradorCorreo", "compradorTelefono",
        ],
        3: [
            "inmuebleTipo", "inmuebleRegistro", "inmuebleNombre", "inmuebleArea", 
            "inmuebleHabitaciones", "inmuebleBanos", "inmueblePais", 
            "inmuebleDepartamento", "inmuebleCiudad", "inmuebleBarrio", 
            "inmuebleEstrato", "inmuebleDireccion", "inmuebleGaraje", "inmuebleEstado"
        ],
        4: [
            "fechaVenta", "medioPago", "inmueblePrecio"
        ]
    };

    const getLabel = (name) => {
        const labels = {
            // Vendedor
            vendedorTipoDocumento: "Tipo Doc. Vendedor", 
            vendedorDocumento: "Número Doc. Vendedor",
            vendedorNombreCompleto: "Nombre Completo Vendedor", 
            vendedorCorreo: "Correo Vendedor",
            vendedorTelefono: "Teléfono Vendedor",

            // Comprador
            compradorTipoDocumento: "Tipo Doc. Comprador", 
            compradorDocumento: "Número Doc. Comprador",
            compradorNombreCompleto: "Nombre Completo Comprador", 
            compradorCorreo: "Correo Comprador",
            compradorTelefono: "Teléfono Comprador",

            // Inmueble
            inmuebleTipo: "Tipo de Inmueble", 
            inmuebleRegistro: "No. Registro Catastral",
            inmuebleNombre: "Nombre/Título Comercial", 
            inmuebleArea: "Área Total",
            inmuebleHabitaciones: "No. Habitaciones", 
            inmuebleBanos: "No. Baños",
            inmueblePais: "País", 
            inmuebleDepartamento: "Departamento/Estado",
            inmuebleCiudad: "Ciudad", 
            inmuebleBarrio: "Barrio/Zona",
            inmuebleEstrato: "Estrato Socioeconómico", 
            inmuebleDireccion: "Dirección Completa",
            inmueblePrecio: "Precio de Venta (COP)", 
            inmuebleGaraje: "¿Tiene Garaje?",
            inmuebleEstado: "Estado del Inmueble",

            // Venta
            fechaVenta: "Fecha de Venta",
            medioPago: "Medio de Pago",
        };
        return labels[name] ?? name;
    };

    // === FUNCIONES DE NORMALIZACIÓN ===
    const normalizeValueForStorage = (fieldName, value) => {
        if (typeof value === "boolean") return value;
        if (value === null || value === undefined) return "";
        if (value === 0) return "0";
        if (value === "") return "";

        // Para campos numéricos estrictos, solo mantener dígitos
        if (strictNumericFields.includes(fieldName)) {
            return value.toString().replace(/[^0-9]/g, '');
        }

        // Para campos de moneda, solo mantener dígitos (sin formato)
        if (currencyFields.includes(fieldName)) {
            return value.toString().replace(/[^0-9]/g, '');
        }

        if (docFields.includes(fieldName)) {
            return value.toString().replace(/[\s\-\.]/g, '');
        }

        if (phoneFields.includes(fieldName)) {
            return value.toString().replace(/[\s\-\(\)\+]/g, '');
        }

        // Para otros campos, solo trim
        return value.toString().trim();
    };

    const resetBuyerSelection = useCallback(
        ({ resetState = false, resetFields = false } = {}) => {
            selectedBuyerRef.current = null;
            manuallyEditedBuyerFieldsRef.current.clear();
            setFormValues((prev) => ({
                ...prev,
                compradorPersonaId: "",
                ...(resetFields
                    ? {
                          compradorNombreCompleto: "",
                          compradorCorreo: "",
                          compradorTelefono: "",
                      }
                    : {}),
            }));
            if (resetState) {
                setBuyerLookupState({
                    loading: false,
                    message: "",
                    error: null,
                });
            }
        },
        []
    );

    const applyBuyerData = useCallback((buyer) => {
        if (!buyer) return;

        selectedBuyerRef.current = buyer;

        const buildFullName = () => {
            const parts = [
                buyer.primerNombre,
                buyer.segundoNombre,
                buyer.primerApellido,
                buyer.segundoApellido,
            ].filter(Boolean);

            if (parts.length) return parts.join(" ").trim();
            const rawPersona = buyer.raw?.persona;
            if (rawPersona) {
                const composed = [
                    rawPersona.nombre_completo,
                    rawPersona.apellido_completo,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                if (composed) return composed;
            }
            return "";
        };

        setFormValues((prev) => {
            const nextValues = {
                ...prev,
                compradorPersonaId: buyer.personaId || "",
            };

            if (!manuallyEditedBuyerFieldsRef.current.has("compradorNombreCompleto")) {
                nextValues.compradorNombreCompleto = buildFullName();
            }
            if (!manuallyEditedBuyerFieldsRef.current.has("compradorCorreo")) {
                nextValues.compradorCorreo = buyer.correo || buyer.raw?.persona?.correo || "";
            }
            if (!manuallyEditedBuyerFieldsRef.current.has("compradorTelefono")) {
                nextValues.compradorTelefono = buyer.telefono || buyer.raw?.persona?.telefono || "";
            }

            return nextValues;
        });

        setErrors((prev) => {
            const nextErrors = { ...prev };
            BUYER_AUTOFILL_FIELDS.forEach((field) => {
                if (!manuallyEditedBuyerFieldsRef.current.has(field)) {
                    delete nextErrors[field];
                }
            });
            return nextErrors;
        });
    }, []);

    const fetchBuyerByDocument = useCallback(async () => {
        const tipoDocumento = (formValues.compradorTipoDocumento || "").trim();
        const numeroDocumento = normalizeValueForStorage(
            COMPRADOR_DOC,
            formValues.compradorDocumento || ""
        );

        if (!tipoDocumento || !numeroDocumento) {
            resetBuyerSelection({ resetState: true, resetFields: true });
            return;
        }

        buyerLookupRequestId.current += 1;
        const requestId = buyerLookupRequestId.current;

        setBuyerLookupState({
            loading: true,
            message: "",
            error: null,
        });

        try {
            const buyer = await buyersApiService.findByDocument(
                tipoDocumento,
                numeroDocumento
            );

            if (buyerLookupRequestId.current !== requestId) {
                return;
            }

            if (buyer) {
                applyBuyerData(buyer);
                setBuyerLookupState({
                    loading: false,
                    message: "Datos del comprador completados automáticamente.",
                    error: null,
                });
            } else {
                resetBuyerSelection();
                setBuyerLookupState({
                    loading: false,
                    message: "",
                    error: "No encontramos un comprador registrado con ese documento.",
                });
            }
        } catch (error) {
            if (buyerLookupRequestId.current !== requestId) {
                return;
            }
            resetBuyerSelection();
            setBuyerLookupState({
                loading: false,
                message: "",
                error: error?.message || "No fue posible buscar el comprador.",
            });
        }
    }, [
        applyBuyerData,
        resetBuyerSelection,
        formValues.compradorTipoDocumento,
        formValues.compradorDocumento,
    ]);

    const triggerBuyerLookup = useCallback(
        (delay = 250) => {
            if (buyerLookupTimeoutRef.current) {
                clearTimeout(buyerLookupTimeoutRef.current);
            }

            buyerLookupTimeoutRef.current = setTimeout(() => {
                fetchBuyerByDocument();
            }, delay);
        },
        [fetchBuyerByDocument]
    );

    // Formatear número con separadores de miles (solo para display)
    const formatNumberWithThousandsSeparator = (value) => {
        if (!value && value !== 0) return "";
        const cleanValue = value.toString().replace(/[^0-9]/g, '');
        if (cleanValue === "") return "";

        const formatter = new Intl.NumberFormat('es-CO', { 
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        return formatter.format(cleanValue);
    };

    // === SISTEMA DE VALIDACIÓN MEJORADO ===
    const validateField = (fieldName, value = null, isFinalValidation = false) => {
        const displayValue = formValues[fieldName] ?? "";
        const normalizedValue =
            value !== null && value !== undefined
                ? value
                : normalizeValueForStorage(fieldName, displayValue);
        const label = getLabel(fieldName);
        const isRequired = requiredFields.includes(fieldName);
        const isTouched = dirtyFields[fieldName];
        const enforceFullRules = isFinalValidation || isTouched;
        const stringValue = normalizedValue.toString().trim();
        const displayStringValue = displayValue.toString().trim();

        // Validación de campo requerido (solo si es dirty o validación final)
        if (isRequired && !stringValue && enforceFullRules) {
            return `${label} es requerido`;
        }

        // Si el campo está vacío y no es requerido, no hay error
        if (!stringValue) {
            return '';
        }

        // Validaciones específicas por tipo de campo

        // Campos de nombre completo
        if (nameFields.includes(fieldName)) {
            if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑüÜ\s]*$/.test(displayStringValue)) {
                return `${label} solo puede contener letras y espacios`;
            }
            if (!enforceFullRules) {
                return '';
            }
            if (stringValue.length < 2) return `${label} debe tener al menos 2 caracteres`;
            if (stringValue.length > 100) return `${label} no puede superar los 100 caracteres`;
        }

        // Campos de email
        if (emailFields.includes(fieldName)) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(stringValue)) return `${label} debe ser un correo válido`;
            if (stringValue.length > 254) return `${label} es demasiado largo`;
        }

        // Campos de teléfono - validación más permisiva durante escritura
        if (phoneFields.includes(fieldName)) {
            const telefonoLimpio = stringValue.replace(/[\s\-\(\)]/g, '');

            if (!/^[\d\s\+\-\(\)]*$/.test(displayStringValue)) {
                return `${label} solo puede contener números, espacios y los símbolos + - ( )`;
            }
            if (!enforceFullRules) {
                return '';
            }

            if (!/^(\+57|57)?[3][0-9]{9}$/.test(telefonoLimpio)) {
                return `${label} debe usar formato colombiano (+57 XXX XXX XXXX o 3XX XXX XXXX)`;
            }
        }

        // Campos de documento - validación más permisiva durante escritura
        if (docFields.includes(fieldName)) {
            let tipoDocumento = "";

            if (fieldName === VENDEDOR_DOC) {
                tipoDocumento = formValues.vendedorTipoDocumento || "CC";
            } else if (fieldName === COMPRADOR_DOC) {
                tipoDocumento = formValues.compradorTipoDocumento || "CC";
            }

            if (!/^[A-Za-z0-9\s\-\.]*$/.test(displayStringValue)) {
                return `${label} solo puede contener letras, números, espacios, puntos y guiones`;
            }
            if (!enforceFullRules) {
                return '';
            }

            const numeroLimpio = stringValue.replace(/[\s\-\.]/g, '');

            switch (tipoDocumento) {
                case 'CC':
                    if (!/^[0-9]{8,10}$/.test(numeroLimpio)) return 'La cédula debe tener entre 8 y 10 dígitos';
                    break;
                case 'CE':
                    if (!/^[0-9]{6,10}$/.test(numeroLimpio)) return 'La cédula de extranjería debe tener entre 6 y 10 dígitos';
                    break;
                case 'NIT':
                    if (!/^[0-9]{8,10}$/.test(numeroLimpio)) return 'El NIT debe tener entre 8 y 10 dígitos';
                    break;
                case 'PASAPORTE':
                    if (numeroLimpio.length < 6 || numeroLimpio.length > 20) return 'El pasaporte debe tener entre 6 y 20 caracteres';
                    if (!/^[A-Za-z0-9]+$/.test(numeroLimpio)) return 'El pasaporte solo puede contener letras y números';
                    break;
                case 'TI':
                    if (!/^[0-9]{10,11}$/.test(numeroLimpio)) return 'La tarjeta de identidad debe tener 10 u 11 dígitos';
                    break;
                default:
                    return 'Tipo de documento no válido';
            }
        }

        // Campos numéricos estrictos
        if (strictNumericFields.includes(fieldName)) {
            if (!/^\d*$/.test(displayStringValue)) return `${label} solo permite números`;
            if (!enforceFullRules) {
                return '';
            }

            const numericValue = parseFloat(stringValue);
            if (isNaN(numericValue) || numericValue <= 0) return `${label} debe ser un número mayor a 0`;
            if (!/^\d+$/.test(stringValue)) return `${label} solo permite números enteros`;
        }

        // Campos de moneda
        if (currencyFields.includes(fieldName)) {
            if (!/^[\d\s\.,]*$/.test(displayStringValue)) return `${label} solo permite números, espacios, puntos y comas`;
            if (!enforceFullRules) {
                return '';
            }

            const numericValue = parseFloat(stringValue.replace(/\./g, '').replace(/,/g, '.'));
            if (isNaN(numericValue) || numericValue <= 0) return `${label} debe ser un número mayor a 0`;
        }

        return '';
    };

    // Validación de paso completo (validación final)
    const validateStep = (stepNumber) => {
        const fieldsToValidate = stepFields[stepNumber];
        const newErrors = {};
        let hasError = false;

        fieldsToValidate.forEach(field => {
            const currentValue = normalizeValueForStorage(field, formValues[field] ?? "");
            const error = validateField(field, currentValue, true);
            if (error) {
                newErrors[field] = error;
                hasError = true;
            }
        });

        setErrors(newErrors);
        return { isValid: !hasError, errors: newErrors };
    };

    // Función para obtener la clase de estilo (incluyendo el resaltado de error)
    const getFieldClass = useCallback((fieldName) => {
        const baseClass = "w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-sm text-sm text-gray-700 bg-white";
        const errorClass = errors[fieldName] 
            ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
        return `${baseClass} ${errorClass}`;
    }, [errors]);

    const setElRef = (name) => (el) => {
        if (!el) return;
        elRefs.current[name] = el;
    };

    const markBuyerFieldAsEdited = useCallback((name) => {
        if (BUYER_AUTOFILL_FIELDS.includes(name)) {
            manuallyEditedBuyerFieldsRef.current.add(name);
        }
    }, []);

    // === SOLUCIÓN PRINCIPAL: Manejo de cambios optimizado ===
    const handleInputChange = useCallback((e) => {
        const { name, type, value, checked } = e.target;

        // SOLUCIÓN: Usar función de actualización para evitar problemas de estado
        setFormValues(prev => {
            const newValue = type === "checkbox" ? checked : value;
            
            // Reset de selección de comprador si cambian documentos
            if (name === COMPRADOR_DOC || name === "compradorTipoDocumento") {
                selectedBuyerRef.current = null;
                manuallyEditedBuyerFieldsRef.current.clear();
            }

            markBuyerFieldAsEdited(name);

            return {
                ...prev,
                [name]: newValue
            };
        });

        // Limpiar error inmediatamente al escribir
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors, markBuyerFieldAsEdited]);

    const handleInputBlur = useCallback((e) => {
        const { name, value } = e.target;
        
        // Marcar como touched
        if (!dirtyFields[name]) {
            setDirtyFields((prev) => ({ ...prev, [name]: true }));
        }

        // Validación en blur
        const normalizedValue = normalizeValueForStorage(name, value);
        const error = validateField(name, normalizedValue, true);
        
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));

        // Lógica de búsqueda de comprador
        if (name === COMPRADOR_DOC || name === "compradorTipoDocumento") {
            const currentTipo = formValues.compradorTipoDocumento || "";
            const normalizedDocumento = normalizeValueForStorage(
                COMPRADOR_DOC,
                formValues.compradorDocumento || ""
            );
            const docChanged =
                buyerDocumentSnapshotRef.current.tipo !== currentTipo ||
                buyerDocumentSnapshotRef.current.numero !== normalizedDocumento;

            if (docChanged) {
                resetBuyerSelection({ resetState: true, resetFields: true });
                buyerDocumentSnapshotRef.current = {
                    tipo: currentTipo,
                    numero: normalizedDocumento,
                };
            }

            triggerBuyerLookup(name === COMPRADOR_DOC ? 0 : 200);
        }
    }, [dirtyFields, formValues.compradorTipoDocumento, formValues.compradorDocumento, resetBuyerSelection, triggerBuyerLookup]);

    const handleNextStep = () => {
        const { isValid, errors: stepErrors } = validateStep(step);

        if (!isValid) {
            setErrors(stepErrors);

            // Enfocar el primer campo con error
            const firstErrorField = Object.keys(stepErrors)[0];
            if (errorFocusTimeout.current) clearTimeout(errorFocusTimeout.current);
            errorFocusTimeout.current = setTimeout(() => {
                const el = elRefs.current[firstErrorField];
                if (el) el.focus();
            }, 50);
            return;
        }

        setStep((s) => Math.min(s + 1, totalSteps));
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();

        const normalizedValues = Object.keys(formValues).reduce((acc, fieldName) => {
            const currentValue = formValues[fieldName] ?? "";
            acc[fieldName] = normalizeValueForStorage(fieldName, currentValue);
            return acc;
        }, {});

        // Validar todos los campos requeridos (validación final)
        const allErrors = {};
        let hasError = false;
        let firstErrorField = null;

        requiredFields.forEach(field => {
            const error = validateField(field, normalizedValues[field] ?? "", true);
            if (error) {
                allErrors[field] = error;
                hasError = true;
                if (!firstErrorField) firstErrorField = field;
            }
        });

        setErrors(allErrors);

        if (hasError) {
            // Determinar a qué paso debe volver para mostrar el error
            let targetStep = 1;
            if (stepFields[2].includes(firstErrorField)) targetStep = 2;
            else if (stepFields[3].includes(firstErrorField)) targetStep = 3;
            else if (stepFields[4].includes(firstErrorField)) targetStep = 4;

            setStep(targetStep);

            if (errorFocusTimeout.current) clearTimeout(errorFocusTimeout.current);
            errorFocusTimeout.current = setTimeout(() => {
                const el = elRefs.current[firstErrorField];
                if (el) el.focus();
            }, 50);
            return;
        }

        const payload = {
            ...normalizedValues,
            selectedBuyer: selectedBuyerRef.current,
        };
        if (onSubmit) onSubmit(payload);
        onClose?.();
    };

    // Field: componente auxiliar reutilizando el estilo
    const Field = React.memo(({ name, as = "input", options = [], placeholder, type = "text" }) => {
        const label = getLabel(name);
        const errorMessage = errors[name];
        const isRequired = requiredFields.includes(name);
        const displayValue = formValues[name] ?? "";

        const needsBlurValidation = isRequired || 
            name.includes('Nombre') || 
            name.includes('Correo') || 
            name.includes('Telefono') || 
            name.includes('Documento') ||
            strictNumericFields.includes(name) || 
            currencyFields.includes(name);

        const onBlurHandler = needsBlurValidation ? handleInputBlur : undefined;

        let inputType = type;
        if ((name.includes('Documento') || name.includes('Telefono') || strictNumericFields.includes(name)) && 
            type !== 'date' && type !== 'email' && type !== 'checkbox') {
            inputType = "tel";
        } else if (name.includes('Correo')) {
            inputType = "email";
        }

        // Caso especial para checkbox
        if (type === "checkbox") {
            return (
                <div className="flex items-center space-x-3 h-10">
                    <input
                        id={name}
                        name={name}
                        ref={setElRef(name)}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 shadow-sm transition duration-150"
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                        checked={!!displayValue}
                    />
                    <label htmlFor={name} className="text-sm font-semibold text-gray-700 cursor-pointer">
                        {label}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {errorMessage && (
                        <p className="text-red-500 text-xs mt-1 font-medium absolute top-full left-0 right-0">{errorMessage}</p>
                    )}
                </div>
            );
        }

        const LabelContent = (
            <label htmlFor={name} className="block text-xs font-semibold text-gray-700 mb-1">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
        );

        if (as === "select") {
            return (
                <div className="flex flex-col">
                    {LabelContent}
                    <select
                        id={name}
                        name={name}
                        ref={setElRef(name)}
                        className={getFieldClass(name)} 
                        value={displayValue}
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
                        <p className="text-red-500 text-xs mt-1 font-medium">{errorMessage}</p>
                    )}
                </div>
            );
        }

        if (as === "textarea") {
            return (
                <div className="col-span-1 sm:col-span-2 flex flex-col">
                    {LabelContent}
                    <textarea
                        id={name}
                        name={name}
                        ref={setElRef(name)}
                        className={`${getFieldClass(name)} h-20 resize-none`}
                        placeholder={placeholder}
                        value={displayValue}
                        onChange={handleInputChange}
                        onBlur={onBlurHandler}
                    />
                    {errorMessage && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errorMessage}</p>
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-col">
                {LabelContent}
                <input
                    id={name}
                    name={name}
                    ref={setElRef(name)}
                    className={getFieldClass(name)} 
                    type={inputType}
                    placeholder={placeholder}
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={onBlurHandler} 
                />
                {errorMessage && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{errorMessage}</p>
                )}
            </div>
        );
    });

    const formattedPrice = formatNumberWithThousandsSeparator(formValues.inmueblePrecio || 0);

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm z-50 p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative my-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >

                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-blue-600 p-1 rounded-full transition duration-150" aria-label="Cerrar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Nueva venta</h2>
                    <p className="text-gray-600 text-sm">Complete la información requerida para registrar una nueva venta</p>
                </div>

                <div className="mb-6">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-in-out shadow-lg shadow-blue-400/50"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-blue-700 font-bold mt-2 text-center">
                        Paso {step} de {totalSteps}:{" "}
                        <span className="font-semibold text-gray-600">
                            {step === 1 ? "Datos del Vendedor" : 
                             step === 2 ? "Datos del Comprador" : 
                             step === 3 ? "Detalles de la Propiedad" : "Precio de Venta"}
                        </span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* PASO 1: Datos del Vendedor */}
                    {step === 1 && (
                        <div>
                            <h3 className="text-lg font-bold text-blue-800 mb-4 pb-2 border-b border-blue-200">1. Información del Vendedor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <Field
                                    name="vendedorTipoDocumento"
                                    as="select"
                                    options={DOCUMENT_OPTIONS}
                                />
                                <Field name={VENDEDOR_DOC} placeholder="Ej: 12345678 o 1.234.567-8" />
                                <Field name="vendedorNombreCompleto" placeholder="Nombre completo" />
                                <Field name="vendedorCorreo" placeholder="correo@dominio.com" type="email" />
                                <Field name="vendedorTelefono" placeholder="Ej: +57 300 123 4567" />
                            </div>
                        </div>
                    )}

                    {/* PASO 2: Datos del Comprador */}
                    {step === 2 && (
                        <div>
                            <h3 className="text-lg font-bold text-green-800 mb-4 pb-2 border-b border-green-200">2. Información del Comprador</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <Field
                                    name="compradorTipoDocumento"
                                    as="select"
                                    options={DOCUMENT_OPTIONS}
                                />
                                <Field name={COMPRADOR_DOC} placeholder="Ej: 12345678 o 1.234.567-8" />
                                <Field name="compradorNombreCompleto" placeholder="Nombre completo" />
                                <Field name="compradorCorreo" placeholder="correo@dominio.com" type="email" />
                                <Field name="compradorTelefono" placeholder="Ej: +57 300 123 4567" />
                                {(buyerLookupState.loading || buyerLookupState.error || buyerLookupState.message) && (
                                    <div className="md:col-span-2">
                                        <p
                                            className={`text-sm ${
                                                buyerLookupState.loading
                                                    ? "text-blue-600"
                                                    : buyerLookupState.error
                                                        ? "text-red-600"
                                                        : "text-green-700"
                                            }`}
                                        >
                                            {buyerLookupState.loading && "Buscando comprador…"}
                                            {!buyerLookupState.loading && buyerLookupState.error && buyerLookupState.error}
                                            {!buyerLookupState.loading && !buyerLookupState.error && buyerLookupState.message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PASO 3: Detalles de la Propiedad */}
                    {step === 3 && (
                        <div>
                            <h3 className="text-lg font-bold text-yellow-800 mb-4 pb-2 border-b border-yellow-200">3. Detalles y Ubicación del Inmueble</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                                <Field
                                    name="inmuebleTipo"
                                    as="select"
                                    options={[
                                        { value: "Casa", label: "Casa" },
                                        { value: "Apartamento", label: "Apartamento" },
                                        { value: "Oficina", label: "Oficina" },
                                        { value: "Lote", label: "Lote/Terreno" },
                                    ]}
                                />
                                <Field name="inmuebleRegistro" placeholder="No. de matrícula inmobiliaria" />
                                <div className="md:col-span-2">
                                    <Field name="inmuebleNombre" placeholder="Ej: Apartamento 501, Edificio La Torre" />
                                </div>
                                <Field name="inmuebleArea" placeholder="Área en metros cuadrados" />
                                <Field name="inmuebleHabitaciones" placeholder="Cantidad de habitaciones" />
                                <Field name="inmuebleBanos" placeholder="Cantidad de baños" />
                                <Field name="inmuebleEstrato" placeholder="Estrato (1 a 6)" />

                                <Field name="inmueblePais" placeholder="País" />
                                <Field name="inmuebleDepartamento" placeholder="Departamento o Estado" />
                                <Field name="inmuebleCiudad" placeholder="Ciudad" />
                                <Field name="inmuebleBarrio" placeholder="Barrio o Zona" />
                                <div className="md:col-span-2">
                                    <Field name="inmuebleDireccion" as="textarea" placeholder="Dirección completa, ej: Carrera 10 # 25-50" />
                                </div>

                                <Field name="inmuebleGaraje" type="checkbox" />
                                <Field
                                    name="inmuebleEstado"
                                    as="select"
                                    options={[
                                        { value: "Disponible", label: "Disponible para Venta" },
                                        { value: "En Negociacion", label: "En Negociación" },
                                        { value: "Vendido", label: "Vendido/Transferido" },
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* PASO 4: Precio de Venta */}
                    {step === 4 && (
                        <div>
                            <h3 className="text-lg font-bold text-purple-800 mb-4 pb-2 border-b border-purple-200">4. Precio de Venta</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 mb-6 max-w-xl mx-auto">
                                <Field name="fechaVenta" type="date" />
                                <Field
                                    name="medioPago"
                                    as="select"
                                    options={PAYMENT_OPTIONS}
                                />
                                <Field name="inmueblePrecio" placeholder="Ej: 150.000.000" />
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl shadow-inner text-gray-800 max-w-xl mx-auto">
                                <h4 className="text-base font-extrabold mb-2 text-blue-800 border-b border-blue-200 pb-1">Resumen de la Propiedad</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <p className="font-medium text-gray-700">Tipo/Nombre:</p>
                                        <p className="text-right font-medium text-gray-900">{formValues.inmuebleTipo || "N/A"} - {formValues.inmuebleNombre || "N/A"}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="font-medium text-gray-700">Ubicación:</p>
                                        <p className="text-right font-medium text-gray-900">{formValues.inmuebleCiudad || "N/A"}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="font-medium text-gray-700">Garaje:</p>
                                        <p className="text-right font-medium text-gray-900">{formValues.inmuebleGaraje ? "Sí" : "No"}</p>
                                    </div>
                                    <div className="border-t border-blue-400 pt-2 flex justify-between items-center font-extrabold text-lg mt-2">
                                        <span className="text-gray-900">PRECIO FINAL:</span>
                                        <span className="text-blue-700">$ {formattedPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t mt-6 flex justify-between">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-5 py-2 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-150"
                            >
                                Atrás
                            </button>
                        )}
                        {step === 1 && <div />}

                        {step < totalSteps && (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="px-6 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-400/50 hover:bg-blue-700 transition duration-150 transform hover:scale-[1.02]"
                            >
                                Siguiente
                            </button>
                        )}

                        {step === totalSteps && (
                            <button
                                type="submit"
                                className="px-6 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-400/50 hover:bg-blue-700 transition duration-150 transform hover:scale-[1.02]"
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