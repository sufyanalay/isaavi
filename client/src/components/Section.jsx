import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import Reveal from "./Reveal";

const TITLES = { him: "For Him", her: "For Her", gift: "Gift Packs" };
const EYEBROWS = { him: "Handmade for him", her: "Handmade for her", gift: "Ready to gift" };
const LINKS = { him: "/for-him", her: "/for-her", gift: "/gift-packs" };

export default function Section({ section, limit = 10 }) {
  const key = `${section}:${limit}`;
  const [data, setData] = useState({ key: null, products: [] });
  const loading = data.key !== key;

  useEffect(() => {
    let active = true;
    api.get(`/products?section=${section}`)
      .then((r) => {
        if (active) setData({ key, products: (Array.isArray(r.data) ? r.data : []).slice(0, limit) });
      })
      .catch(() => {
        if (active) setData({ key, products: [] });
      });
    return () => { active = false; };
  }, [section, limit, key]);

  if (!loading && !data.products.length) return null;

  return (
    <section className="mb-16 sm:mb-24">
      <Reveal className="mb-7">
        <div className="relative flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5 after:absolute after:-bottom-px after:left-0 after:h-px after:w-[64px] after:bg-gold after:content-['']">
          <div>
            <div className="eyebrow">{EYEBROWS[section]}</div>
            <h2 className="mt-2 mb-0 font-serif text-[30px] font-normal leading-none sm:text-[38px]">{TITLES[section]}</h2>
          </div>
          <Link to={LINKS[section]} className="link-gold group inline-flex items-center gap-2 pb-1 text-[10px] font-semibold uppercase tracking-[.2em] text-muted transition-colors hover:text-ink">
            View all
            <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Reveal>

      {loading ? (
        <ProductSkeleton count={4} />
      ) : (
        <Reveal delay={80}>
          <div className="product-grid">
            {data.products.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        </Reveal>
      )}
    </section>
  );
}
