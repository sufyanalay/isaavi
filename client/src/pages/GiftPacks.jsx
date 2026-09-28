import { useEffect, useState } from "react";
import api from "../api";
import ProductCard from "../components/ProductCard";

export default function GiftPacks() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api.get("/products?section=gift")
      .then((r) => setProducts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <main className="wrap" style={{ paddingTop: 30, paddingBottom: 40 }}>
      <div className="lbl" style={{ color: "var(--muted)", marginBottom: 6 }}>Ready to Gift</div>
      <h1 className="serif" style={{ fontSize: 40, fontWeight: 400, margin: 0 }}>Gift Packs</h1>
      <p style={{ color: "var(--muted)", maxWidth: 480, margin: "14px 0" }}>Two-piece sets and premium tri-packs, coordinated and gift-ready.</p>
      <div className="lbl" style={{ borderBottom: "1px solid var(--line)", paddingBottom: 18, marginBottom: 24 }}>{products.length} designs</div>

      {!products.length ? (
        <div className="adm-empty" style={{ padding: "20px 0" }}>No gift packs added yet.</div>
      ) : (
        <div className="grid">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
      )}
    </main>
  );
}