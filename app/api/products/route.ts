import { NextResponse } from "next/server";
import { listProducts } from "@/src/lib/repositories";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeUnavailable = url.searchParams.get("includeUnavailable") === "1";
    const products = await listProducts({ onlyAvailable: !includeUnavailable });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error", error);
    return NextResponse.json({ error: "Falha ao carregar produtos." }, { status: 500 });
  }
}
