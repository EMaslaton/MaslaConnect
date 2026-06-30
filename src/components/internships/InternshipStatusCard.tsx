import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";

interface InternshipStatusCardProps {
  role: "freelancer" | "client";
  profileComplete: boolean;
  applicationsCount: number;
  publishedCount?: number;
  receivedApplicationsCount?: number;
  onCompleteProfile?: () => void;
  className?: string;
}

export function InternshipStatusCard({
  role,
  profileComplete,
  applicationsCount,
  publishedCount = 0,
  receivedApplicationsCount = 0,
  onCompleteProfile,
  className,
}: InternshipStatusCardProps) {
  const isStudent = role === "freelancer";

  const checklist = isStudent
    ? [
        {
          done: profileComplete,
          label: "Perfil de pasante completo",
          action: !profileComplete ? onCompleteProfile : undefined,
        },
        {
          done: applicationsCount > 0,
          label:
            applicationsCount > 0
              ? `${applicationsCount} postulación${applicationsCount > 1 ? "es" : ""} enviada${applicationsCount > 1 ? "s" : ""}`
              : "Todavía no postulaste a ninguna pasantía",
        },
      ]
    : [
        {
          done: publishedCount > 0,
          label:
            publishedCount > 0
              ? `${publishedCount} pasantía${publishedCount > 1 ? "s" : ""} publicada${publishedCount > 1 ? "s" : ""}`
              : "Publicá tu primera vacante de pasante",
          link: publishedCount === 0 ? "/pasantias/nueva" : undefined,
        },
        {
          done: receivedApplicationsCount > 0,
          label:
            receivedApplicationsCount > 0
              ? `${receivedApplicationsCount} postulación${receivedApplicationsCount > 1 ? "es" : ""} recibida${receivedApplicationsCount > 1 ? "s" : ""}`
              : "Esperando postulaciones de estudiantes",
        },
      ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-4",
        className
      )}
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Tu progreso
        </p>
        <h2 className="font-display font-semibold text-lg mt-1">
          {isStudent ? "Panel del pasante" : "Panel de la empresa"}
        </h2>
      </div>

      <ul className="space-y-3">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-start gap-3 text-sm">
            {item.done ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                {item.label}
              </span>
              {item.action && (
                <Button
                  size="sm"
                  variant="link"
                  className="h-auto p-0 block text-primary"
                  onClick={item.action}
                >
                  Completar ahora →
                </Button>
              )}
              {"link" in item && item.link && (
                <Link
                  to={item.link}
                  className="block text-primary text-xs mt-0.5 hover:underline"
                >
                  Ir a publicar →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
