import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Package, ShoppingBag, Settings, LogOut } from "lucide-react";

export default function AdminLayout() {
  const nav = useNavigate();
  const logout = () => { localStorage.removeItem("il_token"); nav("/sialkot112200/login"); };

  const linkCls = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm mb-1 transition-colors ${
      isActive ? "bg-gold text-ink font-semibold" : "text-[#d8c9ba] hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      <aside className="w-[230px] bg-ink text-[#f3ebe0] flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="font-serif text-xl">Isaavi Leather</div>
          <small className="block text-[10px] tracking-[.14em] uppercase text-[#c9b8a8] mt-1">Admin Panel</small>
        </div>
        <nav className="flex-1 p-2.5">
          <NavLink to="/sialkot112200/products" className={linkCls}><Package size={16} /> Products</NavLink>
          <NavLink to="/sialkot112200/orders" className={linkCls}><ShoppingBag size={16} /> Orders</NavLink>
          <NavLink to="/sialkot112200/settings" className={linkCls}><Settings size={16} /> Settings</NavLink>
        </nav>
        <button onClick={logout} className="m-3 p-2.5 border border-white/20 rounded-md flex items-center justify-center gap-2 text-sm hover:bg-white/10 transition-colors">
          <LogOut size={15} /> Logout
        </button>
      </aside>
      <main className="flex-1 bg-[#f4f1ea] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}