import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
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
import { useAuthStore } from "@/store/authStore";
import { useGoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { Briefcase, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, confirmGoogleRole, isLoading, error, isAuthenticated, showRoleSelection } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"freelancer" | "client" | null>(null);

  // Redirigir si el login fue exitoso
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    login(email, password);
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Con implicit flow, obtenemos el access_token
        const accessToken = response.access_token;
        
        // Obtener información del usuario
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Error al obtener información de Google');
        }
        
        const data = await userInfoResponse.json();
        
        loginWithGoogle({
          name: data.name,
          email: data.email,
          avatar: data.picture,
        });
      } catch (error) {
        console.error('❌ Error en Google Login:', error);
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
    },
    flow: "implicit",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground">Inicia sesión en tu cuenta</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Demo: valentina.reyes@maslaconnect.com
              </p>
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                className="mt-1.5 rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Demo: test123
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Button
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
            >
              {isLoading ? "Cargando..." : "Iniciar sesión"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o</span>
              </div>
            </div>
            <Button
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
              variant="outline"
              className="w-full rounded-xl h-11"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
              >
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
              {isLoading ? "Cargando..." : "Iniciar sesión con Google"}
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-primary font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Dialog para recuperar contraseña */}
      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword}
      />

      {/* Dialog para seleccionar rol en Google OAuth */}
      <Dialog open={showRoleSelection} onOpenChange={(open) => {
        if (!open && !isLoading) {
          setSelectedRole(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">¿Cuál es tu rol?</DialogTitle>
            <DialogDescription>
              Selecciona cómo quieres usar MaslaConnect para personalizar tu experiencia
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            {/* Freelancer Option */}
            <button
              onClick={() => setSelectedRole("freelancer")}
              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                selectedRole === "freelancer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Soy Freelancer</h3>
                  <p className="text-sm text-muted-foreground">
                    Ofrezco mis servicios y busco proyectos interesantes
                  </p>
                </div>
              </div>
            </button>

            {/* Client Option */}
            <button
              onClick={() => setSelectedRole("client")}
              className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                selectedRole === "client"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Busco Talento</h3>
                  <p className="text-sm text-muted-foreground">
                    Necesito profesionales para mis proyectos
                  </p>
                </div>
              </div>
            </button>
          </div>

          <Button
            onClick={() => {
              if (selectedRole) {
                confirmGoogleRole(selectedRole);
              }
            }}
            disabled={!selectedRole || isLoading}
            className="w-full gradient-primary text-primary-foreground rounded-xl h-11"
          >
            {isLoading ? "Completando registro..." : "Continuar"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
