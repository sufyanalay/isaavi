import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("il_cart")) || []; } catch { return []; }
  });
  const [promo, setPromo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("il_promo")) || null; } catch { return null; }
  });

  useEffect(() => { localStorage.setItem("il_cart", JSON.stringify(cart)); }, [cart]);

  const count = cart.reduce((a, i) => a + i.qty, 0);
  const subtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);

  /* cart khaali ho to code bhi nahi lagta — ise effect se nahi, derive karke handle karte hain */
  const promoCode = cart.length ? promo?.code || "" : "";

  useEffect(() => {
    if (promoCode) localStorage.setItem("il_promo", JSON.stringify(promo));
    else localStorage.removeItem("il_promo");
  }, [promo, promoCode]);

  /* cart badalne par code dobara verify hota hai (minimum order, expiry, limit) */
  useEffect(() => {
    if (!promoCode) return;
    let active = true;
    api.post("/promos/validate", { code: promoCode, cartTotal: subtotal })
      .then((r) => { if (active) setPromo({ ...r.data, status: "ok" }); })
      .catch((err) => {
        if (!active) return;
        setPromo((p) =>
          p ? { ...p, status: "error", message: err.response?.data?.message || "This promo code could not be checked" } : p
        );
      });
    return () => { active = false; };
  }, [promoCode, subtotal]);

  const addToCart = (product, options = {}) => {
    const { color = "", leatherType = "", qty = 1 } = options;
    const lineId = `${product._id}-${color}-${leatherType}`; // alag color/leather = alag cart line

    setCart((c) => {
      const existing = c.find((i) => i.lineId === lineId);
      if (existing) return c.map((i) => (i.lineId === lineId ? { ...i, qty: i.qty + qty } : i));
      return [
        ...c,
        {
          lineId,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0]?.url || "",
          color,
          leatherType,
          qty,
        },
      ];
    });
  };

  /* discount sirf tab lagta hai jab server ne code accept kiya ho */
  const applyPromo = async (code) => {
    const clean = String(code || "").trim().toUpperCase();
    if (!clean) throw new Error("Please enter a promo code");
    const { data } = await api.post("/promos/validate", { code: clean, cartTotal: subtotal });
    setPromo({ ...data, status: "ok" });
    return data;
  };

  const removePromo = () => setPromo(null);

  const promoActive = Boolean(cart.length && promo && promo.status !== "error");
  const promoDiscount = promoActive ? Number(promo.discountAmount) || 0 : 0;

  return (
    <CartContext.Provider
      value={{
        cart, setCart, addToCart, count, subtotal,
        promo, promoCode, promoActive, promoDiscount, applyPromo, removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* Provider aur hook jaan-boojh kar ek hi file mein hain, taake import path har jagah same rahe */
/* eslint-disable-next-line react/only-export-components */
export const useCart = () => useContext(CartContext);
