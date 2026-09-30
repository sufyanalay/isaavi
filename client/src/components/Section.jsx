import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import Reveal from "./Reveal";

const TITLES = { him: "For Him", her: "For Her", gift: "Gift Packs" };
const EYEBROWS = { him: "Handmade for him", her: "Handmade for her", gift: "Ready to gift" };
const LINKS = { him: "/for-him", her: "/for-her", gift: "/gift-packs" };
const NOTES = {
  him: "Belts, bifolds and card holders cut from full-grain hides.",
  her: "Compact wallets, pouches and bags burnished by hand.",
  gift: "Coordinated sets, wrapped and ready to give.",
};

export default function Section({ section, limit = 10, index = "", note }) {
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
        <div className="relative flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-line pb-5 after:absolute after:-bottom-px after:left-0 after:h-px after:w-[64px] after:bg-gold after:content-['']">
          <div className="flex items-start gap-4 sm:gap-5">
            {index && (
              <span aria-hidden="true" className="pt-1 font-serif text-[22px] leading-none text-gold-dark tabular-nums sm:text-[26px]">
                {index}
              </span>
            )}
            <div>
              <div className="eyebrow">{EYEBROWS[section]}</div>
              <h2 className="mt-2 mb-0 font-serif text-[30px] font-normal leading-none sm:text-[38px]">{TITLES[section]}</h2>
              <p className="lede mb-0 mt-2.5 max-w-[440px] text-[13.5px]">{note || NOTES[section]}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 pb-1">
            {!loading && (
              <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-muted tabular-nums">
                {data.products.length} {data.products.length === 1 ? "piece" : "pieces"}
              </span>
            )}

            <Link to={LINKS[section]} className="link-gold group inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-muted transition-colors hover:text-ink">
              View all
              <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <ProductSkeleton count={limit} gridClass="edit-grid" />
      ) : (
        <div className="edit-grid">
          {data.products.map((p, i) => (
            <Reveal key={p._id} delay={Math.min(i, 5) * 60}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
