import { NextResponse } from "next/server";
import { usuarios } from "@/mocks/data";

export async function POST() {
  // Modo demo: acepta cualquier correo/contraseña y siempre autentica como el primer usuario de ejemplo.
  const user = usuarios[0];

  if (!user) {
    return NextResponse.json(
      { message: "No hay usuarios de demo configurados" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({
    accessToken: "demo-access-token",
    refreshToken: "demo-refresh-token",
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      permisos: ["*"],
    },
  });

  // Cookie que habilita el guard de rutas en middleware.ts
  response.cookies.set("bascula_session", "demo-session", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
