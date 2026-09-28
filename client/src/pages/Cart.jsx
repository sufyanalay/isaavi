import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ImageOff } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../api";

const DEFAULTS = { deliveryFee: 250, giftBagFee: 8000 };

function Thumb({ src }) {
  const [bad, setBad] = useState(false);
  return (
    <div className="w-[70px] h-[70px] bg-[#f3ead6] flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
      {src && !bad ? (
        <img src={src} alt="" onError={() => setBad(true)} className="w-full h-full object-cover" />
      ) : (
        <ImageOff size={18} className="text-[#b3a48f]" />
      )}
    </div>
  );
}

export default function Cart() {
  const { cart, setCart } = useCart();
  const [settings, setSettings] = useState(DEFAULTS);
  const [packaging, setPackaging] = useState("normal");
  const nav = useNavigate();

  useEffect(() => {
    api.get("/settings")
      .then((r) => setSettings({ ...DEFAULTS, ...r.data }))
      .catch(() => {});
  }, []);

  const updateQty = (id, delta) =>
    setCart((c) => c.map((i) => (i.lineId === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  const removeItem = (id) => setCart((c) => c.filter((i) => i.lineId !== id));

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const giftBagFee = packaging === "gift" ? Number(settings.giftBagFee) || 0 : 0;
  const deliveryFee = Number(settings.deliveryFee) || 0;
  const total = subtotal + giftBagFee + deliveryFee;

  const goCheckout = () => {
    sessionStorage.setItem("il_packaging", packaging);
    nav("/checkout");
  };

  if (!cart.length)
    return (
      <main className="max-w-[1180px] mx-auto px-6 py-16 text-center">
        <h2 className="font-serif text-3xl">Your cart</h2>
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/" className="text-brown underline">Continue shopping</Link>
      </main>
    );

  return (
    <main className="max-w-[1180px] mx-auto px-6 pt-8 pb-16">
      <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">Step 1 of 2</div>
      <h1 className="font-serif text-4xl font-normal mb-6">Your cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7 items-start">
        <div>
          {cart.map((i) => (
            <div key={i.lineId} className="flex gap-4 bg-card border border-line p-4 mb-3 rounded">
              <Thumb src={i.image} />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium">{i.name}</div>
                {(i.color || i.leatherType) && (
                  <div className="text-xs text-muted">{i.color}{i.color && i.leatherType ? " · " : ""}{i.leatherType}</div>
                )}
                <div className="text-sm text-muted my-1">Rs. {i.price.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(i.lineId, -1)} className="w-7 h-7 border border-line rounded flex items-center justify-center hover:border-ink"><Minus size={12} /></button>
                  <span className="w-5 text-center text-sm">{i.qty}</span>
                  <button onClick={() => updateQty(i.lineId, 1)} className="w-7 h-7 border border-line rounded flex items-center justify-center hover:border-ink"><Plus size={12} /></button>
                  <button onClick={() => removeItem(i.lineId)} className="ml-auto text-muted hover:text-red-600" aria-label="Remove"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="font-semibold text-sm whitespace-nowrap">Rs. {(i.price * i.qty).toLocaleString()}</div>
            </div>
          ))}

          <div className="bg-card border border-line p-5 rounded mt-5">
            <h3 className="mt-0 mb-3 font-serif text-xl font-medium">How should we pack this?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setPackaging("normal")}
                className={`text-left p-4 rounded border transition-colors ${packaging === "normal" ? "border-ink bg-[#f1e9d8]" : "border-line bg-white hover:border-ink"}`}
              >
                <div className="font-semibold text-sm">Normal Order</div>
                <p className="text-xs text-muted mt-1.5 mb-0">Standard protective packaging. No extra cost.</p>
              </button>
              <button
                onClick={() => setPackaging("gift")}
                className={`text-left p-4 rounded border transition-colors ${packaging === "gift" ? "border-ink bg-[#f1e9d8]" : "border-line bg-white hover:border-ink"}`}
              >
                <div className="font-semibold text-sm">Gift Order</div>
                <p className="text-xs text-muted mt-1.5 mb-0">Premium handmade leather gift bag — Rs. {Number(settings.giftBagFee).toLocaleString()}.</p>
              </button>
            </div>
          </div>
        </div>

        <aside className="bg-card border border-line p-5 rounded lg:sticky lg:top-24">
          <h3 className="font-serif mt-0 mb-4 font-medium text-xl">Order summary</h3>
          <div className="flex justify-between text-sm mb-2.5"><span>Items subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm mb-2.5"><span>Gift bag</span><span>{giftBagFee ? `Rs. ${giftBagFee.toLocaleString()}` : "—"}</span></div>
          <div className="flex justify-between text-sm mb-3 border-b border-line pb-3.5"><span>Delivery</span><span>{deliveryFee ? `Rs. ${deliveryFee.toLocaleString()}` : "Free"}</span></div>
          <div className="flex justify-between font-semibold text-base mb-4"><span>Total (COD)</span><span>Rs. {total.toLocaleString()}</span></div>
          <button onClick={goCheckout} className="w-full bg-brown text-[#f3ebe0] py-3.5 text-xs font-semibold uppercase tracking-wide rounded-sm hover:bg-ink transition-colors">Continue to checkout</button>
          <p className="text-[11px] text-muted mt-3 mb-0">Cash on Delivery only — pay the courier after checking your parcel.</p>
        </aside>
      </div>
    </main>
  );
}