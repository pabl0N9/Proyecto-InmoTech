import { useState, useEffect, useMemo } from 'react';

// Datos extendidos de inmuebles con referencias y propietarios
const propertiesWithReferences = [
  {
    id: 1,
    reference: "J001",
    title: "Casa Moderna en El Poblado",
    price: "$850,000",
    location: "El Poblado, Medellín",
    area: "280 m²",
    bedrooms: 4,
    bathrooms: 3,
    type: "Casa",
    status: "Venta",
    owner: "María González",
    ownerPhone: "+57 300 123 4567",
    ownerEmail: "maria.gonzalez@email.com",
    featured: true,
  },
  {
    id: 2,
    reference: "J002",
    title: "Apartamento de Lujo",
    price: "$450,000",
    location: "Laureles, Medellín",
    area: "150 m²",
    bedrooms: 3,
    bathrooms: 2,
    type: "Apartamento",
    status: "Venta",
    owner: "Carlos Rodríguez",
    ownerPhone: "+57 301 234 5678",
    ownerEmail: "carlos.rodriguez@email.com",
    featured: false,
  },
  {
    id: 3,
    reference: "J003",
    title: "Penthouse con Vista Panorámica",
    price: "$1,200,000",
    location: "Envigado, Antioquia",
    area: "320 m²",
    bedrooms: 4,
    bathrooms: 4,
    type: "Apartamento",
    status: "Venta",
    owner: "Ana Martínez",
    ownerPhone: "+57 302 345 6789",
    ownerEmail: "ana.martinez@email.com",
    featured: true,
  },
  {
    id: 4,
    reference: "J004",
    title: "Casa Campestre",
    price: "$750,000",
    location: "Llanogrande, Rionegro",
    area: "450 m²",
    bedrooms: 5,
    bathrooms: 4,
    type: "Casa",
    status: "Venta",
    owner: "Luis Hernández",
    ownerPhone: "+57 303 456 7890",
    ownerEmail: "luis.hernandez@email.com",
    featured: false,
  },
  {
    id: 5,
    reference: "J005",
    title: "Apartamento Amoblado",
    price: "$2,500/mes",
    location: "Belén, Medellín",
    area: "95 m²",
    bedrooms: 2,
    bathrooms: 2,
    type: "Apartamento",
    status: "Alquiler",
    owner: "Patricia López",
    ownerPhone: "+57 304 567 8901",
    ownerEmail: "patricia.lopez@email.com",
    featured: true,
  },
  {
    id: 6,
    reference: "J006",
    title: "Local Comercial",
    price: "$350,000",
    location: "Centro, Medellín",
    area: "120 m²",
    bedrooms: 0,
    bathrooms: 1,
    type: "Local",
    status: "Venta",
    owner: "Roberto Silva",
    ownerPhone: "+57 305 678 9012",
    ownerEmail: "roberto.silva@email.com",
    featured: false,
  },
  {
    id: 7,
    reference: "J007",
    title: "Oficina Ejecutiva",
    price: "$3,000/mes",
    location: "El Poblado, Medellín",
    area: "85 m²",
    bedrooms: 0,
    bathrooms: 2,
    type: "Local",
    status: "Alquiler",
    owner: "Carmen Jiménez",
    ownerPhone: "+57 306 789 0123",
    ownerEmail: "carmen.jimenez@email.com",
    featured: false,
  },
  {
    id: 8,
    reference: "J008",
    title: "Casa Familiar",
    price: "$520,000",
    location: "Sabaneta, Antioquia",
    area: "220 m²",
    bedrooms: 4,
    bathrooms: 3,
    type: "Casa",
    status: "Venta",
    owner: "Diego Morales",
    ownerPhone: "+57 307 890 1234",
    ownerEmail: "diego.morales@email.com",
    featured: false,
  },
  {
    id: 9,
    reference: "J009",
    title: "Apartamento con Terraza",
    price: "$380,000",
    location: "Envigado, Antioquia",
    area: "130 m²",
    bedrooms: 3,
    bathrooms: 2,
    type: "Apartamento",
    status: "Venta",
    owner: "Sofía Vargas",
    ownerPhone: "+57 308 901 2345",
    ownerEmail: "sofia.vargas@email.com",
    featured: false,
  },
  {
    id: 10,
    reference: "J010",
    title: "Finca Recreativa",
    price: "$950,000",
    location: "La Ceja, Antioquia",
    area: "2000 m²",
    bedrooms: 6,
    bathrooms: 5,
    type: "Finca",
    status: "Venta",
    owner: "Fernando Castro",
    ownerPhone: "+57 309 012 3456",
    ownerEmail: "fernando.castro@email.com",
    featured: true,
  },
];

export function usePropertyAutocomplete() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filtrar propiedades basado en el término de búsqueda
  const filteredProperties = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return propertiesWithReferences.filter(property => 
      property.reference.toLowerCase().includes(term) ||
      property.title.toLowerCase().includes(term) ||
      property.location.toLowerCase().includes(term) ||
      property.owner.toLowerCase().includes(term)
    ).slice(0, 10); // Limitar a 10 resultados
  }, [searchTerm]);

  // Buscar propiedad por referencia exacta
  const getPropertyByReference = (reference) => {
    return propertiesWithReferences.find(property => 
      property.reference.toLowerCase() === reference.toLowerCase()
    );
  };

  // Obtener datos del formulario basado en la propiedad seleccionada
  const getFormDataFromProperty = (property) => {
    if (!property) return {};

    return {
      ubicacion: property.location,
      tipoInmueble: property.type,
      referencia: property.reference,
      propietario: property.owner,
      // Mantener otros campos como están
    };
  };

  // Seleccionar propiedad y obtener datos del formulario
  const selectProperty = (property) => {
    setSelectedProperty(property);
    setSearchTerm(property.reference);
    return getFormDataFromProperty(property);
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedProperty(null);
    setSearchTerm('');
  };

  // Buscar por referencia y autocompletar
  const searchByReference = (reference) => {
    setSearchTerm(reference);
    const property = getPropertyByReference(reference);
    if (property) {
      return selectProperty(property);
    }
    return {};
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredProperties,
    selectedProperty,
    isSearching,
    setIsSearching,
    getPropertyByReference,
    getFormDataFromProperty,
    selectProperty,
    clearSelection,
    searchByReference,
    allProperties: propertiesWithReferences
  };
}