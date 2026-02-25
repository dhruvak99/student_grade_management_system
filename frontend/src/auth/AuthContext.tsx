import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  role: "faculty" | "student";
};

type AuthContextType = {
  user: User | null;
  login: (token: string, role: "faculty" | "student") => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const role = localStorage.getItem("role");
    return role ? { role: role as "faculty" | "student" } : null;
  });

  const login = (token: string, role: "faculty" | "student") => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setUser({ role });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};