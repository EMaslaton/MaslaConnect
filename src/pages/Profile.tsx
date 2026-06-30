import { BottomNav } from "@/components/BottomNav";
import { ContactButtons } from "@/components/ContactButtons";
import { ContactUserButton } from "@/components/ContactUserButton";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { TALENTS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { useServiceStore } from "@/store/serviceStore";
import { ArrowLeft, Edit } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const Profile = () => {
  const { id } = useParams();
  console.log("=== PROFILE PAGE ===", "ID:", id);

  const { user: currentUser, updateProfile, registeredUsers = [] } = useAuthStore();
  const { getServicesByUser } = useServiceStore();
  const [editOpen, setEditOpen] = useState(false);

  // Buscar perfil
  let profile: any = null;
  const isOwnProfile = currentUser?.id === id;

  if (isOwnProfile && currentUser) {
    profile = currentUser;
  } else if (registeredUsers?.length > 0) {
    profile = registeredUsers.find((u: any) => u.id === id);
  }

  if (!profile) {
    profile = TALENTS.find((t: any) => t.id === id);
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
