import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { empresasService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { EmpresaFormValues } from "@/utils/validation-schemas";

const EMPRESAS_KEY = "empresas";

export function useEmpresasQuery(params: ListParams) {
  return useQuery({
    queryKey: [EMPRESAS_KEY, params],
    queryFn: () => empresasService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useCrearEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmpresaFormValues) => empresasService.create({ ...payload, estado: "Activa" }),
    onSuccess: () => {
      toast.success("Empresa creada correctamente.");
      queryClient.invalidateQueries({ queryKey: [EMPRESAS_KEY] });
    },
    onError: () => toast.error("No fue posible crear la empresa."),
  });
}

export function useCambiarEstadoEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; estado: "Activa" | "Inactiva" }) =>
      empresasService.patch(payload.id, { estado: payload.estado }),
    onSuccess: () => {
      toast.success("Estado de la empresa actualizado.");
      queryClient.invalidateQueries({ queryKey: [EMPRESAS_KEY] });
    },
    onError: () => toast.error("No fue posible actualizar la empresa."),
  });
}
