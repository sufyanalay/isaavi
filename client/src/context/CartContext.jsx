import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("il_cart")) || []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("il_cart", JSON.stringify(cart)); }, [cart]);

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

  const count = cart.reduce((a, i) => a + i.qty, 0);

  return <CartContext.Provider value={{ cart, setCart, addToCart, count }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);