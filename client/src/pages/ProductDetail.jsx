import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, ImageOff } from "lucide-react";
import api from "../api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [color, setColor] = useState("");
  const [leatherType, setLeatherType] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setProduct(null);
    setActiveImg(0);
    setImgError(false);
    api.get(`/products/${slug}`).then((r) => {
      setProduct(r.data);
      setColor(r.data.colors[0] || "");
      setLeatherType(r.data.leatherTypes[0] || "");
    });
  }, [slug]);

  if (!product) return <main className="max-w-[1180px] mx-auto px-6 py-16">Loading...</main>;

  const handleAdd = () => {
    addToCart(product, { color, leatherType, qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const hasImage = product.images?.[activeImg]?.url && !imgError;

  return (
    <main className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">
      <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-4">
        <Link to="/" className="text-muted no-underline hover:text-ink">Home</Link> / {product.name}
      </div>

      <div className="pdp-grid grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
        <div>
          <div className="bg-gradient-to-br from-[#f3ead6] to-[#ece0c5] aspect-square rounded overflow-hidden mb-2.5">
            {hasImage ? (
              <img
                src={product.images[activeImg].url}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#b3a48f]">
                <ImageOff size={24} /> <span className="text-xs uppercase tracking-wide">No image</span>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.publicId}
                  onClick={() => { setActiveImg(i); setImgError(false); }}
                  className={`w-16 h-16 p-0 overflow-hidden rounded bg-[#f3ead6] ${
                    i === activeImg ? "border-2 border-ink" : "border border-line"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-2">{product.customizable ? "Customizable" : ""}</div>
          <h1 className="font-serif text-4xl font-normal m-0 mb-2.5">{product.name}</h1>
          <div className="text-xl font-semibold mb-5">Rs. {product.price.toLocaleString()}</div>

          {product.description && <p className="text-muted mb-5">{product.description}</p>}

          {product.colors?.length > 0 && (
            <label className="block mb-3.5">
              <span className="block text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">Colour</span>
              <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full border border-line rounded p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
                {product.colors.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          )}

          {product.leatherTypes?.length > 0 && (
            <label className="block mb-3.5">
              <span className="block text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">Leather type</span>
              <select value={leatherType} onChange={(e) => setLeatherType(e.target.value)} className="w-full border border-line rounded p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold">
                {product.leatherTypes.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
          )}

          <label className="block mb-5">
            <span className="block text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">Quantity</span>
            <div className="flex items-center gap-2.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 border border-line rounded hover:border-ink">−</button>
              <span className="w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-8 h-8 border border-line rounded hover:border-ink">+</button>
            </div>
          </label>

          <button onClick={handleAdd} className="w-full bg-brown text-[#f3ebe0] py-3.5 text-xs font-semibold uppercase tracking-wide rounded-sm flex items-center justify-center gap-2 hover:bg-ink transition-colors">
            <ShoppingBag size={14} /> {added ? "Added ✓" : "Add to cart"}
          </button>

          <div className="text-xs text-muted mt-3.5">
            Design: {product.design} · Handmade in Sialkot · Cash on Delivery
          </div>
        </div>
      </div>
    </main>
  );
}