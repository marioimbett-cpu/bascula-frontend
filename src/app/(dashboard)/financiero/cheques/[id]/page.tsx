"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowUpCircle, ArrowDownCircle, Ban, CheckCircle2, Landmark, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useCheque, useCambiarEstadoCheque } from "@/hooks/use-cheques";
import type { EstadoCheque } from "@/interfaces/domain";

// Transiciones válidas desde cada estado (sección 3.8 del esquema)
const TRANSICIONES: Record<EstadoCheque, EstadoCheque[]> = {
  Registrado: ["Pendiente de cobro", "Anulado"],
  "Pendiente de cobro": ["Consignado", "Devuelto/Rechazado"],
  Consignado: ["Cobrado", "Devuelto/Rechazado"],
  Cobrado: [],
  "Devuelto/Rechazado": [],
  Anulado: [],
};

const ACCION_LABEL: Record<EstadoCheque, string> = {
  Registrado: "Registrar",
  "Pendiente de cobro": "Marcar pendiente de cobro",
  Consignado: "Consignar",
  Cobrado: "Confirmar cobro",
  "Devuelto/Rechazado": "Marcar devuelto/rechazado",
  Anulado: "Anular",
};

export default function ChequeDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { data: cheque, isLoading } = useCheque(id);
  const cambiarEstado = useCambiarEstadoCheque();
  const [transicionPendiente, setTransicionPendiente] = useState<EstadoCheque | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const datos = cheque ?? {
    id,
    tipo: "Emitido" as const,
    numeroCheque: "000452",
    banco: "Bancolombia",
    cuentaBancaria: "123-456789-00",
    valor: 3200000,
    fechaEmision: new Date().toISOString(),
    fechaVencimientoCobro: new Date(Date.now() + 5 * 86400000).toISOString(),
    estado: "Pendiente de cobro" as EstadoCheque,
  };

  const transicionesDisponibles = TRANSICIONES[datos.estado];
  const esDevolucion = transicionPendiente === "Devuelto/Rechazado";

  const confirmarTransicion = () => {
    if (!transicionPendiente) return;
    cambiarEstado.mutate({ id: datos.id, estado: transicionPendiente }, { onSuccess: () => setTransicionPendiente(null) });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {datos.tipo === "Emitido" ? (
              <ArrowUpCircle className="h-5 w-5 text-primary-600" aria-hidden="true" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 text-primary-600" aria-hidden="true" />
            )}
            Cheque {datos.numeroCheque}
          </h1>
          <p className="text-sm text-muted-foreground">{datos.tipo} · {datos.banco}</p>
        </div>
        <StatusBadge estado={datos.estado} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>Cuenta bancaria {datos.cuentaBancaria}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Valor</p>
            <p className="font-medium">{datos.valor.toLocaleString("es-CO", { style: "currency", currency: "COP" })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de emisión</p>
            <p className="font-medium">{new Date(datos.fechaEmision).toLocaleDateString("es-CO")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de cobro</p>
            <p className="font-medium">{new Date(datos.fechaVencimientoCobro).toLocaleDateString("es-CO")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar estado</CardTitle>
          <CardDescription>Solo se muestran las transiciones válidas desde el estado actual</CardDescription>
        </CardHeader>
        <CardContent>
          {transicionesDisponibles.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Este cheque no tiene más transiciones disponibles.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {transicionesDisponibles.map((estado) => (
                <Button
                  key={estado}
                  variant={estado === "Devuelto/Rechazado" || estado === "Anulado" ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setTransicionPendiente(estado)}
                >
                  {estado === "Consignado" && <Landmark className="h-4 w-4" aria-hidden="true" />}
                  {estado === "Devuelto/Rechazado" && <RotateCcw className="h-4 w-4" aria-hidden="true" />}
                  {estado === "Anulado" && <Ban className="h-4 w-4" aria-hidden="true" />}
                  {ACCION_LABEL[estado]}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!transicionPendiente}
        title={transicionPendiente ? ACCION_LABEL[transicionPendiente] : ""}
        description={
          esDevolucion
            ? "El banco rechazó este cheque. Esta acción reversará automáticamente el pago asociado y reabrirá el saldo pendiente de la cuenta por pagar/cobrar correspondiente."
            : transicionPendiente === "Anulado"
            ? "El cheque queda anulado en la chequera propia (error de impresión o extravío). No afecta ningún saldo."
            : `El cheque pasará al estado "${transicionPendiente}".`
        }
        confirmLabel={transicionPendiente ? ACCION_LABEL[transicionPendiente] : "Confirmar"}
        variant={esDevolucion || transicionPendiente === "Anulado" ? "destructive" : "default"}
        isLoading={cambiarEstado.isPending}
        onConfirm={confirmarTransicion}
        onCancel={() => setTransicionPendiente(null)}
      />
    </div>
  );
}
