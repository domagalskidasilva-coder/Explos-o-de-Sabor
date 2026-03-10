import { LOJA_INFO } from "@/src/data/loja";
import type { CartProductLine } from "@/src/lib/cart";
import { formatCurrencyFromCents, formatDateTime } from "@/src/lib/format";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import type { CheckoutFormData, PaymentMethod } from "@/src/types/cart";

export function getPaymentLabel(paymentMethod: PaymentMethod) {
  switch (paymentMethod) {
    case "credito":
      return "Credito";
    case "debito":
      return "Debito";
    case "dinheiro":
      return "Dinheiro";
    case "pix":
      return "PIX";
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
}: {
  formData: CheckoutFormData;
  items: CartProductLine[];
  totalCents: number;
}) {
  const dataPedido = formatDateTime(new Date());
  const itensTexto = items
    .map(
      (item) =>
        `${item.quantity}x ${item.product.nome} - ${formatCurrencyFromCents(item.subtotalCents)}`,
    )
    .join("\n");
  const separador = "------------------------------";
  const complemento = formData.complemento.trim() || "-";
  const enderecoLoja = getConfiguredStoreValue(LOJA_INFO.endereco);
  const horarioLoja = getConfiguredStoreValue(LOJA_INFO.horario);

  return [
    `Novo pedido recebido pelo site da ${LOJA_INFO.nome}!`,
    "",
    `Data: ${dataPedido}`,
    "Tipo: Pedido via site",
    separador,
    `NOME: ${formData.nome.trim()}`,
    `Fone: ${formData.telefone.trim()}`,
    `Endereco: ${formData.endereco.trim()}`,
    `Bairro: ${formData.bairro.trim()}`,
    `Complemento: ${complemento}`,
    separador,
    itensTexto || "Carrinho vazio",
    separador,
    `Itens: ${formatCurrencyFromCents(totalCents)}`,
    `TOTAL: ${formatCurrencyFromCents(totalCents)}`,
    separador,
    `Pagamento: ${getPaymentLabel(formData.pagamento)}`,
    ...(enderecoLoja ? [`Referencia da loja: ${enderecoLoja}`] : []),
    ...(horarioLoja ? [`Horario de atendimento: ${horarioLoja}`] : []),
  ].join("\n");
}

export function buildWhatsAppUrl(number: string, message: string) {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
