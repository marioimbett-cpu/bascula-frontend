"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  tickets: "Tickets",
  compras: "Compras",
  ventas: "Ventas",
  inventario: "Inventario",
  financiero: "Financiero",
  cuentas: "Cuentas",
  pagos: "Pagos",
  cheques: "Cheques",
  contable: "Contable",
  causacion: "Causación",
  conciliacion: "Conciliación",
  reportes: "Reportes",
  admin: "Administración",
  empresas: "Empresas",
  terceros: "Terceros",
  usuarios: "Usuarios",
  perfil: "Perfil",
  configuracion: "Configuración",
  nuevo: "Nuevo",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className="mb-4 flex items-center text-sm text-muted-foreground">
      <Link href="/dashboard" className="flex items-center hover:text-foreground" aria-label="Ir al dashboard">
        <Home className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = LABELS[segment] ?? segment;
        return (
          <span key={href} className="flex items-center">
            <ChevronRight className="mx-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {label}
              </span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
