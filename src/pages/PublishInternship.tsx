import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, INTERNSHIP_FIELDS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { useInternshipStore } from "@/store/internshipStore";
import { useNotificationStore } from "@/store/notificationStore";
import { InternshipModality } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const PublishInternship = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuthStore();
  const { addInternship } = useInternshipStore();
  const { addNotification } = useNotificationStore();
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    field: "",
    stipend: "",
    duration: "6 meses",
    modality: "hibrido" as InternshipModality,
    location: "",
    requirements: "",
    schoolInfo: "",
    companyName: user?.companyProfile?.companyName || user?.name || "",
    skills: [] as string[],
  });

  if (user?.role !== "client" && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">
            Solo empresas pueden publicar pasantías.
          </p>
          <Link to="/pasantias">
            <Button variant="outline">Volver a Pasantías</Button>
          </Link>
        </div>
      </div>
    );
  }

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : prev.skills.length < 5
          ? [...prev.skills, skill]
          : prev.skills,
    }));
  };

  const handlePublish = () => {
    if (!form.title || !form.description || !form.field || !form.location) {
      setError("Completá los campos obligatorios");
      return;
    }

    if (!user) return;

    setIsPublishing(true);
    try {
      addInternship({
        companyId: user.id,
        companyName: form.companyName,
        title: form.title,
        description: form.description,
        field: form.field,
        skills: form.skills,
        stipend: form.stipend,
        duration: form.duration,
        modality: form.modality,
        location: form.location,
        requirements: form.requirements,
        schoolInfo: form.schoolInfo,
      });

      updateProfile({
        companyProfile: {
          companyName: form.companyName,
          industry: form.field,
          seekingInterns: true,
          description: user.companyProfile?.description,
          website: user.companyProfile?.website,
        },
      });

      addNotification({
        type: "success",
        title: "Pasantía publicada",
        message: `"${form.title}" ya está visible para estudiantes.`,
      });

      navigate("/pasantias");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Navbar />
      <div className="container max-w-lg py-8 space-y-6">
        <Link
          to="/pasantias"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div>
          <h1 className="text-2xl font-display font-bold">Publicar pasantía</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Completá los tres bloques: datos de la empresa, detalle del puesto y
            requisitos escolares.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8 rounded-2xl bg-card p-6 border">
          <section className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              1 · Empresa y puesto
            </p>
          <div className="space-y-2">
            <Label>Nombre de la empresa</Label>
            <Input
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Título de la pasantía</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder='Ej: "Pasante de Marketing Digital"'
            />
          </div>

          <div className="space-y-2">
            <Label>Rubro</Label>
            <Select
              value={form.field}
              onValueChange={(v) => setForm({ ...form, field: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná rubro" />
              </SelectTrigger>
              <SelectContent>
                {INTERNSHIP_FIELDS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              2 · Condiciones
            </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Stipend / honorarios</Label>
              <Input
                value={form.stipend}
                onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                placeholder="Ej: ARS 100.000/mes"
              />
            </div>
            <div className="space-y-2">
              <Label>Duración</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Modalidad</Label>
              <Select
                value={form.modality}
                onValueChange={(v) =>
                  setForm({ ...form, modality: v as InternshipModality })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ciudad, país"
              />
            </div>
          </div>
          </section>

          <section className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              3 · Documentación y habilidades
            </p>
          <div className="space-y-2">
            <Label>Requisitos (papeles, escuela, etc.)</Label>
            <Textarea
              value={form.requirements}
              onChange={(e) =>
                setForm({ ...form, requirements: e.target.value })
              }
              placeholder="Constancia de alumno, CV, carta de la facultad..."
            />
          </div>

          <div className="space-y-2">
            <Label>Info convenio escuela-empresa</Label>
            <Textarea
              value={form.schoolInfo}
              onChange={(e) => setForm({ ...form, schoolInfo: e.target.value })}
              placeholder="¿Tenés convenio con universidades? MaslaConnect puede gestionar el trámite."
            />
          </div>

          <div className="space-y-2">
            <Label>Habilidades buscadas (máx. 5)</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 12).map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => toggleSkill(cat.label)}
                  className={`px-3 py-1 rounded-full text-xs transition-all ${
                    form.skills.includes(cat.label)
                      ? "gradient-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
          </section>

          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
          >
            {isPublishing ? "Publicando..." : "Publicar pasantía"}
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PublishInternship;
