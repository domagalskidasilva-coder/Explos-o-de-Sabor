import { NextResponse } from "next/server";
import { getStoreSettings } from "@/src/lib/repositories";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("GET /api/store-status error", error);
    return NextResponse.json({ error: "Falha ao carregar status da loja." }, { status: 500 });
  }
}
