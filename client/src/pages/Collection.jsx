import { useEffect, useState } from "react";
import api from "../api";
import ProductCard from "../components/ProductCard";

const CHIP_SETS = {
  him: [["all", "All"], ["wallet", "Wallets"], ["belt", "Belts"], ["card", "Cards"], ["pack", "Packs"]],
  her: [["all", "All"], ["card", "Cards"], ["pouch", "Pouches"], ["pack", "Packs"]],
};
const TITLES = { him: "For Him", her: "For Her" };

export default function Collection({ section }) {
  const [products, setProducts] = useState([]);
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    setType("all");
    setSort("featured");
    api.get(`/products?section=${section}`)
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]));
  }, [section]);

  const filtered = type === "all" ? products : products.filter((p) => p.type === type);
  const shown = [...filtered].sort((a, b) =>
    sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0
  );
  const chips = CHIP_SETS[section] || CHIP_SETS.him;

  return (
    <main className="max-w-[1180px] mx-auto px-6 pt-8 pb-12">
      <div className="flex justify-between items-end flex-wrap gap-4 border-b border-line pb-4 mb-5">
        <div>
          <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">The Collection</div>
          <h1 className="font-serif text-4xl font-normal m-0">{TITLES[section]}</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {chips.map(([k, l]) => (
            <button
              key={k}
              onClick={() => setType(k)}
              className={`border rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                type === k ? "bg-ink text-[#f3ebe0] border-ink" : "bg-white text-muted border-line hover:border-ink"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 text-sm">
        <span className="text-muted">{shown.length} {shown.length === 1 ? "product" : "products"}</span>
        <label className="flex items-center gap-2 text-muted">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-line rounded bg-white px-2.5 py-1.5 text-ink text-sm focus:outline-none focus:border-gold"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </label>
      </div>

      {!shown.length ? (
        <p className="text-muted py-10">No products in this category yet.</p>
      ) : (
        <div className="product-grid">
          {shown.map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
      )}
    </main>
  );
}