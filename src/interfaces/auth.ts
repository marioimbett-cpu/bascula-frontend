import type { RolUsuario } from "./domain";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  permisos: string[];
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}
