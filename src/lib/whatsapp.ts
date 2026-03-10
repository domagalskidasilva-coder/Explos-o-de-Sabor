import { LOJA_INFO } from "@/src/data/loja";
import { formatCurrencyFromCents } from "@/src/lib/format";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import type {
  CartProductLine,
  CheckoutFormData,
  OrderType,
  PaymentMethod,
} from "@/src/types/cart";

export function getPaymentLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case "credito":
      return "Crédito - pagar na retirada";
    case "debito":
      return "Débito - pagar na retirada";
    case "dinheiro":
      return "Dinheiro - pagar na retirada";
    case "pix":
      return "Pix - único pagamento antecipado";
    default:
      throw new Error(`Forma de pagamento inválida: ${paymentMethod}`);
  }
}

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

function getOrderTypeLabel(orderType: OrderType) {
  return orderType === "retirada" ? "Retirada" : "Delivery";
}

function getOperationalPaymentLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case "credito":
      return "Crédito";
    case "debito":
      return "Débito";
    case "dinheiro":
      return "Dinheiro";
    case "pix":
      return "PIX";
    default:
      return getPaymentLabel(paymentMethod);
  }
}

function formatBrazilDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function buildWhatsAppMessage({
  orderId,
  createdAt,
  formData,
  items,
  subtotalCents,
  deliveryFeeCents = 0,
  totalCents,
  discountCents = 0,
  couponCode = null,
  storefrontUrl,
}: {
  orderId: number;
  createdAt: string;
  formData: CheckoutFormData;
  items: CartProductLine[];
  subtotalCents: number;
  deliveryFeeCents?: number;
  totalCents: number;
  discountCents?: number;
  couponCode?: string | null;
  storefrontUrl?: string | null;
}) {
  const pixKey = getConfiguredStoreValue(process.env.NEXT_PUBLIC_PIX_KEY);
  const pixKeyType = getConfiguredStoreValue(process.env.NEXT_PUBLIC_PIX_KEY_TYPE);
  const pixRecipient = getConfiguredStoreValue(
    process.env.NEXT_PUBLIC_PIX_RECIPIENT,
  );
  const itensTexto = items
    .map(
      (item) =>
        `🔹 ${item.quantity}x ${item.product.nome}${item.variationName ? ` (${item.variationName})` : ""} - ${formatCurrencyFromCents(item.subtotalCents)}`,
    )
    .join("\n");

  return [
    "🛒 *NOVO PEDIDO DO SITE*",
    `🔵 *Pedido #${orderId}*`,
    `Data: ${formatBrazilDateTime(createdAt)}`,
    `Tipo: ${getOrderTypeLabel(formData.tipoPedido)}`,
    "",
    "*DADOS DO CLIENTE*",
    `Nome: ${formData.nome.trim()}`,
    `Fone: ${normalizeWhatsAppNumber(formData.telefone)}`,
    `Endereço: ${formData.endereco.trim() || "-"}`,
    `Bairro: ${formData.bairro.trim() || "-"}`,
    `Complemento: ${formData.complemento.trim() || "-"}`,
    "",
    "*ITENS DO PEDIDO*",
    itensTexto || "Carrinho vazio",
    "",
    "*RESUMO*",
    `Itens: ${formatCurrencyFromCents(subtotalCents)}`,
    `Desconto: ${formatCurrencyFromCents(discountCents)}`,
    `Entrega: ${
      formData.tipoPedido === "retirada"
        ? formatCurrencyFromCents(0)
        : deliveryFeeCents > 0
          ? formatCurrencyFromCents(deliveryFeeCents)
          : "A combinar"
    }`,
    "",
    `🔵 *TOTAL: ${formatCurrencyFromCents(totalCents)}*`,
    "",
    `Pagamento: ${getOperationalPaymentLabel(formData.pagamento)}`,
    ...(couponCode && discountCents > 0 ? [`Cupom: ${couponCode}`] : []),
    ...(formData.pagamento === "pix" && pixKey
      ? [
          `Chave PIX: ${pixKey}${pixKeyType ? ` (${pixKeyType})` : ""}${pixRecipient ? ` - ${pixRecipient}` : ""}`,
        ]
      : []),
    "",
    `Loja: ${LOJA_INFO.nome}`,
    ...(storefrontUrl ? [`Novo pedido: ${storefrontUrl}`] : []),
  ].join("\n");
}

export function buildWhatsAppUrl(number: string, message: string) {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
