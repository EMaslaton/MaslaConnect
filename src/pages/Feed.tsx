import { BottomNav } from "@/components/BottomNav";
import { ContractServiceDialog } from "@/components/ContractServiceDialog";
import { Navbar } from "@/components/Navbar";
import { OpportunityCard } from "@/components/OpportunityCard";
import { TalentCard } from "@/components/TalentCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OPPORTUNITIES, TALENTS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { useServiceStore } from "@/store/serviceStore";
import { Service, UserProfile } from "@/types";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Feed = () => {
  const { user: currentUser, registeredUsers } = useAuthStore();
  const navigate = useNavigate();
  const { getAllServices } = useServiceStore();
  const { conversations } = useMessagesStore();
  const allServices = getAllServices();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);

  const resolveFreelancer = (service: Service): UserProfile | null => {
    const fromTalents = TALENTS.find((t) => t.id === service.userId);
    if (fromTalents) {
      return {
        id: fromTalents.id,
        email: `${fromTalents.name.toLowerCase().replace(" ", ".")}@maslaconnect.com`,
        password: "",
        name: fromTalents.name,
        role: "freelancer",
        avatar: fromTalents.avatar,
        tagline: fromTalents.tagline,
        bio: fromTalents.bio,
        location: fromTalents.location,
        skills: fromTalents.skills,
        rating: fromTalents.rating,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const fromRegistered = registeredUsers.find((u) => u.id === service.userId);
    if (fromRegistered) return fromRegistered;

    if (service.userName) {
      return {
        id: service.userId,
        email: "",
        password: "",
        name: service.userName,
        role: "freelancer",
        skills: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return null;
  };

  // Si el usuario es freelancer, mostrar oportunidades
  // Si es cliente, mostrar talentos
  const isFreelancer = currentUser?.role === "freelancer";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-20 md:pb-0">
      <Navbar />
      <div className="container py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Welcome Header - Enhanced */}
          <div className="bg-gradient-to-br from-primary/15 via-accent/10 to-transparent rounded-3xl p-8 border border-primary/20 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary mb-3">
                  ¡Hola, {currentUser?.name}!
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {isFreelancer
                    ? "Descubre oportunidades profesionales que se alinean con tus habilidades y experiencia"
                    : "Encuentra talento joven y calificado para llevar tus proyectos al siguiente nivel"}
                </p>
              </div>
              {isFreelancer ? (
                <div className="flex flex-col gap-2 shrink-0">
                  <Link to="/pasantias">
                    <Button size="lg" variant="outline" className="rounded-full w-full">
                      🎓 Buscar pasantía
                    </Button>
                  </Link>
                  <Link to="/servicios/nuevo">
                    <Button size="lg" className="gradient-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow w-full">
                      Publicar servicio
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/pasantias/nueva" className="shrink-0">
                  <Button size="lg" className="gradient-primary text-primary-foreground rounded-full">
                    Publicar pasantía
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Dashboard Stats - Diferenciado por rol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-2xl p-6 border border-yellow-500/20 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Rating</p>
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                    {currentUser?.rating || "4.9"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">excelente desempeño</p>
                </div>
              </div>
            </motion.div>

            {isFreelancer ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl p-6 border border-blue-500/20 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Servicios activos</p>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {allServices.filter(s => s.userId === currentUser?.id).length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">listos para trabajar</p>
                    </div>
                    <div className="text-4xl">📊</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-6 border border-purple-500/20 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Mensajes</p>
                      <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                        {conversations.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">conversaciones activas</p>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl p-6 border border-green-500/20 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Contratos activos</p>
                      <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-2">
                        0
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">proyectos en curso</p>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl p-6 border border-purple-500/20 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Presupuesto invertido</p>
                      <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                        $0
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">en MaslaConnect</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Recommended Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Recomendado para ti
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isFreelancer ? "Oportunidades que se alinean con tu perfil" : "Profesionales destacados en la plataforma"}
                </p>
              </div>
              <Link to="/explorar">
                <Button variant="outline" size="sm" className="rounded-full">
                  Ver más →
                </Button>
              </Link>
            </div>
            {isFreelancer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPPORTUNITIES.slice(0, 2).map((opp) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-5 border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="mb-2">
                          <p className="font-bold text-foreground text-lg">{opp.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <p className="text-lg font-bold text-primary">${opp.budget}</p>
                          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">Disponible</span>
                        </div>
                      </div>
                      {/* Service icon placeholder */}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TALENTS.slice(0, 4).map((talent) => (
                  <motion.div
                    key={talent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-4 border border-border hover:border-primary/50 hover:shadow-lg transition-all text-center cursor-pointer group"
                  >
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="w-16 h-16 rounded-full mx-auto bg-gradient-to-br from-primary/20 to-accent/20 group-hover:ring-3 group-hover:ring-primary transition-all"
                    />
                    <p className="font-bold text-sm text-foreground mt-3">{talent.name}</p>
                    <p className="text-xs text-primary font-medium mt-1">{talent.skills[0]}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-xs font-medium text-foreground">{talent.rating}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-foreground">
              {isFreelancer ? "Busca oportunidades" : "Encuentra profesionales"}
            </h2>
            <Tabs defaultValue={isFreelancer ? "oportunidades" : "servicios"}>
              <TabsList className="w-full rounded-xl bg-muted h-12 mb-6 p-1">
                {isFreelancer && (
                  <TabsTrigger
                    value="oportunidades"
                    className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                  >
                    🎯 Oportunidades
                  </TabsTrigger>
                )}
                {!isFreelancer && (
                  <TabsTrigger
                    value="servicios"
                    className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                  >
                    🛍️ Servicios
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="talentos"
                  className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                >
                  {isFreelancer ? "⭐ Otros talentos" : "⭐ Talentos"}
                </TabsTrigger>
                {isFreelancer && allServices.filter(s => s.userId === currentUser?.id).length > 0 && (
                  <TabsTrigger
                    value="mis-servicios"
                    className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
                  >
                    💼 Mis servicios
                  </TabsTrigger>
                )}
              </TabsList>

            {/* Opportunities - Solo Freelancers */}
            {isFreelancer && (
              <TabsContent value="oportunidades" className="space-y-4">
                {OPPORTUNITIES.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No hay oportunidades disponibles en este momento
                    </p>
                  </div>
                ) : (
                  OPPORTUNITIES.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                  ))
                )}
              </TabsContent>
            )}

            {/* Talents */}
            <TabsContent value="talentos">
              <div className="grid grid-cols-2 gap-4 auto-rows-fr md:grid-cols-3">
                {TALENTS.filter((t) => t.id !== currentUser?.id).map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </div>
            </TabsContent>

            {/* My Services - Solo Freelancers */}
            {isFreelancer && (
              <TabsContent value="mis-servicios" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Tus servicios publicados</h3>
                    <p className="text-sm text-muted-foreground">Administra y edita tus servicios</p>
                  </div>
                  <Link to="/servicios/nuevo">
                    <Button size="sm" className="gradient-primary text-primary-foreground rounded-full">
                      Agregar servicio
                    </Button>
                  </Link>
                </div>
                {allServices.filter(s => s.userId === currentUser?.id).map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all border border-border"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <h3 className="font-display font-semibold text-foreground">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm flex-wrap">
                          <span className="text-primary font-semibold">
                            ${service.price}
                          </span>
                          <span className="text-muted-foreground">
                            {service.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => navigate(`/servicio/${service.id}`)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
            )}

            {/* Services Available - Solo Clientes (reemplaza la tab de servicios) */}
            {!isFreelancer && (
              <TabsContent value="servicios" className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Servicios disponibles: {allServices.length}
                </p>
                {allServices.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No hay servicios disponibles en este momento
                    </p>
                  </div>
                ) : (
                  allServices.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all border border-border"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <h3 className="font-display font-semibold text-foreground">
                            {service.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </p>
                          <div className="flex gap-4 mt-3 text-sm flex-wrap">
                            <span className="text-primary font-semibold">
                              ${service.price}
                            </span>
                            <span className="text-muted-foreground">
                              {service.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/perfil/${service.userId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full"
                            >
                              Ver perfil
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedService(service);
                              setContractDialogOpen(true);
                            }}
                            className="gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
                          >
                            Contratar
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            )}

            {/* Services from other freelancers - visible to all */}
            {allServices.length > 0 && !isFreelancer && (
              <div className="hidden">
                <TabsContent value="servicios" className="space-y-4">
                  {/* This is handled in the "servicios-disponibles" section above */}
                </TabsContent>
              </div>
            )}
            </Tabs>
          </div>

          {/* Contract Dialog */}
          {selectedService && resolveFreelancer(selectedService) && (
            <ContractServiceDialog
              open={contractDialogOpen}
              onOpenChange={setContractDialogOpen}
              service={selectedService}
              freelancer={resolveFreelancer(selectedService)!}
            />
          )}
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Feed;
