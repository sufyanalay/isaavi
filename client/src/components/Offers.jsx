import { useEffect, useState } from "react";
import { Tag, X, ImageOff } from "lucide-react";
import api from "../api";
import Reveal from "./Reveal";

/* Home page ke offers. Promo codes yahan kabhi show nahi hote —
   codes sirf social media se milte hain. */
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

  if (loading)
    return (
      <section className="shell py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton aspect-[4/3] rounded-[18px]" />
          ))}
        </div>
      </section>
    );

  if (!offers.length) return null;

  return (
    <section className="shell py-16 sm:py-24">
      <Reveal className="mb-8">
        <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-line pb-5 after:absolute after:-bottom-px after:left-0 after:h-px after:w-[64px] after:bg-gold after:content-['']">
          <div>
            <div className="eyebrow">Running now</div>
            <h2 className="mt-2 mb-0 font-serif text-[30px] font-normal leading-none sm:text-[38px]">Offers</h2>
          </div>
          <p className="lede mb-0 max-w-[420px] text-[13.5px]">
            Handpicked deals on our leather pieces. Tap an offer for the details — the matching code is shared on our
            social media pages.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {offers.map((o, i) => (
          <Reveal key={o._id} delay={Math.min(i, 4) * 70}>
            <button
              type="button"
              onClick={() => setOpen(o)}
              className="group block w-full overflow-hidden rounded-[18px] border border-line bg-card p-0 text-left transition-all duration-500 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f7f1e2] to-[#ece0c5]">
                {o.image?.url ? (
                  <img
                    src={o.image.url}
                    alt={o.title}
                    className="h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.22,.9,.25,1)] group-hover:scale-[1.06]"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[#b3a48f]">
                    <ImageOff size={22} />
                  </span>
                )}

                {o.discountText && (
                  <span className="absolute left-3 top-3 rounded-full bg-ink/90 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[.16em] text-[#f7f2e8] backdrop-blur-sm">
                    {o.discountText}
                  </span>
                )}
              </span>

              <span className="block p-4">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-gold-dark">
                  <Tag size={12} /> Offer
                </span>
                <span className="mt-2 block font-serif text-[19px] leading-snug">{o.title}</span>
                {o.description && (
                  <span className="mt-1.5 block text-[12.5px] leading-relaxed text-muted line-clamp-2">{o.description}</span>
                )}
                <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-ink">
                  View details
                  <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                </span>
              </span>
            </button>
          </Reveal>
        ))}
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
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-line bg-white/90 text-ink transition-colors hover:bg-white"
            >
              <X size={16} />
            </button>

            {open.image?.url ? (
              <img src={open.image.url} alt={open.title} className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-[#f7f1e2] to-[#ece0c5] text-[#b3a48f]">
                <ImageOff size={24} />
              </div>
            )}

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
    </section>
  );
}
