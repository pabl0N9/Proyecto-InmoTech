import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Building2, Home, Key, MapPin, Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useProperties } from "../hooks/useProperties";

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState("venta");
  const [propertiesVisible, setPropertiesVisible] = useState(false);
  const propertiesRef = useRef(null);
  const navigate = useNavigate();

  const {
    properties,
    loading,
    error,
    filters,
    setFilters,
    totalCount
  } = useProperties();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPropertiesVisible(true);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    if (propertiesRef.current) {
      observer.observe(propertiesRef.current);
    }

    return () => {
      if (propertiesRef.current) {
        observer.unobserve(propertiesRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      status: activeTab === "venta" ? "venta" : "arriendo"
    }));
  }, [activeTab, setFilters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="flex min-h-screen flex-col">
      <section className="relative h-[400px]">
        <img src="/images/hero-inmuebles.jpg" alt="Inmuebles" className="w-full h-full object-cover brightness-[0.65]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in-up animate-pulse">
            Nuestros Inmuebles
          </h1>
          <p className="text-lg max-w-2xl animate-fade-in-up animation-delay-300">
            Encuentra la propiedad perfecta para ti entre nuestra amplia selección de inmuebles.
          </p>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Tabs defaultValue="venta" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="relative grid w-full grid-cols-2 mb-6 bg-[#F4F4F5] rounded-md select-none">
                <div
                  className={`absolute top-1 left-1 h-[32px] bg-white rounded-md shadow transition-transform duration-300 ease-in-out`}
                  style={{
                    width: "calc(50% - 12px)",
                    transform: activeTab === "venta" ? "translateX(0%)" : "translateX(calc(100% + 14px))"
                  }}
                />
                <TabsTrigger
                  value="venta"
                  className={`relative z-10 py-2 text-center text-sm font-medium cursor-pointer ${
                    activeTab === "venta" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Venta
                </TabsTrigger>
                <TabsTrigger
                  value="alquiler"
                  className={`relative z-10 py-2 text-center text-sm font-medium cursor-pointer ${
                    activeTab === "alquiler" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Alquiler
                </TabsTrigger>
              </TabsList>

              <TabsContent value="venta" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de propiedad</label>
                    <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Todos los tipos">Todos los tipos</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Oficina">Oficina</SelectItem>
                        <SelectItem value="Local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ubicación</label>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Todas las ubicaciones" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Todas las ubicaciones">Todas las ubicaciones</SelectItem>
                        {Array.from(new Set(properties.map((p) => p.locationLabel))).map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-[#0c4a7b] hover:bg-[#0a3d68] text-white">
                      <Search className="h-4 w-4 mr-2" /> Buscar
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="text-[#0c4a7b]">
                    <Filter className="h-4 w-4 mr-2" /> Filtros avanzados
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="alquiler" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo de propiedad</label>
                    <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Todos los tipos">Todos los tipos</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Oficina">Oficina</SelectItem>
                        <SelectItem value="Local">Local</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ubicación</label>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Todas las ubicaciones" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Todas las ubicaciones">Todas las ubicaciones</SelectItem>
                        {Array.from(new Set(properties.map((p) => p.locationLabel))).map((loc) => (
                          <SelectItem key={loc} value={loc}>
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-[#0c4a7b] hover:bg-[#0a3d68] text-white">
                      <Search className="h-4 w-4 mr-2" /> Buscar
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="text-[#0c4a7b]">
                    <Filter className="h-4 w-4 mr-2" /> Filtros avanzados
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section className="py-16" ref={propertiesRef}>
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#0c4a7b]">
              Propiedades Disponibles ({totalCount})
            </h2>
          </div>

          {loading && <p className="text-center text-gray-500">Cargando inmuebles...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && properties.length === 0 && (
            <p className="text-center text-gray-500">No hay inmuebles disponibles con los filtros seleccionados.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <Card
                key={property.id || index}
                className={`overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-600 ease-out ${
                  propertiesVisible ? 'animate-fade-in-up' : ''
                }`}
                style={propertiesVisible ? {
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                  animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                } : {}}
              >
                <div className="relative h-64">
                  <img
                    src={property.mainImage}
                    alt={property.titulo || property.direccion}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-[#0c4a7b]">
                    {property.operacion || property.estado}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{property.titulo || property.direccion}</CardTitle>
                    <p className="text-xl font-bold text-[#0c4a7b]">{property.priceLabel || "-"}</p>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="h-4 w-4 mr-1" /> {property.locationLabel || property.direccion}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" /> {property.area_construida ? `${property.area_construida} m²` : "N/D"}
                    </div>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" /> {property.habitaciones ?? "N/D"} Hab.
                    </div>
                    <div className="flex items-center">
                      <Key className="h-4 w-4 mr-1" /> {property.banos ?? "N/D"} Baños
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-[#0c4a7b] hover:bg-[#0a3d68] text-white"
                    onClick={() => navigate(`/inmuebles/${property.id}`)}
                  >
                    Ver detalles
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
