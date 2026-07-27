"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación estándar para acciones sensibles: anulación de tickets,
 * eliminación de registros, reversos contables. Cumple el requisito de
 * "Confirmaciones" en formularios y de trazabilidad en anulaciones.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  variant = "default",
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant={variant === "destructive" ? "destructive" : "default"} onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {variant === "destructive" && (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        )}
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Modal>
  );
}
