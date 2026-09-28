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
    <main className="max-w-[1180px] mx-auto px-6 pt-8 pb-16 text-center">
      {showOverlay && order.type === "cart" && <DeliveryOverlay onDone={() => setShowOverlay(false)} />}

      <CheckCircle size={40} className="mx-auto" />
      <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-muted mt-4 mb-1.5">Order {order.orderNumber}</div>
      <h1 className="font-serif text-4xl">Thank you, {order.customer.name.split(" ")[0]}!</h1>
      <p className="text-muted max-w-[480px] mx-auto my-3.5">
        {order.type === "custom"
          ? "Your custom request has been received. Our team will call you soon."
          : `Your order is confirmed. Our team will call you at ${order.customer.phone}, then your parcel will be dispatched — pay the courier in cash.`}
      </p>

      {order.type === "cart" && (
        <div className="text-left max-w-[560px] mx-auto bg-card p-5 rounded mt-6">
          <h3 className="mt-0 font-medium">Packing slip</h3>
          {order.items.map((i, idx) => (
            <div key={idx} className="flex justify-between text-sm mb-2">
              <span>{i.qty} × {i.name}</span><span>Rs. {(i.price * i.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-line mt-2.5 pt-2.5 flex justify-between font-semibold">
            <span>Amount payable in cash</span><span>Rs. {order.total.toLocaleString()}</span>
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