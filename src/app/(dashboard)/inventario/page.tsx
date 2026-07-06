"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye, Boxes, Package } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useProductosQuery } from "@/hooks/use-inventario";
import type { Producto } from "@/interfaces/domain";
import { productosService } from "@/services/modules";

// Saldo simulado — en producción vendría agregado desde movimientos de inventario por empresa activa
function saldoSimulado(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 10000;
  return hash;
}

export default function InventarioPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useProductosQuery({ page, pageSize, search: debouncedSearch });

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: "codigo", header: "Código" },
      { accessorKey: "nombre", header: "Producto" },
      {
        accessorKey: "categoria",
        header: "Categoría",
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {getValue<string>() === "Pesado en Bascula" ? <Boxes className="h-3.5 w-3.5" aria-hidden="true" /> : <Package className="h-3.5 w-3.5" aria-hidden="true" />}
            {getValue<string>() === "Pesado en Bascula" ? "Pesado en báscula" : "Productos varios"}
          </span>
        ),
      },
      { accessorKey: "unidadMedida", header: "Unidad" },
      {
        id: "saldo",
        header: "Saldo actual",
        cell: ({ row }) => {
          const saldo = saldoSimulado(row.original.id);
          return (
            <span className="font-medium">
              {saldo.toLocaleString("es-CO")} {row.original.unidadMedida}
            </span>
          );
        },
      },
      {
        id: "alerta",
        header: "Stock",
        cell: ({ row }) => {
          const saldo = saldoSimulado(row.original.id);
          return saldo < 500 ? <Badge variant="warning">Bajo</Badge> : <Badge variant="success">Normal</Badge>;
        },
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/inventario/${row.original.id}`} aria-label={`Ver kardex de ${row.original.nombre}`}>
              <Eye className="h-4 w-4" aria-hidden="true" /> Kardex
            </Link>
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo compartido entre empresas — el saldo (kardex) se controla por empresa activa
        </p>
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
        onExportExcel={() => productosService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => productosService.exportPdf({ search: debouncedSearch })}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron productos."
      />
    </div>
  );
}
