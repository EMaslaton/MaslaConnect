import { Button } from "@/components/ui/button";
import { ServiceNotFoundReason } from "@/services/serviceApi";
import { useServiceStore } from "@/store/serviceStore";
import { Service } from "@/types";
import { AlertCircle, Frown, HelpCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceNotFoundProps {
  serviceId: string;
  reason: ServiceNotFoundReason;
  suggestedCategory?: string;
}

export const ServiceNotFound = ({ 
  serviceId, 
  reason,
  suggestedCategory 
}: ServiceNotFoundProps) => {
  const navigate = useNavigate();
  const { getSuggestedServices, getAllServices } = useServiceStore();
  
  // Obtener sugerencias basadas en categoría o últimos servicios
  let suggestedServices: Service[] = [];
  
  if (suggestedCategory) {
    suggestedServices = getSuggestedServices(suggestedCategory, serviceId, 3);
  }
  
  // Si no hay sugerencias por categoría, obtener los últimos
  if (suggestedServices.length === 0) {
    suggestedServices = getAllServices().slice(-3);
  }

  const getIcon = () => {
    switch (reason.type) {
      case "deleted":
        return <AlertCircle className="w-12 h-12 text-destructive" />;
      case "expired-link":
        return <HelpCircle className="w-12 h-12 text-warning" />;
      default:
        return <Frown className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (reason.type) {
      case "deleted":
        return "Servicio eliminado";
      case "expired-link":
        return "Enlace expirado";
      default:
        return "Servicio no encontrado";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Icono */}
        <div className="flex justify-center">
          {getIcon()}
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
          <p className="text-muted-foreground">{reason.message}</p>
        </div>

        {/* Información técnica (debug) */}
        <div className="bg-muted/50 rounded-lg p-3 text-left space-y-1 text-xs font-mono">
          <div className="text-muted-foreground">
            ID: <span className="text-foreground break-all">{serviceId}</span>
          </div>
          <div className="text-muted-foreground">
            Razón: <span className="text-foreground">{reason.type}</span>
          </div>
          <div className="text-muted-foreground text-[10px]">
            Timestamp: {new Date().toISOString()}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate("/explorar")} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Explorar otros servicios
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full"
          >
            Volver al inicio
          </Button>
        </div>

        {/* Sugerencias */}
        {suggestedServices.length > 0 && (
          <div className="pt-6 border-t border-border space-y-3">
            <p className="text-sm font-medium text-foreground">
              Quizás te interese...
            </p>
            <div className="space-y-2">
              {suggestedServices.map((service: Service) => (
                <button
                  key={service.id}
                  onClick={() => navigate(`/servicio/${service.id}`)}
                  className="w-full p-3 rounded-lg bg-card hover:bg-card/80 transition-colors border border-border text-left group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary">
                        {service.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {service.category}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-primary flex-shrink-0">
                      ${service.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
