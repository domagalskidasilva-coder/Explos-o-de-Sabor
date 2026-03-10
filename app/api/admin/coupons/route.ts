import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/src/lib/admin-auth";
import { createCoupon, listCoupons } from "@/src/lib/repositories";

function parseCouponInput(payload: {
  code?: string;
  discountType?: string;
  discountValue?: number;
  active?: boolean;
}) {
  if (!payload.code?.trim()) {
    throw new Error("Código do cupom é obrigatório.");
  }

  const discountType =
    payload.discountType === "fixed"
      ? "fixed"
      : payload.discountType === "percent"
        ? "percent"
        : null;
  if (!discountType) {
    throw new Error("Tipo de desconto inválido.");
  }

  const discountValue = Number(payload.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    throw new Error("Valor do desconto inválido.");
  }

  return {
    code: payload.code,
    discountType,
    discountValue: Math.round(discountValue),
    active: payload.active ?? true,
  } as const;
}

export async function GET(request: Request) {
  try {
    const unauthorized = await requireAdminRequest(request);
    if (unauthorized) {
      return unauthorized;
    }

    const coupons = await listCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("GET /api/admin/coupons error", error);
    return NextResponse.json(
      { error: "Falha ao listar cupons." },
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

    const payload = (await request.json()) as {
      code?: string;
      discountType?: string;
      discountValue?: number;
      active?: boolean;
    };
    const coupon = await createCoupon(parseCouponInput(payload));
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao criar cupom.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
