import { useQuery } from "@tanstack/react-query";
import { cuentasService, pagosService } from "@/services/modules";
import type { ListParams } from "@/services/resource";

const CUENTAS_KEY = "cuentas";

export function useCuentasQuery(params: ListParams) {
  return useQuery({
    queryKey: [CUENTAS_KEY, params],
    queryFn: () => cuentasService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useCuenta(id: string) {
  return useQuery({
    queryKey: [CUENTAS_KEY, id],
    queryFn: () => cuentasService.getById(id),
    enabled: !!id,
  });
}

/** Historial de pagos/abonos aplicados a una cuenta específica, para su estado de cuenta. */
export function usePagosDeCuenta(cuentaId: string) {
  return useQuery({
    queryKey: [CUENTAS_KEY, cuentaId, "pagos"],
    queryFn: () => pagosService.list({ pageSize: 50, filters: { cuentaId } }),
    enabled: !!cuentaId,
  });
}

/** Cuentas abiertas (Pendiente/Abonada/Vencida), usadas como selector al registrar un pago. */
export function useCuentasAbiertas(tipo?: "Por Pagar" | "Por Cobrar") {
  return useQuery({
    queryKey: [CUENTAS_KEY, "abiertas", tipo],
    queryFn: () =>
      cuentasService.list({
        pageSize: 100,
        filters: { tipo, estadoNot: "Pagada" },
      }),
  });
}
