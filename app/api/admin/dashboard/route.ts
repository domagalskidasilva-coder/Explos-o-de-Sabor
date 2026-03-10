import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/src/lib/admin-auth";
import { getDashboardMetrics } from "@/src/lib/repositories";

export async function GET(request: Request) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const metrics = await getDashboardMetrics();
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("GET /api/admin/dashboard error", error);
    return NextResponse.json(
      { error: "Falha ao carregar dashboard." },
      { status: 500 },
    );
  }
}
