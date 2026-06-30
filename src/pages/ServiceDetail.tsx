import { BottomNav } from "@/components/BottomNav";
import { ContactButtons } from "@/components/ContactButtons";
import { ContactUserButton } from "@/components/ContactUserButton";
import { Navbar } from "@/components/Navbar";
import { ServiceNotFound } from "@/components/ServiceNotFound";
import { Button } from "@/components/ui/button";
import { TALENTS } from "@/lib/mock-data";
import { serviceApi } from "@/services/serviceApi";
import { useAuthStore } from "@/store/authStore";
import { useRatingStore } from "@/store/ratingStore";
import { useServiceStore } from "@/store/serviceStore";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { services } = useServiceStore();
  const { getAverageRating } = useRatingStore();
  const { user: currentUser } = useAuthStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // El Store ya está sincronizado con Supabase
    // Solo marcamos que cargó
    console.log(`🔍 Buscando servicio: ${serviceId}`);
    console.table(services.map(s => ({ id: s.id, title: s.title, userId: s.userId })));
    console.log(`🎯 Servicio encontrado:`, services.find((s) => s.id === serviceId));
    setIsLoading(false);
  }, [serviceId, services]);

  // Buscar el servicio
  const service = services.find((s) => s.id === serviceId);
  const serviceAuthor = service ? TALENTS.find((t) => t.id === service.userId) : null;
  
  // Crear autor fallback si no existe en TALENTS
  const author = serviceAuthor || (service ? {
    id: service.userId,
    name: service.userName || "Profesional",
    avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(service.userName || 'Professional')}`,
    tagline: "Prestador de servicio en MaslaConnect",
    email: "contacto@maslaconnect.local",
    skills: [],
    projectImage: "",
    rate: service.price + "/hr",
    rating: 0,
    reviews: 0,
    location: "Online",
    bio: "Profesional certificado en plataforma MaslaConnect",
    projects: [],
    services: [],
  } : null);
  
  const authorRating = service ? getAverageRating(service.userId) : 0;

  // Si no encuentra el servicio, mostrar componente mejorado
  if (!service) {
    const notFoundReason = serviceApi.getNotFoundReason(serviceId!);
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <ServiceNotFound serviceId={serviceId!} reason={notFoundReason} />
        <BottomNav />
      </div>
    );
  }
  
  // Si no tiene autor (ni en TALENTS ni fallback), mostrar error
  if (!author) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Error al cargar el servicio</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const images = service.images || [];
  const currentImage = images[currentImageIndex] || `https://api.dicebear.com/7.x/patterns/svg?seed=${service.id}`;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-6">
        {/* Header con botón volver */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/explorar")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">{service.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Galería de imágenes - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-4">
            {/* Imagen principal */}
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-video rounded-2xl overflow-hidden bg-muted"
            >
              <img
                src={currentImage}
                alt={`${service.title} - imagen ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 text-xs text-white bg-black/50 px-3 py-1 rounded-full text-center">
                  {currentImageIndex + 1} de {images.length}
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? "border-primary ring-2 ring-primary/50"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Descripción completa */}
            <div className="bg-card rounded-2xl p-6 space-y-4 shadow-card">
              <h2 className="text-lg font-semibold text-foreground">Sobre este servicio</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>

              {/* Categoría */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Categoría</p>
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {service.category}
                </span>
              </div>
            </div>
          </div>

          {/* Panel derecho - Info del autor y CTA */}
          <div className="space-y-4">
            {/* Tarjeta del autor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-card sticky top-24 space-y-4"
            >
              {/* Avatar y nombre del autor */}
              <Link
                to={`/perfil/${author.id}`}
                className="flex items-start gap-4 hover:opacity-80 transition-opacity"
              >
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-16 h-16 rounded-full bg-muted object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{author.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{author.tagline}</p>
                </div>
              </Link>

              {/* Rating */}
              <div className="flex items-center gap-2 py-3 border-y border-border">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">{authorRating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  • {author.location || "Online"}
                </span>
              </div>

              {/* Precio grande */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">Precio</p>
                <p className="text-3xl font-bold text-primary">${service.price}</p>
                <p className="text-xs text-muted-foreground">por hora</p>
              </div>

              {/* Botones de acción */}
              <div className="space-y-2 pt-2">
                {currentUser?.id === author.id ? (
                  <Button className="w-full" disabled>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Tu servicio
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <ContactUserButton user={author} className="w-full" size="sm" />
                    <ContactButtons 
                      talentName={author.name}
                      talentEmail={author.email}
                      serviceName={service.title}
                    />
                  </div>
                )}
              </div>

              {/* Descripción breve del autor */}
              <div className="text-sm text-muted-foreground border-t border-border pt-3">
                <p className="line-clamp-3">{author.bio || "Sin descripción"}</p>
              </div>
            </motion.div>

            {/* Información adicional */}
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Trabajo de calidad</p>
                  <p className="text-muted-foreground text-xs">Garantizado y con confianza</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Comunicación clara</p>
                  <p className="text-muted-foreground text-xs">Respuestas rápidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ServiceDetail;
