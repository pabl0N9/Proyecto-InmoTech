import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaPlus, FaEye, FaChartBar, FaSearch, FaDollarSign, FaCalendarCheck, FaClipboardList } from "react-icons/fa";
import { Plus, Search, Filter, Eye, BarChart3, DollarSign, Calendar, Users, Home } from 'lucide-react';
import "../../../../shared/styles/globals.css";
import SaleForm from "../../components/sales/SaleForm";
import PurchaseTrackingModal from "../../components/sales/SalesTracking";
import InterestedPeopleTable from "../../components/sales/InterestedPeople";
import ViewSaleModal from "../../components/sales/ViewSale";
import ventaApiService from "../../../../shared/services/ventaApiService";
import { buyersApiService } from "../../../../shared/services/buyersApiService";
import { propertiesApiService } from "../../../../shared/services/propertiesApiService";

const INITIAL_VENTAS = [
  {
    id: 1,
    registro: "110010123456",
    tipo: "Casa",
    comprador: "Juan Carlos Jaramillo Sossa",
    fecha: "22/05/2025",
    valor: "15.000.000$",
    estado: "Pagado",
    estadoSeguimiento: "Finalizado",
  },
  {
    id: 2,
    registro: "760010789012",
    tipo: "Apartamento",
    comprador: "Pablo Camargo Buitrago",
    fecha: "10/02/2025",
    valor: "32.500.000$",
    estado: "Pendiente",
    estadoSeguimiento: "Iniciado",
  },
];

const toNumericValue = (value) => {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrencyValue = (value) => {
  const numericValue = toNumericValue(value);
  if (!numericValue) return "0$";
  return `${new Intl.NumberFormat("es-CO").format(Math.round(numericValue))}$`;
};

const formatPlainNumber = (value) => {
  const numeric = toNumericValue(value);
  if (!numeric) return "0";
  return new Intl.NumberFormat("es-CO").format(Math.round(numeric));
};

const formatDateDisplay = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO");
};

