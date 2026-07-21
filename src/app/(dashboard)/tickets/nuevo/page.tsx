"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, FileText, Plus, Scan, Keyboard, Save, ShoppingCart, Tag, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { FileUpload } from "@/components/forms/file-upload";
import { Modal } from "@/components/modals/modal";
import { TerceroForm } from "@/components/forms/tercero-form";
import { UsuarioForm } from "@/components/forms/usuario-form";
import { useTercerosQuery } from "@/hooks/use-terceros";
import { useUsuariosQuery } from "@/hooks/use-usuarios";
import { useProductosQuery } from "@/hooks/use-inventario";
import { useCrearTicket } from "@/hooks/use-tickets";
import { ticketValidationSchema, type TicketValidationFormValues } from "@/utils/validation-schemas";
import { cn } from "@/utils/cn";

// Campos que el OCR reportó con baja confianza (simulado); en producción vendría de la respuesta del motor OCR.
const CAMPOS_BAJA_CONFIANZA = new Set(["pesoSalidaKg", "valorUnKg"]);

type MetodoCapturaTicket = "OCR" | "PDF" | "Manual";

export default function NuevoTicketPage() {
  const router = useRouter();
  const [metodo, setMetodo] = useState<MetodoCapturaTicket>("OCR");
  const [archivoCargado, setArchivoCargado] = useState(false);
  const [archivoUrl, setArchivoUrl] = useState<string | undefined>(undefined);
  const [modalTerceroOpen, setModalTerceroOpen] = useState(false);
  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);

  const { data: terceros, isLoading: cargandoTerceros } = useTercerosQuery({ page: 1, pageSize: 100 });
  const { data: usuarios, isLoading: cargandoUsuarios } = useUsuariosQuery({ page: 1, pageSize: 100 });
  const { data: productos, isLoading: cargandoProductos } = useProductosQuery({ page: 1, pageSize: 100 });
  const crearTicket = useCrearTicket();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketValidationFormValues>({
    resolver: zodResolver(ticketValidationSchema),
    defaultValues: { tipoMovimiento: "Compra", pesoEntradaKg: 0, pesoSalidaKg: 0, pesoDescontadoKg: 0, valorUnKg: 0 },
  });

  const tipoMovimiento = watch("tipoMovimiento") ?? "Compra";

  const pesoEntrada = watch("pesoEntradaKg") || 0;
  const pesoSalida = watch("pesoSalidaKg") || 0;
  const pesoDescontado = watch("pesoDescontadoKg") || 0;
  const pesoNeto = Math.max(0, pesoEntrada - pesoSalida - pesoDescontado);

  const cambiarMetodo = (siguiente: MetodoCapturaTicket) => {
    setMetodo(siguiente);
    setArchivoCargado(false);
    setArchivoUrl(undefined);
  };

  const onSubmit = (values: TicketValidationFormValues) => {
    const producto = productos?.data.find((p) => p.id === values.productoId);
    crearTicket.mutate(
      {
        ...values,
        pesoBrutoKg: pesoEntrada,
        pesoNetoKg: pesoNeto,
        valorTotal: Number((pesoNeto * values.valorUnKg).toFixed(2)),
        nombreMaterialBascula: producto?.nombre ?? "",
        metodoCaptura: metodo === "OCR" ? "OCR" : "Manual",
        tipoAdjunto: metodo === "OCR" ? "Imagen" : metodo === "PDF" ? "PDF" : undefined,
        imagenTicketUrl: archivoUrl,
        estado: "Capturado",
        estadoValidacion: "Pendiente",
      },
      {
        onSuccess: () => {
          reset();
          cambiarMetodo("OCR");
          router.push("/tickets");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Capturar ticket</h1>
        <p className="text-sm text-muted-foreground">
          Todo ticket capturado por OCR requiere validación humana antes de afectar inventario o finanzas.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de movimiento">
        <Button
          type="button"
          variant={tipoMovimiento === "Compra" ? "default" : "outline"}
          size="sm"
          onClick={() => setValue("tipoMovimiento", "Compra")}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Compra
        </Button>
        <Button
          type="button"
          variant={tipoMovimiento === "Venta" ? "default" : "outline"}
          size="sm"
          onClick={() => setValue("tipoMovimiento", "Venta")}
        >
          <Tag className="h-4 w-4" aria-hidden="true" /> Venta
        </Button>
        <Button
          type="button"
          variant={tipoMovimiento === "Servicio de Báscula" ? "default" : "outline"}
          size="sm"
          onClick={() => setValue("tipoMovimiento", "Servicio de Báscula")}
        >
          <Gauge className="h-4 w-4" aria-hidden="true" /> Servicio de báscula
        </Button>
      </div>
      {tipoMovimiento === "Servicio de Báscula" && (
        <p className="text-xs text-muted-foreground">
          Se cobra el pesaje según producto y valor por kg, igual que una compra o venta, pero no genera
          orden de compra/venta después de validarlo — queda como un servicio de báscula independiente.
        </p>
      )}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Método de captura">
        <Button variant={metodo === "OCR" ? "default" : "outline"} size="sm" onClick={() => cambiarMetodo("OCR")}>
          <Scan className="h-4 w-4" aria-hidden="true" /> Escaneo (OCR)
        </Button>
        <Button variant={metodo === "PDF" ? "default" : "outline"} size="sm" onClick={() => cambiarMetodo("PDF")}>
          <FileText className="h-4 w-4" aria-hidden="true" /> Documento PDF
        </Button>
        <Button variant={metodo === "Manual" ? "default" : "outline"} size="sm" onClick={() => cambiarMetodo("Manual")}>
          <Keyboard className="h-4 w-4" aria-hidden="true" /> Digitación manual
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {metodo !== "Manual" && (
          <Card>
            <CardHeader>
              <CardTitle>{metodo === "OCR" ? "Imagen del ticket" : "Documento del ticket"}</CardTitle>
              <CardDescription>
                {metodo === "OCR"
                  ? "Sube la foto o escaneo del ticket físico de báscula"
                  : "Sube el PDF del ticket como respaldo del movimiento"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                label={metodo === "OCR" ? "Arrastra la imagen o haz clic para subirla" : "Arrastra el PDF o haz clic para subirlo"}
                helpText={metodo === "OCR" ? "JPG o PNG — formato fijo del ticket de báscula" : "PDF — se adjunta como respaldo del ticket"}
                accept={metodo === "OCR" ? "image/*" : "application/pdf"}
                onFileSelected={(file) => {
                  setArchivoCargado(true);
                  setArchivoUrl(URL.createObjectURL(file));
                }}
              />
              {archivoCargado && metodo === "OCR" && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  Los campos resaltados en el formulario fueron detectados con baja confianza. Verifícalos.
                </p>
              )}
              {archivoCargado && metodo === "PDF" && (
                <p className="mt-3 text-xs text-muted-foreground">
                  El PDF queda adjunto como respaldo del ticket. Completa los datos manualmente en el formulario.
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
                  <option value="">{cargandoProductos ? "Cargando productos..." : "Selecciona un producto"}</option>
                  {productos?.data.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <FormField id="terceroId" label="Cliente / Proveedor" required error={errors.terceroId?.message}>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register("terceroId")}
                    >
                      <option value="">{cargandoTerceros ? "Cargando..." : "Selecciona un tercero"}</option>
                      {terceros?.data.map((tercero) => (
                        <option key={tercero.id} value={tercero.id}>
                          {tercero.nombre} ({tercero.tipo})
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setModalTerceroOpen(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo
                </Button>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <FormField id="registradoPorId" label="Registrado por" required error={errors.registradoPorId?.message} helpText="Usuario que captura el ticket">
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register("registradoPorId")}
                    >
                      <option value="">{cargandoUsuarios ? "Cargando..." : "Selecciona un usuario"}</option>
                      {usuarios?.data.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setModalUsuarioOpen(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo
                </Button>
              </div>

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

              <Button type="submit" className="w-full" isLoading={isSubmitting || crearTicket.isPending}>
                <Save className="h-4 w-4" aria-hidden="true" /> Registrar ticket
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={modalTerceroOpen}
        onClose={() => setModalTerceroOpen(false)}
        title="Nuevo cliente o proveedor"
        description="Se creará dentro de la empresa activa y quedará disponible de inmediato en este ticket"
      >
        <TerceroForm
          submitLabel="Crear y seleccionar"
          onCancel={() => setModalTerceroOpen(false)}
          onCreated={(tercero) => {
            setValue("terceroId", tercero.id, { shouldValidate: true });
            setModalTerceroOpen(false);
          }}
        />
      </Modal>

      <Modal
        open={modalUsuarioOpen}
        onClose={() => setModalUsuarioOpen(false)}
        title="Nuevo usuario"
        description="Define su rol — quedará disponible de inmediato como responsable de este ticket"
      >
        <UsuarioForm
          submitLabel="Crear y seleccionar"
          onCancel={() => setModalUsuarioOpen(false)}
          onCreated={(usuario) => {
            setValue("registradoPorId", usuario.id, { shouldValidate: true });
            setModalUsuarioOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
