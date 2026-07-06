# Sistema de Báscula y Gestión Administrativo-Financiera — Frontend

## 🚀 Cómo verlo funcionando (modo demo, sin backend)

Este proyecto incluye datos simulados dentro del propio Next.js (`src/app/api/`), así que puedes navegar
toda la interfaz sin montar un backend.

**Requisito:** tener [Node.js](https://nodejs.org) 18 o superior instalado (`node -v` para verificar).

```bash
# 1. Descomprime el .zip y entra a la carpeta
cd bascula-frontend

# 2. Instala las dependencias
npm install

# 3. Levanta el servidor de desarrollo
npm run dev
```

Abre **http://localhost:3000** en tu navegador. Verás la pantalla de login: ingresa cualquier correo y
contraseña (mínimo 8 caracteres) — el modo demo acepta cualquier credencial y te deja entrar como un
usuario de ejemplo. Desde ahí puedes recorrer todos los módulos con datos de muestra (tickets, compras,
ventas, cuentas, cheques, inventario, etc.).

> Los datos del modo demo viven en memoria (`src/mocks/data.ts`) y se reinician cada vez que reinicias
> `npm run dev`. Cuando tengas un backend real, define `NEXT_PUBLIC_API_URL` en `.env.local` apuntando a
> tu API y el frontend dejará de usar las rutas simuladas automáticamente.

Si `npm install` falla o `node -v` no funciona, es porque falta instalar Node.js — no hay forma de ver una
app Next.js sin él; no es algo que se pueda "abrir" como un HTML suelto.

Frontend para el sistema descrito en `Esquema_Sistema_Bascula_Administrativo_2026.docx`: módulo logístico de
báscula (tickets, OCR/manual, validación) integrado con el módulo administrativo-financiero (compras, ventas,
inventario, cartera, cheques, causación, conciliación y reportes), operando en LAN, multiempresa.

## Stack

React 19 · Next.js (App Router) · TypeScript (strict) · Tailwind CSS · componentes estilo shadcn/ui ·
React Hook Form + Zod · TanStack Query + TanStack Table · Axios · Framer Motion · Recharts · Lucide Icons.

## Cómo conectar tu propio backend más adelante

```bash
cp .env.example .env.local   # define NEXT_PUBLIC_API_URL apuntando a tu API real
```

Los servicios en `src/services/` están listos para consumir una API REST (`GET/POST/PUT/PATCH/DELETE`,
export Excel/PDF) — al definir `NEXT_PUBLIC_API_URL`, el frontend deja de usar las rutas mock automáticamente.

## Módulos implementados end-to-end

- **Tickets**: listado + captura/validación (imagen + formulario, resaltado de baja confianza OCR)
- **Compras**: listado + nueva orden con origen dual (Ticket / Documento de proveedor) + detalle con movimientos generados
- **Ventas**: listado + nueva orden desde ticket con factura opcional + detalle con acción "Generar factura"
- **Inventario**: catálogo de productos + kardex por producto + ajuste manual (entrada/salida con motivo trazable)
- **Financiero → Cuentas**: listado con filtro Por Pagar/Por Cobrar + estado de cuenta con historial de pagos
- **Financiero → Pagos**: listado + formulario de registro (método condicional, soporte adjunto, preselección de cuenta vía `?cuentaId=`)
- **Financiero → Cheques**: listado (Emitidos/Recibidos, alerta de posfechados) + registro + detalle con **máquina de estados** (transiciones válidas por estado, reverso automático de pago al marcar "Devuelto/Rechazado")
- **Contable → Causación**: listado pendientes/causadas con acción directa "Causar"
- **Contable → Conciliación**: carga de extracto bancario + cruce contra pagos registrados + marcar conciliado
- **Contable → Reportes**: hub con las 9 categorías del esquema (tickets, compras/ventas, kardex, cartera, cierre de caja, cheques, causación, conciliación, impuestos), exportables a Excel/PDF con rango de fechas
- **Admin → Empresas**: listado + modal de creación (multiempresa) + activar/desactivar
- **Admin → Terceros**: listado con tabs Cliente/Proveedor + alta con validación de identificación fiscal + ficha con saldo
- **Admin → Usuarios**: listado con cambio de rol inline + alta de usuario + aviso de separación de funciones

Solo **Configuración** queda como página "en construcción" (no forma parte del modelo de datos del esquema —
es specífica de cada despliegue).

## Arquitectura

```
src/
├── app/
│   ├── api/               rutas mock de demo (auth/*, catch-all [...path]) — solo para visualizar sin backend
│   ├── (auth)/           login, register, forgot-password — sin sidebar
│   └── (dashboard)/      dashboard, tickets, compras, ventas, inventario,
│                         financiero/*, contable/*, admin/*, perfil, configuracion
│                         — protegidas por AuthProvider + middleware.ts
├── mocks/                data.ts — datos en memoria usados por las rutas /api/* en modo demo
├── components/
│   ├── ui/               Button, Input, Card, Badge/StatusBadge, Label, Tooltip, Skeleton
│   ├── layouts/          Sidebar, Navbar, DashboardShell, Breadcrumb
│   ├── tables/           DataTable (búsqueda, orden, paginación, export, selección)
│   ├── forms/            FormField, FileUpload
│   ├── cards/            StatCard (KPIs)
│   ├── charts/           ComprasVentasChart (Recharts)
│   └── modals/           Modal, ConfirmDialog
├── hooks/                useDebounce, usePagination, useTicketsQuery (TanStack Query)
├── services/             api.ts (Axios + interceptores JWT/refresh), resource.ts (fábrica REST genérica),
│                         modules.ts (servicios por módulo)
├── interfaces/           domain.ts (Ticket, OrdenCompraVenta, Factura, Cheque, Cuenta, Pago, Causación...),
│                         auth.ts
├── context/              AuthProvider, EmpresaProvider (multiempresa), ThemeProvider (claro/oscuro)
└── utils/                cn.ts, validation-schemas.ts (Zod)
```

## Decisiones clave ligadas al esquema funcional

- **Multiempresa**: `EmpresaProvider` guarda la empresa activa y el interceptor Axios envía `X-Empresa-Id` en
  cada petición; el catálogo de productos es compartido, terceros y transacciones se filtran por empresa.
- **Tickets**: la pantalla `/tickets/nuevo` refleja la regla "todo OCR requiere validación humana" resaltando
  los campos de baja confianza y mostrando el peso neto calculado en vivo.
- **Estados y trazabilidad**: `StatusBadge` centraliza el mapeo de estado → color para Ticket, Cheque y Cuenta,
  y `ConfirmDialog` se usa en anulaciones/correcciones para dejar constancia antes de una acción irreversible.
- **Roles**: `useAuth().hasRole()` / `hasPermission()` están listos para ocultar módulos según el rol
  (Báscula, Ventas, Compras, Facturación y Contabilidad, Administrador).
- **Autenticación**: JWT en `localStorage` + refresh automático en `services/api.ts`; `middleware.ts` deja
  preparado el guard a nivel de edge para cuando el backend emita una cookie de sesión httpOnly.

## Siguientes módulos a construir (según fases del esquema)

Compras, Ventas, Inventario, Cuentas/Pagos/Cheques, Causación, Conciliación y Reportes están como páginas
"en construcción" (`ModuloEnConstruccion`) con la misma arquitectura de Tickets — implementarlos es repetir
el patrón `DataTable + servicio REST + TanStack Query` ya usado en `/tickets`.

## Accesibilidad (WCAG AA)

Foco visible en toda la app, labels asociados a inputs, `aria-live`/`role="alert"` en errores de formulario,
skip-link al contenido principal, modales con `role="dialog"` + cierre por `Escape` + bloqueo de scroll,
contraste verificado en ambos temas.
