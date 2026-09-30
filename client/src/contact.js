/* ------------------------------------------------------------------
   Store contact details — ONE place, so every phone number and every
   WhatsApp link in the storefront points at the same shop.
   Change the number here and it updates everywhere.
   ------------------------------------------------------------------ */

export const STORE_PHONE = "0340 6011203";      // what customers see on screen
export const STORE_WHATSAPP = "923406011203";   // wa.me wants country code: 92 + 340 6011203
export const WHATSAPP_MESSAGE = "Hi Isaavi Leather, I have a question about your products.";

const digitsOf = (phone) => String(phone || "").replace(/\D/g, "");

/* drop the country code / trunk zero, e.g. 923406011203 → 3406011203 */
const localOf = (digits) => digits.replace(/^92/, "").replace(/^0/, "");

/* "+92 300 000 0000" / "0300 0000000" style dummy values count as “not set” */
const isUsable = (digits) => {
  const local = localOf(digits);
  return /^3\d{9}$/.test(local) && !/^30+$/.test(local);
};

/** Any format → wa.me number with country code, falling back to the store number. */
export function whatsappNumber(phone) {
  const digits = digitsOf(phone);
  if (!isUsable(digits)) return STORE_WHATSAPP;
  return "92" + localOf(digits);
}

/** Ready-to-use WhatsApp chat link, with an optional prefilled message. */
export function whatsappLink(phone, text = WHATSAPP_MESSAGE) {
  return `https://wa.me/${whatsappNumber(phone || STORE_PHONE)}?text=${encodeURIComponent(text)}`;
}

/** The number to print in the UI: the real setting, else the store default. */
export function displayPhone(phone) {
  return isUsable(digitsOf(phone)) ? String(phone).trim() : STORE_PHONE;
}
