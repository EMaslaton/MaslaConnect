import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Loader, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ConfirmationData {
  email: string;
  timestamp: number;
  expiresAt: number;
  type: string;
}

const ConfirmReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Link inválido");
        setIsLoading(false);
        return;
      }

      try {
        const tokenKey = `confirm_token_${token}`;
        const storedData = sessionStorage.getItem(tokenKey);

        if (!storedData) {
          setError("Link expirado o inválido");
          setIsLoading(false);
          return;
        }

        const confirmData: ConfirmationData = JSON.parse(storedData);

        if (Date.now() > confirmData.expiresAt) {
          setError("Link expirado. Por favor solicita un nuevo email.");
          setIsLoading(false);
          return;
        }

        if (confirmData.type !== "confirmation") {
          setError("Link inválido");
          setIsLoading(false);
          return;
        }

        console.log("✅ Email confirmado:", confirmData.email);
        setUserEmail(confirmData.email);
        setSuccess(true);

        const resetData = {
          email: confirmData.email,
          timestamp: Date.now(),
          expiresAt: Date.now() + 15 * 60 * 1000,
          type: "reset",
          confirmedAt: Date.now(),
        };
        const resetToken = btoa(JSON.stringify(resetData));
        sessionStorage.setItem(`reset_token_${resetToken}`, JSON.stringify(resetData));

        setTimeout(() => {
          navigate(`/reset-password?type=recovery&token=${resetToken}`);
        }, 2000);
      } catch (err) {
        console.error("Error confirmando email:", err);
        setError("Error al procesar el link");
      } finally {
        setIsLoading(false);
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-md py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 border space-y-6 text-center"
          >
            <Loader className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Confirmando tu email...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-md py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 border space-y-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="font-bold text-lg text-red-700">Error</h2>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/login")}
              className="w-full gradient-primary text-primary-foreground rounded-xl"
            >
              Volver a Login
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-md py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 border space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-4"
              >
                <CheckCircle className="w-16 h-16 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                ¡Email Confirmado!
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Redirigiendo a cambio de contraseña...
              </p>
            </div>

            {userEmail && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{userEmail}</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default ConfirmReset;
