"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, UserCog, ShieldAlert } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useUsuariosQuery, useCambiarRol, useDesactivarUsuario } from "@/hooks/use-usuarios";
import { ROL_LABEL } from "@/components/forms/usuario-form";
import type { RolUsuario, Usuario } from "@/interfaces/domain";

const ROLES: RolUsuario[] = ["Bascula", "Ventas", "Compras", "Facturacion y Contabilidad", "Administrador"];

export default function UsuariosPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useUsuariosQuery({ page, pageSize, search: debouncedSearch });
  const cambiarRol = useCambiarRol();
  const desactivar = useDesactivarUsuario();

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      {
        id: "nombre",
        header: "Usuario",
        cell: ({ row }) => (
          <span className="flex items-center gap-2 font-medium">
            <UserCog className="h-4 w-4 text-primary-600" aria-hidden="true" /> {row.original.nombre}
          </span>
        ),
      },
      { accessorKey: "email", header: "Correo" },
      {
        accessorKey: "rol",
        header: "Rol",
        cell: ({ row }) => (
          <select
            value={row.original.rol}
            onChange={(e) => cambiarRol.mutate({ id: row.original.id, rol: e.target.value as RolUsuario })}
            aria-label={`Cambiar rol de ${row.original.nombre}`}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {ROLES.map((rol) => (
              <option key={rol} value={rol}>
                {ROL_LABEL[rol]}
              </option>
            ))}
          </select>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => desactivar.mutate({ id: row.original.id, activo: !row.original.activo })}
            isLoading={desactivar.isPending}
          >
            {row.original.activo ? "Desactivar" : "Activar"}
          </Button>
        ),
      },
    ],
    [cambiarRol, desactivar]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Usuarios y roles</h1>
          <p className="text-sm text-muted-foreground">Los permisos son por rol/módulo — cualquier usuario opera en cualquier empresa registrada</p>
        </div>
        <Button asChild>
          <Link href="/admin/usuarios/nuevo">
            <Plus className="h-4 w-4" aria-hidden="true" /> Nuevo usuario
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Las anulaciones y correcciones con pagos aplicados requieren autorización de un rol Administrador/Supervisor
        (separación de funciones).
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
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No se encontraron usuarios."
      />
    </div>
  );
}
