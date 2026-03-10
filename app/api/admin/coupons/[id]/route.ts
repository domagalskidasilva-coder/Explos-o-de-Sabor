import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/src/lib/admin-auth";
import { deleteCoupon, updateCoupon } from "@/src/lib/repositories";

function parseCouponInput(payload: {
  code?: string;
  discountType?: string;
  discountValue?: number;
  active?: boolean;
}) {
  if (!payload.code?.trim()) {
    throw new Error("Codigo do cupom e obrigatorio.");
  }

  const discountType =
    payload.discountType === "fixed"
      ? "fixed"
      : payload.discountType === "percent"
        ? "percent"
        : null;
  if (!discountType) {
    throw new Error("Tipo de desconto invalido.");
  }

  const discountValue = Number(payload.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new Error("Valor do desconto invalido.");
  }

  return {
    code: payload.code,
    discountType,
    discountValue: Math.round(discountValue),
    active: Boolean(payload.active),
  } as const;
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
    const payload = (await request.json()) as {
      code?: string;
      discountType?: string;
      discountValue?: number;
      active?: boolean;
    };

    const coupon = await updateCoupon(Number(id), parseCouponInput(payload));
    return NextResponse.json({ coupon });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao atualizar cupom.";
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
    await deleteCoupon(Number(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/coupons/[id] error", error);
    return NextResponse.json(
      { error: "Falha ao excluir cupom." },
      { status: 500 },
    );
  }
}