const buildPersonName = (persona = {}) => {
  if (!persona) return "";
  if (persona.nombre_completo || persona.apellido_completo) {
    return [persona.nombre_completo, persona.apellido_completo]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  const parts = [
    persona.primer_nombre,
    persona.segundo_nombre,
    persona.primer_apellido,
    persona.segundo_apellido,
  ].filter(Boolean);

  return parts.join(" ").trim();
};

const buildBuyerFullName = (buyer = {}, fallback = "") => {
  const parts = [
    buyer.primerNombre,
    buyer.segundoNombre,
    buyer.primerApellido,
    buyer.segundoApellido,
  ].filter(Boolean);
  const name = parts.join(" ").trim();
  return name || fallback || "";
};

const normalizeSaleRecord = (sale = {}, fallback = {}) => {
  const inmueble = sale.inmueble || sale.property || {};
  const comprador = sale.comprador || sale.buyer || {};
  const vendedor = sale.vendedor || sale.seller || {};
  const fallbackPrice = fallback.inmueblePrecio ?? fallback.valor;
  const numericPrice = toNumericValue(
    sale.valor_venta ?? sale.precio_venta ?? sale.valor ?? fallbackPrice
  );
  const compradorNombre = buildPersonName(comprador);
  const vendedorNombre = buildPersonName(vendedor);

  return {
    ...fallback,
    id: sale.id ?? sale.id_venta ?? fallback.id ?? Date.now(),
    registro:
      fallback.inmuebleRegistro ??
      sale.registro ??
      inmueble.registro_inmobiliario ??
      "Sin registro",
    tipo: fallback.inmuebleTipo ?? sale.tipo ?? inmueble.categoria ?? "Sin tipo",
    comprador:
      (fallback.comprador ??
        fallback.compradorNombreCompleto ??
        compradorNombre) || "Sin comprador",
    fecha: formatDateDisplay(sale.fecha_venta || sale.fecha || fallback.fecha),
    valor: formatCurrencyValue(numericPrice || fallbackPrice),
    estado: sale.estado || fallback.estado || "Pendiente",
    estadoSeguimiento:
      fallback.estadoSeguimiento ?? sale.estadoSeguimiento ?? "Sin seguimiento",
    compradorTipoDocumento:
      comprador.tipo_documento ?? fallback.compradorTipoDocumento ?? "N/D",
    compradorDocumento:
      comprador.numero_documento ?? fallback.compradorDocumento ?? "N/D",
    compradorNombreCompleto:
      (fallback.compradorNombreCompleto ?? compradorNombre) || "Sin comprador",
    compradorCorreo: comprador.correo ?? fallback.compradorCorreo ?? "Sin correo",
    compradorTelefono:
      comprador.telefono ?? fallback.compradorTelefono ?? "Sin teléfono",
    vendedorTipoDocumento:
      vendedor.tipo_documento ?? fallback.vendedorTipoDocumento ?? "N/D",
    vendedorDocumento:
      vendedor.numero_documento ?? fallback.vendedorDocumento ?? "N/D",
    vendedorNombreCompleto:
      (fallback.vendedorNombreCompleto ?? vendedorNombre) || "Sin vendedor",
    vendedorCorreo: vendedor.correo ?? fallback.vendedorCorreo ?? "Sin correo",
    vendedorTelefono:
      vendedor.telefono ?? fallback.vendedorTelefono ?? "Sin teléfono",
    inmuebleTipo:
      fallback.inmuebleTipo ?? inmueble.categoria ?? fallback.tipo ?? "Sin tipo",
    inmuebleRegistro:
      fallback.inmuebleRegistro ??
      inmueble.registro_inmobiliario ??
      "Sin registro",
    inmuebleNombre:
      fallback.inmuebleNombre ??
      inmueble.nombre ??
      inmueble.direccion ??
      fallback.tipo ??
      "Sin nombre",
    inmuebleArea: fallback.inmuebleArea ?? inmueble.area ?? "N/D",
    inmuebleHabitaciones:
      fallback.inmuebleHabitaciones ?? inmueble.habitaciones ?? "N/D",
    inmuebleBanos: fallback.inmuebleBanos ?? inmueble.banos ?? "N/D",
    inmueblePais: fallback.inmueblePais ?? inmueble.pais ?? "N/D",
    inmuebleDepartamento:
      fallback.inmuebleDepartamento ?? inmueble.departamento ?? "N/D",
    inmuebleCiudad: fallback.inmuebleCiudad ?? inmueble.ciudad ?? "N/D",
    inmuebleBarrio: fallback.inmuebleBarrio ?? inmueble.barrio ?? "N/D",
    inmuebleEstrato: fallback.inmuebleEstrato ?? inmueble.estrato ?? "N/D",
    inmuebleDireccion:
      fallback.inmuebleDireccion ?? inmueble.direccion ?? "Sin dirección",
    inmueblePrecio: formatPlainNumber(fallback.inmueblePrecio ?? numericPrice),
    inmuebleGaraje: fallback.inmuebleGaraje ?? Boolean(inmueble.garaje),
    inmuebleEstado:
      fallback.inmuebleEstado ?? inmueble.estado ?? sale.estado ?? "Pendiente",
  };
};

const toISODate = (value) => {
  if (!value) return new Date().toISOString();
  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate.toISOString();
  }
  const dateOnly = new Date(`${value}T00:00:00`);
  if (!Number.isNaN(dateOnly.getTime())) {
    return dateOnly.toISOString();
  }
  return new Date().toISOString();
};

const mapPaymentToPurchaseType = (medioPago = "") => {
  const normalized = medioPago.toLowerCase();
  if (normalized === "credito") return "Financiada";
  if (normalized === "mixto") return "Mixta";
  return normalized === "transferencia" ? "Directa" : "Directa";
};

