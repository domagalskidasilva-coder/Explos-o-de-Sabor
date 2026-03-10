import { NextResponse } from "next/server";
import { createOrder } from "@/src/lib/repositories";
import type { CartLine, PaymentMethod } from "@/src/types/cart";

function isValidPaymentMethod(value: string): value is PaymentMethod {
  return value === "credito" || value === "debito" || value === "dinheiro" || value === "pix";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      customerName?: string;
      customerAddress?: string;
      paymentMethod?: string;
      lines?: CartLine[];
      couponCode?: string;
    };

    if (!payload.customerName?.trim()) {
      throw new Error("Nome e obrigatorio.");
    }

    if (!payload.customerAddress?.trim()) {
      throw new Error("Endereco e obrigatorio.");
    }

    if (!payload.paymentMethod || !isValidPaymentMethod(payload.paymentMethod)) {
      throw new Error("Forma de pagamento invalida.");
    }

    const lines = Array.isArray(payload.lines)
      ? payload.lines.filter(
          (line): line is CartLine =>
            Boolean(line) &&
            typeof line.productId === "string" &&
            Number.isFinite(line.quantity),
        )
      : [];

    const order = await createOrder({
      customerName: payload.customerName,
      customerAddress: payload.customerAddress,
      paymentMethod: payload.paymentMethod,
      lines,
      couponCode: payload.couponCode,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao criar pedido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
