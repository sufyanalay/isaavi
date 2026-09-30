import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import Reveal from "../components/Reveal";

const CHIP_SETS = {
  him: [["all", "All"], ["wallet", "Wallets"], ["belt", "Belts"], ["card", "Cards"], ["pack", "Packs"]],
  her: [["all", "All"], ["card", "Cards"], ["pouch", "Pouches"], ["pack", "Packs"]],
};
const TITLES = { him: "For Him", her: "For Her" };
const EYEBROWS = { him: "Menswear leather", her: "Womenswear leather" };

export default function Collection({ section }) {
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("featured");
  const [data, setData] = useState({ section: null, products: [] });
  const loading = data.section !== section;
  const products = data.products;

  // the route element is reused when switching For Him <-> For Her, so reset the controls on render
  if (loading) {
    if (type !== "all") setType("all");
    if (sort !== "featured") setSort("featured");
  }

  useEffect(() => {
    let active = true;
    api.get(`/products?section=${section}`)
      .then((r) => {
        if (active) setData({ section, products: Array.isArray(r.data) ? r.data : [] });
      })
      .catch(() => {
        if (active) setData({ section, products: [] });
      });
    return () => { active = false; };
  }, [section]);

  const filtered = type === "all" ? products : products.filter((p) => p.type === type);
  const shown = [...filtered].sort((a, b) =>
    sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0
  );
  const chips = CHIP_SETS[section] || CHIP_SETS.him;

  return (
    <main className="pb-16 sm:pb-24">
      <section className="surface-deep border-b border-line">
        <div className="shell pb-8 pt-8 sm:pb-10 sm:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <Link to="/" className="link-gold no-underline">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink">{TITLES[section]}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">{EYEBROWS[section]}</div>
              <h1 className="mt-3 mb-0 font-serif text-[34px] font-normal leading-none sm:text-[48px]">
                {TITLES[section]}
              </h1>
            </div>
            <p className="lede max-w-[420px]">
              Hand-cut, hand-stitched and finished in Sialkot. Open your parcel before you pay — cash on delivery, nationwide.
            </p>
          </div>
        </div>
      </section>

      <div className="shell">
        <div className="flex flex-col gap-4 border-b border-line py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {chips.map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setType(k)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[.14em] transition-all duration-300 ${
                  type === k
                    ? "border-ink bg-ink text-[#f7f2e8]"
                    : "border-line bg-card text-muted hover:border-gold hover:text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-[11px] uppercase tracking-[.14em] text-muted">
              {loading ? "Loading…" : `${shown.length} ${shown.length === 1 ? "piece" : "pieces"}`}
            </span>
            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[.14em] text-muted">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-line bg-card px-3 py-2 text-base text-ink focus:border-gold focus:outline-none sm:text-[12px]"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        <div className="pt-10 sm:pt-14">
          {loading ? (
            <ProductSkeleton count={8} />
          ) : !shown.length ? (
            <Reveal>
              <div className="card mx-auto max-w-[560px] px-6 py-14 text-center">
                <h2 className="m-0 font-serif text-[26px]">Nothing here yet</h2>
                <p className="lede mx-auto mt-3 max-w-[400px]">
                  No pieces in this category right now. Try another filter, or ask us to handcraft it for you.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <button type="button" onClick={() => setType("all")} className="btn btn-primary">Show all</button>
                  <Link to="/custom-order" className="btn btn-outline">Request a custom piece</Link>
                </div>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <div className="product-grid">
                {shown.map((p) => <ProductCard key={p._id} p={p} />)}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </main>
  );
}
