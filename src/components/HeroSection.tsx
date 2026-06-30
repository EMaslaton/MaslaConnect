import heroIllustration from "@/assets/hero-illustration.png";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Imagen de ilustración con tres círculos conectados
const HeroIllustration = () => (
  <img
    src={heroIllustration}
    alt="Talento conectado con clientes"
    className="w-full h-auto max-w-xl"
  />
);

interface HeroSectionProps {
  title: string | React.ReactNode;
  subtitle: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  stats?: Array<{ icon: React.ReactNode; label: string; value: string }>;
  showIllustration?: boolean;
}

export const HeroSection = ({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  stats,
  showIllustration = true,
}: HeroSectionProps) => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className={`grid ${showIllustration ? "md:grid-cols-2" : ""} gap-12 items-center`}>
          <motion.div className="space-y-6" initial="hidden" animate="visible">
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight"
            >
              {title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-muted-foreground max-w-lg"
            >
              {subtitle}
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-wrap gap-3 pt-4"
            >
              <Link to={ctaPrimary.href}>
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground rounded-full shadow-primary-glow text-base px-8"
                >
                  {ctaPrimary.label}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              {ctaSecondary && (
                <Link to={ctaSecondary.href}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full text-base px-8"
                  >
                    {ctaSecondary.label}
                  </Button>
                </Link>
              )}
            </motion.div>

            {stats && (
              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap gap-6 pt-8"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="text-xl">{stat.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {showIllustration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="hidden md:block"
            >
              <HeroIllustration />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
