"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartLine, CartProductLine } from "@/src/types/cart";
import type { Product } from "@/src/types/product";

export function useCartProducts(lines: CartLine[]) {
  const [productsById, setProductsById] = useState<Map<string, Product>>(
    new Map(),
  );

  useEffect(() => {
    const uniqueIds = Array.from(
      new Set(lines.map((line) => line.productId).filter(Boolean)),
    );

    if (uniqueIds.length === 0) {
      return;
    }

    let cancelled = false;

    fetch("/api/products/by-ids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: uniqueIds }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as { products?: Product[] };
        if (!response.ok) {
          throw new Error("Falha ao buscar produtos do carrinho.");
        }

        const nextMap = new Map(
          (payload.products ?? []).map((product) => [product.id, product]),
        );
        if (!cancelled) {
          setProductsById(nextMap);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProductsById(new Map());
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lines]);

  const items = useMemo(() => {
    return lines.flatMap((line) => {
      const product = productsById.get(line.productId);
      if (!product) {
        return [];
      }

      const variation = line.variationId
        ? (product.variacoes?.find((item) => item.id === line.variationId) ??
          null)
        : null;
      const unitPriceCents = Math.round(
        (variation?.preco ?? product.preco) * 100,
      );

      return [
        {
          productId: line.productId,
          variationId: line.variationId ?? null,
          lineId: `${line.productId}:${line.variationId ?? "padrao"}`,
          product,
          variationName: variation?.nome ?? null,
          unitPriceCents,
          quantity: line.quantity,
          subtotalCents: unitPriceCents * line.quantity,
        } satisfies CartProductLine,
      ];
    });
  }, [lines, productsById]);

  const totalCents = useMemo(
    () => items.reduce((total, item) => total + item.subtotalCents, 0),
    [items],
  );

  return {
    items,
    totalCents,
  };
}
