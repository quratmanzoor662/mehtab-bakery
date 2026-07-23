export const CONTACT = {
  phoneDisplay: "+91 93206 30345",
  phoneTel: "+919320630345",
  whatsappNumber: "919320630345",
} as const;

export function getWhatsAppChatUrl(message?: string) {
  const text =
    message ??
    "Hello Mehtab Bakery, I would like to reserve fresh bread.";
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
