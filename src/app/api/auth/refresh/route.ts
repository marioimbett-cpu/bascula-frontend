import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ accessToken: "demo-access-token", refreshToken: "demo-refresh-token" });
}
