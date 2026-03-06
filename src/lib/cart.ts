import { PRODUTOS_POR_ID } from "@/src/data/produtos";
import type { CartLine } from "@/src/types/cart";
import type { Product } from "@/src/types/product";

export interface CartProductLine {
  productId: string;
  product: Product;
  quantity: number;
  subtotalCents: number;
}

export function getCartProducts(lines: CartLine[]): CartProductLine[] {
  return lines.flatMap((line) => {
    const product = PRODUTOS_POR_ID.get(line.productId);
    if (!product) {
      return [];
    }

    return [
      {
        productId: line.productId,
        product,
        quantity: line.quantity,
        subtotalCents: product.precoCents * line.quantity,
      },
    ];
  });
}

export function getCartCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function getCartTotalCents(lines: CartLine[]) {
  return getCartProducts(lines).reduce((total, line) => total + line.subtotalCents, 0);
}
