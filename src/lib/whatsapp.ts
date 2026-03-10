import { LOJA_INFO } from "@/src/data/loja";
import { formatCurrencyFromCents } from "@/src/lib/format";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import type {
  CartProductLine,
  CheckoutFormData,
  PaymentMethod,
} from "@/src/types/cart";

export function getPaymentLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case "credito":
      return "Credito - pagar na retirada";
    case "debito":
      return "Debito - pagar na retirada";
    case "dinheiro":
      return "Dinheiro - pagar na retirada";
    case "pix":
      return "Pix - unico pagamento antecipado";
    default:
      throw new Error(`Forma de pagamento invalida: ${paymentMethod}`);
  }
}

export function normalizeWhatsAppNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppMessage({
  formData,
  items,
  totalCents,
  discountCents = 0,
  couponCode = null,
}: {
  formData: CheckoutFormData;
  items: CartProductLine[];
  totalCents: number;
  discountCents?: number;
  couponCode?: string | null;
}) {
  const enderecoLoja = getConfiguredStoreValue(LOJA_INFO.endereco);
  const horarioLoja = getConfiguredStoreValue(LOJA_INFO.horario);
  const itensTexto = items
    .map(
      (item) =>
        `${item.quantity}x ${item.product.nome}${item.variationName ? ` (${item.variationName})` : ""} - ${formatCurrencyFromCents(item.subtotalCents)}`,
    )
    .join("\n");

  return [
    `Ola! Gostaria de confirmar um pedido na ${LOJA_INFO.nome}.`,
    "",
    `Nome: ${formData.nome.trim()}`,
    `Endereco: ${formData.endereco.trim()}`,
    `Forma de pagamento: ${getPaymentLabel(formData.pagamento)}`,
    "",
    "Itens do pedido:",
    itensTexto || "Carrinho vazio",
    "",
    ...(couponCode && discountCents > 0
      ? [
          `Cupom aplicado: ${couponCode} (-${formatCurrencyFromCents(discountCents)})`,
          "",
        ]
      : []),
    `Total: ${formatCurrencyFromCents(totalCents)}`,
    "",
    `Retirada: ${LOJA_INFO.retirada}`,
    ...(enderecoLoja ? [`Endereco da loja: ${enderecoLoja}`] : []),
    ...(horarioLoja ? [`Horario: ${horarioLoja}`] : []),
    "",
    "Pode confirmar, por favor?",
  ].join("\n");
}

export function buildWhatsAppUrl(number: string, message: string) {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
