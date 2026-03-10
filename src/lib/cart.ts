import type { CartLine } from "@/src/types/cart";

export function getCartCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
