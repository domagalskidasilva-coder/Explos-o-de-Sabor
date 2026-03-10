export type PaymentMethod = "credito" | "debito" | "dinheiro" | "pix";

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CheckoutFormData {
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  complemento: string;
  pagamento: PaymentMethod;
}
