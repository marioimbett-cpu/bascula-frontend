"use client";

import { useParams } from "next/navigation";
import { Truck, ArrowRight, Boxes, Wallet, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrdenCompra } from "@/hooks/use-compras";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdenCompraDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: orden, isLoading } = useOrdenCompra(id);

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
    cantidad: 12450,
    precioUnitario: 700,
    valorTotal: 8715000,
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
          <CardTitle>Movimientos generados</CardTitle>
          <CardDescription>Automáticos al crear la orden — flujo Compra → Inventario → Cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <span className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary-600" aria-hidden="true" /> Movimiento de inventario — Entrada
            </span>
            <Badge variant="success">Aplicado</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary-600" aria-hidden="true" /> Cuenta por pagar generada
            </span>
            <Badge variant="warning">Pendiente</Badge>
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            Siguiente paso: causación contable y registro de pago (transferencia, cheque o caja menor)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
