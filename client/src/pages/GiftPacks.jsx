import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift } from "lucide-react";
import api from "../api";
import ProductCard from "../components/ProductCard";
import ProductSkeleton from "../components/ProductSkeleton";
import Reveal from "../components/Reveal";

export default function GiftPacks() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products?section=gift")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="pb-16 sm:pb-24">
      <div className="shell pt-6 sm:pt-8">
        <h1 className="sr-only">Gift Packs</h1>

        <div className="flex items-center justify-between gap-4 py-5">
          <span className="text-[11px] uppercase tracking-[.14em] text-muted">
            {loading ? "Loading…" : `${products.length} ${products.length === 1 ? "set" : "sets"}`}
          </span>
          <Link
            to="/custom-order"
            className="link-gold text-[11px] font-semibold uppercase tracking-[.14em] text-muted transition-colors hover:text-ink"
          >
            Need a custom gift?
          </Link>
        </div>

        <div className="pt-4 sm:pt-6">
          {loading ? (
            <ProductSkeleton count={4} />
          ) : !products.length ? (
            <Reveal>
              <div className="card mx-auto max-w-[600px] px-6 py-14 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/40 bg-card text-gold-dark">
                  <Gift size={22} />
                </span>
                <h2 className="mt-5 mb-0 font-serif text-[26px]">No gift packs yet</h2>
                <p className="lede mx-auto mt-3 max-w-[430px]">
                  New coordinated sets are on the way. In the meantime, browse the collection or ask us to build a custom gift.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link to="/for-him" className="btn btn-primary">Shop For Him</Link>
                  <Link to="/custom-order" className="btn btn-outline">Request a custom gift</Link>
                </div>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <div className="product-grid">
                {products.map((p) => <ProductCard key={p._id} p={p} />)}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </main>
  );
}
