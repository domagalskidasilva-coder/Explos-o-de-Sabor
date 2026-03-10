"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import BrandLockup from "@/src/components/BrandLockup";
import { useCart } from "@/src/contexts/CartContext";
import { LOJA_INFO } from "@/src/data/loja";
import { getCartCount } from "@/src/lib/cart";
import {
  getCurrentWeekdayKey,
  type WeeklyScheduleDay,
} from "@/src/lib/store-schedule";
import { getConfiguredStoreValue } from "@/src/lib/store-info";

const links = [
  { href: "/", label: "Início" },
  { href: "/cardapio", label: "Cardápio" },
  { href: "/politica-de-privacidade", label: "Privacidade" },
];

export default function Header() {
  const pathname = usePathname();
  const { lines, openCart } = useCart();
  const itemCount = getCartCount(lines);
  const cartSummary =
    itemCount === 0
      ? "Carrinho vazio"
      : `${itemCount} ${itemCount === 1 ? "item" : "itens"}`;
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
  const [atendimento, setAtendimento] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/store-status")
      .then(async (response) => {
        const payload = (await response.json()) as {
          settings?: {
            serviceDays: string;
            openingTime: string;
            closingTime: string;
            weeklySchedule: WeeklyScheduleDay[];
            effectiveIsClosed: boolean;
          };
        };
        if (!cancelled && payload.settings) {
          const todayLine =
            payload.settings.weeklySchedule.find(
              (day) => day.key === getCurrentWeekdayKey(),
            ) ?? payload.settings.weeklySchedule[0];

          setAtendimento(
            todayLine?.open
              ? `${todayLine.label}: ${todayLine.openingTime} às ${todayLine.closingTime}`
              : `${todayLine?.label ?? "Hoje"}: fechado`,
          );
          setIsClosed(payload.settings.effectiveIsClosed);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAtendimento(getConfiguredStoreValue(LOJA_INFO.horario));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-caramel/30 bg-[rgba(255,247,250,0.9)] backdrop-blur-xl">
      <div className="bg-espresso px-4 py-2 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-biscuit lg:px-6">
        {isClosed
          ? "Loja fechada temporariamente"
          : "Pedidos com confirmação final no WhatsApp"}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
          <div className="hidden lg:block">
            <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-cocoa/82">
              Atendimento
            </p>
            <p className="mt-1 text-sm font-semibold text-espresso/80">
              {atendimento ?? "Horário ainda não configurado"}
            </p>
            <p className="text-sm font-semibold text-espresso/80">
              {telefone ?? "Telefone ainda não configurado"}
            </p>
          </div>

          <Link href="/" className="justify-self-start lg:justify-self-center">
            <BrandLockup compact />
          </Link>

          <div className="flex items-center justify-start gap-2 lg:justify-end">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openCart}
              className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-caramel/22 bg-[linear-gradient(135deg,rgba(134,20,50,0.98),rgba(93,13,40,0.98))] px-3 py-2 text-sugar shadow-[0_14px_28px_rgba(92,24,44,0.28)] transition hover:-translate-y-[1px] hover:shadow-[0_18px_36px_rgba(92,24,44,0.34)]"
              aria-label={`Abrir carrinho. ${itemCount} ${itemCount === 1 ? "item" : "itens"}.`}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/12">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4.5 w-4.5 fill-none stroke-current stroke-[2]"
                >
                  <circle cx="9" cy="19" r="1.5" />
                  <circle cx="18" cy="19" r="1.5" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20 7H7.4"
                  />
                </svg>
              </span>
              <span className="flex flex-col items-start leading-none">
                <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-sugar/72">
                  Carrinho
                </span>
                <span className="mt-1 text-sm font-extrabold text-sugar">
                  {cartSummary}
                </span>
              </span>
              <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-sugar px-2.5 py-1 text-[0.68rem] font-extrabold text-espresso shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                {itemCount}
              </span>
            </motion.button>
          </div>
        </div>

        <nav
          aria-label="Navegação principal"
          className="mt-3 grid grid-cols-3 gap-2"
        >
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-extrabold transition ${
                  active
                    ? "bg-espresso text-sugar"
                    : "border border-caramel/26 bg-white/75 text-espresso hover:bg-oat"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
