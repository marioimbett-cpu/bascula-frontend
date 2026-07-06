"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Landmark, CheckCircle2 } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useCausacionesQuery, useCausarDocumento } from "@/hooks/use-causacion";
import type { Causacion } from "@/interfaces/domain";
import { causacionService } from "@/services/modules";

const ESTADOS = ["Todas", "Pendiente", "Causada"] as const;

export default function CausacionPage() {
  const [estado, setEstado] = useState<(typeof ESTADOS)[number]>("Todas");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);
  const causar = useCausarDocumento();

  const { data, isLoading } = useCausacionesQuery({
    page,
    pageSize,
    search: debouncedSearch,
    filters: estado !== "Todas" ? { estado } : undefined,
  });

  const columns = useMemo<ColumnDef<Causacion>[]>(
    () => [
      { accessorKey: "documentoOrigen", header: "Documento origen" },
      {
        accessorKey: "valorCausado",
        header: "Valor",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
      },
      {
        accessorKey: "fechaCausacion",
        header: "Fecha",
        cell: ({ getValue }) => (getValue<string>() ? new Date(getValue<string>()).toLocaleDateString("es-CO") : "—"),
      },
      { accessorKey: "usuarioCausacion", header: "Responsable", cell: ({ getValue }) => getValue<string>() ?? "—" },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => (
          <Badge variant={getValue<string>() === "Causada" ? "success" : "warning"}>{getValue<string>()}</Badge>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) =>
          row.original.estado === "Pendiente" ? (
            <Button size="sm" onClick={() => causar.mutate(row.original.documentoOrigenId)} isLoading={causar.isPending}>
              <Landmark className="h-4 w-4" aria-hidden="true" /> Causar
            </Button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Causada
            </span>
          ),
      },
    ],
    [causar]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Causación contable</h1>
        <p className="text-sm text-muted-foreground">
          Registro contable de facturas y órdenes, independiente de su estado de pago — a cargo de Facturación y Contabilidad
        </p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Filtrar por estado de causación">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setEstado(e)}
            aria-pressed={estado === e}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              estado === e ? "border-primary-600 bg-primary-600 text-white" : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onExportExcel={() => causacionService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => causacionService.exportPdf({ search: debouncedSearch })}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No hay documentos para causar."
      />
    </div>
  );
}
