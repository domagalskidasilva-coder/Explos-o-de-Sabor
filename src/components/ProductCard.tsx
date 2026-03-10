"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useCart } from "@/src/contexts/CartContext";
import { formatCurrency } from "@/src/lib/format";
import type { Product } from "@/src/types/product";

function getCategoryLabel(category: Product["categoria"]) {
  if (category === "doce") {
    return "Doce";
  }

  if (category === "bebida") {
    return "Bebida";
  }

  return "Salgado";
}

export default function ProductCard({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const disabled = !product.disponivel;
  const variations = product.variacoes ?? [];
  const requiresDetailPage = product.categoria !== "bebida";
  const lowestPrice =
    variations.length > 0
      ? Math.min(...variations.map((variation) => variation.preco))
      : product.preco;

  function handleAddToCart() {
    add(product.id, null, 1);
    openCart();
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="surface-card overflow-hidden rounded-[1.45rem]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-oat">
        <Image
          src={product.imagem}
          alt={`Foto de ${product.nome}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,7,22,0.02)_0%,rgba(47,7,22,0.12)_55%,rgba(47,7,22,0.72)_100%)]" />
        <div className="absolute left-3 top-3 inline-flex rounded-full bg-white/92 px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-cocoa">
          {getCategoryLabel(product.categoria)}
        </div>
        <div className="absolute bottom-3 right-3 rounded-full bg-[rgba(62,8,24,0.86)] px-3 py-1.5 text-[0.82rem] font-extrabold text-sugar">
          {formatCurrency(lowestPrice)}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-oat px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-cocoa/72">
                {product.subcategoria}
              </span>
            </div>
            <h3 className="mt-2 text-[1.18rem] leading-[1.15] text-espresso sm:text-[1.28rem]">
              {product.nome}
            </h3>
            <p className="mt-1 line-clamp-2 text-[0.92rem] leading-6 text-espresso/70">
              {product.descricaoCurta}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] ${
              disabled ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
            }`}
          >
            {disabled ? "Pausado" : "Disponível"}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-cocoa/58">
              {variations.length > 0
                ? `${variations.length} opções`
                : product.categoria === "bebida"
                  ? "Compra rápida"
                  : "Ver adicionais"}
            </p>
            <p className="mt-1 text-[1.7rem] font-extrabold leading-none text-espresso">
              {variations.length > 0
                ? `a partir de ${formatCurrency(lowestPrice)}`
                : formatCurrency(lowestPrice)}
            </p>
          </div>

          {requiresDetailPage ? (
            <Link
              href={`/produto/${product.id}`}
              className="button-primary h-11 min-w-[7.75rem] justify-center px-4 text-[0.78rem]"
            >
              {disabled ? "Pausado" : "Ver item"}
            </Link>
          ) : (
            <motion.button
              type="button"
              whileHover={disabled ? undefined : { scale: 1.02 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              disabled={disabled}
              onClick={handleAddToCart}
              className="button-primary h-11 min-w-[7.75rem] justify-center px-4 text-[0.78rem] disabled:cursor-not-allowed disabled:brightness-75"
            >
              {disabled ? "Pausado" : "Adicionar"}
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
