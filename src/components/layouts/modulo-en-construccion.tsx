import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function ModuloEnConstruccion({
  titulo,
  descripcion,
  icon,
}: {
  titulo: string;
  descripcion: string;
  icon: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{titulo}</h1>
        <p className="text-sm text-muted-foreground">{descripcion}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/40">
            {icon}
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Este módulo sigue la misma arquitectura del sistema (DataTable + servicios REST + React Query) y se
            conecta al backend en la siguiente fase de integración.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
