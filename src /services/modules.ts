import { api, tokenStorage } from "./api";
import { createResourceService } from "./resource";
import type {
  Ticket,
  OrdenCompraVenta,
  Empresa,
  Tercero,
  CuentaPagarCobrar,
  Pago,
  Cheque,
  Producto,
  MovimientoInventario,
  Causacion,
  ConciliacionBancaria,
  Usuario,
} from "@/interfaces/domain";
import type { LoginPayload, AuthResponse } from "@/interfaces/auth";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  logout: async (): Promise<void> => {
    tokenStorage.clear();
    await api.post("/auth/logout").catch(() => undefined);
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
};

export const ticketsService = createResourceService<Ticket>("/tickets");
export const ordenesCompraService = createResourceService<OrdenCompraVenta>("/compras");
export const ordenesVentaService = createResourceService<OrdenCompraVenta>("/ventas");
export const empresasService = createResourceService<Empresa>("/empresas");
export const tercerosService = createResourceService<Tercero>("/terceros");
export const cuentasService = createResourceService<CuentaPagarCobrar>("/cuentas");
export const pagosService = createResourceService<Pago>("/pagos");
export const chequesService = createResourceService<Cheque>("/cheques");
export const productosService = createResourceService<Producto>("/productos");
export const movimientosInventarioService = createResourceService<MovimientoInventario>("/inventario/movimientos");
export const causacionService = createResourceService<Causacion>("/causacion");
export const conciliacionService = createResourceService<ConciliacionBancaria>("/conciliacion");
export const usuariosService = createResourceService<Usuario>("/usuarios");
