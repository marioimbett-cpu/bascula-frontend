"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useAuth } from "@/context/auth-context";

export default function PerfilPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Perfil</h1>
        <p className="text-sm text-muted-foreground">Información de tu cuenta y rol asignado</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Rol: {user?.rol ?? "—"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="nombre" label="Nombre completo">
              <Input defaultValue={user?.nombre} />
            </FormField>
            <FormField id="email" label="Correo electrónico">
              <Input defaultValue={user?.email} type="email" disabled />
            </FormField>
          </div>
          <Button>Guardar cambios</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Actualiza tu contraseña periódicamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="passwordActual" label="Contraseña actual">
              <Input type="password" />
            </FormField>
            <FormField id="passwordNueva" label="Nueva contraseña" helpText="Mínimo 8 caracteres">
              <Input type="password" />
            </FormField>
          </div>
          <Button variant="outline">Actualizar contraseña</Button>
        </CardContent>
      </Card>
    </div>
  );
}
