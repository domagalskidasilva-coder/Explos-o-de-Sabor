import type { Product } from "@/src/types/product";
export type PaymentMethod = "credito" | "debito" | "dinheiro" | "pix";

export interface CartLine {
  productId: string;
  variationId?: string | null;
  quantity: number;
}

export interface CheckoutFormData {
  nome: string;
  endereco: string;
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
