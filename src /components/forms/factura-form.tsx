"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Info, ReceiptText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { FileUpload } from "@/components/forms/file-upload";
import { useCrearFactura } from "@/hooks/use-facturas";
import { facturaSchema, type FacturaFormValues } from "@/utils/validation-schemas";

const OPCIONES_IVA = [0, 5, 19];
const OPCIONES_RETENCION: { value: "ReteFuente" | "ReteIVA" | "ReteICA"; label: string }[] = [
  { value: "ReteFuente", label: "Retención en la fuente" },
  { value: "ReteIVA", label: "Retención de IVA" },
  { value: "ReteICA", label: "Retención de ICA" },
];

interface FacturaFormProps {
  /** Compra: se captura la factura del proveedor. Venta: se captura/genera la factura del cliente. */
  tipo: "Compra" | "Venta";
  /** Id de la orden de compra o de venta que esta factura soporta. */
  ordenId: string;
  /** Tercero (proveedor o cliente) tomado de la orden de origen — no editable aquí. */
  terceroId: string;
  terceroNombre?: string;
  onCancel: () => void;
  onCreated: () => void;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * Captura manual de una factura (de compra o de venta) a partir del PDF que el usuario adjunta
 * como soporte del documento — el sistema no hace OCR sobre este PDF, los datos se digitan:
 * número de factura, fecha, cliente/proveedor, ítems (descripción, valor unitario, valor total),
 * IVA y retención si aplica. Se usa tanto en el detalle de la orden de compra como en el de venta.
 *
 * Esta factura no afecta inventario en ningún caso: solo soporta la causación contable y la
 * cuenta por pagar (compra) o por cobrar (venta) de la orden asociada.
 */
export function FacturaForm({ tipo, ordenId, terceroId, terceroNombre, onCancel, onCreated }: FacturaFormProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const crearFactura = useCrearFactura();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FacturaFormValues>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      numeroFactura: "",
      fecha: new Date().toISOString().slice(0, 10),
      terceroId,
      items: [{ descripcion: "", cantidad: 1, valorUnitario: 0 }],
      ivaPorcentaje: 19,
      aplicaRetencion: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const items = watch("items");
  const ivaPorcentaje = Number(watch("ivaPorcentaje")) || 0;
  const aplicaRetencion = watch("aplicaRetencion");
  const porcentajeRetencion = Number(watch("porcentajeRetencion")) || 0;

  const subtotal = (items ?? []).reduce((acc, item) => acc + (Number(item?.cantidad) || 0) * (Number(item?.valorUnitario) || 0), 0);
  const ivaValor = subtotal * (ivaPorcentaje / 100);
  const retencionValor = aplicaRetencion ? subtotal * (porcentajeRetencion / 100) : 0;
  const total = subtotal + ivaValor - retencionValor;

  const formatCOP = (valor: number) => valor.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  const onSubmit = (values: FacturaFormValues) => {
    if (!pdfFile) {
      setPdfError("Adjunta el PDF de la factura antes de guardar.");
      return;
    }
    crearFactura.mutate({ tipo, ordenId, pdfUrl: URL.createObjectURL(pdfFile), values }, { onSuccess: onCreated });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <FileUpload
          label="Arrastra el PDF de la factura o haz clic para subirlo"
          helpText={`Documento original de la factura de ${tipo === "Compra" ? "proveedor" : "venta"} — queda como soporte`}
          accept="application/pdf"
          onFileSelected={(file) => {
            setPdfFile(file);
            setPdfError(null);
          }}
        />
        {pdfError && (
          <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
            {pdfError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField id="numeroFactura" label="N.º de factura" required error={errors.numeroFactura?.message}>
          <Input placeholder="Ej. FE-00123" {...register("numeroFactura")} />
        </FormField>
        <FormField id="fecha" label="Fecha de la factura" required error={errors.fecha?.message}>
          <Input type="date" {...register("fecha")} />
        </FormField>
      </div>

      <FormField id="terceroId" label={tipo === "Compra" ? "Proveedor" : "Cliente"} helpText="Tomado de la orden de origen">
        <input type="hidden" {...register("terceroId")} />
        <Input readOnly value={terceroNombre ?? terceroId} />
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Ítems de la factura</p>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ descripcion: "", cantidad: 1, valorUnitario: 0 })}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Agregar ítem
          </Button>
        </div>
        {errors.items?.message && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {errors.items.message}
          </p>
        )}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 rounded-md border border-border p-2">
              <div className="col-span-6">
                <FormField id={`items.${index}.descripcion`} label="Descripción" error={errors.items?.[index]?.descripcion?.message}>
                  <Input placeholder="Ej. Maíz amarillo" {...register(`items.${index}.descripcion` as const)} />
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField id={`items.${index}.cantidad`} label="Cantidad" error={errors.items?.[index]?.cantidad?.message}>
                  <Input type="number" step="0.01" {...register(`items.${index}.cantidad` as const)} />
                </FormField>
              </div>
              <div className="col-span-3">
                <FormField id={`items.${index}.valorUnitario`} label="Valor unitario" error={errors.items?.[index]?.valorUnitario?.message}>
                  <Input type="number" step="0.01" {...register(`items.${index}.valorUnitario` as const)} />
                </FormField>
              </div>
              <div className="col-span-1 flex items-end justify-center pb-1.5">
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  aria-label="Quitar ítem"
                  disabled={fields.length === 1}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="col-span-12 text-right text-xs text-muted-foreground">
                Valor total ítem: {formatCOP((Number(items?.[index]?.cantidad) || 0) * (Number(items?.[index]?.valorUnitario) || 0))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FormField id="ivaPorcentaje" label="IVA" error={errors.ivaPorcentaje?.message}>
        <select id="ivaPorcentaje" className={selectClass} {...register("ivaPorcentaje")}>
          {OPCIONES_IVA.map((valor) => (
            <option key={valor} value={valor}>
              {valor}%
            </option>
          ))}
        </select>
      </FormField>

      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" {...register("aplicaRetencion")} />
        <span>
          <span className="text-sm font-medium">¿Esta factura tiene retenciones?</span>
          <span className="block text-xs text-muted-foreground">
            Aplica cuando el {tipo === "Compra" ? "proveedor" : "cliente"} practica una retención sobre el valor de la factura.
          </span>
        </span>
      </label>

      {aplicaRetencion && (
        <div className="grid grid-cols-2 gap-3">
          <FormField id="tipoRetencion" label="Tipo de retención" required error={errors.tipoRetencion?.message}>
            <select id="tipoRetencion" className={selectClass} {...register("tipoRetencion")}>
              <option value="">Selecciona</option>
              {OPCIONES_RETENCION.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="porcentajeRetencion" label="Porcentaje" required error={errors.porcentajeRetencion?.message}>
            <Input type="number" step="0.01" {...register("porcentajeRetencion")} />
          </FormField>
        </div>
      )}

      <div className="space-y-1 rounded-md bg-muted p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCOP(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">IVA ({ivaPorcentaje}%)</span>
          <span>{formatCOP(ivaValor)}</span>
        </div>
        {aplicaRetencion && (
          <div className="flex items-center justify-between text-destructive">
            <span>Retención ({porcentajeRetencion}%)</span>
            <span>- {formatCOP(retencionValor)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border pt-1 font-semibold">
          <span className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" aria-hidden="true" /> Valor total factura
          </span>
          <span>{formatCOP(total)}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Esta factura no genera movimiento de inventario — solo soporta la causación y la cuenta por{" "}
        {tipo === "Compra" ? "pagar" : "cobrar"}.
      </p>

      <div className="flex gap-2">
        <Button type="submit" isLoading={crearFactura.isPending}>
          <ReceiptText className="h-4 w-4" aria-hidden="true" /> Guardar factura
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
