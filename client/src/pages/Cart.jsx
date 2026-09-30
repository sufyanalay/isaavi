import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ImageOff,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Package,
  Gift,
  Banknote,
  PackageOpen,
  Truck,
  Hammer,
  Check,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../api";

const DEFAULTS = { deliveryFee: 250, giftBagFee: 8000 };

const EYEBROW = "text-[10px] tracking-[.18em] uppercase font-semibold text-muted";

const TRUST = [
  [Hammer, "Handmade", "Crafted in Sialkot"],
  [Banknote, "Cash on delivery", "No advance payment"],
  [PackageOpen, "Open first", "Check before you pay"],
  [Truck, "Nationwide", "Delivered to your door"],
];

function Thumb({ src }) {
  const [bad, setBad] = useState(false);
  return (
    <div className="relative w-[86px] h-[86px] sm:w-[104px] sm:h-[104px] flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-line bg-gradient-to-br from-[#f3ead6] to-[#ece0c5] flex items-center justify-center">
      {src && !bad ? (
        <img
          src={src}
          alt=""
          onError={() => setBad(true)}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      ) : (
        <ImageOff size={20} className="text-[#b3a48f]" />
      )}
    </div>
  );
}

function Stepper({ qty, onChange }) {
  const btn =
    "w-8 h-8 grid place-items-center text-ink/75 transition-colors hover:text-ink hover:bg-[#f1e9d8] disabled:text-muted/60 disabled:cursor-not-allowed disabled:hover:bg-transparent";
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white overflow-hidden">
      <button type="button" onClick={() => onChange(-1)} disabled={qty <= 1} aria-label="Decrease quantity" className={btn}>
        <Minus size={13} />
      </button>
      <span aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums select-none">
        {qty}
      </span>
      <button type="button" onClick={() => onChange(1)} aria-label="Increase quantity" className={btn}>
        <Plus size={13} />
      </button>
    </div>
  );
}

function PackOption({ active, onClick, icon: Icon, title, note, price }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`relative flex items-start gap-3.5 rounded-lg border p-4 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${
        active
          ? "border-ink bg-[#f1e9d8] shadow-[0_14px_34px_-26px_rgba(36,21,9,.85)]"
          : "border-line bg-white hover:-translate-y-0.5 hover:border-gold/70 hover:shadow-[0_14px_30px_-26px_rgba(36,21,9,.7)]"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${
          active ? "bg-ink text-[#f3ebe0]" : "bg-[#f6efdf] text-gold-dark"
        }`}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          {active && <Check size={13} className="text-[#2f6b3b]" />}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted">{note}</span>
        <span className={`mt-2 inline-block text-[10px] tracking-[.16em] uppercase font-semibold ${active ? "text-ink" : "text-muted"}`}>
          {price}
        </span>
      </span>
    </button>
  );
}

function TrustStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
      {TRUST.map(([Icon, title, note]) => (
        <div key={title} className="flex flex-col items-center text-center gap-1">
          <Icon size={17} className="text-gold-dark" />
          <div className="text-[10px] tracking-[.16em] uppercase font-semibold">{title}</div>
          <div className="text-[11px] leading-snug text-muted">{note}</div>
        </div>
      ))}
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

  const itemCount = cart.reduce((a, i) => a + i.qty, 0);
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
      <main className="mx-auto max-w-[1180px] px-5 pt-12 pb-20 sm:px-6">
        <div className="mx-auto max-w-[620px] text-center animate-fade-up">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-line bg-card shadow-[0_18px_40px_-30px_rgba(36,21,9,.85)]">
            <ShoppingBag size={26} className="text-gold-dark" />
          </div>
          <div className={`${EYEBROW} mb-2`}>Cart</div>
          <h1 className="font-serif text-[34px] sm:text-4xl font-normal m-0">Your cart is empty</h1>
          <p className="mx-auto mt-3 mb-0 max-w-[450px] text-sm leading-relaxed text-muted">
            Nothing here yet. Explore our handmade leather pieces — belts, wallets and bags — or put together a gift
            pack, delivered nationwide with Cash on Delivery.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/for-him"
              className="inline-flex items-center gap-2 rounded-sm bg-brown px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] no-underline transition-all hover:-translate-y-0.5 hover:bg-ink hover:shadow-lg"
            >
              Shop for him <ArrowRight size={14} />
            </Link>
            <Link
              to="/for-her"
              className="inline-flex items-center gap-2 rounded-sm border border-line bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink no-underline transition-all hover:-translate-y-0.5 hover:border-gold"
            >
              Shop for her
            </Link>
          </div>

          <Link
            to="/gift-packs"
            className="mt-4 inline-block border-b border-line pb-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted no-underline transition-colors hover:border-gold hover:text-ink"
          >
            Or browse ready-made gift packs
          </Link>

          <div className="mt-9 border-t border-line pt-7">
            <TrustStrip />
          </div>
        </div>
      </main>
    );

  return (
    <main className="mx-auto max-w-[1180px] px-5 pt-8 pb-16 sm:px-6">
      {/* ---------- Heading ---------- */}
      <header className="mb-7 animate-fade-up">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-[11px]">
          <Link to="/" className="text-muted no-underline transition-colors hover:text-ink">Home</Link>
          <span className="text-line">/</span>
          <span className="font-medium text-ink">Cart</span>
        </nav>

        <div className="flex items-center gap-3 text-[10px] tracking-[.18em] uppercase font-semibold">
          <span className="flex items-center gap-2 text-ink">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[10px] text-[#f3ebe0]">1</span>
            Your cart
          </span>
          <span aria-hidden="true" className="h-px w-8 bg-line sm:w-12" />
          <span className="flex items-center gap-2 text-muted">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-line bg-white text-[10px]">2</span>
            Checkout
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-serif text-4xl sm:text-[42px] font-normal m-0">Your cart</h1>
          <p className="m-0 max-w-[420px] text-sm leading-relaxed text-muted">
            Review your pieces, choose how we should pack them, then continue to Cash on Delivery checkout.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7 items-start">
        {/* ---------- Items ---------- */}
        <div>
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-line pb-3">
            <div>
              <div className={EYEBROW}>In your bag</div>
              <h2 className="mt-1 mb-0 font-serif text-2xl font-medium">
                {itemCount} {itemCount === 1 ? "piece" : "pieces"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setCart([])}
              className="text-[10px] tracking-[.16em] uppercase font-semibold text-muted transition-colors hover:text-[#a8231a]"
            >
              Clear cart
            </button>
          </div>

          {cart.map((i, idx) => (
            <article
              key={i.lineId}
              style={{ animationDelay: `${idx * 55}ms` }}
              className="group relative mb-3 flex gap-4 rounded-xl border border-line bg-card p-3.5 transition-all duration-300 animate-fade-up hover:border-gold/60 hover:shadow-[0_18px_40px_-30px_rgba(36,21,9,.9)] sm:gap-5 sm:p-4"
            >
              <Thumb src={i.image} />

              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="m-0 pr-9 font-serif text-[19px] leading-snug font-medium line-clamp-2">{i.name}</h3>

                {(i.color || i.leatherType) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {i.color && (
                      <span className="rounded-full border border-line bg-white px-2.5 py-[3px] text-[10px] uppercase tracking-wide text-muted">
                        {i.color}
                      </span>
                    )}
                    {i.leatherType && (
                      <span className="rounded-full border border-line bg-white px-2.5 py-[3px] text-[10px] uppercase tracking-wide text-muted">
                        {i.leatherType}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-2 text-[13px] tabular-nums text-muted">Rs. {i.price.toLocaleString()} each</div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <Stepper qty={i.qty} onChange={(delta) => updateQty(i.lineId, delta)} />
                  <div className="text-base font-semibold tabular-nums">Rs. {(i.price * i.qty).toLocaleString()}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeItem(i.lineId)}
                aria-label={`Remove ${i.name} from cart`}
                className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-transparent text-muted transition-colors hover:border-line hover:bg-white hover:text-[#a8231a]"
              >
                <Trash2 size={15} />
              </button>
            </article>
          ))}

          {/* ---------- Packaging ---------- */}
          <section className="mt-6 rounded-xl border border-line bg-card p-5 sm:p-6">
            <div className={EYEBROW}>Packaging</div>
            <h2 className="mt-1 mb-4 font-serif text-2xl font-medium">How should we pack this?</h2>
            <div role="radiogroup" aria-label="Packaging preference" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PackOption
                active={packaging === "normal"}
                onClick={() => setPackaging("normal")}
                icon={Package}
                title="Normal Order"
                note="Standard protective packaging, wrapped by hand. No extra cost."
                price="Free"
              />
              <PackOption
                active={packaging === "gift"}
                onClick={() => setPackaging("gift")}
                icon={Gift}
                title="Gift Order"
                note="Premium handmade leather gift bag, ready to give — no price slip inside."
                price={`+ Rs. ${Number(settings.giftBagFee).toLocaleString()}`}
              />
            </div>
          </section>

          <div className="mt-6 rounded-xl border border-line bg-white/60 p-5">
            <TrustStrip />
          </div>
        </div>

        {/* ---------- Summary ---------- */}
        <aside className="animate-fade-up rounded-xl border border-line bg-card p-5 shadow-[0_24px_60px_-50px_rgba(36,21,9,.95)] lg:sticky lg:top-24">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="m-0 font-serif text-xl font-medium">Order summary</h2>
            <span className="text-[10px] tracking-[.16em] uppercase font-semibold text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="border-t border-line pt-4">
            <div className="mb-2.5 flex justify-between text-sm">
              <span>Items subtotal</span>
              <span className="tabular-nums">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="mb-2.5 flex justify-between text-sm">
              <span>{packaging === "gift" ? "Leather gift bag" : "Standard packaging"}</span>
              <span className="tabular-nums">{giftBagFee ? `Rs. ${giftBagFee.toLocaleString()}` : "Free"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery</span>
              <span className="tabular-nums">{deliveryFee ? `Rs. ${deliveryFee.toLocaleString()}` : "Free"}</span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted">Total (COD)</span>
            <span className="font-serif text-2xl font-semibold tabular-nums">Rs. {total.toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={goCheckout}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-brown py-3.5 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] transition-all hover:bg-ink hover:shadow-lg active:scale-[.99]"
          >
            Continue to checkout <ArrowRight size={14} />
          </button>

          <Link
            to="/"
            className="mt-3 flex items-center justify-center gap-1.5 text-[10px] tracking-[.16em] uppercase font-semibold text-muted no-underline transition-colors hover:text-ink"
          >
            <ArrowLeft size={12} /> Continue shopping
          </Link>

          <div className="mt-5 rounded-lg border border-[#e4d3a8] bg-[#f1e6cc] p-4 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <Banknote size={14} /> Cash on Delivery only
            </div>
            <p className="mt-1.5 mb-0 leading-relaxed text-[#5b4a2e]">
              Pay the courier in cash after opening and checking your parcel.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}