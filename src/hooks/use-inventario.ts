import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productosService, movimientosInventarioService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { AjusteInventarioFormValues } from "@/utils/validation-schemas";

const INVENTARIO_KEY = "inventario";

/** Catálogo de productos, compartido entre empresas (categoría Pesado en Báscula / Productos Varios). */
export function useProductosQuery(params: ListParams) {
  return useQuery({
    queryKey: [INVENTARIO_KEY, "productos", params],
    queryFn: () => productosService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useProducto(id: string) {
  return useQuery({
    queryKey: [INVENTARIO_KEY, "productos", id],
    queryFn: () => productosService.getById(id),
    enabled: !!id,
  });
}

/** Kardex del producto: entradas, salidas y saldo — filtrado por la empresa activa. */
export function useKardex(productoId: string) {
  return useQuery({
    queryKey: [INVENTARIO_KEY, "kardex", productoId],
    queryFn: () => movimientosInventarioService.list({ pageSize: 50, filters: { productoId } }),
    enabled: !!productoId,
  });
}

/** Ajuste manual de inventario (merma, conteo físico, reverso). Genera un movimiento tipo "Reverso" o Entrada/Salida. */
export function useAjusteInventario(productoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AjusteInventarioFormValues) =>
      movimientosInventarioService.create({
        productoId: payload.productoId,
        tipo: payload.tipo,
        cantidad: payload.cantidad,
        origenId: "ajuste-manual",
      }),
    onSuccess: () => {
      toast.success("Ajuste de inventario registrado.");
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_KEY, "kardex", productoId] });
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_KEY, "productos"] });
    },
    onError: () => toast.error("No fue posible registrar el ajuste."),
  });
}
