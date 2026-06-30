import { SkillBadge } from "@/components/SkillBadge";
import { Button } from "@/components/ui/button";
import { Internship } from "@/types";
import { Building2, Clock, MapPin, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const modalityLabels: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

interface InternshipCardProps {
  internship: Internship;
  matchScore?: number;
  showApply?: boolean;
  onApply?: () => void;
}

export const InternshipCard = ({
  internship,
  matchScore,
  showApply = true,
  onApply,
}: InternshipCardProps) => {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300 space-y-3 border border-border">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground">
            {internship.title}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {internship.companyName}
          </p>
        </div>
        {matchScore !== undefined && matchScore > 0 && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
            {matchScore}% match
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">
        {internship.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        <SkillBadge label={internship.field} variant="primary" />
        {internship.skills.slice(0, 3).map((skill) => (
          <SkillBadge key={skill} label={skill} variant="secondary" />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {internship.location} · {modalityLabels[internship.modality]}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {internship.duration}
        </span>
        {internship.stipend && (
          <span className="flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            {internship.stipend}
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Link to={`/pasantias/${internship.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full rounded-full">
            Ver detalle
          </Button>
        </Link>
        {showApply && onApply && (
          <Button
            size="sm"
            onClick={onApply}
            className="flex-1 gradient-primary text-primary-foreground rounded-full"
          >
            Postularme
          </Button>
        )}
      </div>
    </div>
  );
};
