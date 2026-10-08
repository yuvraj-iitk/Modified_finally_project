import { createContext, useContext, useState } from "react";
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const add = (product) =>
    setItems((old) => {
      const found = old.find((item) => item.id === product.id);
      if (found)
        return old.map((item) =>
          item.id === product.id
            ? { ...item, amount: Math.min(item.amount + 1, product.quantity) }
            : item,
        );
      return [...old, { ...product, amount: 1 }];
    });
  const change = (id, amount) =>
    setItems((old) =>
      old.map((item) =>
        item.id === id
          ? {
              ...item,
              amount: Math.max(1, Math.min(Number(amount) || 1, item.quantity)),
            }
          : item,
      ),
    );
  const remove = (id) =>
    setItems((old) => old.filter((item) => item.id !== id));
  return (
    <CartContext.Provider
      value={{ items, add, change, remove, clear: () => setItems([]) }}
    >
      {children}
    </CartContext.Provider>
  );
}
export const useCart = () => useContext(CartContext);
