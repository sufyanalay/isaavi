import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Hammer, Banknote, PackageOpen, Truck, ArrowRight } from "lucide-react";
import Section from "../components/Section";
import api from "../api";

export default function Home() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { api.get("/settings").then((r) => setSettings(r.data)).catch(() => {}); }, []);

  return (
    <div>
      <section
        className="relative min-h-[600px] flex items-end overflow-hidden animate-fade-in"
        style={{
          background: settings?.heroImage
            ? `url(${settings.heroImage}) center/cover`
            : "linear-gradient(135deg, #7d6248 0%, #4f3822 55%, #2b1a10 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/15" />
        <div className="relative max-w-[1180px] mx-auto px-6 pb-16 w-full text-[#f6efe6]">
          <div className="text-[10px] tracking-[.18em] uppercase font-semibold mb-3.5 text-[#e8d8bd]">Handmade · Sialkot</div>
          <h1 className="font-serif font-normal m-0 leading-[1.02]" style={{ fontSize: "clamp(42px, 7vw, 74px)" }}>Isaavi Leather</h1>
          <p className="my-4 text-base text-[#e8dcc9] max-w-[420px]">Made by hand. Made yours. Full-grain leather goods crafted in Sialkot, delivered nationwide with Cash on Delivery.</p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/for-him" className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide rounded-sm bg-[#f3ebe0] text-ink hover:-translate-y-0.5 hover:shadow-2xl transition-all">
              Shop Him <ArrowRight size={14} />
            </Link>
            <Link to="/for-her" className="inline-flex items-center gap-2 px-7 py-3.5 text-xs font-semibold uppercase tracking-wide rounded-sm border border-white/40 text-[#f6efe6] hover:bg-white/10 hover:-translate-y-0.5 transition-all">
              Shop Her
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-line bg-white">
        {[[Hammer, "Handmade leather"], [Banknote, "Cash delivery"], [PackageOpen, "Open first"], [Truck, "Nationwide delivery"]].map(([I, t], i) => (
          <div key={t} className={`flex gap-2.5 items-center justify-center py-5 px-2 text-muted text-[10px] tracking-[.18em] uppercase font-semibold border-line ${i < 3 ? "border-r" : ""}`}>
            <I size={15} className="text-gold-dark" /> {t}
          </div>
        ))}
      </div>

      <main className="max-w-[1180px] mx-auto px-6 pt-14">
        <Section section="him" limit={10} />
        <Section section="her" limit={10} />
        <Section section="gift" limit={5} />
      </main>
    </div>
  );
}