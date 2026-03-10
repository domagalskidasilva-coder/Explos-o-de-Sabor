import { NextResponse } from "next/server";
import { listProductsByIds } from "@/src/lib/repositories";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [];

    const products = await listProductsByIds(ids);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("POST /api/products/by-ids error", error);
    return NextResponse.json({ error: "Falha ao carregar itens do carrinho." }, { status: 500 });
  }
}
