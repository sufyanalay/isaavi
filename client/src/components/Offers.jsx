import { useEffect, useState } from "react";
import { Tag, X, ArrowRight } from "lucide-react";
import api from "../api";

/* Offers ka ticker — site ke bilkul upper top par, jahaan pehle "COD · Open before
   payment" likha hota tha. Patti patli hai (36/40px) aur offers dayein se bayein
   chalte hain. Promo codes yahan kabhi show nahi hote — codes sirf social media se
   milte hain. */

const SECONDS_PER_OFFER = 5; /* raftaar offers ke count ke hisaab se set hoti hai */
const MIN_SECONDS = 30;

/* Ticker ka ek tukra — sunehra nishan + badge + title, click par details khulte hain */
function OfferChip({ offer, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(offer)}
      className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-2.5 py-[3px] text-left transition-colors duration-300 hover:border-gold/60 hover:bg-white/[.09]"
    >
      <span aria-hidden="true" className="h-[5px] w-[5px] shrink-0 rotate-45 bg-gold" />

      {offer.discountText && (
        <span className="shrink-0 rounded-full bg-gold px-1.5 py-px text-[8.5px] font-semibold uppercase tracking-[.12em] text-ink">
          {offer.discountText}
        </span>
      )}

      <span className="max-w-[130px] truncate text-[12px] font-medium leading-none text-[#f6efe6] sm:max-w-[220px]">
        {offer.title}
      </span>

      <ArrowRight
        size={10}
        className="hidden shrink-0 text-[#8f7f6b] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-gold sm:block"
      />
    </button>
  );
}


export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let active = true;
    api.get("/offers")
      .then((r) => { if (active) setOffers(Array.isArray(r.data) ? r.data : []); })
      .catch(() => { if (active) setOffers([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  /* Esc se modal band, aur peeche ka page scroll lock */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  /* load karte waqt utni hi unchaai ki patti, taake page na hile */
  if (loading)
    return (
      <div className="border-b border-white/10 bg-ink">
        <div className="flex h-9 items-center gap-3 px-4 sm:h-10 sm:px-6">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-4 w-24 shrink-0 animate-pulse rounded-full bg-white/[.07] sm:w-32" />
          ))}
        </div>
      </div>
    );

  if (!offers.length) return null;

  /* Loop seamless rahe isliye aadhi patti hamesha screen se chaouri hoti hai
     (CSS me min-width:100vw hai) — kam offers ho to list dohra di jati hai. */
  const repeats = Math.max(1, Math.ceil(6 / offers.length));
  const half = Array.from({ length: repeats }, () => offers).flat();
  const seconds = Math.max(MIN_SECONDS, half.length * SECONDS_PER_OFFER);

  return (
    <>
      <div className="offer-strip border-b border-white/10 bg-ink text-[#f3ebe0]">
        <div className="flex h-9 items-stretch sm:h-10">
          {/* left par label — ticker iske daayein se behtha hai */}
          <div className="flex shrink-0 items-center gap-1.5 border-r border-white/10 px-2.5 sm:px-4">
            <Tag size={12} className="text-gold" />
            <span className="hidden text-[8.5px] font-semibold uppercase tracking-[.22em] text-[#d8c9a8] sm:inline">
              Offers
            </span>
          </div>

          <div className="offer-track no-scrollbar relative min-w-0 flex-1 overflow-hidden">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-ink to-transparent sm:w-10"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-ink to-transparent sm:w-10"
            />

            <div className="marquee h-full items-center" style={{ animationDuration: `${seconds}s` }}>
              {[0, 1].map((copy) => (
                <div key={copy} className="marquee-pair h-full">
                  {half.map((o, i) => (
                    <OfferChip key={`${o._id}-${copy}-${i}`} offer={o} onOpen={setOpen} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- offer detail modal ---------- */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={open.title}>
          <button
            type="button"
            aria-label="Close offer"
            onClick={() => setOpen(null)}
            className="absolute inset-0 cursor-default bg-ink/60 backdrop-blur-sm"
          />

          <div className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[20px] border border-line bg-card shadow-[var(--shadow-lift)] animate-fade-up">
            <span aria-hidden="true" className="block h-1 w-full bg-gradient-to-r from-gold via-gold/40 to-transparent" />
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90 text-ink transition-colors hover:bg-white"
            >
              <X size={16} />
            </button>

            <div className="p-5 sm:p-7">
              {open.discountText && (
                <span className="inline-block rounded-full bg-ink px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[.16em] text-[#f7f2e8]">
                  {open.discountText}
                </span>
              )}

              <h3 className="mt-3 mb-0 font-serif text-[26px] font-normal leading-tight sm:text-[30px]">{open.title}</h3>

              {open.description && (
                <p className="mt-3 mb-0 whitespace-pre-line text-[13.5px] leading-relaxed text-muted">{open.description}</p>
              )}

              {open.terms && (
                <div className="mt-5 rounded-lg border border-line bg-[#fbf8f2] p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Terms</div>
                  <p className="mt-2 mb-0 whitespace-pre-line text-[12.5px] leading-relaxed text-muted">{open.terms}</p>
                </div>
              )}

              <p className="mt-5 mb-0 text-[11px] leading-relaxed text-muted">
                Promo codes are shared on our social media pages — follow us there and use yours at checkout.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

