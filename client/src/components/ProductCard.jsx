import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ImageOff, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { swatchOf } from "../colors";

export default function ProductCard({ p = {} }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [secondError, setSecondError] = useState(false);
  const [added, setAdded] = useState(false);

  // a card without a product would break the whole page — render nothing instead
  if (!p.slug) return null;

  const primary = p.images?.[0]?.url;
  const secondary = p.images?.[1]?.url;
  const hasImage = primary && !imgError;
  /* hover reveals the second angle — only when that photo really loads */
  const showSecond = Boolean(secondary) && !secondError;
  const soldOut = p.inStock === false;
  const onSale = !soldOut && p.comparePrice > p.price;
  const off = onSale ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
  const colors = (p.colors || []).slice(0, 4);

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  /* always visible on touch, slides up on desktop hover */
  const addBar = `absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 py-3.5 text-[10.5px] font-semibold uppercase tracking-[.16em] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(.22,.9,.25,1)] disabled:cursor-not-allowed ${
    soldOut
      ? "bg-[#e8dfcd]/95 text-muted"
      : added
        ? "bg-[#2f6b3b]/95 text-white"
        : "bg-ink/95 text-[#f7f2e8] hover:bg-brown md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
  }`;

  return (
    <Link to={`/product/${p.slug}`} className="group block no-underline text-ink animate-fade-up">
      {/* ---------- Media ---------- */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-line bg-gradient-to-br from-[#f7f1e2] to-[#ece0c5] transition-shadow duration-500 group-hover:shadow-[var(--shadow-lift)]">
        <span className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

        {hasImage ? (
          <>
            <img
              src={primary}
              alt={p.name}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(.22,.9,.25,1)] group-hover:scale-[1.05] ${
                showSecond ? "group-hover:opacity-0" : ""
              }`}
            />
            {showSecond && (
              <img
                src={secondary}
                alt={`${p.name} — second view`}
                onError={() => setSecondError(true)}
                className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition-all duration-[900ms] ease-[cubic-bezier(.22,.9,.25,1)] group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#b3a48f]">
            <ImageOff size={22} />
            <span className="text-[10px] uppercase tracking-[.16em]">No image</span>
          </div>
        )}

        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {onSale && (
            <span className="rounded-full bg-ink/90 px-3 py-1 text-[9px] font-semibold uppercase tracking-[.16em] text-[#f7f2e8] backdrop-blur-sm">
              {off}% off
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 z-[2] grid place-items-center bg-bg/70 backdrop-blur-[2px]">
            <span className="rounded-full border border-line bg-white px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[.2em]">
              Sold out
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={quickAdd}
          disabled={soldOut}
          aria-label={soldOut ? `${p.name} is sold out` : `Add ${p.name} to cart`}
          className={addBar}
        >
          {added ? <Check size={14} /> : <ShoppingBag size={14} />}
          {soldOut ? "Sold out" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>

      {/* ---------- Info ---------- */}
      <div className="pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[9.5px] font-semibold uppercase tracking-[.2em] text-muted capitalize">{p.type}</span>
          {colors.length > 0 && (
            <span className="flex items-center gap-1">
              {colors.map((c) => (
                <span
                  key={c}
                  title={c}
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-line"
                  style={{ background: swatchOf(c) }}
                />
              ))}
            </span>
          )}
        </div>

        <h3 className="mt-2 mb-0 line-clamp-2 font-serif text-[16.5px] font-medium leading-snug sm:text-[17.5px]">
          {p.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="text-[14.5px] font-semibold tabular-nums">Rs. {p.price?.toLocaleString()}</span>
          {onSale && (
            <>
              <span className="text-[12.5px] text-muted line-through tabular-nums">
                Rs. {p.comparePrice.toLocaleString()}
              </span>
              <span className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-sale">Save {off}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
