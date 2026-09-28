import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ phone }) {
  let number = String(phone || "")
    .split("")
    .filter((c) => c >= "0" && c <= "9")
    .join("");

  if (!number) return null;
  if (number.startsWith("0")) number = "92" + number.slice(1);

  const message = encodeURIComponent("Hi Isaavi Leather, I have a question about your products.");
  const url = "https://wa.me/" + number + "?text=" + message;

  return (
    <a href={url} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 right-5 z-40 w-[52px] h-[52px] rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
      <MessageCircle size={26} />
    </a>
  );
}