import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  validateAdminCredentials,
} from "@/src/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (
      !payload.username ||
      !payload.password ||
      !validateAdminCredentials(payload.username, payload.password)
    ) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      createAdminSessionToken(),
      getAdminSessionCookieOptions(),
    );
    return response;
  } catch (error) {
    console.error("POST /api/admin/login error", error);
    return NextResponse.json({ error: "Falha ao entrar." }, { status: 500 });
  }
}
