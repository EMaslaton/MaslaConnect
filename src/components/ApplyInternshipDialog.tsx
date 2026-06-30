import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { useInternshipStore } from "@/store/internshipStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Internship } from "@/types";
import { useState } from "react";

interface ApplyInternshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  internship: Internship;
}

export const ApplyInternshipDialog = ({
  open,
  onOpenChange,
  internship,
}: ApplyInternshipDialogProps) => {
  const { user } = useAuthStore();
  const { applyToInternship } = useInternshipStore();
  const { addNotification } = useNotificationStore();
  const { toast } = useToast();
  const [coverLetter, setCoverLetter] = useState(
    user?.internshipProfile?.coverLetter || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const application = applyToInternship({
        internship,
        applicant: user,
        coverLetter,
        documentsReady: user.internshipProfile?.documentsReady,
      });

      addNotification({
        type: "success",
        title: "Postulación enviada",
        message: `Tu postulación a "${internship.title}" fue registrada (${application.matchScore}% compatibilidad).`,
      });

      toast({
        title: "¡Postulación enviada!",
        description: `${internship.companyName} recibirá tu perfil y documentación.`,
      });

      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Postularme a pasantía</DialogTitle>
          <DialogDescription>
            {internship.title} · {internship.companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
            <p>
              <strong>Escuela:</strong>{" "}
              {user?.internshipProfile?.school || "Completar en tu perfil"}
            </p>
            <p>
              <strong>Rubro:</strong>{" "}
              {user?.internshipProfile?.field || "Sin especificar"}
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              MaslaConnect transmite la documentación entre tu institución educativa
              y la empresa.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Carta de presentación</Label>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Contá por qué te interesa esta pasantía y qué aportás..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            disabled={isSubmitting}
            className="gradient-primary text-primary-foreground"
          >
            {isSubmitting ? "Enviando..." : "Enviar postulación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
