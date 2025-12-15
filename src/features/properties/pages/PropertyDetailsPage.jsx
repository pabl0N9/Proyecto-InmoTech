<<<<<<< HEAD
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
=======
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PropertyVisitModal from "../components/PropertyVisitModal";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/shared/components/ui/carousel";
import { MapPin, Home, Building2, ShowerHead, Calendar, ChevronRight, Key } from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { inmueblesAPI } from "@/shared/services/propertyApidervice";

const formatPrice = (value, operacion) => {
  if (value === null || value === undefined) return "-";
  const number = Number(value);
  const formatted = Number.isFinite(number)
    ? number.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    : value;
  return operacion && operacion.toLowerCase().includes("arriendo") ? `${formatted}/mes` : formatted;
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const { getSimilarProperties, properties: listLoaded } = useProperties();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await inmueblesAPI.getPublicInmueble(id);
        setProperty({
          ...data,
          priceLabel: formatPrice(data.precio_venta ?? data.precio_arriendo ?? data.precio, data.operacion),
          locationLabel: [data.direccion, data.ciudad, data.departamento].filter(Boolean).join(", "),
          images: (data.imagenes || []).map((img) => img.url || img.ruta_archivo || img).filter(Boolean)
        });
        setError(null);
      } catch (err) {
        console.error("Error cargando inmueble:", err);
        setError(err.message || "No se pudo cargar el inmueble");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const similar = useMemo(() => {
    if (!property) return [];
    const sims = getSimilarProperties(Number(id), 3);
    return sims;
  }, [property, getSimilarProperties, id, listLoaded]);

  if (loading) return <div className="container mx-auto px-4 py-10">Cargando inmueble...</div>;
  if (error) return <div className="container mx-auto px-4 py-10 text-red-500">{error}</div>;
  if (!property) return <div className="container mx-auto px-4 py-10">Inmueble no encontrado.</div>;

  const images = property.images && property.images.length > 0
    ? property.images
    : ["/images/property/propiedad-1.jpg"];
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
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
<<<<<<< HEAD
            <span className="text-gray-900 font-medium">{viewModel.title}</span>
=======
            <span className="text-gray-900 font-medium">{property.titulo || property.direccion}</span>
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
          </div>
        </div>
      </div>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <img
<<<<<<< HEAD
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
=======
                  src={images[0]}
                  alt={property.titulo || "Inmueble"}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-[#00457B]">
                  {property.operacion || property.estado}
                </Badge>
              </div>

              {images.length > 1 && (
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={index} className="basis-1/4 md:basis-1/5">
                        <div className="relative h-24 rounded-lg overflow-hidden cursor-pointer">
                          <img
                            src={image}
                            alt={`${property.titulo || "Inmueble"} - Imagen ${index + 1}`}
                            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              )}
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
            </div>

            <div className="space-y-6">
<<<<<<< HEAD
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
=======
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{property.titulo || property.direccion}</h1>
                  <div className="flex items-center mt-2 text-gray-500">
                    <MapPin className="h-5 w-5 mr-1 text-[#00457B]" />
                    <span>{property.locationLabel}</span>
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00457B]">{property.priceLabel}</div>
                  {property.operacion && (
                    <div className="text-sm text-gray-500">{property.operacion}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl">
<<<<<<< HEAD
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
=======
                <InfoItem icon={<Home className="h-6 w-6 text-[#00457B]" />} label="Área" value={property.area_construida ? `${property.area_construida} m²` : "N/D"} />
                <InfoItem icon={<Building2 className="h-6 w-6 text-[#00457B]" />} label="Habitaciones" value={property.habitaciones ?? "N/D"} />
                <InfoItem icon={<ShowerHead className="h-6 w-6 text-[#00457B]" />} label="Baños" value={property.banos ?? "N/D"} />
                <InfoItem icon={<Key className="h-6 w-6 text-[#00457B]" />} label="Operación" value={property.operacion || "N/D"} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
                  className="flex-1 h-12 border-[#00457B] text-[#00457B] hover:bg-[#00457B]/10"
                  onClick={() => setIsVisitModalOpen(true)}
                >
                  <Calendar className="h-5 w-5 mr-2" /> Agendar visita
                </Button>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Descripción</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {property.descripcion || "No se ha proporcionado una descripción para este inmueble."}
                  </p>
                  {property.comodidades?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Comodidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {property.comodidades.map((c) => (
                          <Badge key={c.id_comodidad || c.nombre} variant="secondary">
                            {c.nombre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
<<<<<<< HEAD
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
=======
        <div>
          <h2 className="text-xl font-bold mb-4">Propiedades similares</h2>
          {similar.length === 0 && <p className="text-gray-500">No hay propiedades similares disponibles.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map((prop, index) => (
              <Card key={prop.id || index} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="relative h-48">
                  <img
                    src={prop.imagenes?.[0]?.url || prop.imagenes?.[0] || "/placeholder.svg"}
                    alt={prop.titulo || prop.direccion}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-[#00457B]">{prop.operacion || prop.estado}</Badge>
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{prop.titulo || prop.direccion}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" /> {prop.ciudad}, {prop.departamento}
                  </div>
<<<<<<< HEAD
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
=======
                  <div className="flex justify-between text-sm mb-4">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1 text-[#00457B]" /> {prop.area_construida ? `${prop.area_construida} m²` : "N/D"}
                    </div>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1 text-[#00457B]" /> {prop.habitaciones ?? "N/D"} Hab.
                    </div>
                    <div className="flex items-center">
                      <ShowerHead className="h-4 w-4 mr-1 text-[#00457B]" /> {prop.banos ?? "N/D"} Baños
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-lg text-[#00457B]">
                      {formatPrice(prop.precio_venta ?? prop.precio_arriendo ?? prop.precio, prop.operacion)}
                    </p>
                    <Button variant="outline" size="sm" className="text-xs" asChild>
                      <Link to={`/inmuebles/${prop.id}`}>Ver detalles</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Property Visit Modal */}
=======
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      <PropertyVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        property={property}
<<<<<<< HEAD
        onSubmit={handleScheduleVisit}
=======
        onSubmit={() => setIsVisitModalOpen(false)}
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
      />
    </main>
  );
}

<<<<<<< HEAD
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
=======
const InfoItem = ({ icon, label, value }) => (
  <div className="flex flex-col items-center text-center p-3">
    {icon}
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);
>>>>>>> 5ea501cea713adbb6eaf5797d96dcb4f6549cf67
