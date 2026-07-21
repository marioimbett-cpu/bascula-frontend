"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TerceroForm } from "@/components/forms/tercero-form";

export default function NuevoTerceroPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nuevo tercero</h1>
        <p className="text-sm text-muted-foreground">La identificación fiscal debe ser única dentro de la empresa activa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del tercero</CardTitle>
          <CardDescription>Indica si es cliente o proveedor y completa sus datos</CardDescription>
        </CardHeader>
        <CardContent>
          <TerceroForm onCreated={() => router.push("/admin/terceros")} onCancel={() => router.push("/admin/terceros")} />
        </CardContent>
      </Card>
    </div>
  );
}
