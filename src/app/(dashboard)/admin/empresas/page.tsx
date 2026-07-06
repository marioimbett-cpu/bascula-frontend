"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Building2, Save } from "lucide-react";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Modal } from "@/components/modals/modal";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useEmpresasQuery, useCrearEmpresa, useCambiarEstadoEmpresa } from "@/hooks/use-empresas";
import type { Empresa } from "@/interfaces/domain";
import { empresaSchema, type EmpresaFormValues } from "@/utils/validation-schemas";

export default function EmpresasPage() {
  const [search, setSearch] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { page, pageSize, setPage } = usePagination(10);

  const { data, isLoading } = useEmpresasQuery({ page, pageSize, search: debouncedSearch });
  const crearEmpresa = useCrearEmpresa();
  const cambiarEstado = useCambiarEstadoEmpresa();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmpresaFormValues>({ resolver: zodResolver(empresaSchema) });

  const onSubmit = (values: EmpresaFormValues) => {
    crearEmpresa.mutate(values, {
      onSuccess: () => {
        reset();
        setModalAbierto(false);
      },
    });
  };

  const columns = useMemo<ColumnDef<Empresa>[]>(
    () => [
      {
        id: "empresa",
        header: "Empresa",
        cell: ({ row }) => (
          <span className="flex items-center gap-2 font-medium">
            <Building2 className="h-4 w-4 text-primary-600" aria-hidden="true" /> {row.original.razonSocial}
          </span>
        ),
      },
      { accessorKey: "nit", header: "NIT" },
      { accessorKey: "telefono", header: "Teléfono", cell: ({ getValue }) => getValue<string>() ?? "—" },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ getValue }) => <Badge variant={getValue<string>() === "Activa" ? "success" : "muted"}>{getValue<string>()}</Badge>,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              cambiarEstado.mutate({ id: row.original.id, estado: row.original.estado === "Activa" ? "Inactiva" : "Activa" })
            }
            isLoading={cambiarEstado.isPending}
          >
            {row.original.estado === "Activa" ? "Desactivar" : "Activar"}
          </Button>
        ),
      },
    ],
    [cambiarEstado]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Empresas</h1>
          <p className="text-sm text-muted-foreground">Cada empresa mantiene sus propias series y consecutivos de documentos</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Nueva empresa
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
        pagination={{ page, pageSize, total: data?.total ?? 0, onPageChange: setPage }}
        emptyMessage="No hay empresas registradas."
      />

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Nueva empresa"
        description="El catálogo de productos se compartirá automáticamente"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-empresa" isLoading={crearEmpresa.isPending}>
              <Save className="h-4 w-4" aria-hidden="true" /> Guardar empresa
            </Button>
          </>
        }
      >
        <form id="form-empresa" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField id="razonSocial" label="Razón social" required error={errors.razonSocial?.message}>
            <Input placeholder="Ej. Agroindustrial del Caribe S.A.S." {...register("razonSocial")} />
          </FormField>
          <FormField id="nit" label="NIT" required error={errors.nit?.message}>
            <Input placeholder="Ej. 900.123.456-7" {...register("nit")} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField id="direccion" label="Dirección" error={errors.direccion?.message}>
              <Input {...register("direccion")} />
            </FormField>
            <FormField id="telefono" label="Teléfono" error={errors.telefono?.message}>
              <Input {...register("telefono")} />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
}
