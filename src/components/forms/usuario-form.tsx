"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/form-field";
import { useCrearUsuario } from "@/hooks/use-usuarios";
import { usuarioSchema, type UsuarioFormValues } from "@/utils/validation-schemas";
import type { RolUsuario, Usuario } from "@/interfaces/domain";

export const ROL_LABEL: Record<RolUsuario, string> = {
  Bascula: "Báscula / Captura",
  Ventas: "Ventas",
  Compras: "Compras",
  "Facturacion y Contabilidad": "Facturación y Contabilidad",
  Administrador: "Administrador / Supervisor",
};

interface UsuarioFormProps {
  /** Se invoca con el usuario recién creado — útil para autoseleccionarlo en otro formulario. */
  onCreated: (usuario: Usuario) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

/**
 * Formulario de alta de usuario (con su rol), extraído de admin/usuarios/nuevo para poder
 * reutilizarse tanto en esa pantalla como embebido en un Modal (p.ej. desde la captura de
 * tickets, para dar de alta a quien registra el ticket sin salir de esa pantalla).
 */
export function UsuarioForm({ onCreated, onCancel, submitLabel = "Crear usuario" }: UsuarioFormProps) {
  const crearUsuario = useCrearUsuario();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormValues>({ resolver: zodResolver(usuarioSchema) });

  const onSubmit = (values: UsuarioFormValues) => {
    crearUsuario.mutate(values, { onSuccess: (usuario) => onCreated(usuario) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField id="nombre" label="Nombre completo" required error={errors.nombre?.message}>
        <Input placeholder="Ej. Laura Gómez" {...register("nombre")} />
      </FormField>
      <FormField id="email" label="Correo electrónico" required error={errors.email?.message}>
        <Input type="email" placeholder="usuario@empresa.com" {...register("email")} />
      </FormField>
      <FormField id="rol" label="Rol" required error={errors.rol?.message}>
        <select
          id="rol"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("rol")}
        >
          <option value="">Selecciona un rol</option>
          {Object.entries(ROL_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" isLoading={crearUsuario.isPending}>
          <Save className="h-4 w-4" aria-hidden="true" /> {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
