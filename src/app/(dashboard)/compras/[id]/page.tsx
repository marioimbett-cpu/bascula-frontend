 "use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Truck, ArrowRight, Boxes, Wallet, FileText, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/modals/modal";
import { FacturaForm } from "@/components/forms/factura-form";
import { useOrdenCompra } from "@/hooks/use-compras";

export default function OrdenCompraDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: orden, isLoading } = useOrdenCompra(id);
  const [modalFacturaOpen, setModalFacturaOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Datos de respaldo para previsualizar el diseño sin backend conectado
  const datos = orden ?? {
    id,
    serie: "OC",
    consecutivo: 132,
    ticketId: "tk-1",
    numeroDocumento: undefined,
    terceroId: "tercero-2",
    cantidad: 12450,
    precioUnitario: 700,
    valorTotal: 8715000,
    facturaId: undefined as string | undefined,
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Orden de compra {datos.serie}-{String(datos.consecutivo).padStart(4, "0")}
        </h1>
        <p className="text-sm text-muted-foreground">ID interno: {datos.id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Origen</CardTitle>
        </CardHeader>
        <CardContent>
          {datos.ticketId ? (
            <div className="flex items-center gap-2 rounded-md bg-primary-50 p-3 text-sm text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
              <Truck className="h-4 w-4" aria-hidden="true" /> Generada desde ticket de báscula
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-primary-50 p-3 text-sm text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
              <FileText className="h-4 w-4" aria-hidden="true" /> Generada desde documento de proveedor {datos.numeroDocumento}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>El precio unitario fue definido en esta transacción</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Cantidad</p>
            <p className="font-medium">{datos.cantidad.toLocaleString("es-CO")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio unitario</p>
            <p className="font-medium">{datos.precioUnitario.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor total</p>
            <p className="font-medium">{datos.valorTotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Factura de compra</CardTitle>
          <CardDescription>PDF adjunto + datos capturados manualmente (número, fecha, ítems, IVA, retenciones)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {datos.facturaId ? (
            <Badge variant="success">
              <ReceiptText className="mr-1 h-3 w-3" aria-hidden="true" /> Factura registrada
            </Badge>
          ) : (
            <>
              <Badge variant="warning">Factura pendiente</Badge>
              <Button size="sm" onClick={() => setModalFacturaOpen(true)}>
                Adjuntar factura del proveedor
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos generados</CardTitle>
          <CardDescription>Automáticos al crear la orden — flujo Compra → Cuenta por pagar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary-600" aria-hidden="true" /> Cuenta por pagar generada
            </span>
            <Badge variant="warning">Pendiente</Badge>
          </div>
          <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <Boxes className="h-4 w-4 shrink-0" aria-hidden="true" />
            Esta orden de compra <strong>no genera movimiento de inventario</strong>: el producto ya ingresó al
            inventario cuando se validó el ticket de báscula (o su ingreso ya fue registrado por otro medio).
            Solo la orden de venta genera movimiento de inventario (salida).
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            Siguiente paso: causación contable y registro de pago (transferencia, cheque o caja menor)
          </div>
        </CardContent>
      </Card>

      <Modal
        open={modalFacturaOpen}
        onClose={() => setModalFacturaOpen(false)}
        title="Factura de compra"
        description="Adjunta el PDF de la factura del proveedor y captura sus datos"
      >
        <FacturaForm
          tipo="Compra"
          ordenId={datos.id}
          terceroId={datos.terceroId}
          onCancel={() => setModalFacturaOpen(false)}
          onCreated={() => setModalFacturaOpen(false)}
        />
      </Modal>
    </div>
  );
}
