import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/mock-data";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, Check, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Role = "freelancer" | "client" | null;

const Register = () => {
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    tagline: "",
    location: "",
  });
  const navigate = useNavigate();
  const { register, isLoading, error, isAuthenticated } = useAuthStore();

  // Redirigir si el registro fue exitoso
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, navigate]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 3
          ? [...prev, skill]
          : prev
    );
  };

  const handleRegister = () => {
    if (!formData.email || !formData.password || !formData.name) {
      return;
    }

    const skills = role === "freelancer" ? selectedSkills : [];

    register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: role as "freelancer" | "client",
      tagline: formData.tagline,
      location: formData.location,
      skills,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${formData.name}`,
    });
  };

  const totalSteps = role === "freelancer" ? 3 : 2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg py-12">
        {/* Progress */}
        {role && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Paso {step + 1} de {totalSteps}
              </span>
              <button
                onClick={() => (step === 0 ? setRole(null) : setStep(step - 1))}
                className="text-sm text-primary flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Atrás
              </button>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Role Selection */}
          {!role && (
            <motion.div
              key="role"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Únete a MaslaConnect
                </h1>
                <p className="text-muted-foreground">
                  ¿Cómo quieres usar la plataforma?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    key: "freelancer" as Role,
                    icon: Palette,
                    title: "Soy talento",
                    desc: "Quiero ofrecer mis servicios y conseguir clientes",
                  },
                  {
                    key: "client" as Role,
                    icon: Briefcase,
                    title: "Busco talento",
                    desc: "Quiero contratar jóvenes creativos para mis proyectos",
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setRole(item.key);
                      setStep(0);
                    }}
                    className="rounded-2xl bg-card p-6 shadow-card hover:shadow-card-hover border-2 border-transparent hover:border-primary/30 transition-all text-left space-y-3"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </motion.div>
          )}

          {/* Step 0: Account */}
          {role && step === 0 && (
            <motion.div
              key="account"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Crea tu cuenta
                </h2>
                <p className="text-muted-foreground">
                  Solo necesitas un email para empezar
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="mt-1.5 rounded-xl"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="mt-1.5 rounded-xl"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() => setStep(1)}
                  disabled={!formData.email || !formData.password || isLoading}
                  className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      o continúa con
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-11">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Profile */}
          {role && step === 1 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {role === "freelancer" ? "Cuéntanos de ti" : "Sobre tu empresa"}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl cursor-pointer hover:bg-muted/70 transition-colors">
                    📷
                  </div>
                </div>
                <div>
                  <Label>
                    {role === "freelancer"
                      ? "Nombre completo"
                      : "Nombre de empresa"}
                  </Label>
                  <Input
                    placeholder={
                      role === "freelancer"
                        ? "Tu nombre"
                        : "Nombre de tu empresa"
                    }
                    className="mt-1.5 rounded-xl"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                {role === "freelancer" && (
                  <div>
                    <Label>Tagline (una frase que te defina)</Label>
                    <Input
                      placeholder='Ej: "Diseñador UI que ama el minimalismo"'
                      className="mt-1.5 rounded-xl"
                      value={formData.tagline}
                      onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                )}
                <div>
                  <Label>Ubicación</Label>
                  <Input
                    placeholder="Ciudad, País"
                    className="mt-1.5 rounded-xl"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() =>
                    role === "freelancer" ? setStep(2) : handleRegister()
                  }
                  disabled={!formData.name || isLoading}
                  className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
                >
                  {role === "freelancer" ? "Continuar" : "Crear cuenta"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills (talent only) */}
          {role === "freelancer" && step === 2 && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  ¿Qué sabes hacer?
                </h2>
                <p className="text-muted-foreground">
                  Elige hasta 3 habilidades principales
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map((cat) => {
                  const selected = selectedSkills.includes(cat.label);
                  return (
                    <button
                      key={cat.label}
                      onClick={() => toggleSkill(cat.label)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selected
                          ? "gradient-primary text-primary-foreground shadow-primary-glow"
                          : "bg-card shadow-card text-foreground hover:shadow-card-hover"
                      }`}
                    >
                      {selected && <Check className="w-4 h-4" />}
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">
                  ¡Sube un proyecto para mostrar tu trabajo!
                </p>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 transition-colors">
                  <p className="text-3xl mb-2">📁</p>
                  <p className="text-sm text-muted-foreground">
                    Arrastra o haz clic para subir
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, PDF (máx 10MB)
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRegister}
                disabled={selectedSkills.length === 0 || isLoading}
                className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
              >
                {isLoading ? "Creando perfil..." : "¡Crear mi perfil! 🎉"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Register;
