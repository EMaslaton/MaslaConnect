import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { GraduationCap, Mail, School } from "lucide-react";
import { Link } from "react-router-dom";
import { SkillBadge } from "./SkillBadge";

interface InternCandidateCardProps {
  candidate: UserProfile;
  matchScore?: number;
  onContact?: () => void;
}

export const InternCandidateCard = ({
  candidate,
  matchScore,
  onContact,
}: InternCandidateCardProps) => {
  const profile = candidate.internshipProfile;

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all border border-border space-y-3">
      <div className="flex gap-3">
        <img
          src={candidate.avatar}
          alt={candidate.name}
          className="w-14 h-14 rounded-full object-cover bg-muted"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-foreground">
                {candidate.name}
              </h3>
              <p className="text-sm text-muted-foreground">{candidate.tagline}</p>
            </div>
            {matchScore !== undefined && matchScore > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
                {matchScore}% match
              </span>
            )}
          </div>
        </div>
      </div>

      {profile && (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-primary" />
            Rubro: <strong className="text-foreground">{profile.field}</strong>
          </p>
          {profile.school && (
            <p className="flex items-center gap-1.5">
              <School className="w-4 h-4 text-primary" />
              {profile.school}
              {profile.degree ? ` · ${profile.degree}` : ""}
            </p>
          )}
          {profile.availability && (
            <p>Disponibilidad: {profile.availability}</p>
          )}
          {profile.documentsReady && (
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-700">
              Documentación escolar lista
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.slice(0, 4).map((skill) => (
          <SkillBadge key={skill} label={skill} variant="secondary" />
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <Link to={`/perfil/${candidate.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full rounded-full">
            Ver portafolio
          </Button>
        </Link>
        {onContact && (
          <Button
            size="sm"
            onClick={onContact}
            className="flex-1 gradient-primary text-primary-foreground rounded-full"
          >
            <Mail className="w-3.5 h-3.5 mr-1" />
            Contactar
          </Button>
        )}
      </div>
    </div>
  );
};
