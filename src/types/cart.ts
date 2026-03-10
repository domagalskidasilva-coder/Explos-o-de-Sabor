import type { Product } from "@/src/types/product";
export type PaymentMethod = "credito" | "debito" | "dinheiro" | "pix";
export type OrderType = "delivery" | "retirada";

export interface CartLine {
  productId: string;
  variationId?: string | null;
  quantity: number;
}

export interface CheckoutFormData {
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  complemento: string;
  tipoPedido: OrderType;
  pagamento: PaymentMethod;
}

export interface CartProductLine {
  productId: string;
  variationId?: string | null;
  lineId: string;
  product: Product;
  variationName: string | null;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
}
