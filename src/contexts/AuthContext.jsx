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
          spoonBalance: me?.spoonBalance ?? saved.spoonBalance ?? 0, // ✅ 추가
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
    const saved = loadAuth();
    saveAuth({
      accessToken: res.accessToken,
      tokenType: res.tokenType,
      userId: res.userId,
      email: res.email,
      userName: res.userName,
      spoonBalance: res.spoonBalance,
      role: res.role,
    });
    const isFirstLogin = res.spoonBalance === 3000 && !saved?.accessToken;

    setUser({
      userId: res.userId,
      email: res.email,
      userName: res.userName,
      spoonBalance: res.spoonBalance,
      role: res.role,
    });
    return { ...res, isFirstLogin };
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  /**
   * ✅ 포인트를 포함한 유저 정보 일부를 전역 상태에 즉시 반영
   */
  const updateUserBalance = (newSpoonBalance) => {
    setUser((prev) => {
      if (!prev || prev.spoonBalance === newSpoonBalance) return prev;
      const updated = { ...prev, spoonBalance: newSpoonBalance };

      // 로컬 스토리지도 동기화
      const saved = loadAuth();
      if (saved && saved.spoonBalance !== newSpoonBalance) {
        saveAuth({ ...saved, spoonBalance: newSpoonBalance });
      }

      return updated;
    });
  };

  const value = useMemo(() => ({ user, loading, login, logout, updateUserBalance }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
