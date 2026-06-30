import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-xl">{title}</h2>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground pl-7">{description}</p>
      )}
    </div>
  );
}
