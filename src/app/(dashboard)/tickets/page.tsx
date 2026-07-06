"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, Scan, Keyboard } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useTicketsQuery } from "@/hooks/use-tickets";
import type { Ticket } from "@/interfaces/domain";
import { ticketsService } from "@/services/modules";

const ESTADOS_FILTRO = ["Todos", "Capturado", "Validado", "Procesado", "Facturado", "Pagado", "Corregido", "Anulado"] as const;

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<(typeof ESTADOS_FILTRO)[number]>("Todos");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useTicketsQuery({
    page,
    pageSize,
    search: debouncedSearch,
    filters: estadoFiltro !== "Todos" ? { estado: estadoFiltro } : undefined,
  });

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      { accessorKey: "numeroBascula", header: "N.º ticket" },
      {
        accessorKey: "tipoMovimiento",
        header: "Tipo",
        cell: ({ getValue }) => <span>{getValue<string>()}</span>,
      },
      {
        accessorKey: "metodoCaptura",
        header: "Captura",
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {getValue<string>() === "OCR" ? <Scan className="h-3.5 w-3.5" aria-hidden="true" /> : <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />}
            {getValue<string>()}
          </span>
        ),
      },
      { accessorKey: "nombreMaterialBascula", header: "Producto" },
      {
        accessorKey: "pesoNetoKg",
        header: "Peso neto (kg)",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO"),
      },
      {
        accessorKey: "valorTotal",
        header: "Valor",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => <StatusBadge estado={getValue<string>()} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tickets/${row.original.id}`} aria-label={`Ver ticket ${row.original.numeroBascula}`}>
              <Eye className="h-4 w-4" aria-hidden="true" /> Ver
            </Link>
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tickets de báscula</h1>
          <p className="text-sm text-muted-foreground">Captura por OCR o digitación manual, con validación humana obligatoria</p>
        </div>
        <Button asChild>
          <Link href="/tickets/nuevo">
            <Plus className="h-4 w-4" aria-hidden="true" /> Capturar ticket
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {ESTADOS_FILTRO.map((estado) => (
          <button
            key={estado}
            onClick={() => setEstadoFiltro(estado)}
            aria-pressed={estadoFiltro === estado}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              estadoFiltro === estado
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {estado}
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
        onExportExcel={() => ticketsService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => ticketsService.exportPdf({ search: debouncedSearch })}
        onPrint={() => window.print()}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron tickets con los filtros aplicados."
      />
    </div>
  );
}
