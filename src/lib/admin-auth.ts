import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_TTL_SECONDS = 60 * 60 * 12;
export const ADMIN_SESSION_COOKIE = "explosao_admin_session";

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !password || !secret) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_PASSWORD e ADMIN_SESSION_SECRET precisam estar configurados.",
    );
  }

  return { username, password, secret };
}

function signValue(value: string) {
  return createHmac("sha256", getAdminConfig().secret)
    .update(value)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCookieHeader(header: string | null) {
  return new Map(
    (header ?? "")
      .split(";")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const separatorIndex = chunk.indexOf("=");
        if (separatorIndex === -1) {
          return [chunk, ""];
        }

        return [
          chunk.slice(0, separatorIndex),
          decodeURIComponent(chunk.slice(separatorIndex + 1)),
        ];
      }),
  );
}

export function createAdminSessionToken() {
  const { username } = getAdminConfig();
  const payload = Buffer.from(
    JSON.stringify({
      username,
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    }),
  ).toString("base64url");

  return `${payload}.${signValue(payload)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = signValue(payload);
  if (!safeEqual(signature, expectedSignature)) {
    return false;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as {
      username?: string;
      expiresAt?: number;
    };

    const { username } = getAdminConfig();

    return (
      decoded.username === username &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export function validateAdminCredentials(username: string, password: string) {
  const config = getAdminConfig();
  return username === config.username && password === config.password;
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminRequest(request: Request) {
  const cookieMap = parseCookieHeader(request.headers.get("cookie"));
  const token = cookieMap.get(ADMIN_SESSION_COOKIE);

  if (verifyAdminSessionToken(token)) {
    return null;
  }

  return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
}
