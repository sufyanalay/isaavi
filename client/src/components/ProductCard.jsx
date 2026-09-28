import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ImageOff, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ p }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  const hasImage = p.images?.[0]?.url && !imgError;
  const onSale = p.comparePrice > p.price;
  const off = onSale ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link to={`/product/${p.slug}`} className="group block no-underline text-ink animate-fade-up">
      <div className="relative aspect-square overflow-hidden bg-white border border-line">
        {onSale && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-[#d92d20] text-white text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full">
            SALE
          </span>
        )}

        {hasImage ? (
          <img
            src={p.images[0].url}
            alt={p.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#b3a48f] bg-[#f6efdf]">
            <ImageOff size={22} />
            <span className="text-[10px] uppercase tracking-wide">No image</span>
          </div>
        )}

        <button
          onClick={quickAdd}
          aria-label={`Add ${p.name} to cart`}
          className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full bg-brown text-[#f3ebe0] flex items-center justify-center shadow-md hover:bg-ink transition-all duration-200 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 focus:opacity-100"
        >
          {added ? <Check size={16} /> : <ShoppingBag size={16} />}
        </button>
      </div>

      <div className="pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] tracking-[.16em] uppercase font-semibold text-muted">{p.type}</span>
          <div className="text-right">
            <div className="font-semibold text-[15px]">Rs. {p.price?.toLocaleString()}</div>
            {onSale && (
              <div className="mt-0.5 flex items-center justify-end gap-1.5">
                <span className="text-xs text-muted line-through">Rs. {p.comparePrice.toLocaleString()}</span>
                <span className="text-[11px] font-semibold text-[#d92d20]">{off}% OFF</span>
              </div>
            )}
          </div>
        </div>

        <div className="font-serif text-[17px] leading-snug font-medium line-clamp-2 mt-1.5">{p.name}</div>

        <button
          onClick={quickAdd}
          className={`mt-3 w-full py-2.5 text-xs font-semibold uppercase tracking-wide rounded-sm flex items-center justify-center gap-2 transition-colors active:scale-[.98] ${
            added ? "bg-[#2f6b3b] text-white" : "bg-brown text-[#f3ebe0] hover:bg-ink"
          }`}
        >
          {added ? <Check size={14} /> : <ShoppingBag size={14} />}
          {added ? "Added" : "Add to cart"}
        </button>
      </div>
    </Link>
  );
}