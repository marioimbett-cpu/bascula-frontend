"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpCircle, ArrowDownCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useCrearCheque } from "@/hooks/use-cheques";
import { chequeSchema, type ChequeFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

export default function NuevoChequePage() {
  const router = useRouter();
  const crearCheque = useCrearCheque();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChequeFormValues>({
    resolver: zodResolver(chequeSchema),
    defaultValues: { tipo: "Emitido", valor: 0 },
  });

  const tipo = watch("tipo");

  const onSubmit = (values: ChequeFormValues) => {
    crearCheque.mutate(values, { onSuccess: () => router.push("/financiero/cheques") });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Registrar cheque</h1>
        <p className="text-sm text-muted-foreground">Soporta cheques posfechados — fecha de cobro distinta a la de emisión</p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Tipo de cheque">
        <button
          type="button"
          onClick={() => setValue("tipo", "Emitido")}
          aria-pressed={tipo === "Emitido"}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg border p-4 text-left transition-colors",
            tipo === "Emitido" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
          )}
        >
          <ArrowUpCircle className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Emitido</p>
            <p className="text-xs text-muted-foreground">Pago a proveedor</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setValue("tipo", "Recibido")}
          aria-pressed={tipo === "Recibido"}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg border p-4 text-left transition-colors",
            tipo === "Recibido" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
          )}
        >
          <ArrowDownCircle className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Recibido</p>
            <p className="text-xs text-muted-foreground">Cobro a cliente</p>
          </div>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del cheque</CardTitle>
          <CardDescription>{tipo === "Emitido" ? "Chequera propia — numeración consecutiva" : "Cheque de terceros"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <FormField id="numeroCheque" label="N.º de cheque" required error={errors.numeroCheque?.message}>
                <Input placeholder="Ej. 000452" {...register("numeroCheque")} />
              </FormField>
              <FormField id="banco" label="Banco" required error={errors.banco?.message}>
                <Input placeholder="Ej. Bancolombia" {...register("banco")} />
              </FormField>
            </div>

            <FormField id="cuentaBancaria" label="Cuenta bancaria" required error={errors.cuentaBancaria?.message}>
              <Input placeholder="Ej. 123-456789-00" {...register("cuentaBancaria")} />
            </FormField>

            <FormField id="terceroId" label={tipo === "Emitido" ? "Proveedor (beneficiario)" : "Cliente (librador)"} required error={errors.terceroId?.message}>
              <select
                id="terceroId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("terceroId")}
              >
                <option value="">Selecciona un tercero</option>
                <option value="tercero-1">Transportes del Norte S.A.S.</option>
                <option value="tercero-2">Agroinsumos del Valle</option>
              </select>
            </FormField>

            <FormField id="valor" label="Valor" required error={errors.valor?.message}>
              <Input type="number" step="0.01" {...register("valor")} />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="fechaEmision" label="Fecha de emisión" required error={errors.fechaEmision?.message}>
                <Input type="date" {...register("fechaEmision")} />
              </FormField>
              <FormField
                id="fechaVencimientoCobro"
                label="Fecha de cobro"
                required
                error={errors.fechaVencimientoCobro?.message}
                helpText="Puede ser posterior a la emisión (cheque posfechado)"
              >
                <Input type="date" {...register("fechaVencimientoCobro")} />
              </FormField>
            </div>

            <div className="flex gap-2">
              <Button type="submit" isLoading={crearCheque.isPending}>
                <Save className="h-4 w-4" aria-hidden="true" /> Registrar cheque
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/financiero/cheques")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
