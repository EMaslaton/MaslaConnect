import { cn } from "@/lib/utils";
import {
  Building2,
  FileCheck,
  GraduationCap,
  Search,
  Send,
} from "lucide-react";

type Role = "freelancer" | "client";

const studentSteps = [
  {
    icon: GraduationCap,
    title: "Completá tu perfil de pasante",
    description: "Rubro, escuela, carrera y disponibilidad horaria.",
  },
  {
    icon: Search,
    title: "Explorá y postulate",
    description: "Elegí pasantías compatibles con tu perfil y enviá tu postulación.",
  },
  {
    icon: FileCheck,
    title: "Documentación centralizada",
    description: "MaslaConnect conecta tu escuela con la empresa contratante.",
  },
];

const companySteps = [
  {
    icon: Building2,
    title: "Publicá la vacante",
    description: "Describí el puesto, requisitos y convenio con la escuela.",
  },
  {
    icon: Search,
    title: "Encontrá candidatos",
    description: "Revisá estudiantes por rubro, habilidades y compatibilidad.",
  },
  {
    icon: Send,
    title: "Gestioná postulaciones",
    description: "Contactá pasantes y recibí toda la info académica en un solo lugar.",
  },
];

interface InternshipFlowGuideProps {
  role: Role;
  className?: string;
}

export function InternshipFlowGuide({ role, className }: InternshipFlowGuideProps) {
  const steps = role === "client" ? companySteps : studentSteps;
  const title =
    role === "client"
      ? "¿Cómo contratar un pasante?"
      : "¿Cómo conseguir una pasantía?";

  return (
    <div className={cn("rounded-2xl border bg-card p-5 md:p-6 space-y-4", className)}>
      <h2 className="font-display font-semibold text-lg">{title}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="relative flex gap-3 md:flex-col md:gap-2">
            <div className="flex flex-col items-center md:flex-row md:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-4 left-[calc(33%-8px)] w-[calc(100%-2rem)] h-px bg-border -z-10" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <step.icon className="w-4 h-4 text-primary md:hidden" />
                <p className="font-medium text-sm">{step.title}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  applied: "Postulación enviada",
  reviewing: "En revisión",
  interview: "Entrevista",
  accepted: "Aceptado",
  rejected: "No seleccionado",
};
