import { useState, useEffect } from "react";
import { Pencil, Trash2, Power, Plus } from "lucide-react";
import api from "../api";

const BLANK = {
  code: "",
  discountType: "percent",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiresAt: "",
  usageLimit: "",
  isActive: true,
};

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /* "abhi" wala time render ke andar nahi nikalte — load par set hota hai, warna render impure ho jata */
  const [now, setNow] = useState(0);

  const load = () => {
    setNow(Date.now());
    return api.get("/promos").then((r) => setPromos(Array.isArray(r.data) ? r.data : [])).catch(() => setPromos([]));
  };
  useEffect(() => { load(); }, []);

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      code: p.code,
      discountType: p.discountType,
      discountValue: p.discountValue,
      minOrderAmount: p.minOrderAmount || "",
      maxDiscount: p.maxDiscount || "",
      expiresAt: p.expiresAt ? String(p.expiresAt).slice(0, 10) : "",
      usageLimit: p.usageLimit || "",
      isActive: p.isActive,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEdit = () => { setEditingId(null); setForm(BLANK); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.code.trim()) return setError("Promo code is required");
    setBusy(true);
    try {
      if (editingId) await api.put(`/promos/${editingId}`, form);
      else await api.post("/promos", form);
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (p) => { await api.put(`/promos/${p._id}`, { isActive: !p.isActive }); load(); };
  const remove = async (id) => {
    if (!confirm("Delete this promo code?")) return;
    await api.delete(`/promos/${id}`);
    load();
  };

  const inputCls = "w-full rounded-md border border-line bg-[#fbfaf7] px-3 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm";
  const labelCls = "block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5";
  const value = (p) =>
    p.discountType === "percent"
      ? `${p.discountValue}% off${p.maxDiscount ? ` (max Rs. ${p.maxDiscount.toLocaleString()})` : ""}`
      : `Rs. ${p.discountValue.toLocaleString()} off`;
  const expired = (p) => Boolean(p.expiresAt) && new Date(p.expiresAt).getTime() < now;

  return (
    <>
      <div className="border-b border-line bg-white px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="m-0 font-serif text-lg font-medium sm:text-xl">Promo Codes</h1>
        <p className="mt-1 mb-0 text-xs text-muted">
          Codes are never shown on the website — share them privately on social media.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 p-4 sm:p-6 lg:grid-cols-[340px_1fr] lg:p-8 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="rounded-lg border border-line bg-white p-4 sm:p-5">
          <h3 className="mt-0 mb-4 text-base font-semibold">{editingId ? "Edit promo code" : "New promo code"}</h3>

          {error && <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}

          <label className="mb-4 block">
            <span className={labelCls}>Code</span>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="ISA10"
              className={`${inputCls} font-semibold tracking-wide uppercase`}
            />
          </label>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls}>Type</span>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className={inputCls}>
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (Rs.)</option>
              </select>
            </label>
            <label className="block">
              <span className={labelCls}>Value</span>
              <input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                placeholder={form.discountType === "percent" ? "10" : "500"}
                className={inputCls}
              />
            </label>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls}>Min order (Rs.)</span>
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                placeholder="Optional"
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className={labelCls}>Max discount (Rs.)</span>
              <input
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                placeholder={form.discountType === "percent" ? "Optional cap" : "—"}
                disabled={form.discountType !== "percent"}
                className={`${inputCls} disabled:opacity-50`}
              />
            </label>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls}>Expires on</span>
              <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Usage limit</span>
              <input
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="Unlimited"
                className={inputCls}
              />
            </label>
          </div>

          <label className="mb-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active — customers can use this code
          </label>

          <div className="flex flex-wrap gap-2.5">
            <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-brown px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink disabled:opacity-60">
              <Plus size={14} /> {busy ? "Saving..." : editingId ? "Update Code" : "Add Code"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-md border border-line px-4 py-2.5 text-sm hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div>
          <h3 className="mb-3.5 text-base font-semibold">All codes ({promos.length})</h3>
          {!promos.length && <div className="py-16 text-center text-sm text-muted">No promo codes yet — create your first one.</div>}

          {promos.map((p) => (
            <div key={p._id} className="mb-2.5 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white p-3.5">
              <div className="min-w-[132px]">
                <div className="font-mono text-sm font-bold tracking-wide">{p.code}</div>
                <div className="mt-1 text-xs text-muted">{value(p)}</div>
              </div>

              <div className="min-w-0 flex-1 text-xs text-muted">
                {p.minOrderAmount > 0 && <span className="mr-3">Min order Rs. {p.minOrderAmount.toLocaleString()}</span>}
                <span className="mr-3">Used {p.usedCount}{p.usageLimit > 0 ? `/${p.usageLimit}` : ""}</span>
                {p.expiresAt && (
                  <span className={expired(p) ? "font-semibold text-red-600" : ""}>
                    Expires {new Date(p.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                  p.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                }`}
              >
                {p.isActive ? "Active" : "Inactive"}
              </span>

              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(p)} className="rounded p-1.5 text-muted hover:bg-[#eee5d8] hover:text-ink" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => toggle(p)}
                  className="rounded p-1.5 text-muted hover:bg-[#eee5d8] hover:text-ink"
                  aria-label={p.isActive ? "Deactivate" : "Activate"}
                >
                  <Power size={16} />
                </button>
                <button onClick={() => remove(p._id)} className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete">
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
