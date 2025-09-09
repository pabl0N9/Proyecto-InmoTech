import { useState, useEffect } from "react"

// Mock data para propiedades
const mockProperties = [
  {
    id: 1,
    title: "Casa Moderna en El Poblado",
    price: "$850,000",
    location: "El Poblado, Medellín",
    area: "280 m²",
    bedrooms: 4,
    bathrooms: 3,
    image: "/property-1.jpg",
    status: "Venta",
    type: "casa",
    featured: true,
  },
  {
    id: 2,
    title: "Apartamento de Lujo",
    price: "$450,000",
    location: "Laureles, Medellín",
    area: "150 m²",
    bedrooms: 3,
    bathrooms: 2,
    image: "/property-2.jpg",
    status: "Venta",
    type: "apartamento",
    featured: false,
  },
  {
    id: 3,
    title: "Penthouse con Vista Panorámica",
    price: "$1,200,000",
    location: "Envigado, Antioquia",
    area: "320 m²",
    bedrooms: 4,
    bathrooms: 4,
    image: "/property-3.jpg",
    status: "Venta",
    type: "apartamento",
    featured: true,
  },
  {
    id: 4,
    title: "Casa Campestre",
    price: "$750,000",
    location: "Llanogrande, Rionegro",
    area: "450 m²",
    bedrooms: 5,
    bathrooms: 4,
    image: "/property-4.jpg",
    status: "Venta",
    type: "casa",
    featured: false,
  },
  {
    id: 5,
    title: "Apartamento Amoblado",
    price: "$2,500/mes",
    location: "Belén, Medellín",
    area: "95 m²",
    bedrooms: 2,
    bathrooms: 2,
    image: "/property-5.jpg",
    status: "Alquiler",
    type: "apartamento",
    featured: true,
  },
  {
    id: 6,
    title: "Local Comercial",
    price: "$350,000",
    location: "Centro, Medellín",
    area: "120 m²",
    bedrooms: 0,
    bathrooms: 1,
    image: "/property-6.jpg",
    status: "Venta",
    type: "local-comercial",
    featured: false,
  },
  {
    id: 7,
    title: "Oficina Ejecutiva",
    price: "$3,000/mes",
    location: "El Poblado, Medellín",
    area: "85 m²",
    bedrooms: 0,
    bathrooms: 2,
    image: "/property-7.jpg",
    status: "Alquiler",
    type: "oficina",
    featured: false,
  },
  {
    id: 8,
    title: "Casa Familiar",
    price: "$520,000",
    location: "Sabaneta, Antioquia",
    area: "220 m²",
    bedrooms: 4,
    bathrooms: 3,
    image: "/property-8.jpg",
    status: "Venta",
    type: "casa",
    featured: false,
  },
  {
    id: 9,
    title: "Apartamento con Terraza",
    price: "$380,000",
    location: "Envigado, Antioquia",
    area: "130 m²",
    bedrooms: 3,
    bathrooms: 2,
    image: "/property-9.jpg",
    status: "Venta",
    type: "apartamento",
    featured: false,
  },
]

export function useProperties() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    type: "all",
    location: "all",
    maxPrice: "all",
    status: "all",
    search: ""
  })

  // Simular carga de datos
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true)
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setProperties(mockProperties)
      } catch (err) {
        setError("Error al cargar las propiedades")
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  // Filtrar propiedades
  const filteredProperties = properties.filter(property => {
    const matchesType = filters.type === "all" || property.type === filters.type
    const matchesLocation = filters.location === "all" || 
      property.location.toLowerCase().includes(filters.location.toLowerCase())
    const matchesStatus = filters.status === "all" || property.status === filters.status
    const matchesSearch = !filters.search || 
      property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.location.toLowerCase().includes(filters.search.toLowerCase())

    return matchesType && matchesLocation && matchesStatus && matchesSearch
  })

  // Obtener propiedades destacadas
  const featuredProperties = properties.filter(property => property.featured)

  // Obtener propiedad por ID
  const getPropertyById = (id) => {
    return properties.find(property => property.id === parseInt(id))
  }

  // Obtener propiedades similares
  const getSimilarProperties = (propertyId, limit = 3) => {
    const currentProperty = getPropertyById(propertyId)
    if (!currentProperty) return []

    return properties
      .filter(property => 
        property.id !== propertyId && 
        (property.type === currentProperty.type || property.location === currentProperty.location)
      )
      .slice(0, limit)
  }

  return {
    properties: filteredProperties,
    allProperties: properties,
    featuredProperties,
    loading,
    error,
    filters,
    setFilters,
    getPropertyById,
    getSimilarProperties,
    totalCount: filteredProperties.length
  }
}