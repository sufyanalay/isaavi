import { useEffect, useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { ShoppingBag, Phone, Mail, MapPin, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import api from "../api";
import WhatsAppButton from "./WhatsAppButton";

export default function Layout() {
  const { count } = useCart();
  const [settings, setSettings] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { api.get("/settings").then((r) => setSettings(r.data)).catch(() => {}); }, []);

  const navLink = "text-[13px] font-medium text-muted hover:text-ink transition-colors pb-1.5 border-b border-transparent";
  const navLinkClass = ({ isActive }) => `${navLink} ${isActive ? "text-ink border-gold" : ""}`;

  const navLinks = (
    <>
      <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>Home</NavLink>
      <NavLink to="/for-him" className={navLinkClass} onClick={() => setMenuOpen(false)}>For Him</NavLink>
      <NavLink to="/for-her" className={navLinkClass} onClick={() => setMenuOpen(false)}>For Her</NavLink>
      <NavLink to="/gift-packs" className={navLinkClass} onClick={() => setMenuOpen(false)}>Gift Packs</NavLink>
      <NavLink to="/custom-order" className={navLinkClass} onClick={() => setMenuOpen(false)}>Custom Order</NavLink>
    </>
  );

  return (
    <div>
      {settings?.promoActive && settings?.promoText && (
        <div className="text-[10px] tracking-[.18em] uppercase font-semibold bg-gold text-ink text-center py-2.5 px-4">
          {settings.promoText}
        </div>
      )}
      <div className="text-[10px] tracking-[.18em] uppercase font-semibold bg-ink text-[#f3ebe0] text-center py-2.5">
        {settings?.announcement || "COD · Open before payment"}
      </div>

      <header className="border-b border-line sticky top-0 bg-bg/90 backdrop-blur-md z-30">
        <div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between h-[68px] gap-4">
          <Link to="/" className="no-underline text-ink">
            <div className="font-serif text-2xl leading-none font-medium">Isaavi Leather</div>
            <div className="text-[8px] tracking-[.18em] uppercase text-muted mt-1">Handmade · Sialkot</div>
          </Link>

          <nav className="hidden md:flex gap-8">{navLinks}</nav>

          <div className="flex gap-2.5 items-center">
            <Link to="/cart" aria-label="Cart" className="relative isolate w-[38px] h-[38px] border border-line bg-white grid place-items-center rounded-sm hover:border-ink transition-colors overflow-visible">
  <ShoppingBag size={16} />
  {count > 0 && (
    <span className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 flex items-center justify-center bg-gold text-ink text-[9px] font-bold rounded-full leading-none">
      {count > 9 ? "9+" : count}
    </span>
  )}
</Link>
            <button className="md:hidden bg-white border border-line w-[38px] h-[38px] rounded-sm flex items-center justify-center" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden flex flex-col gap-0.5 px-6 pb-4 pt-2.5 border-t border-line bg-bg">
            {navLinks}
          </nav>
        )}
      </header>

      <Outlet />

      <footer className="border-t border-line pt-10 mt-16">
        <div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
          <div>
            <div className="font-serif text-xl">Isaavi Leather</div>
            <div className="text-[13px] text-muted mt-2">Handmade in Sialkot.</div>
          </div>
          <div>
            <div className="text-[10px] tracking-[.18em] uppercase font-semibold mb-3.5">Shop</div>
            <Link to="/for-him" className="block text-[13px] text-muted no-underline mb-2.5 hover:text-ink">For Him</Link>
            <Link to="/for-her" className="block text-[13px] text-muted no-underline mb-2.5 hover:text-ink">For Her</Link>
            <Link to="/gift-packs" className="block text-[13px] text-muted no-underline mb-2.5 hover:text-ink">Gift Packs</Link>
            <Link to="/cart" className="block text-[13px] text-muted no-underline hover:text-ink">Cart</Link>
          </div>
          <div>
            <div className="text-[10px] tracking-[.18em] uppercase font-semibold mb-3.5">Contact</div>
            <div className="flex gap-2.5 items-center text-[13px] text-muted mb-3"><Phone size={14} /> {settings?.phone || "+92 300 000 0000"}</div>
            <div className="flex gap-2.5 items-center text-[13px] text-muted mb-3"><Mail size={14} /> {settings?.email || "orders@isaavileather.com"}</div>
            <div className="flex gap-2.5 items-center text-[13px] text-muted mb-3"><MapPin size={14} /> {settings?.address || "Sialkot, Punjab, Pakistan"}</div>
          </div>
        </div>
        <div className="border-t border-line text-center py-4 text-[11px] text-muted">
          © 2026 Isaavi Leather · COD · Allowed to Open
        </div>
      </footer>

      <WhatsAppButton phone={settings?.phone} />
  
    </div>
  );
}