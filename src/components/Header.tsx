"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import BrandLockup from "@/src/components/BrandLockup";
import { useCart } from "@/src/contexts/CartContext";
import { LOJA_INFO } from "@/src/data/loja";
import { getCartCount } from "@/src/lib/cart";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import { normalizeWhatsAppNumber } from "@/src/lib/whatsapp";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/cardapio", label: "Cardapio" },
  { href: "/politica-de-privacidade", label: "Privacidade" },
];

const whatsappNumber = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
);
const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

export default function Header() {
  const pathname = usePathname();
  const { lines, openCart } = useCart();
  const itemCount = getCartCount(lines);
  const horario = getConfiguredStoreValue(LOJA_INFO.horario);
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
  const headerDetails = [
    horario ? `Horario: ${horario}` : null,
    telefone ? `Tel.: ${telefone}` : null,
    LOJA_INFO.retirada,
  ].filter(Boolean);

  return (
    <header className="sticky top-0 z-40 border-b border-caramel/20 bg-cream/88 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-espresso text-sugar">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] lg:px-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sugar/82">
            {headerDetails.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center justify-center rounded-full bg-biscuit px-4 text-[0.7rem] font-extrabold tracking-[0.1em] text-espresso transition hover:bg-cream"
            >
              Pedidos no WhatsApp
            </a>
          ) : null}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between lg:min-w-0 lg:flex-1">
            <Link
              href="/"
              className="max-w-2xl text-espresso transition hover:text-cocoa"
            >
              <BrandLockup compact />
            </Link>

            <nav
              aria-label="Navegacao principal"
              className="flex flex-wrap gap-2"
            >
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-bold transition ${
                      active
                        ? "bg-espresso text-sugar shadow-[0_10px_24px_rgba(53,33,22,0.18)]"
                        : "border border-caramel/25 bg-sugar text-espresso hover:border-caramel hover:bg-oat"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCart}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-cocoa px-5 text-base font-bold text-sugar shadow-[0_12px_26px_rgba(90,61,41,0.2)] transition hover:bg-espresso"
              aria-label={`Abrir carrinho. ${itemCount} ${itemCount === 1 ? "item" : "itens"}.`}
            >
              <span>Carrinho</span>
              <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-sugar px-2 py-1 text-sm text-espresso">
                {itemCount}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
