import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const verifySession = useCallback(async () => {
    try {
      const data = await api.getMe();
      setUser(data.user || null);
    } catch {
      setAuthToken('');
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const register = async (payload) => {
    const data = await api.register(payload);
    if (data.token) setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password, rememberMe = false) => {
    const data = await api.login({ email, password, remember_me: rememberMe });
    if (data.token) setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (credential) => {
    const data = await api.googleLogin({ credential });
    if (data.token) setAuthToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore network error on logout
    }
    setAuthToken('');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isSuperAdmin,
        authLoading,
        register,
        login,
        loginWithGoogle,
        logout,
        verifySession,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
