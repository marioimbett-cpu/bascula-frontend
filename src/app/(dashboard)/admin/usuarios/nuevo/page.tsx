"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UsuarioForm } from "@/components/forms/usuario-form";

export default function NuevoUsuarioPage() {
  const router = useRouter();

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nuevo usuario</h1>
        <p className="text-sm text-muted-foreground">El rol determina los permisos por módulo, no por empresa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del usuario</CardTitle>
          <CardDescription>Se enviará una invitación al correo para definir su contraseña</CardDescription>
        </CardHeader>
        <CardContent>
          <UsuarioForm onCreated={() => router.push("/admin/usuarios")} onCancel={() => router.push("/admin/usuarios")} />
        </CardContent>
      </Card>
    </div>
  );
}
