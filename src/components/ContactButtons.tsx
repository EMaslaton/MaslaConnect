import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    generateContactMessage,
    generateEmailLink,
    generateWhatsAppLink,
} from "@/lib/contact-utils";
import { Instagram, Linkedin, Mail, MessageCircle, Send, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

interface ContactButtonsProps {
  talentName: string;
  talentEmail?: string;
  serviceName?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
  socialLinks?: {
    whatsapp?: string;
    instagram?: string;
    linkedin?: string;
    telegram?: string;
    phone?: string;
  };
}

export const ContactButtons = ({
  talentName,
  talentEmail,
  serviceName,
  showLabel = true,
  size = "sm",
  socialLinks = {},
}: ContactButtonsProps) => {
  const message = generateContactMessage(talentName, serviceName);

  // Teléfono de ejemplo (en producción vendría del usuario)
  const phoneNumber = socialLinks?.phone || import.meta.env.VITE_SUPPORT_PHONE || "+5491234567890";
  const whatsappLink = generateWhatsAppLink(phoneNumber, message);

  // Email link - usar email del perfil si está disponible
  const emailLink = talentEmail
    ? generateEmailLink(
        talentEmail,
        `Interés en tu perfil y servicios`,
        message
      )
    : "";

  const hasContactInfo = talentEmail || Object.values(socialLinks).some(v => v);

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {/* WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-fit"
      >
        <Button
          size={size}
          className="w-full gradient-primary text-primary-foreground rounded-full shadow-primary-glow"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {showLabel ? "WhatsApp" : ""}
        </Button>
      </a>

      {/* Chat Interno */}
      <Link to="/mensajes" className="flex-1 min-w-fit">
        <Button size={size} variant="outline" className="w-full rounded-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          {showLabel ? "Chat" : ""}
        </Button>
      </Link>

      {/* Email */}
      {talentEmail && (
        <a
          href={emailLink}
          className="flex-1 min-w-fit"
        >
          <Button size={size} variant="ghost" className="w-full rounded-full">
            <Mail className="w-4 h-4 mr-2" />
            {showLabel ? "Email" : ""}
          </Button>
        </a>
      )}

      {/* Más opciones de contacto */}
      {(socialLinks?.instagram || socialLinks?.linkedin || socialLinks?.telegram || socialLinks?.phone) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={size} variant="ghost" className="rounded-full">
              Más
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {socialLinks?.instagram && (
              <DropdownMenuItem asChild>
                <a 
                  href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              </DropdownMenuItem>
            )}
            {socialLinks?.linkedin && (
              <DropdownMenuItem asChild>
                <a 
                  href={`https://linkedin.com/in/${socialLinks.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </DropdownMenuItem>
            )}
            {socialLinks?.telegram && (
              <DropdownMenuItem asChild>
                <a 
                  href={`https://t.me/${socialLinks.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Telegram
                </a>
              </DropdownMenuItem>
            )}
            {socialLinks?.phone && (
              <DropdownMenuItem asChild>
                <a 
                  href={`tel:${socialLinks.phone}`}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Teléfono
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
