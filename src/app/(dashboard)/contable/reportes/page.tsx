"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Truck,
  ShoppingCart,
  Boxes,
  Wallet,
  Landmark,
  FileCheck2,
  Receipt,
  Calculator,
  Download,
  FileText,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { DataTable } from "@/components/tables/data-table";
import { api } from "@/services/api";
import {
  ticketsService,
  ordenesCompraService,
  ordenesVentaService,
  cuentasService,
  chequesService,
  causacionService,
  conciliacionService,
  pagosService,
  movimientosInventarioService,
  tercerosService,
  productosService,
} from "@/services/modules";
import { toast } from "sonner";

const REPORTES = [
  { id: "tickets", titulo: "Tickets", descripcion: "Por rango de fechas y estado", icon: Truck },
  { id: "compras-ventas", titulo: "Compras y ventas", descripcion: "Por producto, cliente o proveedor", icon: ShoppingCart },
  { id: "kardex", titulo: "Kardex de inventario", descripcion: "Entradas, salidas y saldo por producto", icon: Boxes },
  { id: "cartera", titulo: "Cartera", descripcion: "Cuentas por cobrar y pagar, totales y por vencer", icon: Wallet },
  { id: "cierre-caja", titulo: "Cierre diario de caja y bancos", descripcion: "Pagos del período por método de pago", icon: Landmark },
  { id: "cheques", titulo: "Cheques", descripcion: "Pendientes, próximos a vencer, devueltos y consecutivo de chequera", icon: FileCheck2 },
  { id: "causacion", titulo: "Causación", descripcion: "Facturas causadas vs. pendientes, por periodo", icon: Calculator },
  { id: "conciliacion", titulo: "Conciliación bancaria", descripcion: "Pagos conciliados vs. pendientes", icon: Receipt },
  { id: "impuestos", titulo: "Informe de impuestos", descripcion: "Consolidado de ventas y compras por periodo", icon: FileText },
] as const;

// Las filas combinan varios tipos de dominio distintos (Ticket, OrdenCompraVenta, Cheque...), así que
// se tipan de forma laxa aquí a propósito — cada set de columnas ya sabe qué campos leer de su propio tipo.
type FilaReporte = any;

const dentroDeRango = (fechaIso: string | undefined, desde: string, hasta: string) => {
  if (!fechaIso) return true; // registros sin fecha (demo) no se excluyen por rango
  const fecha = new Date(fechaIso).getTime();
  if (desde && fecha < new Date(desde).getTime()) return false;
  if (hasta && fecha > new Date(hasta + "T23:59:59").getTime()) return false;
  return true;
};

const moneda = (valor: number | undefined) =>
  (valor ?? 0).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

