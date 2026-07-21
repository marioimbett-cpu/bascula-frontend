import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ordenesVentaService, ticketsService } from "@/services/modules";
import { api } from "@/services/api";
import type { ListParams } from "@/services/resource";
import type { OrdenCompraVenta } from "@/interfaces/domain";
import type { OrdenVentaFormValues } from "@/utils/validation-schemas";

const VENTAS_KEY = "ventas";

export function useVentasQuery(params: ListParams) {
  return useQuery({
    queryKey: [VENTAS_KEY, params],
    queryFn: () => ordenesVentaService.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useOrdenVenta(id: string) {
  return useQuery({
    queryKey: [VENTAS_KEY, id],
    queryFn: () => ordenesVentaService.getById(id),
    enabled: !!id,
  });
}

/** Tickets de Venta ya validados y sin orden generada (origen siempre báscula para ventas). */
export function useTicketsPendientesVenta() {
  return useQuery({
    queryKey: [VENTAS_KEY, "tickets-pendientes"],
    queryFn: () => ticketsService.list({ pageSize: 50, filters: { estado: "Validado", tipoMovimiento: "Venta" } }),
  });
}

/**
 * Crea la orden de venta. En backend dispara: movimiento de inventario (salida) + cuenta por cobrar.
 * Si requiereFactura = false, la cuenta por cobrar queda soportada directamente en la orden.
 */
export function useCrearOrdenVenta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrdenVentaFormValues) => {
      const body: Partial<OrdenCompraVenta> = {
        tipo: "Venta",
        ticketId: payload.origen === "Ticket" ? payload.ticketId : undefined,
        numeroDocumento: payload.origen === "Documento" ? payload.numeroDocumento : undefined,
        terceroId: payload.clienteId,
        productoId: payload.productoId,
        cantidad: payload.cantidad,
        precioUnitario: payload.precioUnitario,
        valorTotal: payload.cantidad * payload.precioUnitario,
        requiereFactura: payload.requiereFactura,
      };
      return ordenesVentaService.create(body);
    },
    onSuccess: () => {
      toast.success("Orden de venta generada. Inventario y cuenta por cobrar actualizados.");
      queryClient.invalidateQueries({ queryKey: [VENTAS_KEY] });
    },
    onError: () => toast.error("No fue posible generar la orden de venta."),
  });
}

/** Genera la factura opcional asociada a una orden de venta ya creada. */
export function useGenerarFactura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ordenVentaId: string) => api.post(`/facturas`, { ordenVentaId }).then((r) => r.data),
    onSuccess: () => {
      toast.success("Factura generada correctamente.");
      queryClient.invalidateQueries({ queryKey: [VENTAS_KEY] });
    },
    onError: () => toast.error("No fue posible generar la factura."),
  });
}
