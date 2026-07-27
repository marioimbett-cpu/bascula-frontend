import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { causacionService } from "@/services/modules";
import type { ListParams } from "@/services/resource";

const CAUSACION_KEY = "causacion";

export function useCausacionesQuery(params: ListParams) {
  return useQuery({
    queryKey: [CAUSACION_KEY, params],
    queryFn: () => causacionService.list(params),
    placeholderData: (previous) => previous,
  });
}

/** Documentos (factura/orden) pendientes de causar — aún sin registro contable. */
export function useDocumentosPendientesCausar() {
  return useQuery({
    queryKey: [CAUSACION_KEY, "pendientes"],
    queryFn: () => causacionService.list({ pageSize: 50, filters: { estado: "Pendiente" } }),
  });
}

/** Registra la causación contable de un documento origen (factura, orden de compra u orden de venta). */
export function useCausarDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentoOrigenId: string) => causacionService.create({ documentoOrigenId, estado: "Causada" }),
    onSuccess: () => {
      toast.success("Documento causado contablemente.");
      queryClient.invalidateQueries({ queryKey: [CAUSACION_KEY] });
    },
    onError: () => toast.error("No fue posible causar el documento."),
  });
}
