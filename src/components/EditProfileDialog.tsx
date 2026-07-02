import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES, DEFAULT_COUNTRY, getCountryByCode } from "@/lib/countries";
import { CATEGORIES } from "@/lib/mock-data";
import { PortfolioProject, UserProfile } from "@/types";
import { Check, Plus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onSave: (updates: Partial<UserProfile>) => Promise<boolean>;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  user,
  onSave,
}: EditProfileDialogProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user.name,
    phoneCountry: user.phoneCountry || DEFAULT_COUNTRY.code,
    phoneNumber: user.phoneNumber || "",
    tagline: user.tagline || "",
    bio: user.bio || "",
    location: user.location || "",
    avatar: user.avatar || "",
    skills: user.skills || [],
    portfolioUrl: user.socialLinks?.portfolio || "",
    linkedin: user.socialLinks?.linkedin || "",
    github: user.socialLinks?.github || "",
  });
  const [portfolio, setPortfolio] = useState<PortfolioProject[]>(
    user.portfolio || []
  );
  const [newProject, setNewProject] = useState({
    title: "",
    category: "",
    image: "",
    link: "",
  });
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user.skills || []
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 5
          ? [...prev, skill]
          : prev
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setUploadError("Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)");
        toast({
          title: "Error",
          description: "Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)",
          variant: "destructive",
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        setUploadError("El archivo es demasiado grande. Máximo 5MB.");
        toast({
          title: "Error",
          description: "El archivo es demasiado grande. Máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData({ ...formData, avatar: dataUrl });
        toast({
          title: "Imagen cargada",
          description: "Foto de perfil actualizada correctamente.",
        });
      };
      reader.onerror = () => {
        setUploadError("Error al leer el archivo");
        toast({
          title: "Error",
          description: "Error al leer el archivo",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePortfolioImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProject({ ...newProject, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAddProject = () => {
    if (!newProject.title || !newProject.image) {
      toast({
        title: "Proyecto incompleto",
        description: "Agregá título e imagen al proyecto.",
        variant: "destructive",
      });
      return;
    }
    if (portfolio.length >= 12) {
      toast({
        title: "Límite alcanzado",
        description: "Podés agregar hasta 12 proyectos.",
        variant: "destructive",
      });
      return;
    }
    setPortfolio([
      ...portfolio,
      {
        id: `proj_${Date.now()}`,
        title: newProject.title,
        category: newProject.category || "General",
        image: newProject.image,
        link: newProject.link || undefined,
      },
    ]);
    setNewProject({ title: "", category: "", image: "", link: "" });
  };

  const handleRemoveProject = (id: string) => {
    setPortfolio(portfolio.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const selectedCountry = getCountryByCode(formData.phoneCountry);
    const sanitizedPhoneNumber = formData.phoneNumber.replace(/\D/g, "");
    const fullPhoneNumber = sanitizedPhoneNumber ? `${selectedCountry.dialCode}${sanitizedPhoneNumber}` : undefined;

    const saved = await onSave({
      name: formData.name,
      phoneCountry: selectedCountry.code,
      phoneDialCode: selectedCountry.dialCode,
      phoneNumber: sanitizedPhoneNumber,
      tagline: formData.tagline,
      bio: formData.bio,
      location: formData.location,
      avatar: formData.avatar,
      skills: selectedSkills,
      portfolio,
      socialLinks: {
        portfolio: formData.portfolioUrl || undefined,
        linkedin: formData.linkedin || undefined,
        github: formData.github || undefined,
        phone: fullPhoneNumber,
      },
    });
    setIsSaving(false);

    if (saved) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition-colors"
                title="Cambiar foto"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Cambiar foto
            </Button>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nombre completo</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono</Label>
            <div className="grid grid-cols-[minmax(0,11rem)_1fr] gap-3">
              <Select
                value={formData.phoneCountry}
                onValueChange={(value) =>
                  setFormData({ ...formData, phoneCountry: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name} {country.dialCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="Número de teléfono"
                inputMode="tel"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label>Tagline (una frase que te defina)</Label>
            <Input
              value={formData.tagline}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
              placeholder='Ej: "Diseñador UI que ama el minimalismo"'
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Cuéntanos sobre ti y tu experiencia"
              className="min-h-[100px]"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Ubicación</Label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Ciudad, País"
            />
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <Label>Habilidades (máximo 5)</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const selected = selectedSkills.includes(cat.label);
                return (
                  <button
                    key={cat.label}
                    onClick={() => handleToggleSkill(cat.label)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                      selected
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social links */}
          <div className="space-y-3">
            <Label>Enlaces profesionales</Label>
            <Input
              value={formData.portfolioUrl}
              onChange={(e) =>
                setFormData({ ...formData, portfolioUrl: e.target.value })
              }
              placeholder="URL de tu portafolio web"
            />
            <Input
              value={formData.linkedin}
              onChange={(e) =>
                setFormData({ ...formData, linkedin: e.target.value })
              }
              placeholder="LinkedIn"
            />
            <Input
              value={formData.github}
              onChange={(e) =>
                setFormData({ ...formData, github: e.target.value })
              }
              placeholder="GitHub"
            />
          </div>

          {/* Portfolio projects */}
          <div className="space-y-3">
            <Label>Portafolio ({portfolio.length}/12)</Label>
            {portfolio.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {portfolio.map((project) => (
                  <div key={project.id} className="relative group rounded-lg overflow-hidden border">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full aspect-square object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(project.id)}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <p className="text-[10px] p-1 truncate">{project.title}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 rounded-lg border border-dashed p-3">
              <Input
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
                placeholder="Título del proyecto"
              />
              <Input
                value={newProject.category}
                onChange={(e) =>
                  setNewProject({ ...newProject, category: e.target.value })
                }
                placeholder="Categoría (Ej: Diseño UI/UX)"
              />
              <Input
                value={newProject.link}
                onChange={(e) =>
                  setNewProject({ ...newProject, link: e.target.value })
                }
                placeholder="Link del proyecto (opcional)"
              />
              <input
                ref={portfolioInputRef}
                type="file"
                accept="image/*"
                onChange={handlePortfolioImage}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => portfolioInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  {newProject.image ? "Cambiar imagen" : "Subir imagen"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddProject}
                  disabled={!newProject.title || !newProject.image}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Selected Skills Display */}
          {selectedSkills.length > 0 && (
            <div className="space-y-2">
              <Label>Seleccionadas:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleToggleSkill(skill)}
                      className="ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="gradient-primary text-primary-foreground"
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
