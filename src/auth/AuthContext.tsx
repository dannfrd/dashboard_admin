import { useRouter } from "next/router";
import React from "react";

export type AdminUser = {
  id: number;
  name?: string | null;
  email: string;
  role?: string | null;
  provider?: string | null;
};

type AuthContextValue = {
  user: AdminUser | null;
  token: string | null;
  isReady: boolean;
  login: (_token: string, _user: AdminUser) => void;
  logout: () => void;
};

const TOKEN_KEY = "dermify_admin_token";
const USER_KEY = "dermify_admin_user";

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AdminUser;
        if (parsedUser.role?.toLowerCase() === "admin") {
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
      }
    }

    setIsReady(true);
  }, []);

  const login = React.useCallback((nextToken: string, nextUser: AdminUser) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    void router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function getStoredAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}
