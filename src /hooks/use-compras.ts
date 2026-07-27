 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ordenesCompraService, ticketsService } from "@/services/modules";
import type { ListParams } from "@/services/resource";
import type { OrdenCompraVenta } from "@/interfaces/domain";
import type { OrdenCompraFormValues } from "@/utils/validation-schemas";

const COMPRAS_KEY = "compras";

/** Listado paginado de órdenes de compra (origen Ticket o Documento/Productos Varios). */
export function useComprasQuery(params: ListParams) {
  return useQuery({
    queryKey: [COMPRAS_KEY, params],
    queryFn: () => ordenesCompraService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useOrdenCompra(id: string) {
  return useQuery({
    queryKey: [COMPRAS_KEY, id],
    queryFn: () => ordenesCompraService.getById(id),
    enabled: !!id,
  });
}

/**
 * Tickets validados y aún sin orden de compra generada — son los únicos elegibles
 * como origen de una nueva orden (regla de "relación uno a uno" del esquema).
 */
export function useTicketsPendientesCompra() {
  return useQuery({
    queryKey: [COMPRAS_KEY, "tickets-pendientes"],
    queryFn: () => ticketsService.list({ pageSize: 50, filters: { estado: "Validado", tipoMovimiento: "Compra" } }),
  });
}

/**
 * Crea la orden de compra. En backend esto dispara la cuenta por pagar correspondiente y marca
 * el ticket como "Procesado" si aplica.
 *
 * IMPORTANTE: la compra NO genera movimiento de inventario. El producto ya ingresó físicamente
 * (y ya quedó registrado en el kardex) cuando se validó el ticket de báscula — o, si la compra
 * viene "Desde documento de proveedor", su ingreso ya fue registrado por otro medio. Repetir la
 * entrada aquí duplicaría el inventario. Quien sí afecta inventario (salida) es la orden de venta.
 */
export function useCrearOrdenCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrdenCompraFormValues) => {
      const body: Partial<OrdenCompraVenta> = {
        tipo: "Compra",
        ticketId: payload.origen === "Ticket" ? payload.ticketId : undefined,
        numeroDocumento: payload.origen === "Documento" ? payload.numeroDocumento : undefined,
        terceroId: payload.proveedorId,
        productoId: payload.productoId,
        cantidad: payload.cantidad,
        precioUnitario: payload.precioUnitario,
        valorTotal: payload.cantidad * payload.precioUnitario,
      };
      return ordenesCompraService.create(body);
    },
    onSuccess: () => {
      toast.success("Orden de compra generada. Cuenta por pagar actualizada. No afecta inventario: el ingreso ya se registró con el ticket de báscula.");
      queryClient.invalidateQueries({ queryKey: [COMPRAS_KEY] });
    },
    onError: () => {
      toast.error("No fue posible generar la orden de compra.");
    },
  });
}
