import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Palette,
  PenLine,
  Phone,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import api from "../api";

const PHONE_RE = /^(\+?92|0)?3\d{9}$/;
const MAX_MB = 6;
const EYEBROW = "text-[10px] tracking-[.18em] uppercase font-semibold text-muted";

const STEPS = [
  [PenLine, "Send your idea", "Describe the piece and attach a reference photo."],
  [Phone, "We confirm price", "Our team calls you with the final price and timeline."],
  [Truck, "Handmade & delivered", "Cash on Delivery — pay the courier after checking."],
];

export default function CustomOrder() {
  const [settings, setSettings] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState({ itemType: "", color: "", leatherType: "Standard Cowhide", description: "" });
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  const inputCls =
    "w-full rounded-md border border-line bg-white px-3.5 py-2.5 text-base focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 sm:text-sm";
  const labelCls = "mb-1.5 block text-[10px] tracking-[.18em] uppercase font-semibold text-muted";
  const primaryBtn =
    "inline-flex items-center gap-2 rounded-sm bg-brown px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] no-underline transition-all hover:-translate-y-0.5 hover:bg-ink hover:shadow-lg";
  const ghostBtn =
    "inline-flex items-center gap-2 rounded-sm border border-line bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-ink no-underline transition-all hover:-translate-y-0.5 hover:border-gold";

  useEffect(() => {
    api.get("/settings")
      .then((r) => {
        const s = r.data || {};
        setSettings(s);
        setForm((f) => ({
          ...f,
          itemType: s.customOrderTypes?.[0] || f.itemType,
          color: s.colors?.[0] || f.color,
          leatherType: s.leatherTypes?.[0] || f.leatherType,
        }));
      })
      .catch(() =>
        setLoadError(
          "We could not load the custom order form. Please refresh the page, or message us on WhatsApp with your design idea."
        )
      );
  }, []);

  // free the object URL whenever a different preview takes over
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const clearFile = () => { setFile(null); setPreview(""); setFileError(""); };

  const pickFile = (e) => {
    const f = e.target.files?.[0] || null;
    setFileError("");
    if (!f) return clearFile();
    if (!f.type.startsWith("image/")) {
      e.target.value = ""; // allow re-picking the same file after a failed attempt
      clearFile();
      return setFileError("Please choose an image file (JPG or PNG).");
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      e.target.value = "";
      clearFile();
      return setFileError(`That image is too large — please use one under ${MAX_MB} MB.`);
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!contact.name.trim() || !contact.phone.trim() || !form.description.trim()) {
      return setError("Name, phone and design idea are required.");
    }
    if (!PHONE_RE.test(contact.phone.replace(/[\s-]/g, ""))) {
      return setError("Please enter a valid Pakistani mobile number (e.g. 03XX XXXXXXX).");
    }

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong sending your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* ---------- Loading / load failure ---------- */
  if (!settings)
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1180px] items-center justify-center px-5 py-14 sm:px-6">
        {loadError ? (
          <div className="w-full max-w-[430px] animate-fade-up rounded-xl border border-line bg-card p-6 text-center">
            <AlertCircle size={22} className="mx-auto text-[#a8231a]" />
            <h1 className="mt-3 mb-0 font-serif text-2xl font-medium">Custom orders are unavailable right now</h1>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-muted">{loadError}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-sm bg-brown px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] transition-colors hover:bg-ink"
              >
                Try again
              </button>
              <Link to="/" className={ghostBtn}>Back to shop</Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Loading the custom order form…
          </div>
        )}
      </main>
    );

  /* ---------- Success ---------- */
  if (done)
    return (
      <main className="mx-auto max-w-[1180px] px-5 pt-12 pb-16 sm:px-6">
        <div className="mx-auto max-w-[660px] animate-fade-up text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-line bg-card">
            <CheckCircle2 size={30} className="text-[#2f6b3b]" />
          </div>
          <div className={EYEBROW}>Request received</div>
          <h1 className="mt-2 mb-0 font-serif text-[32px] font-normal sm:text-4xl">
            Thank you{contact.name ? `, ${contact.name.trim().split(" ")[0]}` : ""}!
          </h1>
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted">Request ID</span>
            <b className="text-sm">{done}</b>
          </div>
          <p className="mx-auto mt-4 mb-0 max-w-[470px] text-sm leading-relaxed text-muted">
            Our team will call you at {contact.phone} shortly to confirm the final price and timeline. Nothing is charged
            now — your piece ships Cash on Delivery.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/" className={primaryBtn}>Continue shopping</Link>
            <Link to="/for-him" className={ghostBtn}>Browse the collection</Link>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-4 border-t border-line pt-7 text-left sm:grid-cols-3">
            {STEPS.map(([Icon, title, note], i) => (
              <div key={title} className="rounded-lg border border-line bg-card p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-muted">
                  <Icon size={14} className="text-gold-dark" /> Step {i + 1}
                </div>
                <div className="mt-2 text-sm font-semibold">{title}</div>
                <div className="mt-1 text-[12px] leading-relaxed text-muted">{note}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );

  const types = settings.customOrderTypes || [];
  const colors = settings.colors || [];
  const leathers = settings.leatherTypes || [];

  return (
    <main className="mx-auto max-w-[1180px] px-5 pt-8 pb-16 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
        <Link to="/" className="no-underline text-muted transition-colors hover:text-ink">Home</Link>
        <span className="text-line">/</span>
        <span className="font-medium text-ink">Custom Order</span>
      </nav>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <div className={EYEBROW}>Made only for you</div>
          <h1 className="mt-1.5 mb-3 font-serif text-[32px] font-normal leading-tight sm:text-4xl">Custom leather order</h1>
          <p className="m-0 max-w-[580px] text-sm leading-relaxed text-muted sm:text-[15px]">
            Beyond wallets, belts and card holders we handcraft laptop bags, school bags, jackets and one-off pieces. Tell
            us what you want, attach a photo of the design you have in mind, and our team confirms the price and timeline
            before any work starts.
          </p>

          <form onSubmit={submit} className="mt-6 rounded-xl border border-line bg-card p-5 sm:p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelCls}>Your name</span>
                <input
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  autoComplete="name"
                  placeholder="Ahmed Khan"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className={labelCls}>Phone / WhatsApp</span>
                <input
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="03XX XXXXXXX"
                  className={inputCls}
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className={labelCls}>What should we make?</span>
                <select value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })} className={inputCls}>
                  {types.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>Preferred colour</span>
                <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={inputCls}>
                  {colors.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>Leather type</span>
                <select value={form.leatherType} onChange={(e) => setForm({ ...form, leatherType: e.target.value })} className={inputCls}>
                  {leathers.map((l) => <option key={l}>{l}</option>)}
                </select>
              </label>
            </div>

            <label className="mt-4 block">
              <span className={labelCls}>Describe your design idea</span>
              <textarea
                rows={4}
                maxLength={1000}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Size, pockets, stitching colour, embossing, buckle style, deadline…"
                className={inputCls}
              />
              <span className="mt-1 flex justify-between gap-4 text-[11px] text-muted">
                <span>The more detail, the faster we can quote.</span>
                <span className="tabular-nums">{form.description.length}/1000</span>
              </span>
            </label>

            <div className="mt-4">
              <span className={labelCls}>Reference image (optional)</span>
              {preview ? (
                <div className="flex items-center gap-3 rounded-lg border border-line bg-white p-3">
                  <img src={preview} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{file?.name}</div>
                    <div className="text-[11px] text-muted">{file ? (file.size / 1024 / 1024).toFixed(2) : "0.00"} MB</div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Remove attached image"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-white px-4 py-6 text-center transition-colors hover:border-gold">
                  <ImagePlus size={20} className="text-gold-dark" />
                  <span className="text-xs font-semibold uppercase tracking-wide">Attach a photo</span>
                  <span className="text-[11px] text-muted">JPG or PNG, up to {MAX_MB} MB</span>
                  <input type="file" accept="image/*" onChange={pickFile} className="hidden" />
                </label>
              )}
              {fileError && <div className="mt-1.5 text-[11px] text-red-600">{fileError}</div>}
            </div>

            <button
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-brown py-3.5 text-xs font-semibold uppercase tracking-wide text-[#f3ebe0] transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <><Loader2 size={14} className="animate-spin" /> Sending…</>
              ) : (
                <>Send custom request <ArrowRight size={14} /></>
              )}
            </button>
            <p className="mt-3 mb-0 text-[11px] leading-relaxed text-muted">
              Your request goes straight to our workshop team — we call you to confirm the final price before production
              begins. Nothing is charged now.
            </p>
          </form>
        </div>

        <aside className="rounded-xl border border-line bg-card p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-gold-dark" />
            <h2 className="m-0 font-serif text-xl font-medium">How it works</h2>
          </div>

          <ol className="m-0 mt-4 list-none space-y-4 p-0">
            {STEPS.map(([Icon, title, note], i) => (
              <li key={title} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f6efdf] text-[11px] font-semibold text-gold-dark">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Icon size={13} className="text-muted" /> {title}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">{note}</span>
                </span>
              </li>
            ))}
          </ol>

          {types.length > 0 && (
            <div className="mt-5 rounded-lg border border-[#e4d3a8] bg-[#f1e6cc] p-4 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <Palette size={14} /> What we can make
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <span key={t} className="rounded-full border border-[#e4d3a8] bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#5b4a2e]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 mb-0 text-[11px] leading-relaxed text-muted">
            Not sure about sizing or leather? Message us on WhatsApp and we will guide you through the options before you
            place your request.
          </p>
        </aside>
      </div>
    </main>
  );
}
