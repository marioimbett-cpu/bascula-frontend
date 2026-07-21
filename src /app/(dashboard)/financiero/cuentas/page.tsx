"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Plus } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useCuentasQuery } from "@/hooks/use-cuentas";
import type { CuentaPagarCobrar } from "@/interfaces/domain";
import { cuentasService } from "@/services/modules";

const TIPOS = ["Todas", "Por Pagar", "Por Cobrar"] as const;

export default function CuentasPage() {
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Todas");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useCuentasQuery({
    page,
    pageSize,
    search: debouncedSearch,
    filters: tipo !== "Todas" ? { tipo } : undefined,
  });

  const columns = useMemo<ColumnDef<CuentaPagarCobrar>[]>(
    () => [
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
      },
      {
        accessorKey: "valorTotal",
        header: "Valor total",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
      },
      {
        accessorKey: "saldoPendiente",
        header: "Saldo pendiente",
        cell: ({ getValue }) => (
          <span className="font-medium">
            {getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
          </span>
        ),
      },
      {
        accessorKey: "fechaVencimiento",
        header: "Vencimiento",
        cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString("es-CO"),
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
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/financiero/cuentas/${row.original.id}`} aria-label="Ver estado de cuenta">
                <Eye className="h-4 w-4" aria-hidden="true" /> Ver
              </Link>
            </Button>
            {row.original.estado !== "Pagada" && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/financiero/pagos/nuevo?cuentaId=${row.original.id}`}>
                  <Plus className="h-4 w-4" aria-hidden="true" /> Abonar
                </Link>
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Cuentas por pagar / cobrar</h1>
        <p className="text-sm text-muted-foreground">Saldo recalculado en cada pago — estado de cuenta por tercero</p>
      </div>

      <div className="flex gap-2" role="group" aria-label="Filtrar por tipo de cuenta">
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
        onExportExcel={() => cuentasService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => cuentasService.exportPdf({ search: debouncedSearch })}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron cuentas."
      />
    </div>
  );
}
