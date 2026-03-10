import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminRequest } from "@/src/lib/admin-auth";
import { createProduct, listProducts } from "@/src/lib/repositories";
import type { Product } from "@/src/types/product";

function parseProductInput(payload: Partial<Product>) {
  if (!payload.nome?.trim()) {
    throw new Error("Nome do produto e obrigatorio.");
  }
  if (!payload.subcategoria?.trim()) {
    throw new Error("Subcategoria e obrigatoria.");
  }
  if (!payload.descricaoCurta?.trim()) {
    throw new Error("Descricao e obrigatoria.");
  }
  if (!payload.imagem?.trim()) {
    throw new Error("Imagem e obrigatoria.");
  }
  if (
    payload.categoria !== "doce" &&
    payload.categoria !== "salgado" &&
    payload.categoria !== "bebida"
  ) {
    throw new Error("Categoria invalida.");
  }

  const preco = Number(payload.preco);
  if (!Number.isFinite(preco) || preco < 0) {
    throw new Error("Preco invalido.");
  }

  return {
    id: payload.id,
    nome: payload.nome.trim(),
    categoria: payload.categoria,
    subcategoria: payload.subcategoria.trim(),
    descricaoCurta: payload.descricaoCurta.trim(),
    preco,
    imagem: payload.imagem.trim(),
    disponivel: Boolean(payload.disponivel),
    destaque: Boolean(payload.destaque),
  };
}

export async function GET(request: Request) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const products = await listProducts({ onlyAvailable: false });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/admin/products error", error);
    return NextResponse.json(
      { error: "Falha ao listar produtos." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const payload = (await request.json()) as Partial<Product>;
    const product = await createProduct(parseProductInput(payload));
    revalidatePath("/");
    revalidatePath("/cardapio");
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao criar produto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
