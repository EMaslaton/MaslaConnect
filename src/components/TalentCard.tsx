import type { Talent } from "@/lib/mock-data";
import { MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SkillBadge } from "./SkillBadge";

export const TalentCard = ({ talent }: { talent: Talent }) => (
  <div className="group rounded-2xl bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
    <Link
      to={`/perfil/${talent.id}`}
      className="block flex-shrink-0"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={talent.projectImage}
          alt={`Proyecto de ${talent.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    </Link>
    <div className="p-4 space-y-3 flex-1 flex flex-col">
      <div className="flex items-center gap-3">
        <img src={talent.avatar} alt={talent.name} className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <Link to={`/perfil/${talent.id}`} className="block">
            <h3 className="font-display font-semibold text-sm text-foreground truncate hover:underline">{talent.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{talent.tagline}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {talent.skills.slice(0, 3).map((skill) => (
          <SkillBadge key={skill} label={skill} variant="primary" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="font-display font-semibold text-sm text-foreground">{talent.rate}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
          <span className="font-medium">{talent.rating}</span>
          <span>({talent.reviews})</span>
        </div>
      </div>
      <Link
        to={`/perfil/${talent.id}`}
        className="flex items-center justify-center w-full py-2 px-3 mt-auto rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        Ver perfil
      </Link>
    </div>
  </div>
);
