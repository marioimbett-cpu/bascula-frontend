"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, AlertTriangle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useChequesQuery } from "@/hooks/use-cheques";
import type { Cheque } from "@/interfaces/domain";
import { chequesService } from "@/services/modules";

const TIPOS = ["Todos", "Emitido", "Recibido"] as const;

function estaProximoAVencer(fecha: string) {
  const dias = (new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return dias >= 0 && dias <= 7;
}

export default function ChequesPage() {
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Todos");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useChequesQuery({
    page,
    pageSize,
    search: debouncedSearch,
    filters: tipo !== "Todos" ? { tipo } : undefined,
  });

  const columns = useMemo<ColumnDef<Cheque>[]>(
    () => [
      { accessorKey: "numeroCheque", header: "N.º cheque" },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {getValue<string>() === "Emitido" ? (
              <ArrowUpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ArrowDownCircle className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {getValue<string>()}
          </span>
        ),
      },
      { accessorKey: "banco", header: "Banco" },
      {
        accessorKey: "valor",
        header: "Valor",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
      },
      {
        accessorKey: "fechaVencimientoCobro",
        header: "Fecha de cobro",
        cell: ({ getValue }) => {
          const fecha = getValue<string>();
          const proximo = estaProximoAVencer(fecha);
          return (
            <span className={proximo ? "flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400" : ""}>
              {proximo && <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />}
              {new Date(fecha).toLocaleDateString("es-CO")}
            </span>
          );
        },
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
            <Link href={`/financiero/cheques/${row.original.id}`} aria-label={`Ver cheque ${row.original.numeroCheque}`}>
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
          <h1 className="text-xl font-semibold">Control de cheques</h1>
          <p className="text-sm text-muted-foreground">Emitidos y recibidos — con alertas de posfechados próximos a vencer</p>
        </div>
        <Button asChild>
          <Link href="/financiero/cheques/nuevo">
            <Plus className="h-4 w-4" aria-hidden="true" /> Registrar cheque
          </Link>
        </Button>
      </div>

      <div className="flex gap-2" role="group" aria-label="Filtrar por tipo de cheque">
        {TIPOS.map((t) => (
          <button
            key={t}
            onClick={() => setTipo(t)}
            aria-pressed={tipo === t}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              tipo === t ? "border-primary-600 bg-primary-600 text-white" : "border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            {t}
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
        onExportExcel={() => chequesService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => chequesService.exportPdf({ search: debouncedSearch })}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron cheques."
      />
    </div>
  );
}
