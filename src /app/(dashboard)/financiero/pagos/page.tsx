"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Banknote, FileCheck2, Wallet, Paperclip } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { usePagosQuery } from "@/hooks/use-pagos";
import type { Pago } from "@/interfaces/domain";
import { pagosService } from "@/services/modules";

const METODO_ICON = { Transferencia: Banknote, Cheque: FileCheck2, "Caja Menor": Wallet };

export default function PagosPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = usePagosQuery({ page, pageSize, search: debouncedSearch });

  const columns = useMemo<ColumnDef<Pago>[]>(
    () => [
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString("es-CO"),
      },
      {
        accessorKey: "metodoPago",
        header: "Método",
        cell: ({ getValue }) => {
          const Icon = METODO_ICON[getValue<keyof typeof METODO_ICON>()];
          return (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {getValue<string>()}
            </span>
          );
        },
      },
      { accessorKey: "referencia", header: "Referencia", cell: ({ getValue }) => getValue<string>() ?? "—" },
      {
        accessorKey: "valorPago",
        header: "Valor",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</span>
        ),
      },
      {
        id: "soporte",
        header: "Soporte",
        cell: ({ row }) =>
          row.original.soporteAdjuntoUrl ? (
            <span className="flex items-center gap-1 text-xs text-primary-600">
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" /> Adjunto
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      { accessorKey: "usuarioRegistro", header: "Registrado por" },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pagos</h1>
          <p className="text-sm text-muted-foreground">Pagos parciales (abonos) y totales — transferencia, cheque o caja menor</p>
        </div>
        <Button asChild>
          <Link href="/financiero/pagos/nuevo">
            <Plus className="h-4 w-4" aria-hidden="true" /> Registrar pago
          </Link>
        </Button>
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
        onExportExcel={() => pagosService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => pagosService.exportPdf({ search: debouncedSearch })}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron pagos registrados."
      />
    </div>
  );
}
