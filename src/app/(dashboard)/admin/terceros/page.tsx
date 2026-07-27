"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, Users } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useTercerosQuery } from "@/hooks/use-terceros";
import type { Tercero } from "@/interfaces/domain";
import { tercerosService } from "@/services/modules";

const TIPOS = ["Todos", "Cliente", "Proveedor"] as const;

export default function TercerosPage() {
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Todos");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useTercerosQuery({
    page,
    pageSize,
    search: debouncedSearch,
    filters: tipo !== "Todos" ? { tipo } : undefined,
  });

  const columns = useMemo<ColumnDef<Tercero>[]>(
    () => [
      {
        id: "nombre",
        header: "Nombre / razón social",
        cell: ({ row }) => (
          <span className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-primary-600" aria-hidden="true" /> {row.original.nombre}
          </span>
        ),
      },
      { accessorKey: "identificacionFiscal", header: "Identificación" },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.tipo}
            {row.original.subtipoProveedor ? ` (${row.original.subtipoProveedor})` : ""}
          </span>
        ),
      },
      { accessorKey: "condicionesPago", header: "Condiciones de pago" },
      {
        accessorKey: "saldoActual",
        header: "Saldo actual",
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}</span>
        ),
      },
      {
        accessorKey: "activo",
        header: "Estado",
        cell: ({ getValue }) => <Badge variant={getValue<boolean>() ? "success" : "muted"}>{getValue<boolean>() ? "Activo" : "Inactivo"}</Badge>,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/terceros/${row.original.id}`} aria-label={`Ver ficha de ${row.original.nombre}`}>
              <Eye className="h-4 w-4" aria-hidden="true" /> Ficha
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
          <h1 className="text-xl font-semibold">Terceros</h1>
          <p className="text-sm text-muted-foreground">Clientes y proveedores por empresa — no se comparten entre empresas</p>
        </div>
        <Button asChild>
          <Link href="/admin/terceros/nuevo">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo tercero
          </Link>
        </Button>
      </div>

      <div className="flex gap-2" role="group" aria-label="Filtrar por tipo de tercero">
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
        onExportExcel={() => tercerosService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => tercerosService.exportPdf({ search: debouncedSearch })}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron terceros."
      />
    </div>
  );
}
