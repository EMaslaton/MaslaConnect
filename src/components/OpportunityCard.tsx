import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";
import { Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import { SkillBadge } from "./SkillBadge";
import { Button } from "./ui/button";

type Opportunity = {
  id: string;
  title: string;
  budget: string;
  skills: string[];
  company: string;
  posted: string;
  description: string;
};

export const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
  const { user } = useAuthStore();
  const { createOrder } = usePaymentStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleInterested = () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const budgetAmount = parseFloat(opportunity.budget.replace(/[$,]/g, ""));
      createOrder({
        clientId: "system", // Mock client
        freelancerId: user.id,
        serviceId: opportunity.id,
        totalAmount: budgetAmount,
        notes: `Interesado en: ${opportunity.title}`,
        status: "pending",
        paymentMethod: "transfer",
      });

      toast({
        title: "¡Éxito!",
        description: "Tu propuesta ha sido enviada",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la propuesta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground">{opportunity.title}</h3>
          <p className="text-sm text-muted-foreground">{opportunity.company}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <Clock className="w-3.5 h-3.5" />
          {opportunity.posted}
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{opportunity.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {opportunity.skills.map((skill) => (
          <SkillBadge key={skill} label={skill} variant="secondary" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 text-sm font-display font-semibold text-foreground">
          <DollarSign className="w-4 h-4 text-secondary" />
          {opportunity.budget}
        </div>
        <Button 
          size="sm" 
          onClick={handleInterested}
          disabled={isLoading}
          className="gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
        >
          {isLoading ? "Enviando..." : "Me interesa"}
        </Button>
      </div>
    </div>
  );
};
