"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/forms/file-upload";
import { usePagination } from "@/hooks/use-pagination";
import { useConciliacionQuery, useCargarExtracto, useMarcarConciliado } from "@/hooks/use-conciliacion";
import type { ConciliacionBancaria } from "@/interfaces/domain";

const ESTADO_ICON = { Conciliado: CheckCircle2, Pendiente: Clock, "Con diferencia": AlertTriangle };
const ESTADO_VARIANT = { Conciliado: "success", Pendiente: "muted", "Con diferencia": "warning" } as const;

export default function ConciliacionPage() {
  const { page, pageSize, setPage } = usePagination(10);
  const { data, isLoading } = useConciliacionQuery({ page, pageSize });
  const cargarExtracto = useCargarExtracto();
  const marcarConciliado = useMarcarConciliado();

  const columns = useMemo<ColumnDef<ConciliacionBancaria>[]>(
    () => [
      { accessorKey: "movimientoBancario", header: "Movimiento bancario" },
      {
        accessorKey: "fechaConciliacion",
        header: "Fecha",
        cell: ({ getValue }) => (getValue<string>() ? new Date(getValue<string>()).toLocaleDateString("es-CO") : "—"),
      },
      { accessorKey: "usuarioConciliacion", header: "Responsable", cell: ({ getValue }) => getValue<string>() ?? "—" },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => {
          const estado = getValue<keyof typeof ESTADO_ICON>();
          const Icon = ESTADO_ICON[estado];
          return (
            <Badge variant={ESTADO_VARIANT[estado]}>
              <Icon className="mr-1 h-3 w-3" aria-hidden="true" /> {estado}
            </Badge>
          );
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) =>
          row.original.estado !== "Conciliado" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => marcarConciliado.mutate({ id: row.original.id, estado: "Conciliado" })}
              isLoading={marcarConciliado.isPending}
            >
              Marcar conciliado
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    [marcarConciliado]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Conciliación bancaria</h1>
        <p className="text-sm text-muted-foreground">
          Cruce entre pagos registrados (transferencias y cheques cobrados) y movimientos del extracto bancario
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cargar extracto bancario</CardTitle>
          <CardDescription>Sube el archivo del banco para generar las coincidencias sugeridas</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept=".csv,.xlsx,.pdf"
            label="Arrastra el extracto o haz clic para subirlo"
            helpText="Formatos CSV, Excel o PDF según lo entregue el banco"
            onFileSelected={(file) => cargarExtracto.mutate(file)}
          />
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="Aún no hay movimientos para conciliar. Carga un extracto para comenzar."
      />
    </div>
  );
}
