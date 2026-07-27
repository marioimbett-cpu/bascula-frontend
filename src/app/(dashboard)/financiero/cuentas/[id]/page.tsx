"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Banknote, FileCheck2, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCuenta, usePagosDeCuenta } from "@/hooks/use-cuentas";

const METODO_ICON = { Transferencia: Banknote, Cheque: FileCheck2, "Caja Menor": Wallet };

export default function CuentaDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: cuenta, isLoading } = useCuenta(id);
  const { data: pagos, isLoading: cargandoPagos } = usePagosDeCuenta(id);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const datos = cuenta ?? {
    id,
    tipo: "Por Cobrar" as const,
    valorTotal: 8330000,
    saldoPendiente: 3330000,
    estado: "Abonada" as const,
    fechaVencimiento: new Date().toISOString(),
  };

  const porcentajePagado = ((datos.valorTotal - datos.saldoPendiente) / datos.valorTotal) * 100;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Estado de cuenta</h1>
          <p className="text-sm text-muted-foreground">{datos.tipo} · ID: {datos.id}</p>
        </div>
        <StatusBadge estado={datos.estado} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Vence el {new Date(datos.fechaVencimiento).toLocaleDateString("es-CO")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Valor total</p>
              <p className="font-medium">{datos.valorTotal.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo pendiente</p>
              <p className="font-medium text-destructive">{datos.saldoPendiente.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Abonado</p>
              <p className="font-medium text-success">
                {(datos.valorTotal - datos.saldoPendiente).toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </p>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={porcentajePagado} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-success" style={{ width: `${porcentajePagado}%` }} />
          </div>
          {datos.estado !== "Pagada" && (
            <Button asChild>
              <Link href={`/financiero/pagos/nuevo?cuentaId=${datos.id}`}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Registrar abono
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de pagos</CardTitle>
          <CardDescription>Trazabilidad completa de abonos aplicados a esta cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {cargandoPagos ? (
            <Skeleton className="h-16 w-full" />
          ) : pagos && pagos.data.length > 0 ? (
            pagos.data.map((pago) => {
              const Icon = METODO_ICON[pago.metodoPago];
              return (
                <div key={pago.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary-600" aria-hidden="true" />
                    {pago.metodoPago} {pago.referencia && `· ${pago.referencia}`}
                  </span>
                  <span className="font-medium">{pago.valorPago.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</span>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Aún no se han registrado pagos para esta cuenta.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
