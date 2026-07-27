"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTercero } from "@/hooks/use-terceros";

export default function TerceroFichaPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: tercero, isLoading } = useTercero(id);

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const datos = tercero ?? {
    id,
    tipo: "Cliente" as const,
    nombre: "Distribuidora El Progreso",
    identificacionFiscal: "900.555.222-1",
    condicionesPago: "Credito 30 dias",
    saldoActual: 4120000,
    activo: true,
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Users className="h-5 w-5 text-primary-600" aria-hidden="true" /> {datos.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">{datos.tipo} · {datos.identificacionFiscal}</p>
        </div>
        <Badge variant={datos.activo ? "success" : "muted"}>{datos.activo ? "Activo" : "Inactivo"}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos generales</CardTitle>
          <CardDescription>Condiciones de pago: {datos.condicionesPago}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Identificación fiscal</p>
            <p className="font-medium">{datos.identificacionFiscal}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="font-medium">{datos.tipo}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary-600" aria-hidden="true" /> Saldo y estado de cuenta
          </CardTitle>
          <CardDescription>Consulta directa desde la ficha, sin salir del módulo de Terceros</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-2xl font-semibold">{datos.saldoActual.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</p>
          <Button variant="outline" asChild>
            <Link href="/financiero/cuentas">Ver cuentas asociadas</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
