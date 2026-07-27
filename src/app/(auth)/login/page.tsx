"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Scale, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useAuth } from "@/context/auth-context";
import { loginSchema, type LoginFormValues } from "@/utils/validation-schemas";

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
    } catch {
      toast.error("Credenciales inválidas. Verifica tu correo y contraseña.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-popover"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Scale className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-lg font-semibold">Sistema de Báscula Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField id="email" label="Correo electrónico" required error={errors.email?.message}>
            <Input type="email" placeholder="usuario@empresa.com" autoComplete="username" {...register("email")} />
          </FormField>

          <FormField id="password" label="Contraseña" required error={errors.password?.message}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </FormField>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            <LogIn className="h-4 w-4" aria-hidden="true" /> Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sistema local (LAN) · Operación sin dependencia de internet
        </p>
      </motion.div>
    </div>
  );
}
