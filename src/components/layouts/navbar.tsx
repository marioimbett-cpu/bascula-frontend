"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, ChevronDown, LogOut, User as UserIcon, Menu } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useEmpresaActiva } from "@/context/empresa-context";
import { cn } from "@/utils/cn";

export function Navbar({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { empresas, empresaActiva, seleccionarEmpresa } = useEmpresaActiva();
  const [empresaMenuOpen, setEmpresaMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      <button
        onClick={onOpenMobileMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Abrir menú de navegación"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Selector de empresa activa (multiempresa) */}
      <div className="relative">
        <button
          onClick={() => setEmpresaMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-haspopup="listbox"
          aria-expanded={empresaMenuOpen}
        >
          <span className="max-w-[10rem] truncate">{empresaActiva?.razonSocial ?? "Selecciona empresa"}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>
        {empresaMenuOpen && (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-40 mt-1 w-64 rounded-md border border-border bg-popover p-1 shadow-popover"
          >
            {empresas.map((empresa) => (
              <li key={empresa.id}>
                <button
                  role="option"
                  aria-selected={empresa.id === empresaActiva?.id}
                  onClick={() => {
                    seleccionarEmpresa(empresa);
                    setEmpresaMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-sm px-3 py-2 text-left text-sm hover:bg-accent",
                    empresa.id === empresaActiva?.id && "bg-primary-50 text-primary-700 dark:bg-primary-900/40"
                  )}
                >
                  {empresa.razonSocial}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Buscador global */}
      <div className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar ticket, tercero, factura..."
          aria-label="Buscar en el sistema"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
        >
          {theme === "light" ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
        </button>

        <button
          className="relative rounded-md p-2 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {user?.nombre?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
            <span className="hidden text-left text-sm sm:block">
              <span className="block font-medium leading-tight">{user?.nombre ?? "Usuario"}</span>
              <span className="block text-xs leading-tight text-muted-foreground">{user?.rol}</span>
            </span>
          </button>
          {userMenuOpen && (
            <ul role="menu" className="absolute right-0 top-full z-40 mt-1 w-48 rounded-md border border-border bg-popover p-1 shadow-popover">
              <li role="none">
                <a href="/perfil" role="menuitem" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent">
                  <UserIcon className="h-4 w-4" aria-hidden="true" /> Perfil
                </a>
              </li>
              <li role="none">
                <button onClick={() => logout()} role="menuitem" className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
