import { Navbar } from "@/components/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/mock-data";
import { COUNTRIES, DEFAULT_COUNTRY, getCountryByCode } from "@/lib/countries";
import { useAuthStore } from "@/store/authStore";
import { useGoogleLogin } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Briefcase, Check, GraduationCap, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Role = "freelancer" | "client" | null;
type AccountType = "person" | "company" | "school" | null;

const Register = () => {
  const [role, setRole] = useState<Role>(null);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [step, setStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState<"freelancer" | "client" | null>(null);
  const [selectedGoogleAccountType, setSelectedGoogleAccountType] = useState<"person" | "company" | "school" | null>(null);
  const [googlePhoneCountry, setGooglePhoneCountry] = useState(DEFAULT_COUNTRY.code);
  const [googlePhoneNumber, setGooglePhoneNumber] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phoneCountry: DEFAULT_COUNTRY.code,
    phoneNumber: "",
    tagline: "",
    location: "",
    taxId: "",
    institutionCode: "",
  });
  const navigate = useNavigate();
  const { register, loginWithGoogle, confirmGoogleRole, showRoleSelection, isLoading, error, isAuthenticated } = useAuthStore();

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

  const requiredText = (value: string) => value.trim().length > 0;

  const validateStepOne = () => {
    if (!requiredText(formData.name)) {
      return accountType === "person"
        ? "Tu nombre es obligatorio"
        : accountType === "company"
          ? "El nombre de la empresa es obligatorio"
          : "El nombre de la institución es obligatorio";
    }

    if (accountType === "person" && !requiredText(formData.tagline)) {
      return "La tagline es obligatoria";
    }

    if (accountType === "company") {
      if (!requiredText(formData.tagline)) {
        return "El rubro de la empresa es obligatorio";
      }

      if (!requiredText(formData.taxId)) {
        return "El CUIT es obligatorio";
      }
    }

    if (accountType === "school") {
      if (!requiredText(formData.tagline)) {
        return "La descripción es obligatoria";
      }

      if (!requiredText(formData.institutionCode)) {
        return "El código institucional es obligatorio";
      }
    }

    if (!requiredText(formData.location)) {
      return "La ubicación es obligatoria";
    }

    if (!requiredText(formData.phoneNumber)) {
      return "El teléfono es obligatorio";
    }

    return null;
  };

  const validateSkillsStep = () => {
    if (selectedSkills.length === 0) {
      return "Selecciona al menos una habilidad";
    }

    return null;
  };

  const runValidation = () => {
    const stepError = step === 1 ? validateStepOne() : step === 2 ? validateSkillsStep() : null;

    if (stepError) {
      setRegistrationError(stepError);
      return false;
    }

    setRegistrationError(null);
    return true;
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const accessToken = response.access_token;
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userInfoResponse.ok) {
          throw new Error("Error al obtener información de Google");
        }

        const data = await userInfoResponse.json();

        loginWithGoogle({
          name: data.name,
          email: data.email,
          avatar: data.picture,
        });
      } catch (error) {
        console.error("❌ Error en Google Login:", error);
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
    },
    flow: "implicit",
  });

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      return;
    }

    if (!runValidation()) {
      return;
    }

    setIsRegistering(true);

    try {
      const skills = accountType === "person" ? selectedSkills : [];
      const resolvedAccountType = accountType || (role === "freelancer" ? "person" : "company");
      const selectedCountry = getCountryByCode(formData.phoneCountry);
      const sanitizedPhoneNumber = formData.phoneNumber.replace(/\D/g, "");

      const baseUser = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: role as "freelancer" | "client",
        accountType: resolvedAccountType,
        phoneCountry: selectedCountry.code,
        phoneDialCode: selectedCountry.dialCode,
        phoneNumber: sanitizedPhoneNumber,
        tagline: formData.tagline,
        location: formData.location,
        skills,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${formData.name}`,
      };

      const saved = await register(
        resolvedAccountType === "company"
          ? {
              ...baseUser,
              companyProfile: {
                companyName: formData.name,
                industry: formData.tagline || "General",
                taxId: formData.taxId || undefined,
                seekingInterns: true,
              },
            }
          : resolvedAccountType === "school"
            ? {
                ...baseUser,
                schoolProfile: {
                  schoolName: formData.name,
                  institutionCode: formData.institutionCode || undefined,
                  seekingStudents: true,
                },
              }
            : baseUser
      );

      if (saved) {
        navigate("/feed");
      }
    } finally {
      setIsRegistering(false);
    }
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
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    id: "talent",
                    role: "freelancer" as Role,
                    accountType: "person" as AccountType,
                    icon: Palette,
                    title: "Soy talento",
                    desc: "Quiero ofrecer mis servicios y conseguir clientes",
                  },
                  {
                    id: "company",
                    role: "client" as Role,
                    accountType: "company" as AccountType,
                    icon: Briefcase,
                    title: "Soy empresa",
                    desc: "Busco pasantes o freelancers para mis proyectos",
                  },
                  {
                    id: "school",
                    role: "client" as Role,
                    accountType: "school" as AccountType,
                    icon: GraduationCap,
                    title: "Soy escuela",
                    desc: "Quiero postular una lista de estudiantes",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setRole(item.role);
                      setAccountType(item.accountType);
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

              <div className="space-y-4">
                {registrationError && (
                  <Alert variant="destructive">
                    <AlertDescription>{registrationError}</AlertDescription>
                  </Alert>
                )}
                {!registrationError && error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
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
                    required
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
                    required
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
                <Button variant="outline" className="w-full rounded-xl h-11" onClick={() => handleGoogleLogin()}>
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
                  {accountType === "person"
                    ? "Cuéntanos de ti"
                    : accountType === "company"
                      ? "Sobre tu empresa"
                      : "Sobre tu escuela"}
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
                    {accountType === "person"
                      ? "Nombre completo"
                      : accountType === "company"
                        ? "Nombre de empresa"
                        : "Nombre de la institución"}
                  </Label>
                  <Input
                    placeholder={
                      accountType === "person"
                        ? "Tu nombre"
                        : accountType === "company"
                          ? "Nombre de tu empresa"
                          : "Nombre de tu escuela"
                    }
                    className="mt-1.5 rounded-xl"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
                {accountType === "person" && (
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
                      required
                    />
                  </div>
                )}
                {accountType === "company" && (
                  <>
                    <div>
                      <Label>CUIT</Label>
                      <Input
                        placeholder="30-12345678-9"
                        className="mt-1.5 rounded-xl"
                        value={formData.taxId}
                        onChange={(e) =>
                          setFormData({ ...formData, taxId: e.target.value })
                        }
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <Label>Rubro de la empresa</Label>
                      <Input
                        placeholder="Ej: Tecnología, Marketing, Construcción"
                        className="mt-1.5 rounded-xl"
                        value={formData.tagline}
                        onChange={(e) =>
                          setFormData({ ...formData, tagline: e.target.value })
                        }
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </>
                )}
                {accountType === "school" && (
                  <>
                    <div>
                      <Label>Código institucional</Label>
                      <Input
                        placeholder="Código o identificador interno"
                        className="mt-1.5 rounded-xl"
                        value={formData.institutionCode}
                        onChange={(e) =>
                          setFormData({ ...formData, institutionCode: e.target.value })
                        }
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Input
                        placeholder="Ej: Escuela técnica con enfoque en software"
                        className="mt-1.5 rounded-xl"
                        value={formData.tagline}
                        onChange={(e) =>
                          setFormData({ ...formData, tagline: e.target.value })
                        }
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </>
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
                    required
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <div className="mt-1.5 grid grid-cols-[minmax(0,11rem)_1fr] gap-3">
                    <Select
                      value={formData.phoneCountry}
                      onValueChange={(value) =>
                        setFormData({ ...formData, phoneCountry: value })
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="País" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.flag} {country.name} {country.dialCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Número de teléfono"
                      className="rounded-xl"
                      inputMode="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    if (accountType === "person") {
                      const stepOneError = validateStepOne();
                      if (stepOneError) {
                        setRegistrationError(stepOneError);
                        return;
                      }

                      setStep(2);
                      return;
                    }

                    if (!runValidation()) {
                      return;
                    }

                    await handleRegister();
                  }}
                  disabled={isLoading || isRegistering}
                  className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
                >
                  {accountType === "person"
                    ? "Continuar"
                    : isRegistering
                      ? "Creando cuenta..."
                      : "Crear cuenta"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Skills (talent only) */}
          {accountType === "person" && step === 2 && (
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
              {registrationError && (
                <Alert variant="destructive">
                  <AlertDescription>{registrationError}</AlertDescription>
                </Alert>
              )}
              {!registrationError && error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
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
                onClick={() => {
                  const skillsError = validateSkillsStep();
                  if (skillsError) {
                    setRegistrationError(skillsError);
                    return;
                  }

                  void handleRegister();
                }}
                disabled={selectedSkills.length === 0 || isLoading}
                className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
              >
                {isLoading ? "Creando perfil..." : "¡Crear mi perfil! 🎉"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog
        open={showRoleSelection}
        onOpenChange={(open) => {
          if (!open && !isLoading) {
            setSelectedGoogleRole(null);
            setSelectedGoogleAccountType(null);
            setGooglePhoneCountry(DEFAULT_COUNTRY.code);
            setGooglePhoneNumber("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Completa tu registro</DialogTitle>
            <DialogDescription>
              Selecciona cómo quieres usar MaslaConnect y agrega tu teléfono.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <button
              onClick={() => {
                setSelectedGoogleRole("freelancer");
                setSelectedGoogleAccountType("person");
              }}
              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                selectedGoogleAccountType === "person"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Soy freelancer</h3>
                  <p className="text-sm text-muted-foreground">Ofrezco mis servicios y busco proyectos interesantes</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedGoogleRole("client");
                setSelectedGoogleAccountType("company");
              }}
              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                selectedGoogleAccountType === "company"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Soy empresa</h3>
                  <p className="text-sm text-muted-foreground">Busco pasantes o freelancers para mis proyectos</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setSelectedGoogleRole("client");
                setSelectedGoogleAccountType("school");
              }}
              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                selectedGoogleAccountType === "school"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Soy escuela</h3>
                  <p className="text-sm text-muted-foreground">Quiero postular una lista de estudiantes</p>
                </div>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <Label>Teléfono</Label>
            <div className="grid grid-cols-[minmax(0,11rem)_1fr] gap-3">
              <Select value={googlePhoneCountry} onValueChange={setGooglePhoneCountry} disabled={isLoading}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name} {country.dialCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Número de teléfono"
                className="rounded-xl"
                inputMode="tel"
                value={googlePhoneNumber}
                onChange={(e) => setGooglePhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            onClick={() => {
              if (!selectedGoogleRole || !selectedGoogleAccountType) return;

              const selectedCountry = COUNTRIES.find((country) => country.code === googlePhoneCountry) || DEFAULT_COUNTRY;

              confirmGoogleRole(selectedGoogleRole, selectedGoogleAccountType, {
                phoneCountry: selectedCountry.code,
                phoneDialCode: selectedCountry.dialCode,
                phoneNumber: googlePhoneNumber,
              });
            }}
            disabled={!selectedGoogleRole || !selectedGoogleAccountType || !googlePhoneNumber.trim() || isLoading}
            className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
          >
            {isLoading ? "Completando registro..." : "Continuar"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
