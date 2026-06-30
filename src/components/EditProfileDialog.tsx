import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { CATEGORIES } from "@/lib/mock-data";
import { UserProfile } from "@/types";
import { Check, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  onSave: (updates: Partial<UserProfile>) => void;
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
    tagline: user.tagline || "",
    bio: user.bio || "",
    location: user.location || "",
    avatar: user.avatar || "",
    skills: user.skills || [],
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user.skills || []
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleSave = () => {
    onSave({
      ...formData,
      skills: selectedSkills,
    });
    onOpenChange(false);
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
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="gradient-primary text-primary-foreground"
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
