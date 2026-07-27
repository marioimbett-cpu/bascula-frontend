"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { UserPlus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { registerSchema, type RegisterFormValues } from "@/utils/validation-schemas";
import { api } from "@/services/api";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await api.post("/auth/register", values);
      toast.success("Cuenta creada. Un administrador debe activar tu acceso.");
    } catch {
      toast.error("No fue posible crear la cuenta.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-popover"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <UserPlus className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-lg font-semibold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Un administrador debe asignarte rol y permisos</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField id="nombre" label="Nombre completo" required error={errors.nombre?.message}>
            <Input placeholder="Ej. Ana Torres" autoComplete="name" {...register("nombre")} />
          </FormField>
          <FormField id="email" label="Correo electrónico" required error={errors.email?.message}>
            <Input type="email" placeholder="usuario@empresa.com" autoComplete="email" {...register("email")} />
          </FormField>
          <FormField id="password" label="Contraseña" required error={errors.password?.message} helpText="Mínimo 8 caracteres">
            <Input type="password" autoComplete="new-password" {...register("password")} />
          </FormField>
          <FormField id="confirmPassword" label="Confirmar contraseña" required error={errors.confirmPassword?.message}>
            <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
          </FormField>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>

        <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Volver al inicio de sesión
        </Link>
      </motion.div>
    </div>
  );
}
