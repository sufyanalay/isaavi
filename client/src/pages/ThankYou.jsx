import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import api from "../api";
import DeliveryOverlay from "../components/DeliveryOverlay";

export default function ThankYou() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => { api.get(`/orders/token/${token}`).then((r) => setOrder(r.data)); }, [token]);

  if (!order) return <main className="max-w-[1180px] mx-auto px-6 py-16">Loading...</main>;

  return (
    <main className="mx-auto max-w-[1180px] px-5 pt-8 pb-16 text-center sm:px-6">
      {showOverlay && order.type === "cart" && <DeliveryOverlay onDone={() => setShowOverlay(false)} />}

      <CheckCircle size={40} className="mx-auto" />
      <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted mt-4 mb-1.5">Order {order.orderNumber}</div>
      <h1 className="break-anywhere font-serif text-[30px] sm:text-4xl">Thank you, {order.customer.name.split(" ")[0]}!</h1>
      <p className="text-muted max-w-[480px] mx-auto my-3.5">
        {order.type === "custom"
          ? "Your custom request has been received. Our team will call you soon."
          : `Your order is confirmed. Our team will call you at ${order.customer.phone}, then your parcel will be dispatched — pay the courier in cash.`}
      </p>

      {order.type === "cart" && (
        <div className="mx-auto mt-6 max-w-[560px] rounded-xl border border-line bg-card p-5 text-left">
          <h3 className="mt-0 mb-3 font-medium">Packing slip</h3>
          {order.items.map((i, idx) => (
            <div key={idx} className="mb-2 flex items-start justify-between gap-4 text-sm">
              <span className="break-anywhere">{i.qty} × {i.name}</span>
              <span className="shrink-0 tabular-nums">Rs. {(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-line pt-2.5 font-semibold">
            <span>Amount payable in cash</span><span className="shrink-0 tabular-nums">Rs. {order.total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link to="/" className="inline-flex px-6 py-2.5 bg-brown text-[#f3ebe0] text-xs font-semibold uppercase tracking-wide rounded-sm hover:bg-ink transition-colors no-underline">
          Continue shopping
        </Link>
      </div>
    </main>
  );
}