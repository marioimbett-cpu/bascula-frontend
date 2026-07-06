import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pagosService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { PagoFormValues } from "@/utils/validation-schemas";

const PAGOS_KEY = "pagos";

export function usePagosQuery(params: ListParams) {
  return useQuery({
    queryKey: [PAGOS_KEY, params],
    queryFn: () => pagosService.list(params),
    placeholderData: (previous) => previous,
  });
}

/**
 * Registra un pago (abono parcial o total). El backend recalcula saldo_pendiente de la cuenta
 * y, si el método es Cheque, crea el registro de Cheque enlazado (estado inicial: Registrado).
 */
export function useCrearPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PagoFormValues) => pagosService.create(payload),
    onSuccess: () => {
      toast.success("Pago registrado. El saldo de la cuenta fue actualizado.");
      queryClient.invalidateQueries({ queryKey: [PAGOS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
    },
    onError: () => toast.error("No fue posible registrar el pago."),
  });
}
