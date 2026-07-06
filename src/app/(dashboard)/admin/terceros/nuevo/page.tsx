"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useCrearTercero } from "@/hooks/use-terceros";
import { terceroSchema, type TerceroFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

export default function NuevoTerceroPage() {
  const router = useRouter();
  const crearTercero = useCrearTercero();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TerceroFormValues>({
    resolver: zodResolver(terceroSchema),
    defaultValues: { tipo: "Cliente" },
  });

  const tipo = watch("tipo");

  const onSubmit = (values: TerceroFormValues) => {
    crearTercero.mutate(values, { onSuccess: () => router.push("/admin/terceros") });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nuevo tercero</h1>
        <p className="text-sm text-muted-foreground">La identificación fiscal debe ser única dentro de la empresa activa</p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Tipo de tercero">
        <button
          type="button"
          onClick={() => setValue("tipo", "Cliente")}
          aria-pressed={tipo === "Cliente"}
          className={cn(
            "flex-1 rounded-lg border p-3 text-sm font-medium transition-colors",
            tipo === "Cliente" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
          )}
        >
          Cliente
        </button>
        <button
          type="button"
          onClick={() => setValue("tipo", "Proveedor")}
          aria-pressed={tipo === "Proveedor"}
          className={cn(
            "flex-1 rounded-lg border p-3 text-sm font-medium transition-colors",
            tipo === "Proveedor" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
          )}
        >
          Proveedor
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del tercero</CardTitle>
          <CardDescription>{tipo === "Proveedor" ? "Indica si es local o nacional" : "Datos del cliente"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField id="nombre" label="Nombre o razón social" required error={errors.nombre?.message}>
              <Input placeholder="Ej. Distribuidora El Progreso" {...register("nombre")} />
            </FormField>

            <FormField id="identificacionFiscal" label="Identificación fiscal" required error={errors.identificacionFiscal?.message} helpText="NIT, RUT o CC según aplique">
              <Input placeholder="Ej. 900.555.222-1" {...register("identificacionFiscal")} />
            </FormField>

            {tipo === "Proveedor" && (
              <FormField id="subtipoProveedor" label="Origen del proveedor" required error={errors.subtipoProveedor?.message}>
                <select
                  id="subtipoProveedor"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("subtipoProveedor")}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Local">Local</option>
                  <option value="Nacional">Nacional</option>
                </select>
              </FormField>
            )}

            <FormField id="condicionesPago" label="Condiciones de pago" required error={errors.condicionesPago?.message}>
              <select
                id="condicionesPago"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("condicionesPago")}
              >
                <option value="">Selecciona condiciones de pago</option>
                <option value="Contado">Contado</option>
                <option value="Credito 15 dias">Crédito 15 días</option>
                <option value="Credito 30 dias">Crédito 30 días</option>
                <option value="Credito 60 dias">Crédito 60 días</option>
              </select>
            </FormField>

            <div className="flex gap-2">
              <Button type="submit" isLoading={crearTercero.isPending}>
                <Save className="h-4 w-4" aria-hidden="true" /> Guardar tercero
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/terceros")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
