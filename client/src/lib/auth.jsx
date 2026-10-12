import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => { api('/auth/me').then(d => setUser(d.user)).catch(() => {}).finally(() => setLoading(false)); }, []);
  const login = async (email, password) => { const d = await api('/auth/login', { method: 'POST', body: { email, password } }); setUser(d.user); return d.user; };
  const signup = async (token, password) => { const d = await api('/auth/signup', { method: 'POST', body: { token, password } }); setUser(d.user); return d.user; };
  const logout = async () => { await api('/auth/logout', { method: 'POST' }).catch(() => {}); setUser(null); };
  return <Ctx.Provider value={{ user, loading, login, signup, logout }}>{children}</Ctx.Provider>;
}
