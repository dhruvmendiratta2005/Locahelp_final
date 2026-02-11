import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("locahelp_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = ({ token, user }) => {
    localStorage.setItem("locahelp_token", token);
    localStorage.setItem("locahelp_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("locahelp_token");
    localStorage.removeItem("locahelp_user");
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...nextUser };
      localStorage.setItem("locahelp_user", JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, logout, updateUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