const buildSalePayload = (saleData = {}, buyerInfo, propertyInfo) => {
  const numericPrice = toNumericValue(saleData.inmueblePrecio);
  const medioPago = (saleData.medioPago || "efectivo").toLowerCase();
  const fechaVentaISO = toISODate(saleData.fechaVenta);
  const firstNames = [buyerInfo?.primerNombre, buyerInfo?.segundoNombre]
    .filter(Boolean)
    .join(" ")
    .trim();
  const lastNames = [buyerInfo?.primerApellido, buyerInfo?.segundoApellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id_persona: buyerInfo?.personaId,
    id_inmueble: Number(propertyInfo?.id ?? propertyInfo?.raw?.id_inmueble),
    fecha_venta: fechaVentaISO,
    valor_venta: numericPrice,
    medio_pago: medioPago,
    estado: saleData.estado || "Activa",
    comprador: {
      tipo_documento: buyerInfo?.tipoDocumento,
      numero_documento: buyerInfo?.documento,
      nombre_completo:
        firstNames ||
        saleData.compradorNombreCompleto ||
        buyerInfo?.raw?.persona?.nombre_completo ||
        "",
      apellido_completo:
        lastNames ||
        buyerInfo?.raw?.persona?.apellido_completo ||
        "",
      correo:
        saleData.compradorCorreo ||
        buyerInfo?.correo ||
        buyerInfo?.raw?.persona?.correo ||
        "",
      telefono:
        saleData.compradorTelefono ||
        buyerInfo?.telefono ||
        buyerInfo?.raw?.persona?.telefono ||
        "",
    },
  };
};

// 🔹 Componente que da color según estado
const EstadoBadge = ({ estado }) => {
  let colorClass = "bg-gray-200 text-gray-700";

  switch (estado) {
    case "Pagado":
      colorClass = "bg-green-100 text-green-800 border border-green-400";
      break;
    case "Pendiente":
      colorClass = "bg-yellow-100 text-yellow-800 border border-yellow-400";
      break;
    case "Debe":
      colorClass = "bg-red-100 text-red-800 border border-red-400";
      break;
    default:
      colorClass = "bg-gray-200 text-gray-700";
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}
    >
      {estado}
    </span>
  );
};

