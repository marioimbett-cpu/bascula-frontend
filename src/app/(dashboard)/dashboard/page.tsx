"use client";

import { Truck, Wallet, Banknote, FileCheck2, Plus, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/cards/stat-card";
import { ComprasVentasChart } from "@/components/charts/compras-ventas-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import Link from "next/link";

const DATA_CHART = [
  { fecha: "01 jun", compras: 4200000, ventas: 5100000 },
  { fecha: "08 jun", compras: 3900000, ventas: 4700000 },
  { fecha: "15 jun", compras: 5100000, ventas: 4300000 },
  { fecha: "22 jun", compras: 4700000, ventas: 6200000 },
  { fecha: "29 jun", compras: 5600000, ventas: 5800000 },
];

const ACTIVIDAD_RECIENTE = [
  { id: "1", texto: "Ticket #00452 validado por J. Ramírez", estado: "Validado", hace: "hace 5 min" },
  { id: "2", texto: "Pago registrado a Transportes del Norte", estado: "Pagado", hace: "hace 22 min" },
  { id: "3", texto: "Cheque #8891 marcado como Devuelto/Rechazado", estado: "Devuelto/Rechazado", hace: "hace 1 h" },
  { id: "4", texto: "Factura FV-0231 causada contablemente", estado: "Causada", hace: "hace 2 h" },
];

const TAREAS_PENDIENTES = [
  { id: "1", texto: "8 tickets capturados por OCR sin validar" },
  { id: "2", texto: "3 facturas pendientes de causación" },
  { id: "3", texto: "2 cheques posfechados vencen esta semana" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen general de la operación de hoy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/tickets/nuevo">
              <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo ticket
            </Link>
          </Button>
          <Button asChild>
            <Link href="/financiero/pagos">
              <Plus className="h-4 w-4" aria-hidden="true" /> Registrar pago
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tickets hoy" value="27" icon={<Truck className="h-5 w-5" aria-hidden="true" />} trend={{ value: 12, label: "vs. ayer" }} />
        <StatCard label="Cartera por vencer" value="$18.4M" icon={<Wallet className="h-5 w-5" aria-hidden="true" />} tone="warning" trend={{ value: -4, label: "vs. semana pasada" }} />
        <StatCard label="Caja menor disponible" value="$1.2M" icon={<Banknote className="h-5 w-5" aria-hidden="true" />} tone="success" />
        <StatCard label="Cheques por vencer" value="5" icon={<FileCheck2 className="h-5 w-5" aria-hidden="true" />} tone="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComprasVentasChart data={DATA_CHART} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tareas pendientes</CardTitle>
            <CardDescription>Requieren tu atención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {TAREAS_PENDIENTES.map((tarea) => (
              <div key={tarea.id} className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {tarea.texto}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription>Últimos movimientos en el sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {ACTIVIDAD_RECIENTE.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
              <span className="text-sm">{item.texto}</span>
              <div className="flex items-center gap-3">
                <StatusBadge estado={item.estado} />
                <span className="text-xs text-muted-foreground">{item.hace}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
