import { useState, useEffect } from "react";
import { Pencil, Trash2, Upload, ImageOff } from "lucide-react";
import api from "../api";

const SECTIONS = ["him", "her", "gift"];
const TYPES = ["wallet", "belt", "card", "pouch", "pack"];
const BLANK = { name: "", price: "", comparePrice: "", sections: [], type: "wallet", design: "As shown", description: "" };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.get("/products").then((r) => setProducts(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { load(); }, []);

  const toggleSection = (s) =>
    setForm((f) => ({ ...f, sections: f.sections.includes(s) ? f.sections.filter((x) => x !== s) : [...f.sections, s] }));

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      comparePrice: p.comparePrice || "",
      sections: p.sections,
      type: p.type,
      design: p.design,
      description: p.description || "",
    });
    setFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(null); setForm(BLANK); setFiles([]); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price || !form.sections.length) return setError("Name, price and at least one section are required");
    if (form.comparePrice && Number(form.comparePrice) <= Number(form.price)) {
      return setError("Original price must be higher than the selling price (or leave it empty)");
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("comparePrice", form.comparePrice || 0);
      fd.append("type", form.type);
      fd.append("design", form.design);
      fd.append("description", form.description);
      fd.append("sections", JSON.stringify(form.sections));
      files.forEach((f) => fd.append("images", f));

      if (editingId) await api.put(`/products/${editingId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      else await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });

      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => { if (!confirm("Delete this product?")) return; await api.delete(`/products/${id}`); load(); };

  const inputCls = "w-full rounded-md border border-line bg-[#fbfaf7] px-3 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm";
  const labelCls = "block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5";

  return (
    <>
      <div className="border-b border-line bg-white px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="m-0 font-serif text-lg font-medium sm:text-xl">Products</h1>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 p-4 sm:p-6 lg:grid-cols-[340px_1fr] lg:p-8 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="rounded-lg border border-line bg-white p-4 sm:p-5">
          <h3 className="mt-0 mb-4 text-base font-semibold">{editingId ? "Edit Product" : "Add New Product"}</h3>
          {error && <div className="bg-red-50 text-red-700 text-sm rounded p-2.5 mb-3.5">{error}</div>}

          <label className="block mb-4">
            <span className={labelCls}>Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </label>

          <div className="grid grid-cols-2 gap-3 mb-1">
            <label className="block mb-4">
              <span className={labelCls}>Price (Rs.)</span>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} />
            </label>
            <label className="block mb-4">
              <span className={labelCls}>Original (Rs.)</span>
              <input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} placeholder="Optional" className={inputCls} />
            </label>
          </div>
          <p className="text-[11px] text-muted -mt-2 mb-4">Fill "Original" with a higher price to show a SALE badge and % OFF on the product card.</p>

          <label className="block mb-4">
            <span className={labelCls}>Type</span>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <div className="mb-4">
            <span className={labelCls}>Sections</span>
            <div className="flex gap-4 flex-wrap">
              {SECTIONS.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.sections.includes(s)} onChange={() => toggleSection(s)} />
                  {s === "him" ? "For Him" : s === "her" ? "For Her" : "Gift Packs"}
                </label>
              ))}
            </div>
          </div>

          <label className="block mb-4">
            <span className={labelCls}>Description</span>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </label>

          <div className="mb-4">
            <span className={labelCls}>Images {editingId ? "(add more — front, back, sides)" : "(select 3–5: front, back, sides)"}</span>
            <input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} className="mt-1.5 w-full text-sm" />
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-brown px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink disabled:opacity-60">
              <Upload size={14} /> {busy ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="px-4 py-2.5 rounded-md text-sm border border-line hover:bg-gray-50">Cancel</button>
            )}
          </div>
        </form>

        <div>
          <h3 className="mb-3.5 text-base font-semibold">All Products ({products.length})</h3>
          {!products.length && <div className="text-center text-muted py-16 text-sm">No products yet — add your first one.</div>}
          {products.map((p) => (
            <div key={p._id} className="mb-2.5 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-3.5">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#f0ebe0]">
                {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <ImageOff size={16} className="text-gray-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium break-anywhere">{p.name}</div>
                <div className="mt-1.5">
                  {p.sections.map((s) => <span key={s} className="inline-block text-[10px] uppercase bg-[#eee5d8] text-muted px-2 py-0.5 rounded-full mr-1">{s}</span>)}
                  <span className="inline-block text-[10px] uppercase bg-[#eee5d8] text-muted px-2 py-0.5 rounded-full">{p.type}</span>
                </div>
              </div>
              <div className="ml-auto text-right sm:ml-0 sm:min-w-[90px]">
                <div className="font-semibold">Rs. {p.price.toLocaleString()}</div>
                {p.comparePrice > p.price && <div className="text-xs text-muted line-through">Rs. {p.comparePrice.toLocaleString()}</div>}
              </div>
              <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-[#eee5d8] text-muted hover:text-ink" aria-label="Edit"><Pencil size={16} /></button>
              <button onClick={() => remove(p._id)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}