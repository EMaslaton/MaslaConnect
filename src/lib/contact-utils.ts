/**
 * Utilidades para contacto y comunicación
 */

export const generateWhatsAppLink = (
  phoneNumber: string,
  message: string
): string => {
  // Formato: https://wa.me/1234567890?text=mensaje
  const formattedNumber = phoneNumber.replace(/\D/g, ""); // Solo números
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
};

export const generateEmailLink = (
  email: string,
  subject: string,
  body: string
): string => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
};

export const generateContactMessage = (
  talentName: string,
  serviceName?: string
): string => {
  if (serviceName) {
    return `Hola ${talentName}, me interesa tu servicio "${serviceName}". ¿Podemos conversar al respecto?`;
  }
  return `Hola ${talentName}, vi tu perfil en MaslaConnect y me gustaría trabajar contigo. ¿Podemos conversar?`;
};
