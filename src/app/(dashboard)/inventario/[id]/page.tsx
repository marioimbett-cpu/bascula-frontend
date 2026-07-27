"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, RotateCcw, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducto, useKardex, useAjusteInventario } from "@/hooks/use-inventario";
import { ajusteInventarioSchema, type AjusteInventarioFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

const TIPO_ICON = { Entrada: ArrowUp, Salida: ArrowDown, Reverso: RotateCcw };
const TIPO_COLOR = { Entrada: "text-success", Salida: "text-destructive", Reverso: "text-amber-600" };

export default function KardexProductoPage() {
  const params = useParams();
  const productoId = params.id as string;
  const { data: producto, isLoading: cargandoProducto } = useProducto(productoId);
  const { data: kardex, isLoading: cargandoKardex } = useKardex(productoId);
  const ajuste = useAjusteInventario(productoId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AjusteInventarioFormValues>({
    resolver: zodResolver(ajusteInventarioSchema),
    defaultValues: { productoId, tipo: "Entrada", cantidad: 0, motivo: "" },
  });

  const tipoAjuste = watch("tipo");

  const onSubmit = (values: AjusteInventarioFormValues) => {
    ajuste.mutate(values, { onSuccess: () => reset({ productoId, tipo: "Entrada", cantidad: 0, motivo: "" }) });
  };

  const nombreProducto = producto?.nombre ?? "Producto";

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        {cargandoProducto ? <Skeleton className="h-7 w-64" /> : <h1 className="text-xl font-semibold">Kardex — {nombreProducto}</h1>}
        <p className="text-sm text-muted-foreground">Entradas, salidas y saldo del producto en la empresa activa</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos</CardTitle>
          <CardDescription>Historial ordenado del más reciente al más antiguo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {cargandoKardex ? (
            <>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </>
          ) : kardex && kardex.data.length > 0 ? (
            kardex.data.map((mov) => {
              const Icon = TIPO_ICON[mov.tipo];
              return (
                <div key={mov.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                  <span className={cn("flex items-center gap-2", TIPO_COLOR[mov.tipo])}>
                    <Icon className="h-4 w-4" aria-hidden="true" /> {mov.tipo}
                  </span>
                  <span className="text-muted-foreground">{new Date(mov.fecha).toLocaleDateString("es-CO")}</span>
                  <span className="font-medium">{mov.cantidad.toLocaleString("es-CO")}</span>
                  <span className="text-xs text-muted-foreground">Saldo: {mov.saldoResultante.toLocaleString("es-CO")}</span>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">Aún no hay movimientos registrados para este producto.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ajuste manual</CardTitle>
          <CardDescription>Mermas, conteos físicos o reversos por corrección de tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="flex gap-2" role="group" aria-label="Tipo de ajuste">
              <button
                type="button"
                onClick={() => setValue("tipo", "Entrada")}
                aria-pressed={tipoAjuste === "Entrada"}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-sm font-medium transition-colors",
                  tipoAjuste === "Entrada" ? "border-success bg-green-50 text-success dark:bg-green-900/20" : "border-border hover:bg-accent/50"
                )}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" /> Entrada
              </button>
              <button
                type="button"
                onClick={() => setValue("tipo", "Salida")}
                aria-pressed={tipoAjuste === "Salida"}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-sm font-medium transition-colors",
                  tipoAjuste === "Salida" ? "border-destructive bg-red-50 text-destructive dark:bg-red-900/20" : "border-border hover:bg-accent/50"
                )}
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" /> Salida
              </button>
            </div>

            <FormField id="cantidad" label="Cantidad" required error={errors.cantidad?.message}>
              <Input type="number" step="0.01" {...register("cantidad")} />
            </FormField>

            <FormField id="motivo" label="Motivo del ajuste" required error={errors.motivo?.message} helpText="Queda registrado con usuario y fecha para trazabilidad">
              <textarea
                id="motivo"
                rows={2}
                placeholder="Ej. Merma por humedad detectada en conteo físico"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("motivo")}
              />
            </FormField>

            <Button type="submit" isLoading={ajuste.isPending}>
              <Save className="h-4 w-4" aria-hidden="true" /> Registrar ajuste
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
