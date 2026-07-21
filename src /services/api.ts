import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const ACCESS_TOKEN_KEY = "bascula_access_token";
const REFRESH_TOKEN_KEY = "bascula_refresh_token";
const EMPRESA_ACTIVA_KEY = "bascula_empresa_activa";

export const tokenStorage = {
  getAccessToken: () => (typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_KEY) : null),
  getRefreshToken: () => (typeof window !== "undefined" ? localStorage.getItem(REFRESH_TOKEN_KEY) : null),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  getEmpresaActiva: () => (typeof window !== "undefined" ? localStorage.getItem(EMPRESA_ACTIVA_KEY) : null),
  setEmpresaActiva: (empresaId: string) => localStorage.setItem(EMPRESA_ACTIVA_KEY, empresaId),
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Interceptor de request: adjunta el JWT y la empresa activa (multiempresa)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const empresaId = tokenStorage.getEmpresaActiva();
  if (empresaId) {
    config.headers["X-Empresa-Id"] = empresaId;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

// Interceptor de response: refresh token automático + manejo global de errores
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No hay refresh token disponible");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        tokenStorage.setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Manejo global de errores no relacionados a autenticación
    const status = error.response?.status;
    const message = (error.response?.data as { message?: string } | undefined)?.message;

    if (status === 403) {
      toast.error("No tienes permisos para realizar esta acción.");
    } else if (status === 500) {
      toast.error("Ocurrió un error en el servidor. Intenta nuevamente.");
    } else if (status && status >= 400 && status !== 401) {
      toast.error(message ?? "Ocurrió un error al procesar la solicitud.");
    } else if (!status) {
      toast.error("No fue posible conectar con el servidor.");
    }

    return Promise.reject(error);
  }
);
