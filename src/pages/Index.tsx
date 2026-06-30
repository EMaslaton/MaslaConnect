import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES, SERVICES, TALENTS } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Users } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <HeroSection
        title={
          <>
            Tu talento vale,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              aunque sea tu primera vez
            </span>
          </>
        }
        subtitle="Conectamos jóvenes creativos con clientes que buscan talento fresco. Sin experiencia requerida — solo muestra lo que sabes hacer."
        ctaPrimary={{
          label: "Quiero ofrecer mis servicios",
          href: "/registro",
        }}
        ctaSecondary={{
          label: "Busco talento joven",
          href: "/registro",
        }}
        stats={[
          {
            icon: <Users className="w-5 h-5 text-secondary" />,
            label: "jóvenes registrados",
            value: "Comunidad en crecimiento",
          },
          {
            icon: <Briefcase className="w-5 h-5 text-primary" />,
            label: "proyectos completados",
            value: "Proyectos publicados",
          },
        ]}
        showIllustration
      />

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Encuentra talento en cualquier área
            </h2>
            <p className="text-muted-foreground mt-2">
              Categorías populares donde los jóvenes destacan
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card shadow-card hover:shadow-card-hover transition-all text-sm font-medium text-foreground"
              >
                <span className="text-lg">{cat.emoji}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Así de fácil funciona
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Crea tu perfil", desc: "Muestra quién eres y qué sabes hacer. Sin CV, solo tu trabajo.", icon: "🎯" },
              { step: "2", title: "Sube tus proyectos", desc: "Tu portafolio es tu carta de presentación. Una imagen vale más que mil palabras.", icon: "🚀" },
              { step: "3", title: "Conecta y trabaja", desc: "Recibe propuestas o postúlate a proyectos. Fácil, directo y sin complicaciones.", icon: "🤝" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl gradient-primary shadow-primary-glow flex items-center justify-center text-2xl mx-auto">
                  {item.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Talento destacado
              </h2>
              <p className="text-muted-foreground mt-1">
                Publicaciones que están ganando tracción
              </p>
            </div>
            <Link to="/explorar">
              <Button variant="ghost" className="text-primary">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
            {SERVICES.slice(0, 4).map((service, i) => {
              const author = TALENTS.find((t) => t.id === service.userId);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ServiceCard
                    service={service}
                    authorName={author?.name || "Autor desconocido"}
                    authorAvatar={author?.avatar || "https://api.dicebear.com/9.x/avataaars/svg?seed=Unknown"}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl gradient-primary p-10 md:p-16 text-center space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
              ¿Listo para empezar?
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto">
              Únete a la comunidad de jóvenes creativos más grande de Latinoamérica
            </p>
            <Link to="/registro">
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 rounded-full text-base px-8 mt-4"
              >
                Crear mi perfil gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-display font-bold text-lg text-foreground">
              Junior<span className="text-primary">Hub</span>
            </span>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Sobre nosotros</a>
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 JuniorHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
