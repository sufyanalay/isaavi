import { useEffect, useState } from "react";

const STAGES = [
  { key: "packing", label: "Packing your order" },
  { key: "loading", label: "Loading into the truck" },
  { key: "onroad", label: "Truck is on the way" },
  { key: "delivered", label: "Delivered to your doorstep" },
];

export default function DeliveryJourney() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500);
    const t2 = setTimeout(() => setStage(2), 3000);
    const t3 = setTimeout(() => setStage(3), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const truckLeft = stage >= 3 ? "calc(100% - 44px)" : stage === 2 ? "calc(100% - 44px)" : stage === 1 ? "10%" : "-40px";
  const truckTransitionMs = stage === 2 ? 3800 : 400;

  return (
    <div style={{ background: "var(--card)", padding: "26px 20px 20px", margin: "24px 0", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        {STAGES.map((s, i) => (
          <div key={s.key} style={{ textAlign: "center", flex: 1, fontSize: 11, color: i <= stage ? "var(--ink)" : "var(--muted)", fontWeight: i === stage ? 600 : 400 }}>
            {s.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 6px", marginBottom: 4 }}>
        {STAGES.map((s, i) => (
          <div key={s.key} style={{ width: 10, height: 10, borderRadius: "50%", background: i <= stage ? "var(--brown)" : "var(--line)", border: "2px solid var(--card)" }} />
        ))}
      </div>

      <div style={{ position: "relative", height: 56, borderTop: "3px dashed var(--muted)", margin: "22px 0 8px", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            bottom: 6,
            left: truckLeft,
            fontSize: 30,
            transition: `left ${truckTransitionMs}ms linear`,
          }}
        >
          🚚
        </div>
        {stage >= 3 && (
          <div style={{ position: "absolute", bottom: 6, right: 6, fontSize: 26 }}>📍</div>
        )}
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
        {stage < 3 ? "Isaavi Leather · handmade in Sialkot, packed with care" : "Your order has reached its destination"}
      </div>
    </div>
  );
}