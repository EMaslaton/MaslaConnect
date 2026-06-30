import { BottomNav } from "@/components/BottomNav";
import { ContactButtons } from "@/components/ContactButtons";
import { ContactUserButton } from "@/components/ContactUserButton";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { TALENTS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { useServiceStore } from "@/store/serviceStore";
import { PortfolioProject, UserProfile } from "@/types";
import { ArrowLeft, Edit, ExternalLink, GraduationCap, ImageIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const Profile = () => {
  const { id } = useParams();
  console.log("=== PROFILE PAGE ===", "ID:", id);

  const { user: currentUser, updateProfile, registeredUsers = [] } = useAuthStore();
  const { getServicesByUser } = useServiceStore();
  const [editOpen, setEditOpen] = useState(false);

  // Buscar perfil
  let profile: UserProfile | (typeof TALENTS)[0] | null = null;
  const isOwnProfile = currentUser?.id === id;

  if (isOwnProfile && currentUser) {
    profile = currentUser;
  } else if (registeredUsers?.length > 0) {
    profile = registeredUsers.find((u) => u.id === id) ?? null;
  }

  if (!profile) {
    profile = TALENTS.find((t) => t.id === id) ?? null;
  }

  console.log("Profile found:", profile?.name || "NOT FOUND");

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Perfil no encontrado</p>
            <Link to="/explorar">
              <Button variant="outline">Volver</Button>
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const userServices = getServicesByUser(profile.id);

  const portfolioItems: PortfolioProject[] =
    "portfolio" in profile && profile.portfolio?.length
      ? profile.portfolio
      : "projects" in profile && profile.projects?.length
        ? profile.projects.map((p, i) => ({
            id: `proj_${i}`,
            title: p.title,
            image: p.image,
            category: p.category,
          }))
        : [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />
      <div className="container max-w-3xl py-6 space-y-6">
        <Link to="/explorar" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="rounded-2xl bg-card p-6 shadow-lg mb-6">
          <div className="flex gap-4 mb-4">
            <img src={profile.avatar} alt={profile.name} className="w-20 h-20 rounded-full object-cover bg-muted" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{profile.name}</h1>
              {profile.tagline && <p className="text-muted-foreground text-sm mb-2">{profile.tagline}</p>}
              {profile.location && <p className="text-muted-foreground text-sm">{profile.location}</p>}
            </div>
            {isOwnProfile && (
              <Button onClick={() => setEditOpen(true)} size="sm" className="gradient-primary">
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
            )}
          </div>

          {!isOwnProfile && (
            <div className="pt-4 border-t space-y-3">
              <ContactUserButton user={profile} size="sm" className="w-full" />
              <ContactButtons 
                talentName={profile.name} 
                talentEmail={profile.email}
                socialLinks={profile.socialLinks}
                size="sm" 
              />
            </div>
          )}
        </div>

        {profile.bio && (
          <div className="rounded-lg bg-card p-4">
            <h3 className="font-semibold mb-2">Sobre mí</h3>
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="rounded-lg bg-card p-4">
            <h3 className="font-semibold mb-3">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill: string) => (
                <span key={skill} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {"internshipProfile" in profile && profile.internshipProfile?.seekingInternship && (
          <div className="rounded-lg bg-card p-4 border border-primary/20">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Buscando pasantía
            </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Rubro:{" "}
                <strong className="text-foreground">
                  {profile.internshipProfile.field}
                </strong>
              </p>
              {profile.internshipProfile.school && (
                <p>Escuela: {profile.internshipProfile.school}</p>
              )}
              {profile.internshipProfile.degree && (
                <p>Carrera: {profile.internshipProfile.degree}</p>
              )}
              {profile.internshipProfile.availability && (
                <p>Disponibilidad: {profile.internshipProfile.availability}</p>
              )}
            </div>
          </div>
        )}

        {portfolioItems.length > 0 && (
          <div className="rounded-lg bg-card p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              Portafolio
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {portfolioItems.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl overflow-hidden border border-border group"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{project.title}</p>
                    <p className="text-xs text-muted-foreground">{project.category}</p>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary inline-flex items-center gap-0.5 mt-1"
                      >
                        Ver proyecto <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {"socialLinks" in profile && profile.socialLinks && (
          <div className="rounded-lg bg-card p-4">
            <h3 className="font-semibold mb-2">Enlaces</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              {profile.socialLinks.portfolio && (
                <a
                  href={profile.socialLinks.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Portafolio web
                </a>
              )}
              {profile.socialLinks.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {profile.socialLinks.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}

        {userServices.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Servicios</h2>
            <div className="space-y-3">
              {userServices.map((svc: any) => (
                <div key={svc.id} className="rounded-lg bg-card p-4">
                  <h3 className="font-semibold mb-1">{svc.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{svc.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">${svc.price}</span>
                    {!isOwnProfile && currentUser?.role === "client" && <Button size="sm">Contratar</Button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOwnProfile && userServices.length === 0 && (
          <div className="rounded-lg bg-card p-6 text-center">
            <p className="text-muted-foreground mb-4">No tienes servicios publicados</p>
            <Link to="/servicios/nuevo">
              <Button className="gradient-primary">+ Publicar servicio</Button>
            </Link>
          </div>
        )}
      </div>

      {isOwnProfile && currentUser && (
        <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} user={currentUser} onSave={updateProfile} />
      )}

      <BottomNav />
    </div>
  );
};

export default Profile;
