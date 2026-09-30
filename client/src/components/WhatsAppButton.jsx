import { MessageCircle } from "lucide-react";
import { whatsappLink } from "../contact";

/**
 * Floating WhatsApp button. `phone` comes from the admin settings; when it is
 * empty (or still a dummy number) the store number is used instead, so this
 * icon always opens a real chat.
 */
export default function WhatsAppButton({ phone }) {
  const url = whatsappLink(phone);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle size={26} />
    </a>
  );
}