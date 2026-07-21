import { NextResponse } from "next/server";
import { usuarios } from "@/mocks/data";

export async function GET() {
  const user = usuarios[0];

  if (!user) {
    return NextResponse.json(
      { message: "No hay usuarios de demostración configurados." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    permisos: ["*"],
  });
}
