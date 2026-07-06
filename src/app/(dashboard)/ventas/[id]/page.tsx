"use client";

import { useParams } from "next/navigation";
import { Truck, Boxes, Wallet, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrdenVenta, useGenerarFactura } from "@/hooks/use-ventas";

export default function OrdenVentaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: orden, isLoading } = useOrdenVenta(id);
  const generarFactura = useGenerarFactura();

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const datos = orden ?? {
    id,
    serie: "OV",
    consecutivo: 87,
    cantidad: 9800,
    precioUnitario: 850,
    valorTotal: 8330000,
    requiereFactura: true,
    facturaId: undefined as string | undefined,
  };

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Orden de venta {datos.serie}-{String(datos.consecutivo).padStart(4, "0")}
        </h1>
        <p className="text-sm text-muted-foreground">ID interno: {datos.id}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Origen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-md bg-primary-50 p-3 text-sm text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
            <Truck className="h-4 w-4" aria-hidden="true" /> Generada desde ticket de báscula
          </div>
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
          <CardTitle>Facturación</CardTitle>
          <CardDescription>Opcional según el caso — siempre se genera cuenta por cobrar</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {datos.requiereFactura ? (
            datos.facturaId ? (
              <Badge variant="success">
                <ReceiptText className="mr-1 h-3 w-3" aria-hidden="true" /> Factura generada
              </Badge>
            ) : (
              <>
                <Badge variant="warning">Factura pendiente</Badge>
                <Button size="sm" onClick={() => generarFactura.mutate(datos.id)} isLoading={generarFactura.isPending}>
                  Generar factura
                </Button>
              </>
            )
          ) : (
            <Badge variant="muted">No requiere factura — soportada en la orden</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos generados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <span className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-primary-600" aria-hidden="true" /> Movimiento de inventario — Salida
            </span>
            <Badge variant="success">Aplicado</Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary-600" aria-hidden="true" /> Cuenta por cobrar generada
            </span>
            <Badge variant="warning">Pendiente</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
