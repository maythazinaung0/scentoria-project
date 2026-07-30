import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know if a token/session already exists

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api.get('/me', { skipErrorToast: true })
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function signIn(email, password) {
    const { data } = await api.post('/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function signUp({ name, email, phone_number, password, password_confirmation }) {
    const { data } = await api.post('/register', { name, email, phone_number, password, password_confirmation });
    localStorage.setItem('auth_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function signOut() {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout request failed:', err.response?.status, err.response?.data);
    } finally {
      localStorage.removeItem('auth_token');
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