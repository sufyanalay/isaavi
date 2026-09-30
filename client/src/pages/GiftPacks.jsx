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
      <section className="surface-deep border-b border-line">
        <div className="shell pb-8 pt-8 sm:pb-10 sm:pt-10">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <Link to="/" className="link-gold no-underline">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-ink">Gift Packs</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Ready to gift</div>
              <h1 className="mt-3 mb-0 font-serif text-[34px] font-normal leading-none sm:text-[48px]">Gift Packs</h1>
            </div>
            <p className="lede max-w-[440px]">
              Coordinated sets, wrapped by hand. Add our leather gift bag at checkout and we will leave the price slip out.
            </p>
          </div>
        </div>
      </section>

      <div className="shell">
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
