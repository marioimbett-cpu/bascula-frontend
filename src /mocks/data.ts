import type {
  Empresa,
  Tercero,
  Ticket,
  OrdenCompraVenta,
  CuentaPagarCobrar,
  Pago,
  Cheque,
  Producto,
  MovimientoInventario,
  Causacion,
  ConciliacionBancaria,
  Usuario,
} from "@/interfaces/domain";

// Datos en memoria — se reinician cada vez que se reinicia el servidor de desarrollo.
// Sirven únicamente para poder visualizar y navegar la interfaz sin un backend real.

export const empresas: Empresa[] = [
  { id: "emp-1", razonSocial: "Agroindustrial del Caribe S.A.S.", nit: "900.111.222-3", direccion: "Km 5 vía Cartagena", telefono: "605 555 1010", estado: "Activa" },
  { id: "emp-2", razonSocial: "Comercializadora Río Grande Ltda.", nit: "900.333.444-5", direccion: "Zona Industrial, Barranquilla", telefono: "605 555 2020", estado: "Activa" },
];

export const terceros: Tercero[] = [
  { id: "tercero-1", empresaId: "emp-1", tipo: "Proveedor", subtipoProveedor: "Local", nombre: "Transportes del Norte S.A.S.", identificacionFiscal: "900.555.111-2", condicionesPago: "Contado", saldoActual: 4500000, activo: true },
  { id: "tercero-2", empresaId: "emp-1", tipo: "Proveedor", subtipoProveedor: "Nacional", nombre: "Agroinsumos del Valle", identificacionFiscal: "900.666.222-3", condicionesPago: "Credito 30 dias", saldoActual: 1200000, activo: true },
  { id: "cli-1", empresaId: "emp-1", tipo: "Cliente", nombre: "Distribuidora El Progreso", identificacionFiscal: "900.777.333-4", condicionesPago: "Credito 30 dias", saldoActual: 3330000, activo: true },
  { id: "cli-2", empresaId: "emp-1", tipo: "Cliente", nombre: "Comercializadora San José", identificacionFiscal: "900.888.444-5", condicionesPago: "Contado", saldoActual: 0, activo: true },
];

export const productos: Producto[] = [
  { id: "prod-1", categoria: "Pesado en Bascula", unidadMedida: "Kg", nombre: "Maíz amarillo", codigo: "MZ-001" },
  { id: "prod-2", categoria: "Pesado en Bascula", unidadMedida: "Kg", nombre: "Arena de río", codigo: "AR-002" },
  { id: "prod-3", categoria: "Productos Varios", unidadMedida: "Unidad", nombre: "Empaques de fibra", codigo: "PV-010" },
];

export const tickets: Ticket[] = [
  {
    id: "tk-1", empresaId: "emp-1", numeroBascula: "T-004521", codigoEstacionBascula: "PVN01", tipoMovimiento: "Compra",
    origenCaptura: "Bascula", estado: "Validado", fechaHoraEntrada: new Date().toISOString(), fechaHoraSalida: new Date().toISOString(),
    pesoEntradaKg: 18200, pesoSalidaKg: 5750, pesoDescontadoKg: 0, pesoBrutoKg: 18200, pesoNetoKg: 12450,
    productoId: "prod-1", nombreMaterialBascula: "Maíz amarillo", terceroId: "tercero-2", conductor: "Carlos Pérez", placa: "WBH-234",
    valorUnKg: 700, valorTotal: 8715000, metodoCaptura: "OCR", estadoValidacion: "Validado", validadoPor: "J. Ramírez",
  },
  {
    id: "tk-2", empresaId: "emp-1", numeroBascula: "T-004522", codigoEstacionBascula: "PVN01", tipoMovimiento: "Venta",
    origenCaptura: "Bascula", estado: "Validado", fechaHoraEntrada: new Date().toISOString(), fechaHoraSalida: new Date().toISOString(),
    pesoEntradaKg: 15200, pesoSalidaKg: 5400, pesoDescontadoKg: 0, pesoBrutoKg: 15200, pesoNetoKg: 9800,
    productoId: "prod-1", nombreMaterialBascula: "Maíz amarillo", terceroId: "cli-1", conductor: "Ana Ruiz", placa: "TKD-889",
    valorUnKg: 850, valorTotal: 8330000, metodoCaptura: "Manual", estadoValidacion: "Validado", validadoPor: "J. Ramírez",
  },
  {
    id: "tk-3", empresaId: "emp-1", numeroBascula: "T-004523", codigoEstacionBascula: "PEN01", tipoMovimiento: "Compra",
    origenCaptura: "Bascula", estado: "Capturado", fechaHoraEntrada: new Date().toISOString(), fechaHoraSalida: new Date().toISOString(),
    pesoEntradaKg: 20100, pesoSalidaKg: 6200, pesoDescontadoKg: 0, pesoBrutoKg: 20100, pesoNetoKg: 13900,
    nombreMaterialBascula: "Arena de río", metodoCaptura: "OCR", estadoValidacion: "Pendiente", valorUnKg: 0, valorTotal: 0,
  },
];

