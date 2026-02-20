// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/auth";
import { clearAuth, loadAuth, saveAuth } from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {userId,email,userName,role}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const saved = loadAuth();
      if (!saved?.accessToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        setUser(me);

        // Keep user snapshot in storage so feature pages can resolve userId after refresh.
        saveAuth({
          accessToken: saved.accessToken,
          tokenType: saved.tokenType,
          userId: me?.userId ?? saved.userId ?? null,
          email: me?.email ?? saved.email ?? null,
          userName: me?.userName ?? saved.userName ?? null,
          role: me?.role ?? saved.role ?? null,
        });
      } catch {
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    // res: {accessToken, tokenType, userId, email, userName, role}
    saveAuth({
      accessToken: res.accessToken,
      tokenType: res.tokenType,
      userId: res.userId,
      email: res.email,
      userName: res.userName,
      role: res.role,
    });
    setUser({
      userId: res.userId,
      email: res.email,
      userName: res.userName,
      role: res.role,
    });
    return res;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
