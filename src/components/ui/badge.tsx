import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-100 text-primary-800",
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
        destructive: "border-transparent bg-red-100 text-red-800",
        muted: "border-transparent bg-muted text-muted-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * Traduce estados del dominio (Ticket, Cheque, Cuenta) a la variante visual correcta.
 * Centraliza la regla de color para que cada tabla/pantalla no la reimplemente.
 */
const ESTADO_VARIANT_MAP: Record<string, BadgeProps["variant"]> = {
  Capturado: "muted",
  Validado: "default",
  Procesado: "default",
  Facturado: "default",
  Pagado: "success",
  Corregido: "warning",
  Anulado: "destructive",
  Pendiente: "warning",
  Abonada: "warning",
  Vencida: "destructive",
  Registrado: "muted",
  "Pendiente de cobro": "warning",
  Consignado: "default",
  Cobrado: "success",
  "Devuelto/Rechazado": "destructive",
  Causada: "success",
  Conciliado: "success",
  "Con diferencia": "warning",
};

export function StatusBadge({ estado }: { estado: string }) {
  return <Badge variant={ESTADO_VARIANT_MAP[estado] ?? "muted"}>{estado}</Badge>;
}
