"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Scan, Keyboard, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { FileUpload } from "@/components/forms/file-upload";
import { ticketValidationSchema, type TicketValidationFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

// Campos que el OCR reportó con baja confianza (simulado); en producción vendría de la respuesta del motor OCR.
const CAMPOS_BAJA_CONFIANZA = new Set(["pesoSalidaKg", "valorUnKg"]);

export default function NuevoTicketPage() {
  const [metodo, setMetodo] = useState<"OCR" | "Manual">("OCR");
  const [imagenCargada, setImagenCargada] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TicketValidationFormValues>({
    resolver: zodResolver(ticketValidationSchema),
    defaultValues: { pesoEntradaKg: 0, pesoSalidaKg: 0, pesoDescontadoKg: 0, valorUnKg: 0 },
  });

  const pesoEntrada = watch("pesoEntradaKg") || 0;
  const pesoSalida = watch("pesoSalidaKg") || 0;
  const pesoDescontado = watch("pesoDescontadoKg") || 0;
  const pesoNeto = Math.max(0, pesoEntrada - pesoSalida - pesoDescontado);

  const onSubmit = async (values: TicketValidationFormValues) => {
    // En producción: POST a ticketsService.create({...values, estado: "Validado"})
    console.log("Ticket validado:", values);
    toast.success("Ticket validado y listo para generar orden de compra/venta.");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Capturar ticket</h1>
        <p className="text-sm text-muted-foreground">
          Todo ticket capturado por OCR requiere validación humana antes de afectar inventario o finanzas.
        </p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Método de captura">
        <Button variant={metodo === "OCR" ? "default" : "outline"} size="sm" onClick={() => setMetodo("OCR")}>
          <Scan className="h-4 w-4" aria-hidden="true" /> Escaneo (OCR)
        </Button>
        <Button variant={metodo === "Manual" ? "default" : "outline"} size="sm" onClick={() => setMetodo("Manual")}>
          <Keyboard className="h-4 w-4" aria-hidden="true" /> Digitación manual
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {metodo === "OCR" && (
          <Card>
            <CardHeader>
              <CardTitle>Imagen del ticket</CardTitle>
              <CardDescription>Sube la foto o escaneo del ticket físico de báscula</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                label="Arrastra la imagen o haz clic para subirla"
                helpText="JPG o PNG — formato fijo del ticket de báscula"
                onFileSelected={() => setImagenCargada(true)}
              />
              {imagenCargada && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Los campos resaltados en el formulario fueron detectados con baja confianza. Verifícalos.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card className={cn(metodo === "Manual" && "lg:col-span-2")}>
          <CardHeader>
            <CardTitle>Datos del ticket</CardTitle>
            <CardDescription>Formulario editable — corrige cualquier dato antes de validar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-3">
                <FormField id="pesoEntradaKg" label="Peso entrada (kg)" required error={errors.pesoEntradaKg?.message}>
                  <Input type="number" step="0.01" {...register("pesoEntradaKg")} />
                </FormField>
                <FormField
                  id="pesoSalidaKg"
                  label="Peso salida (kg)"
                  required
                  error={errors.pesoSalidaKg?.message}
                  className={cn(metodo === "OCR" && CAMPOS_BAJA_CONFIANZA.has("pesoSalidaKg") && "rounded-md ring-2 ring-amber-400")}
                >
                  <Input type="number" step="0.01" {...register("pesoSalidaKg")} />
                </FormField>
              </div>

              <FormField
                id="pesoDescontadoKg"
                label="Peso descontado / tara (kg)"
                error={errors.pesoDescontadoKg?.message}
                helpText="Descuento aplicado según el ticket físico (tara u otro)"
              >
                <Input type="number" step="0.01" {...register("pesoDescontadoKg")} />
              </FormField>

              <div className="rounded-md bg-muted p-3 text-sm">
                Peso neto calculado: <span className="font-semibold">{pesoNeto.toLocaleString("es-CO")} kg</span>
              </div>

              <FormField id="productoId" label="Producto" required error={errors.productoId?.message}>
                <select
                  id="productoId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("productoId")}
                >
                  <option value="">Selecciona un producto</option>
                  <option value="prod-1">Maíz amarillo</option>
                  <option value="prod-2">Arena de río</option>
                  <option value="prod-3">Productos varios</option>
                </select>
              </FormField>

              <FormField id="terceroId" label="Cliente / Proveedor" required error={errors.terceroId?.message}>
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

              <FormField
                id="valorUnKg"
                label="Valor por kg"
                required
                error={errors.valorUnKg?.message}
                className={cn(metodo === "OCR" && CAMPOS_BAJA_CONFIANZA.has("valorUnKg") && "rounded-md ring-2 ring-amber-400")}
                helpText="El precio es variable y se define en cada transacción"
              >
                <Input type="number" step="0.01" {...register("valorUnKg")} />
              </FormField>

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                <Save className="h-4 w-4" aria-hidden="true" /> Validar ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
