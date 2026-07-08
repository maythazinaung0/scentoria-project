import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know if a session already exists

  // On first load (or page refresh), check whether a valid session cookie already exists.
  useEffect(() => {
    api.get('/me')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    // Sanctum requires the CSRF cookie before any stateful POST
    await axios.get(`${import.meta.env.VITE_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });

    const { data } = await api.post('/login', { email, password });
    setUser(data.user);
    return data.user;
  }

  async function signUp({ name, email, phone_number, password, password_confirmation }) {
  await axios.get(`${import.meta.env.VITE_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
  const { data } = await api.post('/register', { name, email, phone_number, password, password_confirmation });
  setUser(data.user);
  return data.user;
}


  async function signOut() {
    try {
      await api.post('/logout');
    } finally {
      setUser(null);
    }
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}