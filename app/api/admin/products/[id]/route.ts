import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminRequest } from "@/src/lib/admin-auth";
import { deleteProduct, updateProduct } from "@/src/lib/repositories";
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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const payload = (await request.json()) as Partial<Product>;
    const product = await updateProduct(id, parseProductInput(payload));
    revalidatePath("/");
    revalidatePath("/cardapio");
    return NextResponse.json({ product });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao atualizar produto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    await deleteProduct(id);
    revalidatePath("/");
    revalidatePath("/cardapio");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error", error);
    return NextResponse.json(
      { error: "Falha ao excluir produto." },
      { status: 500 },
    );
  }
}
