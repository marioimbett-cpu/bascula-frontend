"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Eye, Truck, FileText } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useComprasQuery } from "@/hooks/use-compras";
import type { OrdenCompraVenta } from "@/interfaces/domain";
import { ordenesCompraService } from "@/services/modules";

export default function ComprasPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useComprasQuery({ page, pageSize, search: debouncedSearch });

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
        id: "origen",
        header: "Origen",
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            {row.original.ticketId ? (
              <>
                <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Ticket
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Documento
              </>
            )}
          </span>
        ),
      },
      { accessorKey: "numeroDocumento", header: "N.º factura proveedor", cell: ({ getValue }) => getValue<string>() ?? "—" },
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
        cell: ({ row }) => (row.original.facturaId ? <Badge variant="default">Asociada</Badge> : <Badge variant="muted">N/A</Badge>),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/compras/${row.original.id}`} aria-label={`Ver orden de compra ${row.original.consecutivo}`}>
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
          <h1 className="text-xl font-semibold">Compras</h1>
          <p className="text-sm text-muted-foreground">
            Órdenes desde ticket de báscula o desde documento/factura de proveedor (productos varios)
          </p>
        </div>
        <Button asChild>
          <Link href="/compras/nueva">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nueva orden de compra
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
        onExportExcel={() => ordenesCompraService.exportExcel({ search: debouncedSearch })}
        onExportPdf={() => ordenesCompraService.exportPdf({ search: debouncedSearch })}
        onPrint={() => window.print()}
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron órdenes de compra."
      />
    </div>
  );
}
