"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Ban, Pencil, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";

// Datos de ejemplo — en producción se obtienen con ticketsService.getById(id) vía React Query
const TICKET_DEMO = {
  numeroBascula: "T-004521",
  estado: "Validado",
  tipoMovimiento: "Compra",
  pesoNetoKg: 12450,
  valorTotal: 8715000,
  conductor: "Carlos Pérez",
  placa: "WBH-234",
  producto: "Maíz amarillo",
  tercero: "Agroinsumos del Valle",
};

export default function TicketDetallePage() {
  const params = useParams();
  const [confirmarAnulacion, setConfirmarAnulacion] = useState(false);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Scale className="h-5 w-5 text-primary-600" aria-hidden="true" />
            Ticket {TICKET_DEMO.numeroBascula}
          </h1>
          <p className="text-sm text-muted-foreground">ID interno: {params.id}</p>
        </div>
        <StatusBadge estado={TICKET_DEMO.estado} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle del ticket</CardTitle>
          <CardDescription>Información capturada y validada</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Detalle label="Tipo de movimiento" valor={TICKET_DEMO.tipoMovimiento} />
          <Detalle label="Peso neto" valor={`${TICKET_DEMO.pesoNetoKg.toLocaleString("es-CO")} kg`} />
          <Detalle label="Valor total" valor={TICKET_DEMO.valorTotal.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })} />
          <Detalle label="Producto" valor={TICKET_DEMO.producto} />
          <Detalle label="Tercero" valor={TICKET_DEMO.tercero} />
          <Detalle label="Conductor / placa" valor={`${TICKET_DEMO.conductor} · ${TICKET_DEMO.placa}`} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline">
          <Pencil className="h-4 w-4" aria-hidden="true" /> Corregir
        </Button>
        <Button variant="destructive" onClick={() => setConfirmarAnulacion(true)}>
          <Ban className="h-4 w-4" aria-hidden="true" /> Anular
        </Button>
      </div>

      <ConfirmDialog
        open={confirmarAnulacion}
        title="Anular ticket"
        description="Esta acción no elimina el registro: queda marcado como Anulado y no afecta inventario ni finanzas. Si el ticket ya tiene pagos aplicados, se requerirá una nota de ajuste en su lugar."
        confirmLabel="Anular ticket"
        variant="destructive"
        onConfirm={() => setConfirmarAnulacion(false)}
        onCancel={() => setConfirmarAnulacion(false)}
      />
    </div>
  );
}

function Detalle({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{valor}</p>
    </div>
  );
}
