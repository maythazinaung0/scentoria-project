import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/CartDrawer.jsx';
import { NotificationProvider } from './contexts/NotificationContext';
import './index.css';
import { ConfirmProvider } from './contexts/ConfirmContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </NotificationProvider>
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>,
);