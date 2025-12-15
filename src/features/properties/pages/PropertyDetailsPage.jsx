import React, { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import PropertyVisitModal from "../components/PropertyVisitModal"
import { useToast } from "@/shared/hooks/use-toast"
import { useAppointments } from "@/shared/contexts/AppointmentContext"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/shared/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion"
import {
  Building2,
  Calendar,
  Car,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Heart,
  Home,
  Info,
  Landmark,
  Layers,
  MapPin,
  Maximize2,
  MessageSquare,
  Phone,
  Share2,
  ShowerHead,
  Star,
  ThumbsUp,
  Trees,
  Tv,
  Wifi,
  Eye,
} from "lucide-react"
import { inmueblesAPI } from "@/shared/services/propertyApidervice"

export default function PropertyDetailPage() {
  const { id } = useParams()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [property, setProperty] = useState(null)
  const { toast } = useToast()
  const { addExistingAppointment } = useAppointments()

  const propertyId = useMemo(() => {
    const parsed = Number(id)
    return Number.isFinite(parsed) ? parsed : id
  }, [id])

  useEffect(() => {
    let mounted = true

    const formatPrice = (value) => {
      const n = Number(value)
      if (!Number.isFinite(n)) return "Consultar"
      return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    }

    const fetchProperty = async () => {
      try {
        setLoading(true)
        setError(null)

        const { items } = await inmueblesAPI.getPublicInmuebles(1, 100, { _t: Date.now() })
        const match = items.find((p) => String(p.id) === String(propertyId))

        if (match) {
          if (mounted) setProperty(match)
          return
        }

        try {
          const byId = await inmueblesAPI.getInmuebleById(propertyId)
          if (mounted) setProperty(byId)
        } catch (_err) {
          if (mounted) setError("No encontramos la información de este inmueble")
        }
      } catch (err) {
        console.error("Error cargando inmueble:", err)
        if (mounted) setError("No se pudo cargar la información del inmueble")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProperty()
    return () => {
      mounted = false
    }
  }, [propertyId])

  const viewModel = useMemo(() => {
    if (!property) return null

    const comodidades = Array.isArray(property.comodidades) ? property.comodidades : []
    const findAmenity = (name) => {
      const item = comodidades.find((c) => (c.nombre || "").toLowerCase() === name.toLowerCase())
      return item?.cantidad ?? "N/D"
    }

    const images =
      Array.isArray(property.imagenes) && property.imagenes.length
        ? property.imagenes
        : ["/images/hero-inmuebles.jpg"]

    const mainImage = images[0]
    const locationParts = [property.barrio, property.ciudad, property.departamento, property.pais].filter(Boolean)

    const formatPrice = (value) => {
      const n = Number(value)
      if (!Number.isFinite(n)) return "Consultar"
      return n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    }

    return {
      id: property.id,
      title: property.titulo,
      location: locationParts.join(", "),
      price: property.precio_venta || property.precio_arriendo ? formatPrice(property.precio) : "Consultar",
      pricePerM2: property.area_construida
        ? `${formatPrice((property.precio || 0) / property.area_construida)} / m2`
        : null,
      area: property.area_construida ? `${property.area_construida} m2` : "N/D",
      bedrooms: findAmenity("habitaciones"),
      bathrooms: findAmenity("baños") === "N/D" ? findAmenity("banos") : findAmenity("baños"),
      parking: findAmenity("parqueaderos"),
      code: property.registro || property.registro_inmobiliario || property.id,
      type: property.categoria || property.tipo || "Inmueble",
      operation: property.operacion || "Sin definir",
      status: property.estado_bool === false ? "No disponible" : "Disponible",
      description: property.descripcion || "Sin descripción",
      amenities: comodidades,
      images,
      mainImage,
      owner: property.propietario
    }
  }, [property])

  const handleScheduleVisit = (nuevaCita) => {
    addExistingAppointment(nuevaCita);
    setIsVisitModalOpen(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando información del inmueble...</p>
      </main>
    )
  }

  if (error || !viewModel) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-600 font-semibold">No se pudo cargar el inmueble</p>
          {error && <p className="text-sm text-gray-600">{error}</p>}
          <Button asChild className="mt-2">
            <Link to="/inmuebles">Volver al listado</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-[#00457B]">
              Inicio
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link to="/inmuebles" className="hover:text-[#00457B]">
              Inmuebles
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium">{viewModel.title}</span>
          </div>
        </div>
      </div>

      {/* Galería de imágenes */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imagen principal y carrusel */}
            <div className="space-y-4">
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <img
                  src={viewModel.mainImage || "/placeholder.svg"}
                  alt={viewModel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/80 hover:bg-white"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-white/80 hover:bg-white">
                    <Share2 className="h-5 w-5 text-gray-700" />
                  </Button>
                </div>
                <Badge className="absolute top-4 left-4 bg-[#00457B]">{viewModel.operation}</Badge>
              </div>

              <Carousel className="w-full">
                <CarouselContent>
                  {viewModel.images.map((image, index) => (
                    <CarouselItem key={index} className="basis-1/4 md:basis-1/5">
                      <div className="relative h-24 rounded-lg overflow-hidden cursor-pointer">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${viewModel.title} - Imagen ${index + 1}`}
                          className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>

            {/* Información básica */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{viewModel.title}</h1>
                    <div className="flex items-center mt-2 text-gray-500">
                      <MapPin className="h-5 w-5 mr-1 text-[#00457B]" />
                      <span>{viewModel.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#00457B]">{viewModel.price}</div>
                    {viewModel.pricePerM2 && <div className="text-sm text-gray-500">{viewModel.pricePerM2}</div>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="flex flex-col items-center text-center p-3">
                  <Home className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Área</span>
                  <span className="font-bold">{viewModel.area}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <Building2 className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Habitaciones</span>
                  <span className="font-bold">{viewModel.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <ShowerHead className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Baños</span>
                  <span className="font-bold">{viewModel.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <Car className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Estacionamientos</span>
                  <span className="font-bold">{viewModel.parking}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3">
                    <Info className="h-5 w-5 text-[#00457B]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Código de la propiedad</h3>
                    <p className="text-gray-500">{viewModel.code}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3">
                    <Landmark className="h-5 w-5 text-[#00457B]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Tipo de propiedad</h3>
                    <p className="text-gray-500">{viewModel.type}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3">
                    <Clock className="h-5 w-5 text-[#00457B]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Operación</h3>
                    <p className="text-gray-500">{viewModel.operation}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3">
                    <CheckCircle className="h-5 w-5 text-[#00457B]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Estado</h3>
                    <p className="text-gray-500">{viewModel.status}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-[#00457B] text-[#00457B] hover:bg-[#00457B]/10"
                  onClick={() => setIsVisitModalOpen(true)}
                >
                  <Calendar className="h-5 w-5 mr-2" /> Agendar visita
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs de informaci?n */}
            <Tabs defaultValue="descripcion" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 rounded-xl bg-white">
                <TabsTrigger value="descripcion" className="rounded-lg">
                  Descripci?n
                </TabsTrigger>
                <TabsTrigger value="caracteristicas" className="rounded-lg">
                  Caracter?sticas
                </TabsTrigger>
                <TabsTrigger value="ubicacion" className="rounded-lg">
                  Ubicaci?n
                </TabsTrigger>
              </TabsList>

              <TabsContent value="descripcion" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-4 text-gray-700">
                    <h2 className="text-xl font-bold">Descripci?n de la propiedad</h2>
                    <p>{viewModel.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="caracteristicas" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Comodidades</h2>
                    {viewModel.amenities?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {viewModel.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-gray-700">
                              {amenity.nombre} {amenity.cantidad ? `(${amenity.cantidad})` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Sin comodidades registradas.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ubicacion" className="mt-6">
                <Card>
                  <CardContent className="p-6 space-y-2 text-gray-700">
                    <h2 className="text-xl font-bold mb-2">Ubicaci?n</h2>
                    <p><span className="font-medium">Direcci?n:</span> {property.direccion || "N/D"}</p>
                    <p><span className="font-medium">Barrio:</span> {property.barrio || "N/D"}</p>
                    <p><span className="font-medium">Ciudad:</span> {property.ciudad || "N/D"}</p>
                    <p><span className="font-medium">Departamento:</span> {property.departamento || "N/D"}</p>
                    <p><span className="font-medium">Pa?s:</span> {property.pais || "N/D"}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Propiedades similares - pendiente de implementar con datos reales */}
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Agente inmobiliario */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="/avatar-agent-1.jpg" alt="Ana Rodríguez" />
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">Ana Rodríguez</h3>
                  <p className="text-[#00457B]">Agente Inmobiliario Senior</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm text-gray-500">(28 reseñas)</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#00457B] mr-2" />
                    <span>+123 456 7890</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-[#00457B] mr-2" />
                    <span>ana.rodriguez@matriz.com</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-[#00457B] hover:bg-[#003b69]">
                    <Phone className="h-5 w-5 mr-2" /> Llamar ahora
                  </Button>
                  <Button variant="outline" className="w-full border-[#00457B] text-[#00457B] hover:bg-[#00457B]/10">
                    <MessageSquare className="h-5 w-5 mr-2" /> Enviar mensaje
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            {/* Contenido lateral adicional pendiente */}
          </div>
        </div>
      </section>

      {/* Property Visit Modal */}
      <PropertyVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        property={property}
        onSubmit={handleScheduleVisit}
      />
    </main>
  )
}

// Función para obtener el icono de amenidad
function getAmenityIcon(iconName) {
  switch (iconName) {
    case "pool":
      return <Tv className="h-6 w-6 text-[#00457B]" />
    case "gym":
      return <ThumbsUp className="h-6 w-6 text-[#00457B]" />
    case "garden":
      return <Trees className="h-6 w-6 text-[#00457B]" />
    case "wifi":
      return <Wifi className="h-6 w-6 text-[#00457B]" />
    default:
      return <CheckCircle className="h-6 w-6 text-[#00457B]" />
  }
}

// Función para obtener el icono de punto de interés
function getPoiIcon(poiType) {
  switch (poiType) {
    case "school":
      return <Building2 className="h-4 w-4 text-[#00457B]" />
    case "mall":
      return <Building2 className="h-4 w-4 text-[#00457B]" />
    case "park":
      return <Trees className="h-4 w-4 text-[#00457B]" />
    case "hospital":
      return <Building2 className="h-4 w-4 text-[#00457B]" />
    case "restaurant":
      return <Building2 className="h-4 w-4 text-[#00457B]" />
    case "transport":
      return <Building2 className="h-4 w-4 text-[#00457B]" />
    default:
      return <MapPin className="h-4 w-4 text-[#00457B]" />
  }
}
