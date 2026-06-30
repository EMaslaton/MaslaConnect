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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { INTERNSHIP_FIELDS } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { InternshipCandidateProfile } from "@/types";
import { useState } from "react";

interface RegisterInternshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterInternshipDialog = ({
  open,
  onOpenChange,
}: RegisterInternshipDialogProps) => {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToast();

  const existing = user?.internshipProfile;
  const [form, setForm] = useState<InternshipCandidateProfile>({
    seekingInternship: true,
    field: existing?.field || "",
    school: existing?.school || "",
    degree: existing?.degree || "",
    year: existing?.year || "",
    availability: existing?.availability || "Tiempo parcial (20 hs/semana)",
    documentsReady: existing?.documentsReady || false,
    coverLetter: existing?.coverLetter || "",
  });

  const handleSave = () => {
    if (!form.field) {
      toast({
        title: "Rubro requerido",
        description: "Seleccioná el rubro en el que buscás pasantía.",
        variant: "destructive",
      });
      return;
    }

    updateProfile({ internshipProfile: form });
    toast({
      title: "Perfil de pasante actualizado",
      description: "Ya aparecés en el listado para empresas.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil de pasante</DialogTitle>
          <p className="text-sm text-muted-foreground pt-1">
            Paso 1 de 2: completá tu información académica. Después podrás
            explorar vacantes y postularte.
          </p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              1 · Rubro y disponibilidad
            </p>
          <div className="space-y-2">
            <Label>Rubro de interés</Label>
            <Select
              value={form.field}
              onValueChange={(v) => setForm({ ...form, field: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná un rubro" />
              </SelectTrigger>
              <SelectContent>
                {INTERNSHIP_FIELDS.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Disponibilidad horaria</Label>
            <Select
              value={form.availability}
              onValueChange={(v) => setForm({ ...form, availability: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tiempo completo (40 hs/semana)">
                  Tiempo completo (40 hs/semana)
                </SelectItem>
                <SelectItem value="Tiempo parcial (20 hs/semana)">
                  Tiempo parcial (20 hs/semana)
                </SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              2 · Datos de la escuela
            </p>
          <div className="space-y-2">
            <Label>Institución educativa</Label>
            <Input
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              placeholder="Ej: UBA, UTN, Universidad de Palermo..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Carrera</Label>
              <Input
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="Ej: Lic. en Sistemas"
              />
            </div>
            <div className="space-y-2">
              <Label>Año / cursada</Label>
              <Input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="Ej: 3er año"
              />
            </div>
          </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              3 · Presentación
            </p>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.documentsReady}
              onChange={(e) =>
                setForm({ ...form, documentsReady: e.target.checked })
              }
              className="rounded"
            />
            Tengo documentación escolar lista (constancia, convenio, etc.)
          </label>

          <div className="space-y-2">
            <Label>Presentación breve</Label>
            <Textarea
              value={form.coverLetter}
              onChange={(e) =>
                setForm({ ...form, coverLetter: e.target.value })
              }
              placeholder="Contá en pocas líneas tu perfil y objetivos..."
              className="min-h-[80px]"
            />
          </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="gradient-primary text-primary-foreground"
          >
            Guardar y publicar perfil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
