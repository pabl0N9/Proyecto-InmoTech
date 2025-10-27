// src/modules/propertyForm/config/propertyConfig.js
const propertyConfig = {
  lote: {
    label: "Lote",
    baseFields: [
      { name: "area_total", label: "Área total (m²)", type: "number", required: true }
    ],
    amenities: [
      { name: "Acceso pavimentado", hasQuantity: false },
      { name: "Servicios públicos disponibles", hasQuantity: false },
      { name: "Cerco perimetral", hasQuantity: false }
    ]
  },
  casa: {
    label: "Casa",
    baseFields: [
      { name: "area", label: "Área construida (m²)", type: "number", required: true },
      { name: "habitaciones", label: "Habitaciones", type: "number", required: true },
      { name: "banos", label: "Baños", type: "number", required: true }
    ],
    amenities: [
      { name: "Garaje", hasQuantity: true },
      { name: "Terraza", hasQuantity: false },
      { name: "Jardín", hasQuantity: false },
      { name: "Patio", hasQuantity: false }
    ]
  },
  apartaestudio: {
    label: "Apartaestudio",
    baseFields: [
      { name: "area", label: "Área (m²)", type: "number", required: true },
      { name: "banos", label: "Baños", type: "number", required: true }
    ],
    amenities: [
      { name: "Balcón", hasQuantity: false },
      { name: "Garaje", hasQuantity: true },
      { name: "Zona de lavandería", hasQuantity: false }
    ]
  },
  apartamento: {
    label: "Apartamento",
    baseFields: [
      { name: "area", label: "Área (m²)", type: "number", required: true },
      { name: "habitaciones", label: "Habitaciones", type: "number", required: true },
      { name: "banos", label: "Baños", type: "number", required: true }
    ],
    amenities: [
      { name: "Garaje", hasQuantity: true },
      { name: "Balcón", hasQuantity: false },
      { name: "Zona de lavandería", hasQuantity: false },
      { name: "Depósito", hasQuantity: false }
    ]
  },
  finca: {
    label: "Finca",
    baseFields: [
      { name: "area_total", label: "Área total (m²)", type: "number", required: true },
      { name: "area_construida", label: "Área construida (m²)", type: "number", required: false }
    ],
    amenities: [
      { name: "Piscina", hasQuantity: false },
      { name: "Zona BBQ", hasQuantity: false },
      { name: "Árboles frutales", hasQuantity: false },
      { name: "Establos", hasQuantity: true },
      { name: "Lago o estanque", hasQuantity: false }
    ]
  },
  oficina: {
    label: "Oficina",
    baseFields: [
      { name: "area", label: "Área (m²)", type: "number", required: true }
    ],
    amenities: [
      { name: "Salas de reunión", hasQuantity: true },
      { name: "Parqueaderos", hasQuantity: true },
      { name: "Aire acondicionado", hasQuantity: false },
      { name: "Ascensor", hasQuantity: false },
      { name: "Baños privados", hasQuantity: true }
    ]
  }
};

export default propertyConfig;
