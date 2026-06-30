import { ApplyInternshipDialog } from "@/components/ApplyInternshipDialog";
import { BottomNav } from "@/components/BottomNav";
import { InternCandidateCard } from "@/components/InternCandidateCard";
import { InternshipCard } from "@/components/InternshipCard";
import {
  APPLICATION_STATUS_LABELS,
  InternshipFlowGuide,
} from "@/components/internships/InternshipFlowGuide";
import { InternshipStatusCard } from "@/components/internships/InternshipStatusCard";
import { SectionHeader } from "@/components/internships/SectionHeader";
import { Navbar } from "@/components/Navbar";
import { RegisterInternshipDialog } from "@/components/RegisterInternshipDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { EXTERNAL_INTERNSHIP_LINKS, INTERNSHIP_FIELDS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { useInternshipStore } from "@/store/internshipStore";
import { Internship } from "@/types";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Internships = () => {
  const { user } = useAuthStore();
  const registeredUsers = useAuthStore((s) => s.registeredUsers);
  const {
    initializeInternships,
    getOpenInternships,
    getInternshipsByCompany,
    getMatchingInternships,
    getMatchingCandidates,
    getApplicationsByApplicant,
    getApplicationsByCompany,
  } = useInternshipStore();

  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [applyTarget, setApplyTarget] = useState<Internship | null>(null);
  const [externosOpen, setExternosOpen] = useState(false);

  useEffect(() => {
    initializeInternships();
  }, [initializeInternships]);

  const isStudent = user?.role === "freelancer";
  const isCompany = user?.role === "client";

  const openInternships = getOpenInternships();
  const myPublished = user ? getInternshipsByCompany(user.id) : [];

  const filteredInternships = useMemo(() => {
    return openInternships.filter((i) => {
      const matchesSearch =
        !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.companyName.toLowerCase().includes(search.toLowerCase()) ||
        i.field.toLowerCase().includes(search.toLowerCase());
      const matchesField = fieldFilter === "all" || i.field === fieldFilter;
      return matchesSearch && matchesField;
    });
  }, [openInternships, search, fieldFilter]);

  const candidates = useMemo(
    () => registeredUsers.filter((u) => u.internshipProfile?.seekingInternship),
    [registeredUsers]
  );

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.internshipProfile?.field.toLowerCase().includes(q) ||
        c.internshipProfile?.school?.toLowerCase().includes(q)
      );
    });
  }, [candidates, search]);

  const matchedInternships = user && isStudent ? getMatchingInternships(user) : [];
  const myApplications = user ? getApplicationsByApplicant(user.id) : [];
  const companyApplications = user ? getApplicationsByCompany(user.id) : [];

  const profileComplete = Boolean(
    user?.internshipProfile?.seekingInternship && user.internshipProfile.field
  );

  const handleApply = (internship: Internship) => {
    if (!profileComplete) {
      setRegisterOpen(true);
      return;
    }
    setApplyTarget(internship);
  };

  const companyMatches = useMemo(() => {
    if (!isCompany || !user) return [];
    const myPosts = openInternships.filter((i) => i.companyId === user.id);
    const first = myPosts[0];
    if (!first) return [];
    return getMatchingCandidates(first, candidates);
  }, [isCompany, user, openInternships, candidates, getMatchingCandidates]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24 md:pb-8">
      <Navbar />

      <div className="container py-8 max-w-5xl space-y-10">
        {/* Encabezado según rol */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Badge variant="secondary" className="rounded-full">
            Pasantías · MaslaConnect
          </Badge>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                {isCompany
                  ? "Contratá pasantes"
                  : isStudent
                    ? "Encontrá tu pasantía"
                    : "Pasantías profesionales"}
              </h1>
              <p className="text-muted-foreground max-w-xl">
                {isCompany
                  ? "Publicá vacantes, recibí postulaciones y centralizá la documentación con las escuelas."
                  : isStudent
                    ? "Creá tu perfil, explorá oportunidades y postulate en pocos pasos."
                    : "Conectamos estudiantes con empresas en Argentina."}
              </p>
            </div>
            {isStudent && (
              <Button
                onClick={() => setRegisterOpen(true)}
                className="gradient-primary text-primary-foreground rounded-full shrink-0"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                {profileComplete ? "Editar mi perfil" : "Crear perfil de pasante"}
              </Button>
            )}
            {isCompany && (
              <Link to="/pasantias/nueva" className="shrink-0">
                <Button className="gradient-primary text-primary-foreground rounded-full w-full md:w-auto">
                  <Building2 className="w-4 h-4 mr-2" />
                  Publicar vacante
                </Button>
              </Link>
            )}
          </div>
        </motion.header>

        {/* Guía + progreso */}
        {user && (isStudent || isCompany) && (
          <div className="grid gap-6 md:grid-cols-2">
            <InternshipFlowGuide role={isCompany ? "client" : "freelancer"} />
            <InternshipStatusCard
              role={isCompany ? "client" : "freelancer"}
              profileComplete={profileComplete}
              applicationsCount={myApplications.length}
              publishedCount={myPublished.length}
              receivedApplicationsCount={companyApplications.length}
              onCompleteProfile={() => setRegisterOpen(true)}
            />
          </div>
        )}

        {/* Buscador global */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              isCompany
                ? "Buscar estudiantes por nombre, rubro o escuela..."
                : "Buscar pasantías por empresa, rubro o título..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl h-11"
          />
        </div>

        {/* ─── VISTA ESTUDIANTE ─── */}
        {isStudent && (
          <div className="space-y-10">
            {!profileComplete && (
              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-3">
                <GraduationCap className="w-10 h-10 mx-auto text-primary" />
                <p className="font-medium">Empezá por acá</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Antes de postularte, completá tu perfil con rubro, escuela y
                  disponibilidad. Así las empresas te encuentran más fácil.
                </p>
                <Button onClick={() => setRegisterOpen(true)} className="rounded-full">
                  Completar perfil de pasante
                </Button>
              </div>
            )}

            {matchedInternships.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  icon={Sparkles}
                  title="Recomendadas para vos"
                  description="Pasantías que coinciden con tu rubro y habilidades."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {matchedInternships.slice(0, 4).map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      showApply
                      onApply={() => handleApply(internship)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <SectionHeader
                icon={Briefcase}
                title="Todas las pasantías"
                description="Explorá vacantes publicadas por empresas en la plataforma."
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={fieldFilter === "all" ? "default" : "outline"}
                  onClick={() => setFieldFilter("all")}
                  className="rounded-full"
                >
                  Todos los rubros
                </Button>
                {INTERNSHIP_FIELDS.map((field) => (
                  <Button
                    key={field}
                    size="sm"
                    variant={fieldFilter === field ? "default" : "outline"}
                    onClick={() => setFieldFilter(field)}
                    className="rounded-full"
                  >
                    {field}
                  </Button>
                ))}
              </div>
              {filteredInternships.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 rounded-xl bg-muted/30">
                  No hay pasantías con esos filtros.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredInternships.map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      showApply
                      onApply={() => handleApply(internship)}
                    />
                  ))}
                </div>
              )}
            </section>

            {myApplications.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  icon={Briefcase}
                  title="Mis postulaciones"
                  description="Seguimiento de las pasantías a las que te postulaste."
                />
                <div className="space-y-2">
                  {myApplications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl bg-card p-4 border flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold">{app.internshipTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.companyName} · {app.matchScore}% compatibilidad
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {APPLICATION_STATUS_LABELS[app.status] || app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <Collapsible open={externosOpen} onOpenChange={setExternosOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-xl justify-between h-12"
                >
                  <span>Ver portales de pasantías en Argentina</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${externosOpen ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Referencias externas útiles además de las vacantes en MaslaConnect.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {EXTERNAL_INTERNSHIP_LINKS.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-card p-4 border hover:border-primary/40 transition-all group flex gap-3"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary">
                          {link.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {link.organization}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* ─── VISTA EMPRESA ─── */}
        {isCompany && (
          <div className="space-y-10">
            {myPublished.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-3">
                <Building2 className="w-10 h-10 mx-auto text-primary" />
                <p className="font-medium">Publicá tu primera vacante</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Describí el puesto, requisitos y documentación escolar. Los
                  estudiantes podrán postularse desde la plataforma.
                </p>
                <Link to="/pasantias/nueva">
                  <Button className="rounded-full">Publicar pasantía</Button>
                </Link>
              </div>
            )}

            {companyApplications.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  icon={Briefcase}
                  title="Postulaciones recibidas"
                  description="Estudiantes que se postularon a tus vacantes."
                />
                <div className="space-y-2">
                  {companyApplications.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl bg-card p-4 border flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold">{app.applicantName}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.internshipTitle} · {app.matchScore}% compatibilidad
                        </p>
                        {app.school && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {app.school}
                            {app.degree ? ` · ${app.degree}` : ""}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {APPLICATION_STATUS_LABELS[app.status] || app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {companyMatches.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  icon={Sparkles}
                  title="Candidatos recomendados"
                  description="Estudiantes compatibles con tus vacantes publicadas."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {companyMatches.slice(0, 4).map((candidate) => (
                    <InternCandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <SectionHeader
                icon={Users}
                title="Estudiantes buscando pasantía"
                description={`${filteredCandidates.length} perfiles disponibles en la plataforma.`}
              />
              {filteredCandidates.length === 0 ? (
                <p className="text-center text-muted-foreground py-10 rounded-xl bg-muted/30">
                  Todavía no hay estudiantes registrados como pasantes.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredCandidates.map((candidate) => (
                    <InternCandidateCard key={candidate.id} candidate={candidate} />
                  ))}
                </div>
              )}
            </section>

            {myPublished.length > 0 && (
              <section className="space-y-4">
                <SectionHeader
                  icon={Building2}
                  title="Tus vacantes publicadas"
                  description="Pasantías que publicaste en MaslaConnect."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  {myPublished.map((internship) => (
                    <InternshipCard
                      key={internship.id}
                      internship={internship}
                      showApply={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Admin u otro rol: vista general */}
        {!isStudent && !isCompany && (
          <div className="space-y-6">
            <InternshipFlowGuide role="freelancer" />
            <SectionHeader
              icon={Briefcase}
              title="Pasantías en la plataforma"
              description="Iniciá sesión como estudiante o empresa para acceder a todas las funciones."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {openInternships.slice(0, 6).map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  showApply={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <RegisterInternshipDialog open={registerOpen} onOpenChange={setRegisterOpen} />
      {applyTarget && (
        <ApplyInternshipDialog
          open={!!applyTarget}
          onOpenChange={(open) => !open && setApplyTarget(null)}
          internship={applyTarget}
        />
      )}
      <BottomNav />
    </div>
  );
};

export default Internships;
