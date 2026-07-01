import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const itemCount = items.reduce((sum, i) => sum + (i.qty || 1), 0);

  return (
    <CartContext.Provider value={{ items, setItems, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}