"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Info, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useTicketsPendientesVenta, useCrearOrdenVenta } from "@/hooks/use-ventas";
import { ordenVentaSchema, type OrdenVentaFormValues } from "@/utils/validation-schemas";

export default function NuevaVentaPage() {
  const router = useRouter();
  const { data: ticketsPendientes, isLoading: cargandoTickets } = useTicketsPendientesVenta();
  const crearOrden = useCrearOrdenVenta();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrdenVentaFormValues>({
    resolver: zodResolver(ordenVentaSchema),
    defaultValues: { cantidad: 0, precioUnitario: 0, requiereFactura: true },
  });

  const cantidad = watch("cantidad") || 0;
  const precioUnitario = watch("precioUnitario") || 0;
  const requiereFactura = watch("requiereFactura");
  const valorTotal = cantidad * precioUnitario;

  const onSubmit = (values: OrdenVentaFormValues) => {
    crearOrden.mutate(values, { onSuccess: () => router.push("/ventas") });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nueva orden de venta</h1>
        <p className="text-sm text-muted-foreground">Se genera desde un ticket de báscula ya validado</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la orden</CardTitle>
          <CardDescription>El precio unitario es editable por transacción</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField id="ticketId" label="Ticket de báscula" required error={errors.ticketId?.message}>
              <select
                id="ticketId"
                disabled={cargandoTickets}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("ticketId")}
              >
                <option value="">{cargandoTickets ? "Cargando tickets..." : "Selecciona un ticket validado"}</option>
                {ticketsPendientes?.data.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.numeroBascula} — {ticket.nombreMaterialBascula} — {ticket.pesoNetoKg.toLocaleString("es-CO")} kg
                  </option>
                ))}
              </select>
            </FormField>

            <FormField id="clienteId" label="Cliente" required error={errors.clienteId?.message}>
              <select
                id="clienteId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("clienteId")}
              >
                <option value="">Selecciona un cliente</option>
                <option value="cli-1">Distribuidora El Progreso</option>
                <option value="cli-2">Comercializadora San José</option>
              </select>
            </FormField>

            <FormField id="productoId" label="Producto" required error={errors.productoId?.message}>
              <select
                id="productoId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("productoId")}
              >
                <option value="">Selecciona un producto</option>
                <option value="prod-1">Maíz amarillo</option>
                <option value="prod-2">Arena de río</option>
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="cantidad" label="Cantidad" required error={errors.cantidad?.message} helpText="Se sugiere el peso neto del ticket">
                <Input type="number" step="0.01" {...register("cantidad")} />
              </FormField>
              <FormField id="precioUnitario" label="Precio unitario" required error={errors.precioUnitario?.message}>
                <Input type="number" step="0.01" {...register("precioUnitario")} />
              </FormField>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
              <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Valor total:{" "}
              <span className="font-semibold">
                {valorTotal.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
              </span>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" {...register("requiereFactura")} />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <ReceiptText className="h-4 w-4" aria-hidden="true" /> Generar factura de venta
                </span>
                <span className="text-xs text-muted-foreground">
                  {requiereFactura
                    ? "Se generará una factura asociada a esta orden."
                    : "No se generará factura — la cuenta por cobrar quedará soportada directamente en la orden de venta."}
                </span>
              </span>
            </label>

            <div className="flex gap-2">
              <Button type="submit" isLoading={crearOrden.isPending}>
                <Save className="h-4 w-4" aria-hidden="true" /> Generar orden de venta
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/ventas")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
