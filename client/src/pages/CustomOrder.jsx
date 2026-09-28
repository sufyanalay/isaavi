import { useEffect, useState } from "react";
import api from "../api";

export default function CustomOrder() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ itemType: "", color: "", leatherType: "Standard Cowhide", description: "" });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [contact, setContact] = useState({ name: "", phone: "" });

  const inputCls = "w-full border border-line rounded p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold";
  const labelCls = "block text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5";

  useEffect(() => {
    api.get("/settings").then((r) => {
      setSettings(r.data);
      setForm((f) => ({ ...f, itemType: r.data.customOrderTypes[0], color: r.data.colors[0] }));
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!contact.name || !contact.phone || !form.description) return setError("Name, phone and design idea are required");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", contact.name);
      fd.append("phone", contact.phone);
      fd.append("itemType", form.itemType);
      fd.append("color", form.color);
      fd.append("leatherType", form.leatherType);
      fd.append("description", form.description);
      if (file) fd.append("image", file);

      const { data } = await api.post("/orders/custom", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setDone(data.orderNumber);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong sending your request");
    } finally {
      setBusy(false);
    }
  };

  if (!settings) return null;

  if (done)
    return (
      <main className="max-w-[1180px] mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-3xl">Thank you!</h1>
        <p className="text-muted">Your request has been received. Order ID: <b>{done}</b></p>
        <p className="text-muted">Our team will call you soon to confirm price and timeline.</p>
      </main>
    );

  return (
    <main className="max-w-[720px] mx-auto px-6 pt-8 pb-16">
      <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">Made Only For You</div>
      <h1 className="font-serif text-4xl font-normal mb-3.5">Custom leather order</h1>
      <p className="text-muted">
        Beyond wallets, belts and card holders, we handcraft laptop bags, school bags, jackets and one-off pieces.
        Tell us what you want, attach a photo of the design you have in mind, and our team will confirm the price
        and timeline before any work starts. No advance payment — custom pieces also ship Cash on Delivery.
      </p>

      <form onSubmit={submit} className="bg-card p-6 rounded mt-5">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <label><span className={labelCls}>Your name</span><input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={inputCls} /></label>
          <label><span className={labelCls}>Phone</span><input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="03XX XXXXXXX" className={inputCls} /></label>
        </div>

        <label className="block mb-3.5">
          <span className={labelCls}>What should we make?</span>
          <select value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })} className={inputCls}>
            {settings.customOrderTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
          <label>
            <span className={labelCls}>Preferred colour</span>
            <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls}>
              {settings.colors.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span className={labelCls}>Leather type</span>
            <select value={form.leatherType} onChange={(e) => setForm({ ...form, leatherType: e.target.value })} className={inputCls}>
              {settings.leatherTypes.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>

        <label className="block mb-3.5">
          <span className={labelCls}>Describe your design idea</span>
          <textarea rows={4} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Size, pockets, stitching colour, embossing, buckle style, deadline..." className={inputCls} />
          <div className="text-right text-[11px] text-muted">{form.description.length}/1000</div>
        </label>

        <label className="block mb-4">
          <span className={labelCls}>Reference image (optional)</span>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </label>

        <button disabled={busy} className="w-full bg-brown text-[#f3ebe0] py-3 text-xs font-semibold uppercase tracking-wide rounded-sm hover:bg-ink transition-colors disabled:opacity-60">
          {busy ? "Sending..." : "Send custom request"}
        </button>
        <p className="text-[11px] text-muted mt-2.5">
          Custom requests are sent directly to our team — we'll call you to confirm the final price before production begins.
        </p>
      </form>
    </main>
  );
}