/** Arma columnas + filas de la vista previa a partir de los datos ya disponibles (mismos servicios que el resto de módulos). */
async function cargarVistaPrevia(reporteId: string, desde: string, hasta: string): Promise<{ columnas: ColumnDef<FilaReporte, any>[]; filas: FilaReporte[] }> {
  const [{ data: terceros }, { data: productos }] = await Promise.all([
    tercerosService.list({ pageSize: 200 }),
    productosService.list({ pageSize: 200 }),
  ]);
  const nombreTercero = (id?: string) => terceros.find((t) => t.id === id)?.nombre ?? id ?? "—";
  const nombreProducto = (id?: string) => productos.find((p) => p.id === id)?.nombre ?? id ?? "—";

  if (reporteId === "tickets") {
    const { data } = await ticketsService.list({ pageSize: 200 });
    const filas = data.filter((t) => dentroDeRango(t.fechaHoraEntrada, desde, hasta));
    return {
      filas,
      columnas: [
        { accessorKey: "numeroBascula", header: "N.º ticket" },
        { accessorKey: "tipoMovimiento", header: "Tipo" },
        { accessorKey: "fechaHoraEntrada", header: "Fecha", cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString("es-CO") },
        { id: "tercero", header: "Cliente / Proveedor", cell: ({ row }) => nombreTercero((row.original as any).terceroId) },
        { accessorKey: "nombreMaterialBascula", header: "Producto" },
        { accessorKey: "pesoNetoKg", header: "Peso neto (kg)", cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO") },
        { accessorKey: "valorTotal", header: "Valor", cell: ({ getValue }) => moneda(getValue<number>()) },
        { accessorKey: "estado", header: "Estado" },
      ],
    };
  }

  if (reporteId === "compras-ventas" || reporteId === "impuestos") {
    const [compras, ventas] = await Promise.all([
      ordenesCompraService.list({ pageSize: 200 }),
      ordenesVentaService.list({ pageSize: 200 }),
    ]);
    const filas = [...compras.data, ...ventas.data];
    return {
      filas,
      columnas: [
        { accessorKey: "tipo", header: "Tipo" },
        { id: "consecutivo", header: "N.º", cell: ({ row }) => `${(row.original as any).serie}-${(row.original as any).consecutivo}` },
        { id: "tercero", header: "Cliente / Proveedor", cell: ({ row }) => nombreTercero((row.original as any).terceroId) },
        { id: "producto", header: "Producto", cell: ({ row }) => nombreProducto((row.original as any).productoId) },
        { accessorKey: "cantidad", header: "Cantidad", cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO") },
        { accessorKey: "valorTotal", header: "Valor", cell: ({ getValue }) => moneda(getValue<number>()) },
      ],
    };
  }

  if (reporteId === "kardex") {
    const { data } = await movimientosInventarioService.list({ pageSize: 200 });
    const filas = data.filter((m) => dentroDeRango(m.fecha, desde, hasta));
    return {
      filas,
      columnas: [
        { id: "producto", header: "Producto", cell: ({ row }) => nombreProducto((row.original as any).productoId) },
        { accessorKey: "tipo", header: "Tipo" },
        { accessorKey: "cantidad", header: "Cantidad", cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO") },
        { accessorKey: "saldoResultante", header: "Saldo", cell: ({ getValue }) => getValue<number>()?.toLocaleString("es-CO") },
        { accessorKey: "fecha", header: "Fecha", cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString("es-CO") },
      ],
    };
  }

  if (reporteId === "cartera") {
    const { data } = await cuentasService.list({ pageSize: 200 });
    const filas = data.filter((c) => dentroDeRango(c.fechaVencimiento, desde, hasta));
    return {
      filas,
      columnas: [
        { accessorKey: "tipo", header: "Tipo" },
        { id: "tercero", header: "Tercero", cell: ({ row }) => nombreTercero((row.original as any).terceroId) },
        { accessorKey: "valorTotal", header: "Valor total", cell: ({ getValue }) => moneda(getValue<number>()) },
        { accessorKey: "saldoPendiente", header: "Saldo pendiente", cell: ({ getValue }) => moneda(getValue<number>()) },
        { accessorKey: "estado", header: "Estado" },
        { accessorKey: "fechaVencimiento", header: "Vencimiento", cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString("es-CO") },
      ],
    };
  }

  if (reporteId === "cierre-caja") {
    const { data } = await pagosService.list({ pageSize: 200 });
    const filas = data.filter((p) => dentroDeRango(p.fecha, desde, hasta));
    return {
      filas,
      columnas: [
        { accessorKey: "fecha", header: "Fecha", cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString("es-CO") },
        { accessorKey: "metodoPago", header: "Método" },
        { accessorKey: "valorPago", header: "Valor", cell: ({ getValue }) => moneda(getValue<number>()) },
        { accessorKey: "referencia", header: "Referencia" },
        { accessorKey: "usuarioRegistro", header: "Registrado por" },
      ],
    };
  }

  if (reporteId === "cheques") {
    const { data } = await chequesService.list({ pageSize: 200 });
    const filas = data.filter((c) => dentroDeRango(c.fechaEmision, desde, hasta));
    return {
      filas,
      columnas: [
        { accessorKey: "tipo", header: "Tipo" },
        { accessorKey: "numeroCheque", header: "N.º cheque" },
        { accessorKey: "banco", header: "Banco" },
        { id: "tercero", header: "Tercero", cell: ({ row }) => nombreTercero((row.original as any).terceroId) },
        { accessorKey: "valor", header: "Valor", cell: ({ getValue }) => moneda(getValue<number>()) },
        { accessorKey: "estado", header: "Estado" },
      ],
    };
  }

  if (reporteId === "causacion") {
    const { data } = await causacionService.list({ pageSize: 200 });
    const filas = data.filter((c) => dentroDeRango(c.fechaCausacion, desde, hasta));
    return {
      filas,
      columnas: [
        { accessorKey: "documentoOrigenId", header: "Documento origen" },
        { accessorKey: "fechaCausacion", header: "Fecha", cell: ({ getValue }) => (getValue<string>() ? new Date(getValue<string>()).toLocaleDateString("es-CO") : "—") },
        { accessorKey: "valorCausado", header: "Valor causado", cell: ({ getValue }) => moneda(getValue<number>()) },
        { accessorKey: "usuarioCausacion", header: "Usuario" },
        { accessorKey: "estado", header: "Estado" },
      ],
    };
  }

  // conciliacion
  const { data } = await conciliacionService.list({ pageSize: 200 });
  const filas = data.filter((c) => dentroDeRango(c.fechaConciliacion, desde, hasta));
  return {
    filas,
    columnas: [
      { accessorKey: "movimientoBancario", header: "Movimiento bancario" },
      { accessorKey: "fechaConciliacion", header: "Fecha", cell: ({ getValue }) => (getValue<string>() ? new Date(getValue<string>()).toLocaleDateString("es-CO") : "—") },
      { accessorKey: "estado", header: "Estado" },
      { accessorKey: "usuarioConciliacion", header: "Usuario" },
    ],
  };
}

export default function ReportesPage() {
  const [reporteActivo, setReporteActivo] = useState<(typeof REPORTES)[number]["id"] | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [generando, setGenerando] = useState<"excel" | "pdf" | null>(null);
  const [cargandoVista, setCargandoVista] = useState(false);
  const [vista, setVista] = useState<{ columnas: ColumnDef<FilaReporte, any>[]; filas: FilaReporte[] } | null>(null);
  const [preguntarDescarga, setPreguntarDescarga] = useState(false);

  const seleccionarReporte = (id: (typeof REPORTES)[number]["id"]) => {
    setReporteActivo(id);
    setVista(null);
    setPreguntarDescarga(false);
  };

  const generarVistaPrevia = async () => {
    if (!reporteActivo) return;
    setCargandoVista(true);
    setVista(null);
    setPreguntarDescarga(false);
    try {
      const resultado = await cargarVistaPrevia(reporteActivo, desde, hasta);
      setVista(resultado);
      setPreguntarDescarga(true);
      if (resultado.filas.length === 0) {
        toast.info("No hay registros para el rango de fechas seleccionado.");
      }
    } catch {
      toast.error("No fue posible cargar la vista previa del reporte.");
    } finally {
      setCargandoVista(false);
    }
  };

  const descargar = async (formato: "excel" | "pdf") => {
    if (!reporteActivo) return;
    setGenerando(formato);
    try {
      const { data } = await api.get(`/reportes/${reporteActivo}/${formato}`, {
        params: { desde, hasta },
        responseType: "blob",
      });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reporteActivo}.${formato === "excel" ? "xlsx" : "pdf"}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No fue posible generar el reporte.");
    } finally {
      setGenerando(null);
    }
  };

  const reporte = REPORTES.find((r) => r.id === reporteActivo);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reportes</h1>
        <p className="text-sm text-muted-foreground">Se visualizan primero dentro del sistema — tú decides si además quieres descargarlos</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTES.map(({ id, titulo, descripcion, icon: Icon }) => (
          <button
            key={id}
            onClick={() => seleccionarReporte(id)}
            aria-pressed={reporteActivo === id}
            className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left shadow-card transition-colors ${
              reporteActivo === id ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "border-border bg-card hover:bg-accent/50"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium">{titulo}</span>
            <span className="text-xs text-muted-foreground">{descripcion}</span>
          </button>
        ))}
      </div>

      {reporte && (
        <Card>
          <CardHeader>
            <CardTitle>Ver: {reporte.titulo}</CardTitle>
            <CardDescription>Selecciona el rango de fechas y genera la vista previa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
              <FormField id="desde" label="Desde">
                <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </FormField>
              <FormField id="hasta" label="Hasta">
                <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </FormField>
            </div>
            <Button onClick={generarVistaPrevia} isLoading={cargandoVista}>
              <Eye className="h-4 w-4" aria-hidden="true" /> Ver reporte
            </Button>
          </CardContent>
        </Card>
      )}

      {vista && (
        <>
          <DataTable columns={vista.columnas} data={vista.filas} emptyMessage="No hay registros para el rango seleccionado." />

          {preguntarDescarga && (
            <Card>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">¿Deseas descargar este reporte?</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => descargar("excel")} isLoading={generando === "excel"}>
                    <Download className="h-4 w-4" aria-hidden="true" /> Sí, Excel
                  </Button>
                  <Button variant="outline" onClick={() => descargar("pdf")} isLoading={generando === "pdf"}>
                    <Download className="h-4 w-4" aria-hidden="true" /> Sí, PDF
                  </Button>
                  <Button variant="ghost" onClick={() => setPreguntarDescarga(false)}>
                    No, gracias
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
