"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export interface ComprasVentasPunto {
  fecha: string;
  compras: number;
  ventas: number;
}

export function ComprasVentasChart({ data }: { data: ComprasVentasPunto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compras vs. ventas</CardTitle>
        <CardDescription>Últimos 30 días, valores netos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72" role="img" aria-label="Gráfico de compras versus ventas en los últimos 30 días">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -16, right: 8 }}>
              <defs>
                <linearGradient id="comprasFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ventasFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                formatter={(value: number) => value.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })}
              />
              <Area type="monotone" dataKey="compras" name="Compras" stroke="#2563EB" fill="url(#comprasFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="ventas" name="Ventas" stroke="#16A34A" fill="url(#ventasFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
