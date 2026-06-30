import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { ServiceCardExplorer } from "@/components/ServiceCardExplorer";
import { TalentCard } from "@/components/TalentCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES, TALENTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useRatingStore } from "@/store/ratingStore";
import { useServiceStore } from "@/store/serviceStore";
import { motion } from "framer-motion";
import { Grid3X3, List, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const Explorer = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "newest">("name");
  const [showFilters, setShowFilters] = useState(false);
  const { user: currentUser } = useAuthStore();
  const { getAverageRating } = useRatingStore();
  const { services, initializeServices, isLoading } = useServiceStore();

  // Asegurar que los servicios se carguen desde Supabase
  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  // Combinar talentos del mock data, usuario actual y servicios publicados
  const allTalents = useMemo(() => {
    let talents = [...TALENTS];

    if (
      currentUser &&
      currentUser.role === "freelancer" &&
      !talents.some((t) => t.id === currentUser.id)
    ) {
      talents.unshift({
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar || "",
        tagline: currentUser.tagline || "Talento disponible",
        skills: currentUser.skills,
        projectImage: currentUser.avatar || "",
        rate: "$0/hr",
        rating: 0,
        reviews: 0,
        location: currentUser.location || "Ubicación no especificada",
        bio: currentUser.bio || "",
        projects: [],
        services: [],
      });
    }

    // Agregar servicios publicados como "talentos"
    const serviceRow = services
      .filter((s) => s.userId !== currentUser?.id) // No mostrar propios servicios en exploración
      .map((service) => {
        const serviceAuthor = TALENTS.find((t) => t.id === service.userId);
        // Usar service.userName si existe (de Supabase), sino el nombre del autor en TALENTS
        const authorName = service.userName || serviceAuthor?.name || "Profesional";
        const authorAvatar = serviceAuthor?.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;
        
        return {
          id: service.id,
          name: service.title,
          avatar: authorAvatar,
          tagline: service.description.substring(0, 50) + "...",
          skills: service.category ? [service.category] : [],
          projectImage: service.images?.[0] || serviceAuthor?.projectImage || "https://api.dicebear.com/7.x/patterns/svg?seed=" + service.id,
          rate: `$${service.price}/hr`,
          rating: getAverageRating(service.userId),
          reviews: 0,
          location: serviceAuthor?.location || "Online",
          bio: serviceAuthor?.bio || "Servicio publicado en MaslaConnect",
          projects: [],
          services: [service],
          _isService: true,
        };
      });

    talents = [...talents, ...serviceRow];
    return talents;
  }, [currentUser, services, getAverageRating]);

  // Filtrar por categoría y búsqueda
  const filtered = useMemo(() => {
    let result = allTalents;

    // Filtrar por categoría
    if (activeCategory) {
      result = result.filter((t) =>
        t.skills.some((s) => s === activeCategory)
      );
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.tagline.toLowerCase().includes(query) ||
          t.skills.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Filtrar por rating mínimo
    if (minRating > 0) {
      result = result.filter((t) => getAverageRating(t.id) >= minRating);
    }

    // Excluir al usuario actual del listado
    result = result.filter((t) => t.id !== currentUser?.id);

    // Ordenamiento
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "rating") {
        const ratingA = getAverageRating(a.id);
        const ratingB = getAverageRating(b.id);
        return ratingB - ratingA; // Descendente
      } else if (sortBy === "newest") {
        // Asumir que los primeros son los más nuevos
        return 0;
      }
      return 0;
    });

    return result;
  }, [allTalents, activeCategory, searchQuery, currentUser?.id, minRating, sortBy, getAverageRating]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container py-6">
        {/* Search + view toggle */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, habilidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-card shadow-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 border-0"
              />
            </div>

            {/* View toggle */}
            <div className="hidden md:flex items-center gap-1 bg-card shadow-card rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid"
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "list"
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-card shadow-card text-sm text-foreground border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="name">Ordenar: Nombre</option>
              <option value="rating">Ordenar: Rating</option>
              <option value="newest">Ordenar: Más nuevo</option>
            </select>

            {/* Rating Filter */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="px-3 py-2 rounded-xl bg-card shadow-card text-sm text-foreground border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="0">Rating: Cualquiera</option>
              <option value="3">⭐ 3+</option>
              <option value="4">⭐ 4+</option>
              <option value="4.5">⭐ 4.5+</option>
            </select>

            {/* Clear filters button */}
            {(searchQuery || activeCategory || minRating > 0 || sortBy !== "name") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                  setMinRating(0);
                  setSortBy("name");
                }}
                className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
              !activeCategory
                ? "gradient-primary text-primary-foreground shadow-primary-glow"
                : "bg-card shadow-card text-foreground hover:shadow-card-hover"
            )}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() =>
                setActiveCategory(
                  cat.label === activeCategory ? null : cat.label
                )
              }
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                activeCategory === cat.label
                  ? "gradient-primary text-primary-foreground shadow-primary-glow"
                  : "bg-card shadow-card text-foreground hover:shadow-card-hover"
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filtered.length}</span> resultado{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
            {activeCategory && (
              <p className="text-xs text-muted-foreground mt-1">
                En categoría: <span className="font-medium">{activeCategory}</span>
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr"
        >
          {filtered.map((talent, i) => {
            // Verificar si es un servicio
            const isService = (talent as any)._isService;
            const service = isService ? (talent as any).services?.[0] : null;
            
            return (
              <motion.div
                key={talent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                layout
              >
                {isService && service ? (
                  <ServiceCardExplorer
                    service={service}
                    authorName={talent.name}
                    authorAvatar={talent.avatar}
                    authorRating={talent.rating}
                  />
                ) : (
                  <TalentCard talent={talent} />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron resultados</h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar tus filtros o búsqueda
            </p>
            <div className="flex flex-col gap-2 justify-center">
              {(searchQuery || activeCategory || minRating > 0) && (
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory(null);
                    setMinRating(0);
                    setSortBy("name");
                  }}
                  variant="outline"
                  className="rounded-full"
                >
                  Limpiar todos los filtros
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Tenemos {allTalents.length} resultado{allTalents.length !== 1 ? "s" : ""} disponible{allTalents.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Explorer;
