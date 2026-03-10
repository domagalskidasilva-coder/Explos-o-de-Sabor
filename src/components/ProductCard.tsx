"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCart } from "@/src/contexts/CartContext";
import { formatCurrency } from "@/src/lib/format";
import type { Product } from "@/src/types/product";

function getCategoryLabel(category: Product["categoria"]) {
  return category === "doce" ? "Doce" : "Salgado";
}

export default function ProductCard({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const disabled = !product.disponivel;

  function handleAddToCart() {
    add(product.id, 1);
    openCart();
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group panel flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-[linear-gradient(140deg,rgba(255,253,249,1),rgba(236,210,152,1))]">
        <Image
          src={product.imagem}
          alt={`Foto de ${product.nome}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,7,22,0.02)_0%,rgba(47,7,22,0.14)_48%,rgba(47,7,22,0.76)_100%)]" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/86 px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-cocoa backdrop-blur">
          <span>{getCategoryLabel(product.categoria)}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-caramel" />
          <span>{product.subcategoria}</span>
        </div>
        <div className="absolute bottom-4 right-4 rounded-full border border-white/16 bg-[rgba(62,8,24,0.75)] px-3 py-2 text-sm font-extrabold text-biscuit backdrop-blur">
          {formatCurrency(product.preco)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="section-kicker text-cocoa/68">Selecao da casa</p>
            <h3 className="text-[2rem] leading-tight text-espresso">
              {product.nome}
            </h3>
          </div>
          <p className="text-sm leading-7 text-espresso/78">
            {product.descricaoCurta}
          </p>
        </div>

        <div className="mt-auto space-y-5 pt-5">
          <div className="rounded-[1.5rem] border border-[rgba(124,20,46,0.12)] bg-white/66 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-kicker text-cocoa/70">Fluxo do pedido</p>
                <p className="mt-2 text-sm leading-6 text-espresso/72">
                  Adicione ao carrinho e confirme tudo com a loja no WhatsApp.
                </p>
              </div>
              <p className="hidden rounded-full border border-caramel/18 bg-oat/80 px-3 py-1 text-sm font-extrabold text-espresso sm:inline-flex">
                {formatCurrency(product.preco)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="section-kicker text-cocoa/70">Disponibilidade</p>
              <p className="mt-2 text-sm leading-6 text-espresso/72">
                {disabled
                  ? "Item pausado no momento."
                  : "Liberado para pedido e confirmacao imediata."}
              </p>
            </div>
            <motion.button
              type="button"
              whileHover={disabled ? undefined : { scale: 1.02 }}
              whileTap={disabled ? undefined : { scale: 0.98 }}
              disabled={disabled}
              onClick={handleAddToCart}
              className="button-primary shrink-0 px-6 disabled:cursor-not-allowed disabled:brightness-75"
            >
              {disabled ? "Indisponivel" : "Adicionar"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
