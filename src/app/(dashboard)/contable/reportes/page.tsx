"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { api } from "@/services/api";
import { toast } from "sonner";

const REPORTES = [
  { id: "tickets", titulo: "Tickets", descripcion: "Por rango de fechas y estado", icon: Truck },
  { id: "compras-ventas", titulo: "Compras y ventas", descripcion: "Por producto, cliente o proveedor", icon: ShoppingCart },
  { id: "kardex", titulo: "Kardex de inventario", descripcion: "Entradas, salidas y saldo por producto", icon: Boxes },
  { id: "cartera", titulo: "Cartera", descripcion: "Cuentas por cobrar y pagar, totales y por vencer", icon: Wallet },
  { id: "cierre-caja", titulo: "Cierre diario de caja y bancos", descripcion: "Consolidado del día por método de pago", icon: Landmark },
  { id: "cheques", titulo: "Cheques", descripcion: "Pendientes, próximos a vencer, devueltos y consecutivo de chequera", icon: FileCheck2 },
  { id: "causacion", titulo: "Causación", descripcion: "Facturas causadas vs. pendientes, por periodo", icon: Calculator },
  { id: "conciliacion", titulo: "Conciliación bancaria", descripcion: "Pagos conciliados vs. pendientes", icon: Receipt },
  { id: "impuestos", titulo: "Informe de impuestos", descripcion: "Consolidado de ventas y compras por periodo", icon: FileText },
] as const;

export default function ReportesPage() {
  const [reporteActivo, setReporteActivo] = useState<(typeof REPORTES)[number]["id"] | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [generando, setGenerando] = useState<"excel" | "pdf" | null>(null);

  const generar = async (formato: "excel" | "pdf") => {
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
        <p className="text-sm text-muted-foreground">Todos exportables a Excel y PDF, con filtro por rango de fechas</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTES.map(({ id, titulo, descripcion, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setReporteActivo(id)}
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
            <CardTitle>Generar: {reporte.titulo}</CardTitle>
            <CardDescription>Selecciona el rango de fechas y el formato de exportación</CardDescription>
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
            <div className="flex gap-2">
              <Button onClick={() => generar("excel")} isLoading={generando === "excel"}>
                <Download className="h-4 w-4" aria-hidden="true" /> Exportar Excel
              </Button>
              <Button variant="outline" onClick={() => generar("pdf")} isLoading={generando === "pdf"}>
                <Download className="h-4 w-4" aria-hidden="true" /> Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
