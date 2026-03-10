import type { Product } from "@/src/types/product";
export type PaymentMethod = "credito" | "debito" | "dinheiro" | "pix";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CheckoutFormData {
  nome: string;
  endereco: string;
  pagamento: PaymentMethod;
}

export interface CartProductLine {
  productId: string;
  product: Product;
  quantity: number;
  subtotalCents: number;
}
