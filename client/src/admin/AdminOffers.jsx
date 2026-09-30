import { useState, useEffect } from "react";
import { Pencil, Trash2, Power, Plus, Tag } from "lucide-react";
import api from "../api";

const BLANK = { title: "", discountText: "", description: "", terms: "", isActive: true };

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    api.get("/offers/all").then((r) => setOffers(Array.isArray(r.data) ? r.data : [])).catch(() => setOffers([]));
  useEffect(() => { load(); }, []);

  const startEdit = (o) => {
    setEditingId(o._id);
    setForm({
      title: o.title,
      discountText: o.discountText || "",
      description: o.description || "",
      terms: o.terms || "",
      isActive: o.isActive,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(null); setForm(BLANK); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Offer title is required");
    setBusy(true);
    try {
      /* offers me image nahi — plain JSON body */
      const payload = {
        title: form.title.trim(),
        discountText: form.discountText.trim(),
        description: form.description,
        terms: form.terms,
        isActive: form.isActive,
      };

      if (editingId) await api.put(`/offers/${editingId}`, payload);
      else await api.post("/offers", payload);

      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (o) => { await api.put(`/offers/${o._id}`, { isActive: !o.isActive }); load(); };
  const remove = async (id) => {
    if (!confirm("Delete this offer?")) return;
    await api.delete(`/offers/${id}`);
    load();
  };

  const inputCls = "w-full rounded-md border border-line bg-[#fbfaf7] px-3 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm";
  const labelCls = "block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5";

  return (
    <>
      <div className="border-b border-line bg-white px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="m-0 font-serif text-lg font-medium sm:text-xl">Offers</h1>
        <p className="mt-1 mb-0 text-xs text-muted">
          Active offers run in the top bar ticker. No images — just the title, a short badge and the details.
          Never put promo codes here — share those privately.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 p-4 sm:p-6 lg:grid-cols-[340px_1fr] lg:p-8 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="rounded-lg border border-line bg-white p-4 sm:p-5">
          <h3 className="mt-0 mb-4 text-base font-semibold">{editingId ? "Edit offer" : "New offer"}</h3>

          {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

          <label className="mb-4 block">
            <span className={labelCls}>Title</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Monsoon wallet week" className={inputCls} />
          </label>

          <label className="mb-4 block">
            <span className={labelCls}>Discount badge</span>
            <input
              value={form.discountText}
              onChange={(e) => setForm({ ...form, discountText: e.target.value })}
              placeholder="20% OFF"
              className={inputCls}
            />
          </label>

          <label className="mb-4 block">
            <span className={labelCls}>Description</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What the offer gives, and which pieces it applies to."
              className={inputCls}
            />
          </label>

          <label className="mb-4 block">
            <span className={labelCls}>Terms</span>
            <textarea
              rows={4}
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              placeholder="One code per order · valid till 30 Sept · cash on delivery only"
              className={inputCls}
            />
          </label>

          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active — show this offer in the top bar ticker
          </label>

          <div className="flex flex-wrap gap-2.5">
            <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-brown px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink disabled:opacity-60">
              <Plus size={14} /> {busy ? "Saving..." : editingId ? "Update Offer" : "Add Offer"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-md border border-line px-4 py-2.5 text-sm hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div>
          <h3 className="mb-3.5 text-base font-semibold">All offers ({offers.length})</h3>
          {!offers.length && <div className="py-16 text-center text-sm text-muted">No offers yet — publish your first one.</div>}

          {offers.map((o) => (
            <div key={o._id} className="mb-2.5 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-3.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#f0ebe0]">
                <Tag size={16} className="text-[#8f6b31]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-medium break-anywhere">{o.title}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {o.discountText && (
                    <span className="rounded-full bg-[#eee5d8] px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                      {o.discountText}
                    </span>
                  )}
                  {o.description && <span className="min-w-0 truncate text-xs text-muted">{o.description}</span>}
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                  o.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                }`}
              >
                {o.isActive ? "Active" : "Inactive"}
              </span>

              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(o)} className="rounded p-1.5 text-muted hover:bg-[#eee5d8] hover:text-ink" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => toggle(o)}
                  className="rounded p-1.5 text-muted hover:bg-[#eee5d8] hover:text-ink"
                  aria-label={o.isActive ? "Deactivate" : "Activate"}
                >
                  <Power size={16} />
                </button>
                <button onClick={() => remove(o._id)} className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
