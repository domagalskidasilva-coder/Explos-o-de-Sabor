"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCart } from "@/src/contexts/CartContext";
import { formatCurrencyFromCents } from "@/src/lib/format";
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="group overflow-hidden rounded-[1.75rem] border border-caramel/20 bg-sugar/92 shadow-[var(--surface-shadow)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,rgba(255,252,246,1),rgba(235,215,188,1))]">
        <Image
          src={product.imagem}
          alt={`Foto de ${product.nome}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_34%),linear-gradient(180deg,transparent_45%,rgba(46,31,22,0.34)_100%)]" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/78 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-cocoa backdrop-blur">
          <span>{getCategoryLabel(product.categoria)}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-caramel" />
          <span>{product.subcategoria}</span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-2xl text-espresso">{product.nome}</h3>
          <p className="mt-2 text-sm leading-7 text-espresso/75">
            {product.descricaoCurta}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
              Preco
            </p>
            <p className="mt-1 text-2xl font-bold text-espresso">
              {formatCurrencyFromCents(product.precoCents)}
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={disabled ? undefined : { scale: 1.02 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            disabled={disabled}
            onClick={handleAddToCart}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-cocoa px-5 text-sm font-bold text-sugar transition hover:bg-espresso disabled:cursor-not-allowed disabled:bg-caramel/45 disabled:text-sugar/80"
          >
            {disabled ? "Indisponivel" : "Adicionar"}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
