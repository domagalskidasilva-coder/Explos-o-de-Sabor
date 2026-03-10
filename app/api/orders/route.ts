import { NextResponse } from "next/server";
import { createOrder } from "@/src/lib/repositories";
import type { CartLine, OrderType, PaymentMethod } from "@/src/types/cart";

function isValidPaymentMethod(value: string): value is PaymentMethod {
  return (
    value === "credito" ||
    value === "debito" ||
    value === "dinheiro" ||
    value === "pix"
  );
}

function isValidOrderType(value: string): value is OrderType {
  return value === "delivery" || value === "retirada";
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
      customerNeighborhood?: string;
      customerComplement?: string;
      orderType?: string;
      deliveryFeeCents?: number;
      paymentMethod?: string;
      lines?: CartLine[];
      couponCode?: string;
    };

    if (!payload.customerName?.trim()) {
      throw new Error("Nome é obrigatório.");
    }

    if (!payload.customerPhone?.trim()) {
      throw new Error("Telefone é obrigatório.");
    }

    if (
      payload.orderType === "delivery" &&
      !payload.customerAddress?.trim()
    ) {
      throw new Error("Endereço é obrigatório.");
    }

    if (
      payload.orderType === "delivery" &&
      !payload.customerNeighborhood?.trim()
    ) {
      throw new Error("Bairro é obrigatório.");
    }

    if (
      !payload.paymentMethod ||
      !isValidPaymentMethod(payload.paymentMethod)
    ) {
      throw new Error("Forma de pagamento inválida.");
    }

    if (!payload.orderType || !isValidOrderType(payload.orderType)) {
      throw new Error("Tipo de pedido inválido.");
    }

    const lines = Array.isArray(payload.lines)
      ? payload.lines.filter(
          (line): line is CartLine =>
            Boolean(line) &&
            typeof line.productId === "string" &&
            (!("variationId" in line) ||
              typeof line.variationId === "string" ||
              line.variationId == null) &&
            Number.isFinite(line.quantity),
        )
      : [];

    const order = await createOrder({
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      customerAddress: payload.customerAddress?.trim() ?? "",
      customerNeighborhood: payload.customerNeighborhood?.trim() ?? "",
      customerComplement: payload.customerComplement?.trim() ?? "",
      orderType: payload.orderType,
      deliveryFeeCents: Number.isFinite(payload.deliveryFeeCents)
        ? Math.max(0, Number(payload.deliveryFeeCents))
        : 0,
      paymentMethod: payload.paymentMethod,
      lines,
      couponCode: payload.couponCode,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao criar pedido.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
