"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useCrearUsuario } from "@/hooks/use-usuarios";
import { usuarioSchema, type UsuarioFormValues } from "@/utils/validation-schemas";
import type { RolUsuario } from "@/interfaces/domain";

const ROL_LABEL: Record<RolUsuario, string> = {
  Bascula: "Báscula / Captura",
  Ventas: "Ventas",
  Compras: "Compras",
  "Facturacion y Contabilidad": "Facturación y Contabilidad",
  Administrador: "Administrador / Supervisor",
};

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const crearUsuario = useCrearUsuario();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormValues>({ resolver: zodResolver(usuarioSchema) });

  const onSubmit = (values: UsuarioFormValues) => {
    crearUsuario.mutate(values, { onSuccess: () => router.push("/admin/usuarios") });
  };

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField id="nombre" label="Nombre completo" required error={errors.nombre?.message}>
              <Input placeholder="Ej. Laura Gómez" {...register("nombre")} />
            </FormField>
            <FormField id="email" label="Correo electrónico" required error={errors.email?.message}>
              <Input type="email" placeholder="usuario@empresa.com" {...register("email")} />
            </FormField>
            <FormField id="rol" label="Rol" required error={errors.rol?.message}>
              <select
                id="rol"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("rol")}
              >
                <option value="">Selecciona un rol</option>
                {Object.entries(ROL_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="flex gap-2">
              <Button type="submit" isLoading={crearUsuario.isPending}>
                <Save className="h-4 w-4" aria-hidden="true" /> Crear usuario
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/usuarios")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
