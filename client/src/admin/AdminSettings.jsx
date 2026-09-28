import { useEffect, useState } from "react";
import api from "../api";

export default function AdminSettings() {
  const [s, setS] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get("/settings").then((r) => setS(r.data)); }, []);

  const arr = (key) => s[key].join(", ");
  const setArr = (key, val) => setS({ ...s, [key]: val.split(",").map((x) => x.trim()).filter(Boolean) });

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    ["announcement", "phone", "email", "address", "deliveryFee", "giftBagFee", "promoActive", "promoText"].forEach((k) => fd.append(k, s[k]));
    fd.append("colors", JSON.stringify(s.colors));
    fd.append("leatherTypes", JSON.stringify(s.leatherTypes));
    fd.append("customOrderTypes", JSON.stringify(s.customOrderTypes));
    if (heroFile) fd.append("heroImage", heroFile);

    const { data } = await api.put("/settings", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setS(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!s) return null;

  const inputCls = "w-full border border-line rounded-md p-2.5 text-sm bg-[#fbfaf7] focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold";
  const labelCls = "block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5";
  const cardCls = "bg-white border border-line rounded-lg p-5 mb-5";

  return (
    <>
      <div className="bg-white border-b border-line px-8 py-4.5"><h1 className="font-serif text-xl font-medium m-0">Settings</h1></div>
      <div className="p-8 max-w-[640px]">
        {saved && <div className="bg-green-50 text-green-700 text-sm rounded p-2.5 mb-4">Settings saved successfully.</div>}
        <form onSubmit={submit}>
          <div className={cardCls}>
            <h3 className="mt-0 mb-4 text-base font-semibold">Promotion Banner</h3>
            <label className="flex items-center gap-2 mb-3.5 text-sm">
              <input type="checkbox" checked={s.promoActive} onChange={(e) => setS({ ...s, promoActive: e.target.checked })} />
              Show promotion banner on site
            </label>
            <label className="block"><span className={labelCls}>Promotion text</span><input value={s.promoText} onChange={(e) => setS({ ...s, promoText: e.target.value })} placeholder="e.g. Eid Sale — Flat 20% off" className={inputCls} /></label>
          </div>

          <div className={cardCls}>
            <h3 className="mt-0 mb-4 text-base font-semibold">Storefront</h3>
            <label className="block mb-4"><span className={labelCls}>Top bar announcement</span><input value={s.announcement} onChange={(e) => setS({ ...s, announcement: e.target.value })} className={inputCls} /></label>
            <div>
              <span className={labelCls}>Hero banner image</span>
              <div className="flex gap-3 items-center">
                {s.heroImage && <img src={s.heroImage} alt="" className="w-[70px] h-[50px] object-cover rounded" />}
                <input type="file" accept="image/*" onChange={(e) => setHeroFile(e.target.files[0])} className="text-sm" />
              </div>
            </div>
          </div>

          <div className={cardCls}>
            <h3 className="mt-0 mb-4 text-base font-semibold">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <label><span className={labelCls}>Delivery fee (Rs.)</span><input type="number" value={s.deliveryFee} onChange={(e) => setS({ ...s, deliveryFee: e.target.value })} className={inputCls} /></label>
              <label><span className={labelCls}>Gift bag fee (Rs.)</span><input type="number" value={s.giftBagFee} onChange={(e) => setS({ ...s, giftBagFee: e.target.value })} className={inputCls} /></label>
            </div>
          </div>

          <div className={cardCls}>
            <h3 className="mt-0 mb-4 text-base font-semibold">Contact Info</h3>
            <label className="block mb-4"><span className={labelCls}>Phone</span><input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} className={inputCls} /></label>
            <label className="block mb-4"><span className={labelCls}>Email</span><input value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Address</span><input value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} className={inputCls} /></label>
          </div>

          <div className={cardCls}>
            <h3 className="mt-0 mb-4 text-base font-semibold">Product Options</h3>
            <label className="block mb-4"><span className={labelCls}>Colours (comma-separated)</span><input value={arr("colors")} onChange={(e) => setArr("colors", e.target.value)} className={inputCls} /></label>
            <label className="block mb-4"><span className={labelCls}>Leather types (comma-separated)</span><input value={arr("leatherTypes")} onChange={(e) => setArr("leatherTypes", e.target.value)} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Custom order item types (comma-separated)</span><input value={arr("customOrderTypes")} onChange={(e) => setArr("customOrderTypes", e.target.value)} className={inputCls} /></label>
          </div>

          <button className="bg-brown text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-ink transition-colors">Save Settings</button>
        </form>
      </div>
    </>
  );
}