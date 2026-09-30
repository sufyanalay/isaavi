import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Banknote, PackageOpen, Truck } from "lucide-react";
import api from "../api";
import Section from "../components/Section";
import Reveal from "../components/Reveal";

const CRAFT = [
  ["01", "Full-grain leather", "Hides chosen for grain, density and the way they age."],
  ["02", "Cut & stitched by hand", "Every piece is shaped and finished by our artisans in Sialkot."],
  ["03", "Checked before dispatch", "Stitching, hardware and edges are inspected one last time."],
  ["04", "Cash on delivery", "Pay the courier only after you open and check your parcel."],
];

const COLLECTIONS = [
  { to: "/for-him", key: "him", label: "For Him", note: "Belts, bifolds, card holders" },
  { to: "/for-her", key: "her", label: "For Her", note: "Compact wallets, pouches" },
  { to: "/gift-packs", key: "gift", label: "Gift Packs", note: "Ready-to-give sets" },
];

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [tiles, setTiles] = useState({});

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
    // collection tiles use real catalogue imagery
    ["him", "her", "gift"].forEach((s) => {
      api.get(`/products?section=${s}`)
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : [];
          const img = list.find((p) => p.images?.[0]?.url)?.images?.[0]?.url || "";
          setTiles((t) => ({ ...t, [s]: img }));
        })
        .catch(() => {});
    });
  }, []);

  return (
    <div>
      <section className="relative flex min-h-[560px] items-end overflow-hidden sm:min-h-[660px] lg:min-h-[720px]">
        {settings?.heroImage ? (
          <img src={settings.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(135deg,#7d6248_0%,#4f3822_55%,#2b1a10_100%)]" />
        )}
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/15" />

        <div className="shell relative w-full pb-14 text-[#f6efe6] sm:pb-16 lg:pb-20">
          <Reveal>
            <div className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#d8c9a8]">
              Handmade in Sialkot · Full-grain leather
            </div>
            <h1 className="mt-5 max-w-[16ch] font-serif text-[40px] font-normal leading-[1.03] tracking-[-.02em] text-white sm:text-[62px] lg:text-[74px]">
              Leather goods worth keeping.
            </h1>
            <p className="mt-5 max-w-[480px] text-[15px] leading-relaxed text-[#e6d9c6] sm:text-[16px]">
              Belts, wallets and bags cut and stitched by hand — delivered anywhere in Pakistan with cash on delivery.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/for-him" className="btn btn-light">
                Shop the collection <ArrowRight size={14} />
              </Link>
              <Link to="/custom-order" className="btn border border-white/35 text-[#f6efe6] hover:bg-white/10">
                Custom order
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#d8c9a8]">
              <span className="inline-flex items-center gap-2"><Banknote size={13} /> Cash on delivery</span>
              <span className="inline-flex items-center gap-2"><PackageOpen size={13} /> Open before you pay</span>
              <span className="inline-flex items-center gap-2"><Truck size={13} /> Nationwide delivery</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- collections ---------- */}
      <section className="shell py-16 sm:py-24">
        <Reveal className="mb-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="eyebrow">Shop by collection</div>
              <h2 className="mt-3 mb-0 font-serif text-[32px] font-normal leading-none sm:text-[44px]">
                Find your everyday carry
              </h2>
            </div>
            <p className="lede max-w-[380px]">
              Three curated edits, one level of craft. Made in small batches so every piece keeps its character.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.key} delay={i * 90}>
              <Link
                to={c.to}
                className="group relative block aspect-[4/3] overflow-hidden rounded-[18px] border border-line no-underline sm:aspect-[3/4]"
              >
                {tiles[c.key] ? (
                  <img
                    src={tiles[c.key]}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,.9,.25,1)] group-hover:scale-[1.07]"
                  />
                ) : (
                  <span aria-hidden="true" className="block h-full w-full bg-[linear-gradient(150deg,#e8dabd,#cdb692)]" />
                )}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <span className="block font-serif text-[26px] leading-none text-white sm:text-[30px]">{c.label}</span>
                  <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[.2em] text-[#e0d2ba]">
                    {c.note}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white">
                    Explore
                    <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- craft ---------- */}
      <section className="surface-deep border-y border-line">
        <div className="shell grid grid-cols-1 items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-[20px] border border-line bg-[#e9dcc0]">
              {settings?.heroImage ? (
                <img src={settings.heroImage} alt="Isaavi Leather workshop" className="h-full w-full object-cover" />
              ) : (
                <span aria-hidden="true" className="block aspect-[4/3] w-full bg-[linear-gradient(150deg,#e3d3b2,#c9b28c)]" />
              )}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="eyebrow">The Isaavi standard</div>
            <h2 className="mt-3 mb-4 font-serif text-[32px] font-normal leading-tight sm:text-[44px]">
              Made slowly, made to last
            </h2>
            <p className="lede max-w-[540px]">
              We keep our batches small so every belt, wallet and bag gets the time it deserves: edges burnished by hand,
              stitching that follows the grain, hardware that will not give up.
            </p>

            <ol className="mt-9 grid grid-cols-1 gap-x-8 gap-y-6 p-0 sm:grid-cols-2">
              {CRAFT.map(([n, title, note]) => (
                <li key={n} className="flex gap-4">
                  <span className="font-serif text-[22px] leading-none text-gold-dark">{n}</span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold uppercase tracking-[.12em] text-ink">{title}</span>
                    <span className="mt-1.5 block text-[13px] leading-relaxed text-muted">{note}</span>
                  </span>
                </li>
              ))}
            </ol>

            <Link to="/custom-order" className="btn btn-primary mt-9">
              Start a custom order <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- catalogue ---------- */}
      <div className="shell py-16 sm:py-24">
        <Section section="him" limit={10} />
        <Section section="her" limit={10} />
        <Section section="gift" limit={5} />
      </div>

      {/* ---------- custom order band ---------- */}
      <section className="shell pb-4 sm:pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] bg-ink px-6 py-14 text-center text-[#f3ebe0] sm:px-12 sm:py-20">
            <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-brown/60 blur-3xl" />
            <div className="relative mx-auto max-w-[620px]">
              <div className="text-[10px] font-semibold uppercase tracking-[.24em] text-[#d8c9a8]">Made only for you</div>
              <h2 className="mt-4 mb-0 font-serif text-[32px] font-normal leading-tight text-white sm:text-[46px]">
                Have something else in mind?
              </h2>
              <p className="mx-auto mt-4 mb-0 max-w-[520px] text-[14.5px] leading-relaxed text-[#cbbb9f]">
                Laptop bags, school bags, jackets or a one-off piece. Send your idea and our team confirms the price and
                timeline before any work starts — no advance payment, cash on delivery.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/custom-order" className="btn btn-light">
                  Start a custom order <ArrowRight size={14} />
                </Link>
                <Link to="/gift-packs" className="btn border border-white/30 text-[#f6efe6] hover:bg-white/10">
                  See gift packs
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
