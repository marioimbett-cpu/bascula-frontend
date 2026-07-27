"use client";

import { useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Download, FileText, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonTableRows } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  enableRowSelection?: boolean;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onPrint?: () => void;
  pagination?: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void };
  emptyMessage?: string;
}

/**
 * Tabla reutilizable para todos los módulos (tickets, compras, ventas, cuentas, cheques...).
 * Soporta búsqueda, orden por columna, selección múltiple, exportación y paginación,
 * cumpliendo el requisito transversal de "Tablas" del esquema funcional.
 */
export function DataTable<TData extends { id: string }>({
  columns,
  data,
  isLoading,
  searchValue,
  onSearchChange,
  enableRowSelection,
  onExportExcel,
  onExportPdf,
  onPrint,
  pagination,
  emptyMessage = "No hay registros para mostrar.",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              aria-label="Buscar en la tabla"
              className="pl-9"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {onExportExcel && (
            <Button variant="outline" size="sm" onClick={onExportExcel}>
              <Download className="h-4 w-4" aria-hidden="true" /> Excel
            </Button>
          )}
          {onExportPdf && (
            <Button variant="outline" size="sm" onClick={onExportPdf}>
              <FileText className="h-4 w-4" aria-hidden="true" /> PDF
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4" aria-hidden="true" /> Imprimir
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="whitespace-nowrap px-3 py-3 text-left font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonTableRows rows={pagination?.pageSize ?? 5} columns={columns.length} />
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-accent/50",
                    row.getIsSelected() && "bg-primary-50 dark:bg-primary-900/20"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-3 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between border-t border-border p-4 text-sm text-muted-foreground">
          <span>
            Página {pagination.page} de {totalPages} · {pagination.total} registros
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