export const ordenesCompra: OrdenCompraVenta[] = [
  { id: "oc-1", empresaId: "emp-1", tipo: "Compra", serie: "OC", consecutivo: 132, ticketId: "tk-1", terceroId: "tercero-2", productoId: "prod-1", cantidad: 12450, precioUnitario: 700, valorTotal: 8715000 },
  { id: "oc-2", empresaId: "emp-1", tipo: "Compra", serie: "OC", consecutivo: 133, numeroDocumento: "FC-00981", terceroId: "tercero-1", productoId: "prod-3", cantidad: 500, precioUnitario: 4200, valorTotal: 2100000 },
];

export const ordenesVenta: OrdenCompraVenta[] = [
  { id: "ov-1", empresaId: "emp-1", tipo: "Venta", serie: "OV", consecutivo: 87, ticketId: "tk-2", terceroId: "cli-1", productoId: "prod-1", cantidad: 9800, precioUnitario: 850, valorTotal: 8330000, requiereFactura: true },
  { id: "ov-2", empresaId: "emp-1", tipo: "Venta", serie: "OV", consecutivo: 88, ticketId: "tk-2", terceroId: "cli-2", productoId: "prod-2", cantidad: 4200, precioUnitario: 300, valorTotal: 1260000, requiereFactura: false },
];

export const cuentas: CuentaPagarCobrar[] = [
  { id: "cta-1", empresaId: "emp-1", tipo: "Por Pagar", terceroId: "tercero-2", documentoOrigenId: "oc-1", valorTotal: 8715000, saldoPendiente: 8715000, estado: "Pendiente", fechaVencimiento: new Date(Date.now() + 15 * 86400000).toISOString() },
  { id: "cta-2", empresaId: "emp-1", tipo: "Por Cobrar", terceroId: "cli-1", documentoOrigenId: "ov-1", valorTotal: 8330000, saldoPendiente: 3330000, estado: "Abonada", fechaVencimiento: new Date(Date.now() + 5 * 86400000).toISOString() },
  { id: "cta-3", empresaId: "emp-1", tipo: "Por Pagar", terceroId: "tercero-1", documentoOrigenId: "oc-2", valorTotal: 2100000, saldoPendiente: 0, estado: "Pagada", fechaVencimiento: new Date(Date.now() - 3 * 86400000).toISOString() },
];

export const pagos: Pago[] = [
  { id: "pago-1", empresaId: "emp-1", cuentaId: "cta-2", valorPago: 5000000, saldoAnterior: 8330000, saldoNuevo: 3330000, metodoPago: "Transferencia", referencia: "TRX-88213", usuarioRegistro: "L. Gómez", fecha: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "pago-2", empresaId: "emp-1", cuentaId: "cta-3", valorPago: 2100000, saldoAnterior: 2100000, saldoNuevo: 0, metodoPago: "Caja Menor", referencia: "CM-0042", usuarioRegistro: "L. Gómez", fecha: new Date(Date.now() - 6 * 86400000).toISOString() },
];

export const cheques: Cheque[] = [
  { id: "cheque-1", empresaId: "emp-1", tipo: "Emitido", numeroCheque: "000452", banco: "Bancolombia", cuentaBancaria: "123-456789-00", terceroId: "tercero-2", valor: 3200000, fechaEmision: new Date().toISOString(), fechaVencimientoCobro: new Date(Date.now() + 4 * 86400000).toISOString(), estado: "Pendiente de cobro" },
  { id: "cheque-2", empresaId: "emp-1", tipo: "Recibido", numeroCheque: "889102", banco: "Davivienda", cuentaBancaria: "987-654321-00", terceroId: "cli-1", valor: 1500000, fechaEmision: new Date().toISOString(), fechaVencimientoCobro: new Date(Date.now() + 20 * 86400000).toISOString(), estado: "Registrado" },
];

export const movimientosInventario: MovimientoInventario[] = [
  { id: "mov-1", empresaId: "emp-1", productoId: "prod-1", tipo: "Entrada", cantidad: 12450, origenId: "oc-1", saldoResultante: 12450, fecha: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "mov-2", empresaId: "emp-1", productoId: "prod-1", tipo: "Salida", cantidad: 9800, origenId: "ov-1", saldoResultante: 2650, fecha: new Date(Date.now() - 1 * 86400000).toISOString() },
];

export const causaciones: Causacion[] = [
  { id: "caus-1", empresaId: "emp-1", documentoOrigenId: "oc-1", fechaCausacion: "", valorCausado: 8715000, usuarioCausacion: "", estado: "Pendiente" },
  { id: "caus-2", empresaId: "emp-1", documentoOrigenId: "ov-1", fechaCausacion: new Date(Date.now() - 2 * 86400000).toISOString(), valorCausado: 8330000, usuarioCausacion: "L. Gómez", estado: "Causada" },
];

export const conciliaciones: ConciliacionBancaria[] = [
  { id: "conc-1", pagoId: "pago-1", movimientoBancario: "TRX-88213 · Bancolombia", fechaConciliacion: "", estado: "Pendiente", usuarioConciliacion: "" },
];

export const usuarios: Usuario[] = [
  { id: "user-1", nombre: "Laura Gómez", email: "laura.gomez@empresa.com", rol: "Facturacion y Contabilidad", activo: true },
  { id: "user-2", nombre: "Julián Ramírez", email: "julian.ramirez@empresa.com", rol: "Bascula", activo: true },
  { id: "user-3", nombre: "Ana Torres", email: "ana.torres@empresa.com", rol: "Administrador", activo: true },
];
