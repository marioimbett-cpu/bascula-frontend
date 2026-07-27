"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, FileText, Save, Info, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useTicketsPendientesVenta, useCrearOrdenVenta } from "@/hooks/use-ventas";
import { useTercerosQuery } from "@/hooks/use-terceros";
import { useProductosQuery } from "@/hooks/use-inventario";
import { ordenVentaSchema, type OrdenVentaFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

export default function NuevaVentaPage() {
  const router = useRouter();
  const [origen, setOrigen] = useState<"Ticket" | "Documento">("Ticket");
  const { data: ticketsPendientes, isLoading: cargandoTickets } = useTicketsPendientesVenta();
  const { data: clientes, isLoading: cargandoClientes } = useTercerosQuery({ page: 1, pageSize: 100, filters: { tipo: "Cliente" } });
  const { data: productos, isLoading: cargandoProductos } = useProductosQuery({ page: 1, pageSize: 100 });
  const crearOrden = useCrearOrdenVenta();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrdenVentaFormValues>({
    resolver: zodResolver(ordenVentaSchema),
    defaultValues: { origen: "Ticket", cantidad: 0, precioUnitario: 0, requiereFactura: true },
  });

  const cantidad = watch("cantidad") || 0;
  const precioUnitario = watch("precioUnitario") || 0;
  const requiereFactura = watch("requiereFactura");
  const valorTotal = cantidad * precioUnitario;

  const cambiarOrigen = (nuevoOrigen: "Ticket" | "Documento") => {
    setOrigen(nuevoOrigen);
    setValue("origen", nuevoOrigen);
  };

  const onSubmit = (values: OrdenVentaFormValues) => {
    crearOrden.mutate(values, { onSuccess: () => router.push("/ventas") });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nueva orden de venta</h1>
        <p className="text-sm text-muted-foreground">
          Cada ticket o documento genera una única orden — no se agrupan varios en un solo documento
        </p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Origen de la orden de venta">
        <button
          type="button"
          onClick={() => cambiarOrigen("Ticket")}
          aria-pressed={origen === "Ticket"}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg border p-4 text-left transition-colors",
            origen === "Ticket" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
          )}
        >
          <Truck className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Desde ticket de báscula</p>
            <p className="text-xs text-muted-foreground">Producto pesado, ya validado</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => cambiarOrigen("Documento")}
          aria-pressed={origen === "Documento"}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg border p-4 text-left transition-colors",
            origen === "Documento" ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border hover:bg-accent/50"
          )}
        >
          <FileText className="h-5 w-5 text-primary-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Venta directa (sin báscula)</p>
            <p className="text-xs text-muted-foreground">Productos varios, sin báscula</p>
          </div>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la orden</CardTitle>
          <CardDescription>El precio unitario es editable por transacción</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {origen === "Ticket" ? (
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
            ) : (
              <FormField id="numeroDocumento" label="N.º de documento de venta" required error={errors.numeroDocumento?.message}>
                <Input placeholder="Ej. FV-00045" {...register("numeroDocumento")} />
              </FormField>
            )}

            <FormField id="clienteId" label="Cliente" required error={errors.clienteId?.message}>
              <select
                id="clienteId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("clienteId")}
              >
                <option value="">{cargandoClientes ? "Cargando..." : "Selecciona un cliente"}</option>
                {clientes?.data.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              id="productoId"
              label="Producto"
              required
              error={errors.productoId?.message}
              helpText={origen === "Documento" ? "Productos varios: los que no pasan por la báscula" : undefined}
            >
              <select
                id="productoId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("productoId")}
              >
                <option value="">{cargandoProductos ? "Cargando..." : "Selecciona un producto"}</option>
                {productos?.data
                  .filter((producto) => (origen === "Ticket" ? producto.categoria === "Pesado en Bascula" : producto.categoria === "Productos Varios"))
                  .map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
              </select>
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField id="cantidad" label="Cantidad" required error={errors.cantidad?.message} helpText={origen === "Ticket" ? "Se sugiere el peso neto del ticket" : "Cantidad según el documento"}>
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
