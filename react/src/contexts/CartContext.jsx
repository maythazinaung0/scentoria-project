import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const refreshCart = useCallback(async (silent = false) => {
    if (!user) {
      setItems([]);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);
  const openCart = () => setIsOpen(true);   
  const closeCart = () => setIsOpen(false); 
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ items, setItems, itemCount, loading, refreshCart, isOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}