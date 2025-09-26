import React, { useState } from "react"
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

export default function PropertyDetailPage() {
  const { id } = useParams()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false)
  const { toast } = useToast()
  const { addAppointment } = useAppointments()

  // Simulamos obtener los datos de la propiedad basados en el ID
  const propertyId = parseInt(id)
  const property = properties.find((p) => p.id === propertyId) || properties[0]

  const handleScheduleVisit = (visitData) => {
    const todayLocal = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD en hora local
    const appointmentData = {
      ...visitData,
      servicio: 'Visita a Propiedad',
      propiedad: property.title,
      estado: 'programada',
      fechaCreacion: todayLocal
    };

    addAppointment(appointmentData);

    setIsVisitModalOpen(false);

    toast({
      title: "¡Visita agendada exitosamente!",
      description: "Te contactaremos pronto para confirmar los detalles.",
      variant: "default"
    })
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
            <span className="text-gray-900 font-medium">{property.title}</span>
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
                  src={property.mainImage || "/placeholder.svg"}
                  alt={property.title}
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
                <Badge className="absolute top-4 left-4 bg-[#00457B]">{property.status}</Badge>
              </div>

              <Carousel className="w-full">
                <CarouselContent>
                  {property.images.map((image, index) => (
                    <CarouselItem key={index} className="basis-1/4 md:basis-1/5">
                      <div className="relative h-24 rounded-lg overflow-hidden cursor-pointer">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${property.title} - Imagen ${index + 1}`}
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
                    <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                    <div className="flex items-center mt-2 text-gray-500">
                      <MapPin className="h-5 w-5 mr-1 text-[#00457B]" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#00457B]">{property.price}</div>
                    {property.pricePerM2 && <div className="text-sm text-gray-500">{property.pricePerM2} / m²</div>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="flex flex-col items-center text-center p-3">
                  <Home className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Área</span>
                  <span className="font-bold">{property.area}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <Building2 className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Habitaciones</span>
                  <span className="font-bold">{property.bedrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <ShowerHead className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Baños</span>
                  <span className="font-bold">{property.bathrooms}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <Car className="h-6 w-6 text-[#00457B] mb-2" />
                  <span className="text-sm text-gray-500">Estacionamientos</span>
                  <span className="font-bold">{property.parking}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3">
                    <Info className="h-5 w-5 text-[#00457B]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Código de la propiedad</h3>
                    <p className="text-gray-500">{property.code}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3">
                    <Landmark className="h-5 w-5 text-[#00457B]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Tipo de propiedad</h3>
                    <p className="text-gray-500">{property.type}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3">
                    <Clock className="h-5 w-5 text-[#00457B]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Antigüedad</h3>
                    <p className="text-gray-500">{property.age}</p>
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
            {/* Tabs de información */}
            <Tabs defaultValue="descripcion" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl bg-white">
                <TabsTrigger value="descripcion" className="rounded-lg">
                  Descripción
                </TabsTrigger>
                <TabsTrigger value="caracteristicas" className="rounded-lg">
                  Características
                </TabsTrigger>
                <TabsTrigger value="ubicacion" className="rounded-lg">
                  Ubicación
                </TabsTrigger>
                <TabsTrigger value="video" className="rounded-lg">
                  Video
                </TabsTrigger>
              </TabsList>

              {/* Descripción */}
              <TabsContent value="descripcion" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Descripción de la propiedad</h2>
                    <div className="space-y-4 text-gray-700">
                      <p>{property.description}</p>
                      <p>
                        Esta espectacular propiedad se encuentra en una de las zonas más exclusivas y seguras de la
                        ciudad, con fácil acceso a centros comerciales, colegios, restaurantes y parques.
                      </p>
                      <p>
                        La casa cuenta con acabados de lujo, amplios espacios y excelente iluminación natural. La cocina
                        está completamente equipada con electrodomésticos de alta gama y la sala principal tiene vista
                        panorámica a la ciudad.
                      </p>
                    </div>

                    <div className="mt-8">
                      <h3 className="font-bold mb-3">Destacados de la propiedad</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {property.highlights.map((highlight, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Características */}
              <TabsContent value="caracteristicas" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Características y amenidades</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-bold text-[#00457B] mb-3">Interiores</h3>
                        <div className="space-y-3">
                          {property.features.interior.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-[#00457B] mb-3">Exteriores</h3>
                        <div className="space-y-3">
                          {property.features.exterior.map((feature, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="font-bold text-[#00457B] mb-3">Amenidades del edificio/conjunto</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {property.amenities.map((amenity, index) => (
                          <div key={index} className="flex flex-col items-center bg-gray-50 p-4 rounded-lg text-center">
                            {getAmenityIcon(amenity.icon)}
                            <span className="mt-2 text-sm">{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ubicación */}
              <TabsContent value="ubicacion" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Ubicación</h2>

                    <div className="relative h-[400px] rounded-xl overflow-hidden mb-6">
                      <img src="/property-map.png" alt="Mapa de ubicación" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button className="bg-[#00457B] hover:bg-[#003b69]">
                          <ExternalLink className="h-5 w-5 mr-2" /> Ver en Google Maps
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold">Puntos de interés cercanos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.pointsOfInterest.map((poi, index) => (
                          <div key={index} className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-[#00457B]/10 flex items-center justify-center mr-3 flex-shrink-0">
                              {getPoiIcon(poi.type)}
                            </div>
                            <div>
                              <p className="font-medium">{poi.name}</p>
                              <p className="text-sm text-gray-500">{poi.distance}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Video */}
              <TabsContent value="video" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Video y tour virtual</h2>

                    <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                      <img
                        src="/property-video-thumbnail.png"
                        alt="Video de la propiedad"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-[#00457B] flex items-center justify-center cursor-pointer hover:bg-[#003b69] transition-colors">
                          <div className="h-0 w-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button className="bg-[#00457B] hover:bg-[#003b69]">
                        <Maximize2 className="h-5 w-5 mr-2" /> Ver tour virtual 360°
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Propiedades similares */}
            <div>
              <h2 className="text-xl font-bold mb-4">Propiedades similares</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {similarProperties.map((property, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div className="relative h-48">
                      <img
                        src={property.image || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-[#00457B]">{property.status}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{property.title}</h3>
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-1" /> {property.location}
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-1 text-[#00457B]" /> {property.area}
                        </div>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1 text-[#00457B]" /> {property.bedrooms} Hab.
                        </div>
                        <div className="flex items-center">
                          <ShowerHead className="h-4 w-4 mr-1 text-[#00457B]" /> {property.bathrooms} Baños
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-lg text-[#00457B]">{property.price}</p>
                        <Button variant="outline" size="sm" className="text-xs">
                          Ver detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Estadísticas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Vistas</span>
                    </div>
                    <span className="font-bold">1,245</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                      <span>Guardados</span>
                    </div>
                    <span className="font-bold">87</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Share2 className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Compartidos</span>
                    </div>
                    <span className="font-bold">32</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>Visitas agendadas</span>
                    </div>
                    <span className="font-bold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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

// Datos de ejemplo
const properties = [
  {
    id: 1,
    title: "Casa Moderna en El Poblado",
    price: "$850,000",
    pricePerM2: "$3,035",
    location: "El Poblado, Medellín",
    area: "280 m²",
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    status: "Venta",
    type: "Casa",
    code: "PROP-1234",
    age: "5 años",
    mainImage: "/property-1.jpg",
    images: [
      "/property-1.jpg",
      "/property-2.jpg",
      "/property-3.jpg",
      "/property-4.jpg",
      "/property-5.jpg",
      "/property-6.jpg",
    ],
    description:
      "Espectacular casa moderna ubicada en el exclusivo sector de El Poblado, con acabados de lujo y amplios espacios. Perfecta para familias que buscan comodidad y elegancia en una de las mejores zonas de la ciudad.",
    highlights: [
      "Diseño arquitectónico moderno",
      "Amplios espacios con excelente iluminación natural",
      "Zona social integrada con vista panorámica",
      "Cocina tipo isla completamente equipada",
      "Habitación principal con vestier y baño privado",
      "Terraza con jacuzzi y zona BBQ",
    ],
    features: {
      interior: [
        "Cocina integral con electrodomésticos de alta gama",
        "Pisos en porcelanato importado",
        "Ventanales de piso a techo",
        "Sistema de domótica",
        "Calentador de agua a gas",
        "Vestier en habitación principal",
        "Estudio/biblioteca",
        "Sala de entretenimiento",
      ],
      exterior: [
        "Terraza con vista panorámica",
        "Jardín privado",
        "Zona BBQ",
        "Jacuzzi exterior",
        "Parqueadero para 2 vehículos",
        "Depósito",
      ],
    },
    amenities: [
      { name: "Piscina", icon: "pool" },
      { name: "Gimnasio", icon: "gym" },
      { name: "Jardines", icon: "garden" },
      { name: "Wi-Fi", icon: "wifi" },
      { name: "Seguridad 24/7", icon: "security" },
      { name: "Salón social", icon: "social" },
      { name: "Parque infantil", icon: "playground" },
      { name: "Zona de mascotas", icon: "pets" },
    ],
    pointsOfInterest: [
      { name: "Colegio Internacional", type: "school", distance: "0.5 km" },
      { name: "Centro Comercial El Tesoro", type: "mall", distance: "1.2 km" },
      { name: "Parque Lleras", type: "park", distance: "1.5 km" },
      { name: "Clínica Las Américas", type: "hospital", distance: "2.3 km" },
      { name: "Restaurante La Provincia", type: "restaurant", distance: "0.8 km" },
      { name: "Estación Metro Poblado", type: "transport", distance: "1.7 km" },
    ],
  },
]

const similarProperties = [
  {
    title: "Apartamento de Lujo",
    price: "$450,000",
    location: "Laureles, Medellín",
    area: "150 m²",
    bedrooms: 3,
    bathrooms: 2,
    image: "/property-2.jpg",
    status: "Venta",
  },
  {
    title: "Penthouse con Vista Panorámica",
    price: "$1,200,000",
    location: "Envigado, Antioquia",
    area: "320 m²",
    bedrooms: 4,
    bathrooms: 4,
    image: "/property-3.jpg",
    status: "Venta",
  },
]