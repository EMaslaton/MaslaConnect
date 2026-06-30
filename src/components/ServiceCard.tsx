import type { Service } from "@/types";
import { ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  service: Service;
  authorName: string;
  authorAvatar: string;
}

export const ServiceCard = ({ service, authorName, authorAvatar }: ServiceCardProps) => (
  <div className="group rounded-2xl bg-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
    <Link
      to={`/servicio/${service.id}`}
      className="block flex-shrink-0"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={service.images?.[0] || "https://api.dicebear.com/7.x/patterns/svg?seed=" + service.id}
          alt={`Servicio: ${service.title}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    </Link>
    <div className="p-4 space-y-3 flex-1 flex flex-col">
      <div className="flex items-center gap-3">
        <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <Link to={`/perfil/${service.userId}`} className="block">
            <h3 className="font-display font-semibold text-sm text-foreground truncate hover:underline">{authorName}</h3>
          </Link>
          <p className="text-xs text-muted-foreground truncate">{service.category}</p>
        </div>
      </div>
      <div>
        <h4 className="font-display font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {service.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {service.description.substring(0, 50)}...
        </p>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="font-display font-semibold text-sm text-primary">${service.price}</span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 fill-primary text-primary" />
          <span className="font-medium">{service.rating}</span>
          <span>({service.reviews})</span>
        </div>
      </div>
      <Link
        to={`/servicio/${service.id}`}
        className="flex items-center justify-center w-full py-2 px-3 mt-auto rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-sm font-medium"
      >
        <ShoppingBag className="w-4 h-4 mr-1" />
        Ver servicio
      </Link>
    </div>
  </div>
);
