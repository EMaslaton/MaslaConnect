import type { Service } from "@/types";
import { ArrowUpRight, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface ServiceCardExplorerProps {
  service: Service;
  authorName: string;
  authorAvatar: string;
  authorRating: number;
}

export const ServiceCardExplorer = ({
  service,
  authorName,
  authorAvatar,
  authorRating,
}: ServiceCardExplorerProps) => {
  const userId = service.userId;
  const navigate = useNavigate();

  return (
    <Link
      to={`/servicio/${service.id}`}
      className="group block rounded-2xl bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
    >
      {/* Service Image */}
      <div className="aspect-square overflow-hidden relative flex-shrink-0">
        <img
          src={service.images?.[0] || "https://api.dicebear.com/7.x/patterns/svg?seed=" + service.id}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Service Badge */}
        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
          Servicio
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/perfil/${userId}`);
            }}
          >
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full bg-muted object-cover ring-2 ring-transparent group-hover:ring-primary transition-all"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-sm text-foreground truncate">
              {authorName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {service.category}
            </p>
          </div>
        </div>

        {/* Service Title */}
        <div className="space-y-1 flex-1">
          <h3 className="font-display font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {service.description.substring(0, 60)}...
          </p>
        </div>

        {/* Rating & Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="font-display font-bold text-sm text-primary">
            ${service.price}
            <span className="text-xs text-muted-foreground font-normal">/hr</span>
          </span>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span className="font-semibold text-xs text-primary">{authorRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
