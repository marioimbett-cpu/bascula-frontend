import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { facturasService } from "@/services/modules";
import type { Factura, FacturaItem } from "@/interfaces/domain";
import type { FacturaFormValues } from "@/utils/validation-schemas";

const FACTURAS_KEY = "facturas";

/** Factura individual (compra o venta) — usada en el detalle de la orden para mostrar lo ya capturado. */
export function useFactura(id?: string) {
  return useQuery({
    queryKey: [FACTURAS_KEY, id],
    queryFn: () => facturasService.getById(id as string),
    enabled: !!id,
  });
}

interface CrearFacturaInput {
  tipo: "Compra" | "Venta";
  ordenId: string;
  pdfUrl?: string;
  values: FacturaFormValues;
}

function calcularFactura(values: FacturaFormValues) {
  const items: FacturaItem[] = values.items.map((item, index) => ({
    id: `item-${index + 1}`,
    descripcion: item.descripcion,
    cantidad: item.cantidad,
    valorUnitario: item.valorUnitario,
    valorTotal: Number((item.cantidad * item.valorUnitario).toFixed(2)),
  }));
  const subtotal = items.reduce((acc, item) => acc + item.valorTotal, 0);
  const ivaValor = Number((subtotal * (values.ivaPorcentaje / 100)).toFixed(2));
  const valorRetencion = values.aplicaRetencion
    ? Number((subtotal * ((values.porcentajeRetencion ?? 0) / 100)).toFixed(2))
    : undefined;
  const valorTotal = subtotal + ivaValor - (valorRetencion ?? 0);
  return { items, subtotal, ivaValor, valorRetencion, valorTotal };
}

/**
 * Captura manual de la factura (de compra o de venta) con su PDF adjunto como soporte —
 * número, fecha, cliente/proveedor, ítems (descripción/valor unitario/valor total), IVA y
 * retención si aplica. Compartido entre el detalle de la orden de compra y el de venta.
 *
 * IMPORTANTE: la factura NUNCA genera movimiento de inventario. La entrada la genera el ticket
 * de báscula al validarse y la salida la genera la orden de venta — la compra y su factura no
 * vuelven a tocar el inventario en ningún caso.
 */
export function useCrearFactura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tipo, ordenId, pdfUrl, values }: CrearFacturaInput) => {
      const { items, subtotal, ivaValor, valorRetencion, valorTotal } = calcularFactura(values);
      const body: Partial<Factura> = {
        tipo,
        ordenId,
        numeroFactura: values.numeroFactura,
        fecha: values.fecha,
        terceroId: values.terceroId,
        items,
        subtotal,
        ivaPorcentaje: values.ivaPorcentaje,
        ivaValor,
        aplicaRetencion: values.aplicaRetencion,
        tipoRetencion: values.aplicaRetencion ? values.tipoRetencion : undefined,
        porcentajeRetencion: values.aplicaRetencion ? values.porcentajeRetencion : undefined,
        valorRetencion,
        valorTotal,
        pdfUrl,
        estado: "Pendiente",
      };
      return facturasService.create(body);
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.tipo === "Compra" ? "Factura de compra registrada." : "Factura de venta generada.");
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      queryClient.invalidateQueries({ queryKey: ["ventas"] });
      queryClient.invalidateQueries({ queryKey: [FACTURAS_KEY] });
    },
    onError: () => toast.error("No fue posible registrar la factura."),
  });
}
