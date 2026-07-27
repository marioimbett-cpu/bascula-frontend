import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sistema de Báscula Admin",
    template: "%s · Sistema de Báscula Admin",
  },
  description: "Gestión administrativo-financiera integrada con el módulo logístico de báscula.",
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        {/* Salto de enlace para navegación por teclado (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only-focusable fixed left-2 top-2 z-[100] rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Saltar al contenido principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
