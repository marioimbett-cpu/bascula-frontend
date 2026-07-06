"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/modules";
import { tokenStorage } from "@/services/api";
import type { AuthUser, LoginPayload } from "@/interfaces/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permiso: string) => boolean;
  hasRole: (...roles: AuthUser["rol"][]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const bootstrap = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    setUser(response.user);
    router.push("/dashboard");
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push("/login");
  };

  const hasPermission = (permiso: string) => user?.permisos?.includes(permiso) ?? false;
  const hasRole = (...roles: AuthUser["rol"][]) => (user ? roles.includes(user.rol) : false);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, hasPermission, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
