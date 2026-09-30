import { useState } from "react";
import { Tag, Check, X, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";

/**
 * Cart/checkout ka promo code box. Discount sirf server se aata hai —
 * client khud kuch calculate nahi karta.
 */
export default function PromoBox({ className = "" }) {
  const { promo, promoActive, promoDiscount, applyPromo, removePromo } = useCart();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await applyPromo(code);
      setCode("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not apply this code");
    } finally {
      setBusy(false);
    }
  };

  const removeBtn =
    "ml-auto inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[.14em] text-muted transition-colors hover:text-[#a8231a]";

  return (
    <section className={`rounded-xl border border-line bg-card p-4 ${className}`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-muted">
        <Tag size={13} className="text-gold-dark" /> Promo code
      </div>

      {promoActive ? (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-[#c6e0c9] bg-[#eef7ef] px-3 py-2.5 text-sm">
            <Check size={14} className="shrink-0 text-[#2f6b3b]" />
            <span className="font-semibold tracking-wide">{promo.code}</span>
            <span className="text-[#2f6b3b]">− Rs. {promoDiscount.toLocaleString()}</span>
            <button type="button" onClick={removePromo} className={removeBtn}>
              <X size={12} /> Remove
            </button>
          </div>
          {promo.message && <p className="mt-2 mb-0 text-[11px] leading-relaxed text-muted">{promo.message}</p>}
        </div>
      ) : promo ? (
        /* code save tha magar ab valid nahi (expire / limit / minimum order) */
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-[#e7c3bf] bg-[#fbf1f0] px-3 py-2.5 text-sm">
            <X size={14} className="shrink-0 text-[#a8231a]" />
            <span className="font-semibold tracking-wide">{promo.code}</span>
            <button type="button" onClick={removePromo} className={removeBtn}>
              <X size={12} /> Remove
            </button>
          </div>
          <p className="mt-2 mb-0 text-[11px] leading-relaxed text-[#a8231a]">{promo.message}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3">
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              aria-label="Promo code"
              className="min-w-0 flex-1 rounded-md border border-line bg-white px-3.5 py-2.5 text-sm uppercase tracking-wide focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <button
              type="submit"
              disabled={busy}
              className="shrink-0 rounded-md bg-brown px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[.16em] text-[#f3ebe0] transition-colors hover:bg-ink disabled:opacity-60"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
            </button>
          </div>

          {error && <p className="mt-2 mb-0 text-[11px] leading-relaxed text-[#a8231a]">{error}</p>}

          <p className="mt-2 mb-0 text-[11px] leading-relaxed text-muted">
            We share codes on our social media pages — apply yours here to see the saving.
          </p>
        </form>
      )}
    </section>
  );
}
