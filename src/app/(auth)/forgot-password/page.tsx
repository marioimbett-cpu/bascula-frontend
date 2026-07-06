"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { authService } from "@/services/modules";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/utils/validation-schemas";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await authService.forgotPassword(values.email);
      setSent(true);
    } catch {
      toast.error("No fue posible procesar la solicitud.");
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
        {sent ? (
          <div className="flex flex-col items-center text-center">
            <MailCheck className="mb-3 h-10 w-10 text-success" aria-hidden="true" />
            <h1 className="text-lg font-semibold">Revisa tu correo</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Si el correo existe en el sistema, enviamos un enlace para restablecer tu contraseña.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                <KeyRound className="h-6 w-6" aria-hidden="true" />
              </span>
              <h1 className="text-lg font-semibold">Recuperar contraseña</h1>
              <p className="mt-1 text-sm text-muted-foreground">Te enviaremos un enlace a tu correo</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField id="email" label="Correo electrónico" required error={errors.email?.message}>
                <Input type="email" placeholder="usuario@empresa.com" autoComplete="email" {...register("email")} />
              </FormField>
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Enviar enlace
              </Button>
            </form>
          </>
        )}

        <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Volver al inicio de sesión
        </Link>
      </motion.div>
    </div>
  );
}
