import { useEffect, useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import {
  ShoppingBag, Phone, Mail, MapPin, Menu, X, ChevronRight, MessageCircle,
  Hammer, Banknote, PackageOpen, Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../api";
import WhatsAppButton from "./WhatsAppButton";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/for-him", label: "For Him" },
  { to: "/for-her", label: "For Her" },
  { to: "/gift-packs", label: "Gift Packs" },
  { to: "/custom-order", label: "Custom Order" },
];

const PROMISES = [
  { icon: Hammer, title: "Handmade in Sialkot", note: "Cut, stitched and finished by hand" },
  { icon: Banknote, title: "Cash on delivery", note: "No advance payment, ever" },
  { icon: PackageOpen, title: "Open before you pay", note: "Inspect your parcel first" },
  { icon: Truck, title: "Nationwide delivery", note: "Courier right to your door" },
];

const startScrolled = () => typeof window !== "undefined" && window.scrollY > 14;

export default function Layout() {
  const { count } = useCart();
  const [settings, setSettings] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(startScrolled);

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock the page and allow Esc while the drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const desktopLink = ({ isActive }) =>
    `link-gold text-[12.5px] font-medium tracking-[.05em] transition-colors ${isActive ? "text-ink" : "text-muted hover:text-ink"}`;
  const drawerLink = ({ isActive }) =>
    `flex items-center justify-between border-b border-line py-4 font-serif text-[22px] transition-colors ${isActive ? "text-ink" : "text-muted"}`;

  const waNumber = String(settings?.phone || "").replace(/\D/g, "").replace(/^0/, "92");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-ink text-[#f3ebe0]">
        <div className="shell flex h-9 items-center justify-center">
          <span className="text-center text-[9px] font-semibold uppercase tracking-[.24em] sm:text-[10px]">
            {settings?.announcement || "Cash on delivery · Open before you pay"}
          </span>
        </div>
      </div>

      {settings?.promoActive && settings?.promoText && (
        <div className="bg-gold text-ink">
          <div className="shell py-2 text-center text-[9px] font-semibold uppercase tracking-[.24em] sm:text-[10px]">
            {settings.promoText}
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "border-b border-line bg-bg/85 shadow-[0_20px_45px_-40px_rgba(28,20,16,.85)] backdrop-blur-xl"
            : "border-b border-transparent bg-bg/60 backdrop-blur-md"
        }`}
      >
        <div
          className="shell flex items-center justify-between gap-4"
          style={{ height: scrolled ? 66 : 80, transition: "height .45s cubic-bezier(.22,.9,.25,1)" }}
        >
          <Link to="/" aria-label="Isaavi Leather — home" className="group flex min-w-0 items-center gap-3 no-underline">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/60 bg-card font-serif text-[15px] font-semibold text-brown transition-all duration-300 group-hover:border-gold group-hover:bg-gold/10">
              IL
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-[19px] font-medium leading-none tracking-[.02em] text-ink sm:text-[22px]">
                Isaavi Leather
              </span>
              <span className="mt-1 block text-[8px] uppercase tracking-[.28em] text-muted">Handmade · Sialkot</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
            {NAV.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={desktopLink}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Link
              to="/cart"
              aria-label={count ? `Cart, ${count} items` : "Cart"}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-card text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-gold"
            >
              <ShoppingBag size={17} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-card transition-colors hover:border-gold md:hidden"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[60] md:hidden ${menuOpen ? "visible" : "invisible"}`}>
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-ink/45 backdrop-blur-sm transition-opacity duration-500 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[88%] max-w-[360px] flex-col bg-bg shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.22,.9,.25,1)] ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="font-serif text-lg">Menu</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink"
            >
              <X size={17} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-5" aria-label="Mobile">
            {NAV.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={drawerLink} onClick={() => setMenuOpen(false)}>
                {l.label}
                <ChevronRight size={16} className="text-line" />
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-line px-5 py-5">
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi Isaavi Leather, I have a question about your products.")}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary w-full"
              >
                <MessageCircle size={15} /> WhatsApp us
              </a>
            )}
            <p className="mt-3 text-center text-[11px] tracking-wide text-muted">
              {settings?.phone || "+92 300 000 0000"}
            </p>
          </div>
        </aside>
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <section className="surface-deep mt-20 border-y border-line">
        <div className="shell grid grid-cols-2 gap-x-8 gap-y-9 py-12 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div
              key={p.title}
              className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-card text-gold-dark">
                <p.icon size={17} />
              </span>
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[.16em] text-ink">{p.title}</span>
                <span className="mt-1 block text-[12px] leading-relaxed text-muted">{p.note}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-ink text-[#b6a692]">
        <div className="shell grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 font-serif text-base text-gold">
                IL
              </span>
              <span>
                <span className="block font-serif text-xl text-[#f7f2e8]">Isaavi Leather</span>
                <span className="text-[8px] uppercase tracking-[.28em] text-[#8f7f6b]">Handmade · Sialkot</span>
              </span>
            </div>
            <p className="mt-5 max-w-[330px] text-[13px] leading-relaxed">
              Full-grain leather goods, cut and stitched by hand in Sialkot. Delivered across Pakistan with cash on delivery —
              open your parcel and check it before you pay.
            </p>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#8f7f6b]">Shop</div>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Shop">
              {[
                ["/for-him", "For Him"],
                ["/for-her", "For Her"],
                ["/gift-packs", "Gift Packs"],
                ["/custom-order", "Custom Order"],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="link-gold w-fit text-[13px] text-[#d8c9ba] transition-colors hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#8f7f6b]">Orders</div>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Orders">
              <Link to="/cart" className="link-gold w-fit text-[13px] text-[#d8c9ba] transition-colors hover:text-white">
                Your cart
              </Link>
              <Link to="/checkout" className="link-gold w-fit text-[13px] text-[#d8c9ba] transition-colors hover:text-white">
                Checkout
              </Link>
              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="link-gold w-fit text-[13px] text-[#d8c9ba] transition-colors hover:text-white"
                >
                  Ask about an order
                </a>
              )}
            </nav>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#8f7f6b]">Contact</div>
            <div className="mt-4 flex flex-col gap-3 text-[13px]">
              <span className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-gold" /> {settings?.phone || "+92 300 000 0000"}
              </span>
              <span className="break-anywhere flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-gold" /> {settings?.email || "orders@isaavileather.com"}
              </span>
              <span className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-gold" /> {settings?.address || "Sialkot, Punjab, Pakistan"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="shell flex flex-col items-center justify-between gap-2 pb-20 pt-5 text-center text-[11px] text-[#8f7f6b] sm:flex-row sm:pb-6 sm:text-left">
            <span>© 2026 Isaavi Leather · All rights reserved</span>
            <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>Cash on delivery only</span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-white/15 sm:block" />
              <span>Allowed to open before payment</span>
            </span>
          </div>
        </div>
      </footer>

      <WhatsAppButton phone={settings?.phone} />
    </div>
  );
}
