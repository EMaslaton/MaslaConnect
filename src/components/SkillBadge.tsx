import { cn } from "@/lib/utils";

type SkillBadgeProps = {
  label: string;
  variant?: "primary" | "secondary" | "accent" | "muted";
  size?: "sm" | "md";
};

const variantClasses = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
  muted: "bg-muted text-muted-foreground",
};

export const SkillBadge = ({ label, variant = "primary", size = "sm" }: SkillBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full font-medium",
      size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
      variantClasses[variant]
    )}
  >
    {label}
  </span>
);
