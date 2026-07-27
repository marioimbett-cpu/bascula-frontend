"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, FileCheck2, Wallet, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { FileUpload } from "@/components/forms/file-upload";
import { useCuentasAbiertas } from "@/hooks/use-cuentas";
import { useCrearPago } from "@/hooks/use-pagos";
import { pagoSchema, type PagoFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

const METODOS = [
  { value: "Transferencia", icon: Banknote },
  { value: "Cheque", icon: FileCheck2 },
  { value: "Caja Menor", icon: Wallet },
] as const;

function NuevoPagoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cuentaIdPreseleccionada = searchParams.get("cuentaId") ?? "";
  const { data: cuentas, isLoading: cargandoCuentas } = useCuentasAbiertas();
  const crearPago = useCrearPago();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: { cuentaId: cuentaIdPreseleccionada, valorPago: 0, metodoPago: "Transferencia" },
  });

  const metodoPago = watch("metodoPago");

  const onSubmit = (values: PagoFormValues) => {
    crearPago.mutate(values, { onSuccess: () => router.push("/financiero/pagos") });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Registrar pago</h1>
        <p className="text-sm text-muted-foreground">Se permiten abonos parciales; el saldo se recalcula automáticamente</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del pago</CardTitle>
          <CardDescription>Adjunta el comprobante para dejar el soporte trazable</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField id="cuentaId" label="Cuenta por pagar / cobrar" required error={errors.cuentaId?.message}>
              <select
                id="cuentaId"
                disabled={cargandoCuentas}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("cuentaId")}
              >
                <option value="">{cargandoCuentas ? "Cargando cuentas..." : "Selecciona una cuenta"}</option>
                {cuentas?.data.map((cuenta) => (
                  <option key={cuenta.id} value={cuenta.id}>
                    {cuenta.tipo} — saldo {cuenta.saldoPendiente.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="valorPago" label="Valor del pago" required error={errors.valorPago?.message}>
              <Input type="number" step="0.01" {...register("valorPago")} />
            </FormField>

            <div>
              <p className="mb-1.5 text-sm font-medium">Método de pago</p>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Método de pago">
                {METODOS.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={metodoPago === value}
                    onClick={() => setValue("metodoPago", value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors",
                      metodoPago === value ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {metodoPago === "Transferencia" && (
              <FormField id="referencia" label="N.º de comprobante" required error={errors.referencia?.message}>
                <Input placeholder="Ej. TRX-88213" {...register("referencia")} />
              </FormField>
            )}
            {metodoPago === "Caja Menor" && (
              <FormField id="referencia" label="N.º de comprobante de caja" error={errors.referencia?.message}>
                <Input placeholder="Ej. CM-0042" {...register("referencia")} />
              </FormField>
            )}
            {metodoPago === "Cheque" && (
              <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                Al guardar, se creará un registro de cheque en estado <strong>Registrado</strong>. Completa sus datos
                (banco, número, fecha de cobro) en el módulo de Cheques.
              </p>
            )}

            <div>
              <p className="mb-1.5 text-sm font-medium">Soporte del pago</p>
              <FileUpload accept="image/*,.pdf" label="Sube foto o PDF del comprobante" onFileSelected={() => undefined} />
            </div>

            <FormField id="observaciones" label="Observaciones" error={errors.observaciones?.message}>
              <textarea
                id="observaciones"
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("observaciones")}
              />
            </FormField>

            <div className="flex gap-2">
              <Button type="submit" isLoading={crearPago.isPending}>
                <Save className="h-4 w-4" aria-hidden="true" /> Registrar pago
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/financiero/pagos")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NuevoPagoPage() {
  return (
    <Suspense fallback={null}>
      <NuevoPagoForm />
    </Suspense>
  );
}
