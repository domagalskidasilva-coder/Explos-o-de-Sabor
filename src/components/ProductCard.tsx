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
  const availabilityLabel = disabled ? "Indisponível" : "Disponível agora";
  const availabilityClassName = disabled
    ? "bg-danger/10 text-danger"
    : "bg-success/10 text-success";

  function handleAddToCart() {
    add(product.id, null, 1);
    openCart();
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group panel-soft flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(140deg,rgba(255,253,249,1),rgba(236,210,152,1))]">
        <Image
          src={product.imagem}
          alt={`Foto de ${product.nome}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,7,22,0.02)_0%,rgba(47,7,22,0.16)_52%,rgba(47,7,22,0.74)_100%)]" />
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-white/38 bg-white/86 px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-cocoa backdrop-blur">
            {getCategoryLabel(product.categoria)}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/18 bg-[rgba(62,8,24,0.68)] px-3 py-2 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-biscuit backdrop-blur">
            {product.subcategoria}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 rounded-full border border-white/14 bg-[rgba(62,8,24,0.78)] px-4 py-2 text-sm font-extrabold text-biscuit backdrop-blur">
          {variations.length > 0
            ? `a partir de ${formatCurrency(lowestPrice)}`
            : formatCurrency(lowestPrice)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="section-kicker text-cocoa/68">Seleção da casa</p>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] ${availabilityClassName}`}
            >
              {availabilityLabel}
            </span>
          </div>
          <h3 className="text-[1.7rem] leading-tight text-espresso sm:text-[1.9rem]">
            {product.nome}
          </h3>
          <p className="text-sm leading-7 text-espresso/76">
            {product.descricaoCurta}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {variations.length > 0 ? (
            <span className="inline-flex rounded-full bg-oat/76 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-cocoa/78">
              {variations.length} opções
            </span>
          ) : null}
          <span className="inline-flex rounded-full bg-white/76 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-cocoa/76">
            {product.subcategoria}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="section-kicker text-cocoa/68">Preço</p>
              <p className="mt-1 text-3xl font-extrabold text-espresso">
                {variations.length > 0
                  ? `a partir de ${formatCurrency(lowestPrice)}`
                  : formatCurrency(lowestPrice)}
              </p>
            </div>
            {requiresDetailPage ? (
              <Link
                href={`/produto/${product.id}`}
                className="button-primary w-full justify-center px-5"
              >
                {disabled ? "Pausado" : "Adicionar"}
              </Link>
            ) : (
              <motion.button
                type="button"
                whileHover={disabled ? undefined : { scale: 1.02 }}
                whileTap={disabled ? undefined : { scale: 0.98 }}
                disabled={disabled}
                onClick={handleAddToCart}
                className="button-primary w-full justify-center px-5 disabled:cursor-not-allowed disabled:brightness-75"
              >
                {disabled ? "Pausado" : "Adicionar"}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
