import { useEffect, useState } from "react";
import { Trash2, MessageCircle } from "lucide-react";
import api from "../api";

const STATUS = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", "Awaiting Quote"];
const badgeStyle = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  "Awaiting Quote": "bg-gray-200 text-gray-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => api.get("/orders").then((r) => setOrders(Array.isArray(r.data) ? r.data : []));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => { await api.patch(`/orders/${id}/status`, { status }); load(); };
  const remove = async (id) => { if (!confirm("Delete this order?")) return; await api.delete(`/orders/${id}`); load(); };

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="bg-white border-b border-line px-8 py-4.5"><h1 className="font-serif text-xl font-medium m-0">Orders</h1></div>
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {[
            ["Total Orders", orders.length],
            ["Pending", orders.filter((o) => o.status === "Pending").length],
            ["Awaiting Quote", orders.filter((o) => o.status === "Awaiting Quote").length],
            ["Total Value", `Rs. ${orders.reduce((a, o) => a + (o.total || 0), 0).toLocaleString()}`],
          ].map(([label, num]) => (
            <div key={label} className="bg-white border border-line rounded-lg p-4.5">
              <div className="text-2xl font-semibold">{num}</div>
              <div className="text-xs text-muted uppercase tracking-wide mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          <button onClick={() => setFilter("all")} className={`rounded-full px-3.5 py-1.5 text-xs border ${filter === "all" ? "bg-ink text-white border-ink" : "bg-white text-muted border-line"}`}>All</button>
          {STATUS.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3.5 py-1.5 text-xs border ${filter === s ? "bg-ink text-white border-ink" : "bg-white text-muted border-line"}`}>{s}</button>
          ))}
        </div>

        {!shown.length && <div className="text-center text-muted py-16 text-sm">No orders in this view.</div>}

        {shown.map((o) => (
          <div key={o._id} className="bg-white border border-line rounded-lg p-5 mb-3.5">
            <div className="flex justify-between flex-wrap gap-2.5 mb-2.5">
              <div className="flex gap-2.5 items-center">
                <b>{o.orderNumber}</b>
                {o.type === "custom" && <span className="text-[10px] uppercase bg-[#eee5d8] text-muted px-2 py-0.5 rounded-full">custom</span>}
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase ${badgeStyle[o.status] || ""}`}>{o.status}</span>
              </div>
              <span className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</span>
            </div>

            <div className="text-sm mb-2.5">
              <b>{o.customer.name}</b> · {o.customer.phone}
              {o.customer.city !== "-" && <> · {o.customer.city}, {o.customer.country}</>}
              {o.customer.address !== "-" && <div className="text-muted mt-0.5">{o.customer.address}</div>}
              {o.customer.notes && <div className="text-muted italic mt-0.5">Note: {o.customer.notes}</div>}
            </div>

            {o.type === "cart" ? (
              <div className="text-sm mb-2.5">
                {o.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between py-0.5">
                    <span>{i.qty} × {i.name} {i.color && `(${i.color})`}</span>
                    <span>Rs. {(i.price * i.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-line mt-1.5 pt-1.5 text-xs text-muted">
                  Packaging: {o.packaging} {o.giftBagFee ? `(+Rs. ${o.giftBagFee.toLocaleString()})` : ""} · Delivery: Rs. {o.deliveryFee}
                </div>
                <div className="font-semibold mt-1.5">Total: Rs. {o.total.toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-sm mb-2.5">
                <b>{o.customDetails?.itemType}</b> · {o.customDetails?.color} · {o.customDetails?.leatherType}
                <p className="my-1.5 text-muted">{o.customDetails?.description}</p>
                {o.customDetails?.referenceImage && <img src={o.customDetails.referenceImage} alt="" className="w-20 rounded" />}
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)} className="border border-line rounded-md px-2.5 py-1.5 text-sm">
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <a href={`https://wa.me/92${o.customer.phone.replace(/^0/, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border border-line rounded-md px-3 py-1.5 text-xs hover:bg-gray-50">
                <MessageCircle size={13} /> WhatsApp
              </a>
              <button onClick={() => remove(o._id)} className="ml-auto p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}