export function SalesManagementPage() {
  const [ventas, setVentas] = useState(INITIAL_VENTAS);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [savingVenta, setSavingVenta] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [trackingSale, setTrackingSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInterestedPeople, setShowInterestedPeople] = useState(false);
  const [propertiesCatalog, setPropertiesCatalog] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [propertiesError, setPropertiesError] = useState(null);

  const nextId = useMemo(() => {
    if (!ventas.length) return 1;
    const numericIds = ventas.map((v) => Number(v.id) || 0);
    return Math.max(...numericIds) + 1;
  }, [ventas]);

  const resolvePropertyFromSale = useCallback(
    (saleData) => {
      const target = (saleData?.inmuebleRegistro || "")
        .toString()
        .trim()
        .toLowerCase();

      if (!target) return null;

      return propertiesCatalog.find((property) => {
        const candidates = [
          property.registro,
          property.label,
          property.raw?.registro_inmobiliario,
          property.raw?.registro,
          property.raw?.registro_catastral,
          property.id?.toString(),
        ]
          .filter(Boolean)
          .map((candidate) => candidate.toString().trim().toLowerCase());

        return candidates.includes(target);
      });
    },
    [propertiesCatalog]
  );

  const loadProperties = useCallback(async () => {
    setLoadingProperties(true);
    setPropertiesError(null);
    try {
      const catalog = await propertiesApiService.getAll();
      setPropertiesCatalog(catalog);
    } catch (error) {
      setPropertiesError(
        error?.message ||
          "No fue posible cargar el catálogo de inmuebles. Intenta recargar antes de crear una venta."
      );
    } finally {
      setLoadingProperties(false);
    }
  }, []);

  const fetchVentas = useCallback(async () => {
    setLoadingVentas(true);
    setStatusMessage(null);
    try {
      const response = await ventaApiService.obtenerVentas();
      const payload = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response)
            ? response
            : [];

      if (Array.isArray(payload)) {
        const normalized = payload.map((venta) =>
          normalizeSaleRecord(venta)
        );
        setVentas(normalized);
      }
    } catch (error) {
      console.error("Error cargando ventas:", error);
      setStatusMessage({
        type: "error",
        text:
          error?.message ||
          "No se pudieron cargar las ventas desde la API. Intenta nuevamente.",
      });
    } finally {
      setLoadingVentas(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleViewClick = (sale) => {
    setViewingSale(sale);
  };

  const handleTrackingClick = (sale) => {
    setTrackingSale(sale);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSaveSale = async (saleData) => {
    setSavingVenta(true);
    setStatusMessage(null);

    const buyerInfo = saleData?.selectedBuyer;
    if (!buyerInfo?.personaId) {
      setSavingVenta(false);
      setStatusMessage({
        type: "error",
        text: "Debes ingresar un comprador registrado (tipo y número de documento) para continuar.",
      });
      return;
    }

    if (loadingProperties) {
      setSavingVenta(false);
      setStatusMessage({
        type: "error",
        text: "Esperamos a que cargue el catálogo de inmuebles. Intenta registrar la venta en unos segundos.",
      });
      return;
    }

    if (!propertiesCatalog.length) {
      setSavingVenta(false);
      setStatusMessage({
        type: "error",
        text: "No hay inmuebles disponibles en el catálogo. Registra o activa uno antes de crear la venta.",
      });
      return;
    }

    const matchedProperty = resolvePropertyFromSale(saleData);
    if (!matchedProperty) {
      setSavingVenta(false);
      setStatusMessage({
        type: "error",
        text: "No encontramos un inmueble que coincida con el registro ingresado. Verifica el número de matrícula.",
      });
      return;
    }

    const payload = buildSalePayload(saleData, buyerInfo, matchedProperty);

    if (!payload.id_inmueble || Number.isNaN(payload.id_inmueble)) {
      setSavingVenta(false);
      setStatusMessage({
        type: "error",
        text: "El inmueble seleccionado no tiene un identificador válido.",
      });
      return;
    }

    const buyerFullName =
      saleData.compradorNombreCompleto || buildBuyerFullName(buyerInfo, "Sin comprador");

    const fallbackSale = {
      id: nextId,
      registro: matchedProperty.registro || saleData.inmuebleRegistro || "Sin registro",
      tipo:
        matchedProperty.raw?.categoria ||
        matchedProperty.raw?.tipo ||
        saleData.inmuebleTipo ||
        "Sin tipo",
      comprador: buyerFullName,
      fecha: formatDateDisplay(saleData.fechaVenta || new Date()),
      valor: formatCurrencyValue(payload.valor_venta || saleData.inmueblePrecio),
      estado: "Pendiente",
      estadoSeguimiento: "Iniciado",
      compradorTipoDocumento: buyerInfo.tipoDocumento,
      compradorDocumento: buyerInfo.documento,
      compradorNombreCompleto: buyerFullName,
      compradorCorreo: saleData.compradorCorreo || buyerInfo.correo || "Sin correo",
      compradorTelefono:
        saleData.compradorTelefono || buyerInfo.telefono || "Sin teléfono",
      inmuebleTipo:
        matchedProperty.raw?.categoria || matchedProperty.raw?.tipo || saleData.inmuebleTipo,
      inmuebleRegistro: matchedProperty.registro || saleData.inmuebleRegistro,
      inmuebleNombre:
        matchedProperty.raw?.nombre ||
        matchedProperty.raw?.titulo ||
        saleData.inmuebleNombre ||
        "Sin nombre",
      inmuebleCiudad: matchedProperty.raw?.ciudad || saleData.inmuebleCiudad || "N/D",
      inmuebleDireccion:
        matchedProperty.raw?.direccion || saleData.inmuebleDireccion || "Sin dirección",
      inmueblePrecio: payload.valor_venta,
      id_inmueble: payload.id_inmueble,
    };

    try {
      const response = await ventaApiService.crearVenta(payload);
      const apiSale = response?.data ?? response;
      const normalizedSale = normalizeSaleRecord(apiSale, fallbackSale);

      let buyerUpdateError = null;
      try {
        await buyersApiService.updatePurchaseData(buyerInfo.personaId, {
          id_inmueble: payload.id_inmueble,
          id_venta: apiSale?.id_venta || apiSale?.id || normalizedSale.id,
          fecha_compra: payload.fecha_venta,
          valor_compra: payload.valor_venta,
          tipo_compra: mapPaymentToPurchaseType(payload.medio_pago),
        });
      } catch (error) {
        buyerUpdateError = error;
        console.error("No fue posible actualizar al comprador:", error);
      }

      setVentas((prev) => [...prev, normalizedSale]);
      setStatusMessage({
        type: "success",
        text: buyerUpdateError
          ? "Venta registrada, pero no se pudo actualizar la ficha del comprador. Revisa el módulo de compradores."
          : "Venta registrada correctamente.",
      });
      handleCloseForm();
    } catch (error) {
      console.error("Error guardando la venta:", error);
      setStatusMessage({
        type: "error",
        text:
          error?.message ||
          "No se pudo registrar la venta en la API. Revisa los datos e intenta nuevamente.",
      });
    } finally {
      setSavingVenta(false);
    }
  };

  const handleUpdateTracking = (updatedSale) => {
    setVentas((prevVentas) =>
      prevVentas.map((v) =>
        v.id === updatedSale.id ? { ...v, ...updatedSale } : v
      )
    );
    setTrackingSale(null);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredVentas = ventas.filter((v) => {
    if (!normalizedSearch) return true;

    const registro = v.registro ? v.registro.toLowerCase() : "";
    const comprador = v.comprador ? v.comprador.toLowerCase() : "";
    const tipo = v.tipo ? v.tipo.toLowerCase() : "";

    return (
      registro.includes(normalizedSearch) ||
      comprador.includes(normalizedSearch) ||
      tipo.includes(normalizedSearch)
    );
  });

  // Calcular estadísticas
  const stats = {
    total: filteredVentas.length,
    pagadas: filteredVentas.filter(v => v.estado === 'Pagado').length,
    pendientes: filteredVentas.filter(v => v.estado === 'Pendiente').length,
    totalValor: filteredVentas.reduce((sum, v) => sum + toNumericValue(v.valor), 0)
  };

  // 🔑 --- FUNCIONES PARA RENDERIZAR MODALES CON PORTAL ---
  const renderFormModal = () => {
    if (!showForm) return null;

    const modalContent = (
      <SaleForm onSubmit={handleSaveSale} onClose={handleCloseForm} />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  const renderViewModal = () => {
    if (!viewingSale) return null;

    const modalContent = (
      <ViewSaleModal
        sale={viewingSale}
        onClose={() => setViewingSale(null)}
      />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  const renderInterestedPeopleModal = () => {
    if (!showInterestedPeople) return null;

    const modalContent = (
      <InterestedPeopleTable
        onClose={() => setShowInterestedPeople(false)}
      />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  const renderTrackingModal = () => {
    if (!trackingSale) return null;

    const modalContent = (
      <PurchaseTrackingModal
        venta={trackingSale}
        onClose={() => setTrackingSale(null)}
        onUpdate={handleUpdateTracking}
      />
    );

    return ReactDOM.createPortal(
      modalContent,
      document.getElementById('modal-root') || document.body
    );
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* HEADER CON NUEVO ESTILO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Gestión de Ventas</h1>
            <p className="text-slate-600 mt-1">Administra todas las transacciones de venta de tus propiedades</p>
          </div>
          
          {/* BOTÓN CREAR VENTA EN POSICIÓN DESTACADA - COLOR AZUL */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            disabled={savingVenta}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              savingVenta 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <Plus className="w-5 h-5" />
            {savingVenta ? "Guardando..." : "Crear Venta"}
          </motion.button>
        </motion.div>

        {/* STATS CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Ventas</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-400 rounded-lg p-3">
                <Home className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ventas Pagadas</p>
                <p className="text-2xl font-bold mt-1">{stats.pagadas}</p>
              </div>
              <div className="bg-green-400 rounded-lg p-3">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                <p className="text-2xl font-bold mt-1">{stats.pendientes}</p>
              </div>
              <div className="bg-yellow-400 rounded-lg p-3">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Valor Total</p>
                <p className="text-lg font-bold mt-1">{formatCurrencyValue(stats.totalValor)}</p>
              </div>
              <div className="bg-purple-400 rounded-lg p-3">
                <FaDollarSign className="text-lg" />
              </div>
            </div>
          </div>
        </motion.div>

        {propertiesError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 flex items-start justify-between gap-4"
          >
            <span>{propertiesError}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={loadProperties}
              className="text-xs font-semibold uppercase tracking-wide text-yellow-700 hover:text-yellow-900"
            >
              Reintentar
            </motion.button>
          </motion.div>
        )}

        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${
              statusMessage.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <span>{statusMessage.text}</span>
              {statusMessage.type === "error" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-800"
                  onClick={fetchVentas}
                >
                  Reintentar
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* SEARCH AND FILTERS - SIN BOTÓN CREAR VENTA AQUÍ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        >
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por registro, comprador o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 shadow-sm bg-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInterestedPeople(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300"
            >
              <Users className="w-4 h-4" />
              Personas Interesadas
            </motion.button>
          </div>
        </motion.div>

        {/* CONTENT AREA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* TABLA CON NUEVO ESTILO - SIN COLUMNA ID */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* CABECERA DE TABLA */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                🏠 Lista de Ventas ({filteredVentas.length} {filteredVentas.length === 1 ? "resultado" : "resultados"})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold text-sm border-b">Registro</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold text-sm border-b">Tipo</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold text-sm border-b">Comprador</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold text-sm border-b">Fecha</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold text-sm border-b">Valor</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold text-sm border-b">Estado</th>
                    <th className="px-4 py-3 text-left text-slate-700 font-semibold text-sm border-b">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingVentas ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-slate-500 border-b"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          Cargando ventas desde la API...
                        </div>
                      </td>
                    </tr>
                  ) : filteredVentas.length > 0 ? (
                    filteredVentas.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50 border-b border-slate-100 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-700">{v.registro}</td>
                        <td className="px-4 py-3 text-slate-700">{v.tipo}</td>
                        <td className="px-4 py-3 text-slate-700 truncate max-w-[150px]">{v.comprador}</td>
                        <td className="px-4 py-3 text-slate-700">{v.fecha}</td>
                        <td className="px-4 py-3 font-semibold text-purple-700">
                          {v.valor}
                        </td>
                        <td className="px-4 py-3">
                          <EstadoBadge estado={v.estado} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Ver detalles de la venta"
                              className="text-green-600 hover:text-green-800 transition-colors p-1 rounded-lg hover:bg-green-50"
                              onClick={() => handleViewClick(v)}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Seguimiento de compra"
                              className="text-sky-600 hover:text-sky-800 transition-colors p-1 rounded-lg hover:bg-sky-50"
                              onClick={() => handleTrackingClick(v)}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-slate-500 border-b"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Home className="w-8 h-8 text-slate-400" />
                          <p>No se encontraron resultados</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MODALES RENDERIZADOS CON PORTAL --- */}
      {renderFormModal()}
      {renderViewModal()}
      {renderInterestedPeopleModal()}
      {renderTrackingModal()}
    </>
  );
}