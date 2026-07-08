// contexts/CartContext.js
import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const itemCount = items.reduce((sum, i) => sum + (i.qty || 1), 0);

  // Add this function
  const addToCart = (product, variant, qty) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i.id === product.id && i.variantId === variant.id
      );

      if (existingItem) {
        return prevItems.map((i) =>
          i.id === product.id && i.variantId === variant.id
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [...prevItems, { ...product, variantId: variant.id, variant, qty }];
    });
  };

  return (
    <CartContext.Provider value={{ items, setItems, itemCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}