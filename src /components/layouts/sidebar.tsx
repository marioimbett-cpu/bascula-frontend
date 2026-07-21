"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  ShoppingCart,
  Banknote,
  Boxes,
  Wallet,
  FileCheck2,
  Landmark,
  BarChart3,
  Building2,
  Users,
  UserCog,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { label: "Tickets", href: "/tickets", icon: Truck },
      { label: "Compras", href: "/compras", icon: ShoppingCart },
      { label: "Ventas", href: "/ventas", icon: Banknote },
      { label: "Inventario", href: "/inventario", icon: Boxes },
    ],
  },
  {
    label: "Financiero",
    items: [
      { label: "Cuentas", href: "/financiero/cuentas", icon: Wallet },
      { label: "Pagos", href: "/financiero/pagos", icon: Banknote },
      { label: "Cheques", href: "/financiero/cheques", icon: FileCheck2 },
    ],
  },
  {
    label: "Contable",
    items: [
      { label: "Causación", href: "/contable/causacion", icon: Landmark },
      { label: "Conciliación", href: "/contable/conciliacion", icon: Landmark },
      { label: "Reportes", href: "/contable/reportes", icon: BarChart3 },
    ],
  },
  {
    label: "Administración",
    items: [
      { label: "Empresas", href: "/admin/empresas", icon: Building2 },
      { label: "Terceros", href: "/admin/terceros", icon: Users },
      { label: "Usuarios", href: "/admin/usuarios", icon: UserCog },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card lg:flex"
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="truncate text-sm font-semibold text-primary-700 dark:text-primary-300"
            >
              Báscula Admin
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4" aria-label="Navegación principal">
        <NavLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={pathname === "/dashboard"} collapsed={collapsed} />

        {NAV_GROUPS.map((group) => (
          <NavGroupSection key={group.label} group={group} pathname={pathname} collapsed={collapsed} />
        ))}
      </nav>
    </motion.aside>
  );
}

function NavGroupSection({ group, pathname, collapsed }: { group: NavGroup; pathname: string; collapsed: boolean }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      {!collapsed && (
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          aria-expanded={open}
        >
          {group.label}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !open && "-rotate-90")} aria-hidden="true" />
        </button>
      )}
      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname.startsWith(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
