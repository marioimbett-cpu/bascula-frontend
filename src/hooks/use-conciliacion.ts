import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { conciliacionService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import { api } from "@/services/api";

const CONCILIACION_KEY = "conciliacion";

export function useConciliacionQuery(params: ListParams) {
  return useQuery({
    queryKey: [CONCILIACION_KEY, params],
    queryFn: () => conciliacionService.list(params),
    placeholderData: (previous) => previous,
  });
}

/** Carga el extracto bancario (archivo) para cruzarlo contra los pagos registrados en el sistema. */
export function useCargarExtracto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("extracto", file);
      return api.post("/conciliacion/extracto", formData, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("Extracto cargado. Revisa las coincidencias sugeridas.");
      queryClient.invalidateQueries({ queryKey: [CONCILIACION_KEY] });
    },
    onError: () => toast.error("No fue posible cargar el extracto bancario."),
  });
}

/** Marca un pago como conciliado o pendiente tras revisar el cruce contra el extracto. */
export function useMarcarConciliado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string; estado: "Conciliado" | "Pendiente" | "Con diferencia" }) =>
      conciliacionService.patch(payload.id, { estado: payload.estado }),
    onSuccess: () => {
      toast.success("Estado de conciliación actualizado.");
      queryClient.invalidateQueries({ queryKey: [CONCILIACION_KEY] });
    },
    onError: () => toast.error("No fue posible actualizar la conciliación."),
  });
}
