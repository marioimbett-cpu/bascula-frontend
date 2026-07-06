"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, FileCheck, FileX } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useVentasQuery } from "@/hooks/use-ventas";
import type { OrdenCompraVenta } from "@/interfaces/domain";
import { ordenesVentaService } from "@/services/modules";

export default function VentasPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useVentasQuery({ page, pageSize, search: debouncedSearch });

  const columns = useMemo<ColumnDef<OrdenCompraVenta>[]>(
    () => [
      {
        id: "consecutivo",
        header: "N.º orden",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.serie}-{String(row.original.consecutivo).padStart(4, "0")}
          </span>
        ),
      },
      {
        accessorKey: "cantidad",
        header: "Cantidad",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO"),
      },
      {
        accessorKey: "precioUnitario",
        header: "Precio unitario",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
      },
      {
        accessorKey: "valorTotal",
        header: "Valor total",
        cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }),
      },
      {
        id: "factura",
        header: "Factura",
        cell: ({ row }) =>
          row.original.requiereFactura ? (
            row.original.facturaId ? (
              <Badge variant="success">
                <FileCheck className="mr-1 h-3 w-3" aria-hidden="true" /> Generada
              </Badge>
            ) : (
              <Badge variant="warning">
                <FileX className="mr-1 h-3 w-3" aria-hidden="true" /> Pendiente
              </Badge>
            )
          ) : (
            <Badge variant="muted">No requiere</Badge>
          ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/ventas/${row.original.id}`} aria-label={`Ver orden de venta ${row.original.consecutivo}`}>
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
          <h1 className="text-xl font-semibold">Ventas</h1>
          <p className="text-sm text-muted-foreground">Órdenes desde ticket de báscula, con factura opcional según el caso</p>
        </div>
        <Button asChild>
          <Link href="/ventas/nueva">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nueva orden de venta
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
        onExportExcel={() => ordenesVentaService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => ordenesVentaService.exportPdf({ search: debouncedSearch })}
        onPrint={() => window.print()}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron órdenes de venta."
      />
    </div>
  );
}
