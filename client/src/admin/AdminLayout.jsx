import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Package, ShoppingBag, Settings, LogOut, Tag, Percent } from "lucide-react";

export default function AdminLayout() {
  const nav = useNavigate();
  const logout = () => { localStorage.removeItem("il_token"); nav("/sialkot112200/login"); };

  const linkCls = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${
      isActive ? "bg-gold text-ink font-semibold" : "text-[#d8c9ba] hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col bg-ink text-[#f3ebe0] md:w-[230px]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 md:block md:px-5 md:py-5">
          <div className="min-w-0">
            <div className="truncate font-serif text-lg md:text-xl">Isaavi Leather</div>
            <small className="mt-1 block text-[10px] tracking-[.14em] uppercase text-[#c9b8a8]">Admin Panel</small>
          </div>
          <button
            onClick={logout}
            className="flex shrink-0 items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-xs transition-colors hover:bg-white/10 md:hidden"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        <nav className="no-scrollbar flex gap-2 overflow-x-auto p-2.5 md:flex-1 md:flex-col md:gap-1 md:overflow-visible">
          <NavLink to="/sialkot112200/products" className={(s) => `${linkCls(s)} shrink-0`}><Package size={16} /> Products</NavLink>
          <NavLink to="/sialkot112200/offers" className={(s) => `${linkCls(s)} shrink-0`}><Tag size={16} /> Offers</NavLink>
          <NavLink to="/sialkot112200/promos" className={(s) => `${linkCls(s)} shrink-0`}><Percent size={16} /> Promo Codes</NavLink>
          <NavLink to="/sialkot112200/orders" className={(s) => `${linkCls(s)} shrink-0`}><ShoppingBag size={16} /> Orders</NavLink>
          <NavLink to="/sialkot112200/settings" className={(s) => `${linkCls(s)} shrink-0`}><Settings size={16} /> Settings</NavLink>
        </nav>

        <button
          onClick={logout}
          className="m-3 hidden items-center justify-center gap-2 rounded-md border border-white/20 p-2.5 text-sm transition-colors hover:bg-white/10 md:flex"
        >
          <LogOut size={15} /> Logout
        </button>
      </aside>

      <main className="min-h-screen flex-1 bg-[#f4f1ea]">
        <Outlet />
      </main>
    </div>
  );
}