import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  password: z.string().min(1, "La contraseña es obligatoria").min(8, "Debe tener al menos 8 caracteres"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const registerSchema = z
  .object({
    nombre: z.string().min(2, "Ingresa tu nombre completo"),
    email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
    password: z.string().min(8, "Debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Validación del ticket: peso neto = peso bruto - tara (sección 3.3 del esquema)
export const ticketValidationSchema = z
  .object({
    pesoEntradaKg: z.coerce.number().positive("Debe ser mayor a 0"),
    pesoSalidaKg: z.coerce.number().positive("Debe ser mayor a 0"),
    pesoDescontadoKg: z.coerce.number().min(0, "No puede ser negativo"),
    productoId: z.string().min(1, "Selecciona un producto"),
    terceroId: z.string().min(1, "Selecciona un cliente o proveedor"),
    valorUnKg: z.coerce.number().positive("El valor debe ser mayor a 0"),
  })
  .refine((data) => Math.abs(data.pesoEntradaKg - data.pesoSalidaKg) > 0, {
    message: "El peso de entrada y salida no pueden ser iguales",
    path: ["pesoSalidaKg"],
  });
export type TicketValidationFormValues = z.infer<typeof ticketValidationSchema>;

// Orden de compra: origen dual (Ticket de báscula o Documento/Factura de proveedor -> Productos Varios)
// Sección 3.4 y 5.3 del esquema. El precio unitario es editable por transacción (no hay lista de precios fija).
export const ordenCompraSchema = z
  .object({
    origen: z.enum(["Ticket", "Documento"]),
    ticketId: z.string().optional(),
    numeroDocumento: z.string().optional(),
    proveedorId: z.string().min(1, "Selecciona un proveedor"),
    productoId: z.string().min(1, "Selecciona un producto"),
    cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
    precioUnitario: z.coerce.number().positive("El precio debe ser mayor a 0"),
    observaciones: z.string().max(500, "Máximo 500 caracteres").optional(),
  })
  .refine((data) => data.origen !== "Ticket" || !!data.ticketId, {
    message: "Selecciona el ticket de báscula de origen",
    path: ["ticketId"],
  })
  .refine((data) => data.origen !== "Documento" || !!data.numeroDocumento, {
    message: "Ingresa el número de factura del proveedor",
    path: ["numeroDocumento"],
  });
export type OrdenCompraFormValues = z.infer<typeof ordenCompraSchema>;

// Orden de venta: origen siempre desde ticket de báscula (producto pesado). Factura opcional según el caso;
// si no aplica, la cuenta por cobrar se soporta directamente en la orden de venta (sección 3.5).
export const ordenVentaSchema = z.object({
  ticketId: z.string().min(1, "Selecciona el ticket de báscula de origen"),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  productoId: z.string().min(1, "Selecciona un producto"),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.coerce.number().positive("El precio debe ser mayor a 0"),
  requiereFactura: z.boolean(),
  observaciones: z.string().max(500, "Máximo 500 caracteres").optional(),
});
export type OrdenVentaFormValues = z.infer<typeof ordenVentaSchema>;

// Pago (abono parcial o total) — sección 3.7 y 5.7. La referencia/cheque son condicionales al método.
export const pagoSchema = z
  .object({
    cuentaId: z.string().min(1, "Selecciona la cuenta a pagar/cobrar"),
    valorPago: z.coerce.number().positive("El valor del pago debe ser mayor a 0"),
    metodoPago: z.enum(["Transferencia", "Cheque", "Caja Menor"]),
    referencia: z.string().optional(),
    observaciones: z.string().max(300, "Máximo 300 caracteres").optional(),
  })
  .refine((data) => data.metodoPago !== "Transferencia" || !!data.referencia, {
    message: "Ingresa el número de comprobante de la transferencia",
    path: ["referencia"],
  });
export type PagoFormValues = z.infer<typeof pagoSchema>;

// Cheque — sección 3.8. Emitido (pago a proveedor) o Recibido (cobro a cliente); soporta posfechados.
export const chequeSchema = z.object({
  tipo: z.enum(["Emitido", "Recibido"]),
  numeroCheque: z.string().min(1, "El número de cheque es obligatorio"),
  banco: z.string().min(1, "Selecciona el banco"),
  cuentaBancaria: z.string().min(1, "La cuenta bancaria es obligatoria"),
  terceroId: z.string().min(1, "Selecciona el tercero"),
  valor: z.coerce.number().positive("El valor debe ser mayor a 0"),
  fechaEmision: z.string().min(1, "La fecha de emisión es obligatoria"),
  fechaVencimientoCobro: z.string().min(1, "La fecha de cobro es obligatoria"),
});
export type ChequeFormValues = z.infer<typeof chequeSchema>;

// Ajuste manual de inventario — mermas, conteos físicos, reversos por corrección de tickets (sección 3.6)
export const ajusteInventarioSchema = z.object({
  productoId: z.string().min(1, "Selecciona un producto"),
  tipo: z.enum(["Entrada", "Salida"]),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  motivo: z.string().min(5, "Describe el motivo del ajuste (mínimo 5 caracteres)"),
});
export type AjusteInventarioFormValues = z.infer<typeof ajusteInventarioSchema>;

// Empresa — módulo multiempresa (sección 3.1 / 5.1)
export const empresaSchema = z.object({
  razonSocial: z.string().min(2, "Ingresa la razón social"),
  nit: z.string().min(5, "El NIT es obligatorio"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
});
export type EmpresaFormValues = z.infer<typeof empresaSchema>;

// Tercero (cliente o proveedor) — sección 3.2 / 5.11
export const terceroSchema = z.object({
  tipo: z.enum(["Cliente", "Proveedor"]),
  subtipoProveedor: z.enum(["Local", "Nacional"]).optional(),
  nombre: z.string().min(2, "Ingresa el nombre o razón social"),
  identificacionFiscal: z.string().min(5, "La identificación fiscal es obligatoria"),
  condicionesPago: z.string().min(1, "Selecciona las condiciones de pago"),
});
export type TerceroFormValues = z.infer<typeof terceroSchema>;

// Usuario y rol — módulo de seguridad (sección 3.12)
export const usuarioSchema = z.object({
  nombre: z.string().min(2, "Ingresa el nombre completo"),
  email: z.string().min(1, "El correo es obligatorio").email("Ingresa un correo válido"),
  rol: z.enum(["Bascula", "Ventas", "Compras", "Facturacion y Contabilidad", "Administrador"]),
});
export type UsuarioFormValues = z.infer<typeof usuarioSchema>;
