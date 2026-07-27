import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tercerosService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { TerceroFormValues } from "@/utils/validation-schemas";

const TERCEROS_KEY = "terceros";

export function useTercerosQuery(params: ListParams) {
  return useQuery({
    queryKey: [TERCEROS_KEY, params],
    queryFn: () => tercerosService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useTercero(id: string) {
  return useQuery({
    queryKey: [TERCEROS_KEY, id],
    queryFn: () => tercerosService.getById(id),
    enabled: !!id,
  });
}

/** Valida identificación fiscal única por empresa antes de crear — evita terceros duplicados. */
export function useCrearTercero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TerceroFormValues) => tercerosService.create({ ...payload, saldoActual: 0, activo: true }),
    onSuccess: () => {
      toast.success("Tercero creado correctamente.");
      queryClient.invalidateQueries({ queryKey: [TERCEROS_KEY] });
    },
    onError: () => toast.error("No fue posible crear el tercero. Verifica que la identificación fiscal no esté duplicada."),
  });
}

export function useDesactivarTercero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; activo: boolean }) => tercerosService.patch(payload.id, { activo: payload.activo }),
    onSuccess: () => {
      toast.success("Tercero actualizado.");
      queryClient.invalidateQueries({ queryKey: [TERCEROS_KEY] });
    },
    onError: () => toast.error("No fue posible actualizar el tercero."),
  });
}
