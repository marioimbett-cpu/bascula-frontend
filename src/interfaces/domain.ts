 /**
 * Tipos de dominio derivados del esquema funcional del Sistema de Báscula
 * y Gestión Administrativo-Financiera. Reflejan el modelo de datos (sección 5
 * del documento de esquema) y los estados/reglas descritos en las secciones 3-4.
 */

export type EstadoTicket =
  | "Capturado"
  | "Validado"
  | "Procesado"
  | "Facturado"
  | "Pagado"
  | "Corregido"
  | "Anulado";

export type TipoMovimiento = "Compra" | "Venta" | "Servicio de Báscula";
export type OrigenCaptura = "Bascula" | "Documento";
export type MetodoCaptura = "OCR" | "Manual";

export interface Empresa {
  id: string;
  razonSocial: string;
  nit: string;
  direccion?: string;
  telefono?: string;
  logoUrl?: string;
  estado: "Activa" | "Inactiva";
}

export interface Tercero {
  id: string;
  empresaId: string;
  tipo: "Cliente" | "Proveedor";
  subtipoProveedor?: "Local" | "Nacional";
  nombre: string;
  identificacionFiscal: string;
  condicionesPago: string; // "Contado" | "Credito 30 dias" etc.
  saldoActual: number;
  activo: boolean;
}

export interface Ticket {
  id: string;
  empresaId: string;
  numeroBascula: string;
  codigoEstacionBascula: string;
  tipoMovimiento: TipoMovimiento;
  origenCaptura: OrigenCaptura;
  estado: EstadoTicket;
  fechaHoraEntrada: string;
  fechaHoraSalida: string;
  pesoEntradaKg: number;
  pesoSalidaKg: number;
  pesoDescontadoKg: number;
  pesoBrutoKg: number;
  pesoNetoKg: number;
  productoId?: string;
  nombreMaterialBascula: string;
  terceroId?: string;
  conductor?: string;
  placa?: string;
  valorUnKg: number;
  valorTotal: number;
  metodoCaptura: MetodoCaptura;
  imagenTicketUrl?: string;
  tipoAdjunto?: "Imagen" | "PDF";
  estadoValidacion: "Pendiente" | "Validado" | "Corregido" | "Rechazado";
  validadoPor?: string;
  registradoPorId?: string;
  ticketOrigenId?: string;
  motivoAnulacion?: string;
  motivoCorreccion?: string;
}

export interface OrdenCompraVenta {
  id: string;
  empresaId: string;
  tipo: TipoMovimiento;
  serie: string;
  consecutivo: number;
  ticketId?: string;
  numeroDocumento?: string;
  productoId: string;
  terceroId: string;
  cantidad: number;
  precioUnitario: number;
  valorTotal: number;
  requiereFactura?: boolean;
  facturaId?: string;
}

// Ítem de línea de una factura (compra o venta) — descripción libre + valor unitario/total,
// tal como aparece en el PDF adjunto. No está atado al catálogo de Productos: la factura puede
// traer varias líneas aunque la orden de origen solo maneje un producto/cantidad.
export interface FacturaItem {
  id: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  valorTotal: number;
}

export type TipoRetencion = "ReteFuente" | "ReteIVA" | "ReteICA";

/**
 * Factura de compra o de venta, capturada manualmente a partir del PDF adjunto por el usuario
 * (número de factura, fecha, cliente/proveedor, ítems, IVA y retenciones si aplica).
 * IMPORTANTE: la factura nunca genera movimiento de inventario — eso lo hace el ticket de báscula
 * (entrada) o la orden de venta (salida). Ver `OrdenCompraVenta.facturaId`, que enlaza la orden
 * (de compra o de venta) con la factura capturada aquí.
 */
export interface Factura {
  id: string;
  empresaId: string;
  tipo: "Compra" | "Venta";
  numeroFactura: string;
  fecha: string;
  ordenId: string; // id de la orden de compra o de venta asociada
  terceroId: string; // proveedor (Compra) o cliente (Venta)
  items: FacturaItem[];
  subtotal: number;
  ivaPorcentaje: number;
  ivaValor: number;
  aplicaRetencion: boolean;
  tipoRetencion?: TipoRetencion;
  porcentajeRetencion?: number;
  valorRetencion?: number;
  valorTotal: number;
  pdfUrl?: string;
  estado: "Pendiente" | "Pagada" | "Anulada";
}

export interface Producto {
  id: string;
  categoria: "Pesado en Bascula" | "Productos Varios";
  unidadMedida: "Kg" | "Toneladas" | "Unidad" | "Caja";
  nombre: string;
  codigo: string;
}

export interface MovimientoInventario {
  id: string;
  empresaId: string;
  productoId: string;
  tipo: "Entrada" | "Salida" | "Reverso";
  cantidad: number;
  origenId: string;
  saldoResultante: number;
  fecha: string;
}

export type EstadoCuenta = "Pendiente" | "Abonada" | "Pagada" | "Vencida";

export interface CuentaPagarCobrar {
  id: string;
  empresaId: string;
  tipo: "Por Pagar" | "Por Cobrar";
  terceroId: string;
  documentoOrigenId: string;
  valorTotal: number;
  saldoPendiente: number;
  estado: EstadoCuenta;
  fechaVencimiento: string;
}

export type MetodoPago = "Transferencia" | "Cheque" | "Caja Menor";

export interface Pago {
  id: string;
  empresaId: string;
  cuentaId: string;
  valorPago: number;
  saldoAnterior: number;
  saldoNuevo: number;
  metodoPago: MetodoPago;
  referencia?: string;
  chequeId?: string;
  soporteAdjuntoUrl?: string;
  usuarioRegistro: string;
  fecha: string;
}

export type EstadoCheque =
  | "Registrado"
  | "Pendiente de cobro"
  | "Consignado"
  | "Cobrado"
  | "Devuelto/Rechazado"
  | "Anulado";

export interface Cheque {
  id: string;
  empresaId: string;
  tipo: "Emitido" | "Recibido";
  numeroCheque: string;
  banco: string;
  cuentaBancaria: string;
  terceroId: string;
  valor: number;
  fechaEmision: string;
  fechaVencimientoCobro: string;
  estado: EstadoCheque;
  motivoDevolucion?: string;
}

export interface Causacion {
  id: string;
  empresaId: string;
  documentoOrigenId: string;
  fechaCausacion: string;
  valorCausado: number;
  usuarioCausacion: string;
  estado: "Causada" | "Pendiente";
}

export interface ConciliacionBancaria {
  id: string;
  pagoId: string;
  movimientoBancario: string;
  fechaConciliacion: string;
  estado: "Conciliado" | "Pendiente" | "Con diferencia";
  usuarioConciliacion: string;
}

export type RolUsuario =
  | "Bascula"
  | "Ventas"
  | "Compras"
  | "Facturacion y Contabilidad"
  | "Administrador";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
}
