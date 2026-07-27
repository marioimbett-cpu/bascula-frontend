import { type ReactNode, cloneElement, isValidElement } from "react";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Envuelve un control de formulario con Label accesible, mensaje de error,
 * ayuda visual (tooltip) y conexión aria-describedby/aria-invalid.
 * Se usa junto a React Hook Form: <FormField id="email" label="Correo" error={errors.email?.message}>
 */
export function FormField({ id, label, required, error, helpText, children, className }: FormFieldProps) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        id,
        hasError: !!error,
        "aria-invalid": !!error,
        "aria-describedby": cn(error && errorId, helpText && helpId) || undefined,
      })
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        {helpText && (
          <Tooltip content={helpText}>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </Tooltip>
        )}
      </div>
      {control}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
