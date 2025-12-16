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
            <span className="text-gray-900 font-medium">{property.titulo || property.direccion}</span>
          </div>
        </div>
      </div>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative h-[400px] rounded-xl overflow-hidden">
                <img
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
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{property.titulo || property.direccion}</h1>
                  <div className="flex items-center mt-2 text-gray-500">
                    <MapPin className="h-5 w-5 mr-1 text-[#00457B]" />
                    <span>{property.locationLabel}</span>
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
                <InfoItem icon={<Home className="h-6 w-6 text-[#00457B]" />} label="Área" value={property.area_construida ? `${property.area_construida} m²` : "N/D"} />
                <InfoItem icon={<Building2 className="h-6 w-6 text-[#00457B]" />} label="Habitaciones" value={property.habitaciones ?? "N/D"} />
                <InfoItem icon={<ShowerHead className="h-6 w-6 text-[#00457B]" />} label="Baños" value={property.banos ?? "N/D"} />
                <InfoItem icon={<Key className="h-6 w-6 text-[#00457B]" />} label="Operación" value={property.operacion || "N/D"} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
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
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{prop.titulo || prop.direccion}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" /> {prop.ciudad}, {prop.departamento}
                  </div>
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
          </div>
        </div>
      </section>

      <PropertyVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        property={property}
        onSubmit={() => setIsVisitModalOpen(false)}
      />
    </main>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <div className="flex flex-col items-center text-center p-3">
    {icon}
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-bold">{value}</span>
  </div>
);
