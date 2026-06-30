import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useMessagesStore } from "@/store/messagesStore";
import { UserProfile } from "@/types";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ContactUserButtonProps {
  user: UserProfile;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
}

/**
 * Botón para iniciar una conversación con otro usuario
 * Se puede usar en perfiles, tarjetas de servicio, etc.
 */
export const ContactUserButton = ({
  user,
  variant = "default",
  size = "default",
  className = "",
  showIcon = true,
}: ContactUserButtonProps) => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const startConversation = useMessagesStore((state) => state.startConversation);
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }

    if (currentUser.id === user.id) {
      return;
    }

    try {
      setIsLoading(true);
      await startConversation(currentUser.id, user.id, user);
      if (useMessagesStore.getState().error) {
        return;
      }
      navigate("/mensajes");
    } catch (contactError) {
      console.error("Error starting conversation:", contactError);
    } finally {
      setIsLoading(false);
    }
  };

  // No mostrar botón si es el usuario actual
  if (currentUser?.id === user.id) {
    return null;
  }

  return (
    <Button
      onClick={handleContact}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <MessageSquare className="w-4 h-4 mr-2" />}
      {isLoading ? "Iniciando..." : "Contactar"}
    </Button>
  );
};

export default ContactUserButton;
