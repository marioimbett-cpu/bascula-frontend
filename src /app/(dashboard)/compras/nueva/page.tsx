"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, FileText, Save, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useTicketsPendientesCompra, useCrearOrdenCompra } from "@/hooks/use-compras";
import { useTercerosQuery } from "@/hooks/use-terceros";
import { useProductosQuery } from "@/hooks/use-inventario";
import { ordenCompraSchema, type OrdenCompraFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

export default function NuevaCompraPage() {
  const router = useRouter();
  const [origen, setOrigen] = useState<"Ticket" | "Documento">("Ticket");
  const { data: ticketsPendientes, isLoading: cargandoTickets } = useTicketsPendientesCompra();
  const { data: proveedores, isLoading: cargandoProveedores } = useTercerosQuery({ page: 1, pageSize: 100, filters: { tipo: "Proveedor" } });
  const { data: productos, isLoading: cargandoProductos } = useProductosQuery({ page: 1, pageSize: 100 });
  const crearOrden = useCrearOrdenCompra();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrdenCompraFormValues>({
    resolver: zodResolver(ordenCompraSchema),
    defaultValues: { origen: "Ticket", cantidad: 0, precioUnitario: 0 },
  });

  const cantidad = watch("cantidad") || 0;
  const precioUnitario = watch("precioUnitario") || 0;
  const valorTotal = cantidad * precioUnitario;

  const cambiarOrigen = (nuevoOrigen: "Ticket" | "Documento") => {
    setOrigen(nuevoOrigen);
    setValue("origen", nuevoOrigen);
  };

  const onSubmit = (values: OrdenCompraFormValues) => {
    crearOrden.mutate(values, {
      onSuccess: () => router.push("/compras"),
    });
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Nueva orden de compra</h1>
        <p className="text-sm text-muted-foreground">
          Cada ticket u documento genera una única orden — no se agrupan varios en un solo documento
        </p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Origen de la orden de compra">
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
            <p className="text-sm font-medium">Desde documento de proveedor</p>
            <p className="text-xs text-muted-foreground">Productos varios, sin báscula</p>
          </div>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la orden</CardTitle>
          <CardDescription>El precio unitario es editable — no proviene de una lista de precios fija</CardDescription>
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
              <FormField id="numeroDocumento" label="N.º de factura del proveedor" required error={errors.numeroDocumento?.message}>
                <Input placeholder="Ej. FC-00123" {...register("numeroDocumento")} />
              </FormField>
            )}

            <FormField id="proveedorId" label="Proveedor" required error={errors.proveedorId?.message}>
              <select
                id="proveedorId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("proveedorId")}
              >
                <option value="">{cargandoProveedores ? "Cargando..." : "Selecciona un proveedor"}</option>
                {proveedores?.data.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre} {proveedor.subtipoProveedor ? `(${proveedor.subtipoProveedor})` : ""}
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
              <FormField
                id="cantidad"
                label="Cantidad"
                required
                error={errors.cantidad?.message}
                helpText={origen === "Ticket" ? "Se sugiere el peso neto del ticket" : "Cantidad según el documento"}
              >
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

            <FormField id="observaciones" label="Observaciones" error={errors.observaciones?.message}>
              <textarea
                id="observaciones"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("observaciones")}
              />
            </FormField>

            <p className="text-xs text-muted-foreground">
              Al guardar se generará automáticamente el movimiento de inventario (entrada) y la cuenta por pagar
              correspondiente. La factura de compra es opcional y se causa contablemente por separado.
            </p>

            <div className="flex gap-2">
              <Button type="submit" isLoading={crearOrden.isPending}>
                <Save className="h-4 w-4" aria-hidden="true" /> Generar orden de compra
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/compras")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
