import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ProductCard from "./ProductCard";

const TITLES = { him: "For Him", her: "For Her", gift: "Gift Packs" };
const LINKS = { him: "/for-him", her: "/for-her", gift: "/gift-packs" };

export default function Section({ section, limit = 10 }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`/products?section=${section}`)
      .then((r) => setProducts((Array.isArray(r.data) ? r.data : []).slice(0, limit)))
      .catch(() => setProducts([]));
  }, [section, limit]);

  if (!products.length) return null;

  return (
    <section className="mb-[76px]">
      <div className="relative flex justify-between items-end border-b border-line pb-4 mb-6 after:content-[''] after:absolute after:left-0 after:-bottom-px after:w-[60px] after:h-[2px] after:bg-gold">
        <h2 className="font-serif text-[36px] font-normal m-0">{TITLES[section]}</h2>
        <Link to={LINKS[section]} className="text-muted no-underline text-[10px] tracking-[.18em] uppercase font-semibold pb-1 border-b border-transparent hover:text-ink hover:border-gold transition-colors">
          View all
        </Link>
      </div>
     <div className="product-grid">
        {products.map((p) => <ProductCard key={p._id} p={p} />)}
      </div>
    </section>
  );
}