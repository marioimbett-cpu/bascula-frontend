import { NextResponse, type NextRequest } from "next/server";
import * as db from "@/mocks/data";

// Mapea el prefijo de ruta (tal como lo llaman los servicios en src/services/modules.ts) a su colección en memoria.
// Se ordena de más específico a menos específico para que "inventario/movimientos" no choque con otros prefijos.
const COLECCIONES: Record<string, any[]> = {
  "inventario/movimientos": db.movimientosInventario,
  empresas: db.empresas,
  terceros: db.terceros,
  tickets: db.tickets,
  compras: db.ordenesCompra,
  ventas: db.ordenesVenta,
  cuentas: db.cuentas,
  pagos: db.pagos,
  cheques: db.cheques,
  productos: db.productos,
  causacion: db.causaciones,
  conciliacion: db.conciliaciones,
  usuarios: db.usuarios,
};

const PREFIJOS = Object.keys(COLECCIONES).sort((a, b) => b.length - a.length);

function resolverColeccion(pathname: string): { prefijo: string; coleccion: any[]; resto: string[] } | null {
  const segmentos = pathname.split("/").filter(Boolean);
  const segmentosSeguro = segmentos ?? [];
  for (const prefijo of PREFIJOS) {
    const partesPrefijo = prefijo.split("/");
    const coincide = partesPrefijo.every((parte, i) => segmentosSeguro[i] === parte);
    if (coincide) {
      return { prefijo, coleccion: COLECCIONES[prefijo], resto: segmentosSeguro.slice(partesPrefijo.length);
    }
  }
  return null;
}

function parseFilters(searchParams: URLSearchParams) {
  const filtros: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    const match = key.match(/^filters\[(.+)\]$/);
    if (match && value) filtros[match[1]] = value;
  }
  return filtros;
}

function paginar(items: any[], searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);
  const search = (searchParams.get("search") ?? "").toLowerCase();
  const filtros = parseFilters(searchParams);

  let filtrados = items;

  if (search) {
    filtrados = filtrados.filter((item) => JSON.stringify(item).toLowerCase().includes(search));
  }

  for (const [clave, valor] of Object.entries(filtros)) {
    if (clave === "estadoNot") {
      filtrados = filtrados.filter((item) => item.estado !== valor);
    } else {
      filtrados = filtrados.filter((item) => String(item[clave] ?? "") === valor);
    }
  }

  const total = filtrados.length;
  const start = (page - 1) * pageSize;
  const data = filtrados.slice(start, start + pageSize);

  return { data, total, page, pageSize };
}

// Un blob mínimo para que los botones de exportación tengan una respuesta válida que descargar.
function stubExport(formato: "excel" | "pdf") {
  const contenido = formato === "excel" ? "Exportación de ejemplo (modo demo)" : "%PDF-1.4 Exportación de ejemplo (modo demo)";
  const tipo = formato === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "application/pdf";
  return new NextResponse(contenido, { headers: { "Content-Type": tipo } });
}

export async function GET(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const path = pathname.replace(/^\/api\//, "");

  // Reportes: /reportes/{id}/{excel|pdf}
  if (path.startsWith("reportes/")) {
    const partes = path.split("/");
    const formato = partes[2] === "pdf" ? "pdf" : "excel";
    return stubExport(formato);
  }

  const resuelto = resolverColeccion(path);
  if (!resuelto) return NextResponse.json({ message: "Recurso no encontrado (modo demo)" }, { status: 404 });

  const { coleccion, resto } = resuelto;

  // /{recurso}/export/{excel|pdf}
  if (resto[0] === "export") {
    return stubExport(resto[1] === "pdf" ? "pdf" : "excel");
  }

  // /{recurso}/{id}
  if (resto.length === 1) {
    const item = coleccion.find((i) => i.id === resto[0]);
    if (!item) return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    return NextResponse.json(item);
  }

  // /{recurso} — listado paginado
  return NextResponse.json(paginar(coleccion, searchParams));
}

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = pathname.replace(/^\/api\//, "");

  if (path === "facturas") {
    const body = await request.json();
    const factura = { id: `factura-${Date.now()}`, ...body, estado: "Pendiente" };
    return NextResponse.json(factura);
  }

  if (path === "conciliacion/extracto") {
    return NextResponse.json({ ok: true, mensaje: "Extracto cargado (modo demo)" });
  }

  const resuelto = resolverColeccion(path);
  if (!resuelto) return NextResponse.json({ message: "Recurso no encontrado (modo demo)" }, { status: 404 });

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // multipart/form-data u otros — se ignora el cuerpo en modo demo
  }

  const nuevo = { id: `${resuelto.prefijo.split("/")[0]}-${Date.now()}`, ...body };
  resuelto.coleccion.push(nuevo);
  return NextResponse.json(nuevo, { status: 201 });
}

async function actualizar(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = pathname.replace(/^\/api\//, "");
  const resuelto = resolverColeccion(path);
  if (!resuelto || resuelto.resto.length !== 1) {
    return NextResponse.json({ message: "Recurso no encontrado (modo demo)" }, { status: 404 });
  }

  const id = resuelto.resto[0];
  const index = resuelto.coleccion.findIndex((i) => i.id === id);
  if (index === -1) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  const body = await request.json();
  resuelto.coleccion[index] = { ...resuelto.coleccion[index], ...body };
  return NextResponse.json(resuelto.coleccion[index]);
}

export const PUT = actualizar;
export const PATCH = actualizar;

export async function DELETE(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = pathname.replace(/^\/api\//, "");
  const resuelto = resolverColeccion(path);
  if (!resuelto || resuelto.resto.length !== 1) {
    return NextResponse.json({ message: "Recurso no encontrado (modo demo)" }, { status: 404 });
  }

  const id = resuelto.resto[0];
  const index = resuelto.coleccion.findIndex((i) => i.id === id);
  if (index === -1) return NextResponse.json({ message: "No encontrado" }, { status: 404 });

  resuelto.coleccion.splice(index, 1);
  return NextResponse.json({ ok: true });
}
