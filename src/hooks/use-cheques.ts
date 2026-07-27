import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chequesService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { EstadoCheque } from "@/interfaces/domain";
import type { ChequeFormValues } from "@/utils/validation-schemas";

const CHEQUES_KEY = "cheques";

export function useChequesQuery(params: ListParams) {
  return useQuery({
    queryKey: [CHEQUES_KEY, params],
    queryFn: () => chequesService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useCheque(id: string) {
  return useQuery({
    queryKey: [CHEQUES_KEY, id],
    queryFn: () => chequesService.getById(id),
    enabled: !!id,
  });
}

export function useCrearCheque() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChequeFormValues) => chequesService.create({ ...payload, estado: "Registrado" }),
    onSuccess: () => {
      toast.success("Cheque registrado correctamente.");
      queryClient.invalidateQueries({ queryKey: [CHEQUES_KEY] });
    },
    onError: () => toast.error("No fue posible registrar el cheque."),
  });
}

/**
 * Transición de estado del cheque (sección 3.8): Registrado -> Pendiente de cobro -> Consignado -> Cobrado,
 * o Devuelto/Rechazado (reversa el pago asociado y reabre el saldo), o Anulado (chequera propia, sin afectar saldos).
 */
export function useCambiarEstadoCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string; estado: EstadoCheque; motivoDevolucion?: string }) =>
      chequesService.patch(payload.id, { estado: payload.estado, motivoDevolucion: payload.motivoDevolucion }),
    onSuccess: (_, variables) => {
      if (variables.estado === "Devuelto/Rechazado") {
        toast.warning("Cheque marcado como devuelto. El pago asociado fue reversado y el saldo reabierto.");
      } else {
        toast.success(`Cheque actualizado a: ${variables.estado}`);
      }
      queryClient.invalidateQueries({ queryKey: [CHEQUES_KEY] });
      queryClient.invalidateQueries({ queryKey: ["cuentas"] });
    },
    onError: () => toast.error("No fue posible actualizar el estado del cheque."),
  });
}
