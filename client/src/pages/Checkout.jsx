import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../api";

const DEFAULTS = { deliveryFee: 250, giftBagFee: 8000 };

function Thumb({ src }) {
  const [bad, setBad] = useState(false);
  return (
    <div className="w-12 h-12 bg-[#f3ead6] flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
      {src && !bad ? (
        <img src={src} alt="" onError={() => setBad(true)} className="w-full h-full object-cover" />
      ) : (
        <ImageOff size={14} className="text-[#b3a48f]" />
      )}
    </div>
  );
}

export default function Checkout() {
  const { cart, setCart } = useCart();
  const [settings, setSettings] = useState(DEFAULTS);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", country: "Pakistan", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const packaging = sessionStorage.getItem("il_packaging") || "normal";
  const justPlaced = useRef(false); // stops the empty-cart redirect after a successful order

  useEffect(() => {
    api.get("/settings")
      .then((r) => setSettings({ ...DEFAULTS, ...r.data }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cart.length && !justPlaced.current) nav("/cart");
  }, [cart, nav]);

  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const giftBagFee = packaging === "gift" ? Number(settings.giftBagFee) || 0 : 0;
  const deliveryFee = Number(settings.deliveryFee) || 0;
  const total = subtotal + giftBagFee + deliveryFee;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const inputCls =
    "w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm";
  const labelCls = "block text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5";

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      return setError("Please fill in all required fields");
    }
    if (!/^(\+?92|0)?3\d{9}$/.test(form.phone.replace(/[\s-]/g, ""))) {
      return setError("Please enter a valid Pakistani mobile number (e.g. 03XX XXXXXXX)");
    }

    setBusy(true);
    try {
      const { data } = await api.post("/orders", {
        items: cart.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          color: i.color,
          leatherType: i.leatherType,
        })),
        customer: form,
        packaging,
      });
      justPlaced.current = true; // block redirect BEFORE clearing the cart
      setCart([]);
      sessionStorage.removeItem("il_packaging");
      nav(`/thank-you/${data.token}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-[1180px] px-5 pt-8 pb-16 sm:px-6">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-muted">Step 2 of 2</div>
      <h1 className="mb-6 font-serif text-[30px] font-normal sm:text-4xl">Checkout</h1>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px] lg:gap-7">
        {/* ---------- Form ---------- */}
        <form onSubmit={submit} className="rounded-xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-serif text-2xl font-medium mt-0 mb-5">Delivery details</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3 mb-4">{error}</div>
          )}

          <label className="block mb-4">
            <span className={labelCls}>Full name</span>
            <input value={form.name} onChange={set("name")} placeholder="Ahmed Khan" autoComplete="name" className={inputCls} />
          </label>

          <label className="block mb-4">
            <span className={labelCls}>Phone / WhatsApp</span>
            <input value={form.phone} onChange={set("phone")} placeholder="03XX XXXXXXX" inputMode="tel" autoComplete="tel" className={inputCls} />
          </label>

          <label className="block mb-4">
            <span className={labelCls}>Full delivery address</span>
            <textarea
              rows={3}
              value={form.address}
              onChange={set("address")}
              placeholder="House / street / area, nearest landmark"
              autoComplete="street-address"
              className={inputCls}
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className={labelCls}>City</span>
              <input value={form.city} onChange={set("city")} placeholder="Sialkot" autoComplete="address-level2" className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Country</span>
              <input value={form.country} onChange={set("country")} autoComplete="country-name" className={inputCls} />
            </label>
          </div>

          <label className="block mb-5">
            <span className={labelCls}>Order notes (optional)</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={set("notes")}
              placeholder="Waist size for belts, delivery timing, anything else."
              className={inputCls}
            />
          </label>

          <div className="bg-[#f1e6cc] border border-[#e4d3a8] p-4 text-sm rounded mb-5">
            <div className="font-semibold mb-1">Cash on Delivery</div>
            <div className="text-[#5b4a2e]">
              This is our only payment method. Pay the courier in cash once you have opened and checked your parcel.
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full rounded-sm bg-brown py-3.5 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] transition-all hover:bg-ink active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Placing order..." : `Place COD order · Rs. ${total.toLocaleString()}`}
          </button>
        </form>

        {/* ---------- Summary ---------- */}
        <aside className="bg-card border border-line p-5 rounded lg:sticky lg:top-24">
          <h3 className="font-serif mt-0 mb-4 font-medium text-xl">Your order</h3>

          <div className="space-y-3 mb-4">
            {cart.map((i) => (
              <div key={i.lineId} className="flex gap-3 items-center">
                <Thumb src={i.image} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.name}</div>
                  <div className="text-xs text-muted">
                    {i.qty} × Rs. {i.price.toLocaleString()}
                    {i.color ? ` · ${i.color}` : ""}
                  </div>
                </div>
                <div className="text-sm font-medium whitespace-nowrap">Rs. {(i.price * i.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-line pt-3.5 space-y-2.5 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between">
              <span>{packaging === "gift" ? "Gift bag" : "Standard packaging"}</span>
              <span>{giftBagFee ? `Rs. ${giftBagFee.toLocaleString()}` : "Free"}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryFee ? `Rs. ${deliveryFee.toLocaleString()}` : "Free"}</span>
            </div>
          </div>

          <div className="border-t border-line mt-3.5 pt-3.5 flex justify-between font-semibold text-base">
            <span>Total (COD)</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>

          <div className="mt-5 border-2 border-dashed border-[#a8231a] rounded p-4 text-center -rotate-1">
            <div className="font-serif text-2xl font-semibold text-[#a8231a] leading-tight">ALLOWED TO OPEN</div>
            <div className="text-[10px] tracking-[.2em] uppercase font-semibold mt-1.5">Cash on delivery</div>
            <p className="text-[11px] text-muted mt-2 mb-0">
              Dear courier &amp; customer: this parcel may be opened and checked before payment.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
  
}
