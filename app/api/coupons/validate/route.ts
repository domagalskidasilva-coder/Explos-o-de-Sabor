import { NextResponse } from "next/server";
import { applyCoupon } from "@/src/lib/repositories";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      couponCode?: string;
      subtotalCents?: number;
    };

    const couponCode = payload.couponCode?.trim() ?? "";
    const subtotalCents = Math.max(0, Number(payload.subtotalCents) || 0);

    if (!couponCode) {
      return NextResponse.json(
        { valid: false, message: "Informe um cupom para validar." },
        { status: 400 },
      );
    }

    const result = await applyCoupon(couponCode, subtotalCents);

    if (!result.couponCode || result.discountCents <= 0) {
      return NextResponse.json({
        valid: false,
        message: "Cupom inválido ou inativo.",
        discountCents: 0,
        couponCode: null,
      });
    }

    return NextResponse.json({
      valid: true,
      message: "Cupom válido.",
      discountCents: result.discountCents,
      couponCode: result.couponCode,
    });
  } catch (error) {
    console.error("POST /api/coupons/validate error", error);
    return NextResponse.json(
      { valid: false, message: "Falha ao validar cupom." },
      { status: 500 },
    );
  }
}
