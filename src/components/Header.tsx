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
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
  const [atendimento, setAtendimento] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/store-status")
      .then(async (response) => {
        const payload = (await response.json()) as {
          settings?: {
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
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4 sm:pt-3 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-caramel/18 bg-[linear-gradient(180deg,rgba(255,252,253,0.88),rgba(249,239,233,0.82))] shadow-[0_24px_46px_rgba(82,14,35,0.12)] backdrop-blur-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(194,28,67,0.16),transparent_58%),radial-gradient(circle_at_top_right,rgba(209,161,52,0.18),transparent_34%)]"
          />

          <div className="relative border-b border-caramel/12 px-3 py-2 sm:px-5 sm:py-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-espresso/82 sm:flex-wrap sm:text-[0.68rem] sm:tracking-[0.16em]">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 sm:px-2.5 ${
                    isClosed
                      ? "bg-amber-100/80 text-amber-900"
                      : "bg-emerald-100/80 text-emerald-900"
                  }`}
                >
                  {isClosed ? "Loja fechada" : "Pedidos no WhatsApp"}
                </span>
                <span className="hidden text-cocoa/58 sm:inline">
                  Experiência artesanal com retirada e entrega local
                </span>
              </div>
              <div className="text-right text-[0.6rem] font-bold uppercase tracking-[0.14em] text-cocoa/62 sm:text-[0.68rem] sm:tracking-[0.16em]">
                <p className="truncate">{telefone ?? "Telefone não configurado"}</p>
                <p className="hidden sm:block">
                  {atendimento ?? "Horário ainda não configurado"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative px-3 py-3 sm:px-5 sm:py-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <Link href="/" className="min-w-0">
                  <BrandLockup compact />
                </Link>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <nav
                  aria-label="Navegação principal"
                  className="grid w-full grid-cols-3 gap-2 rounded-[1.35rem] border border-caramel/12 bg-white/62 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] lg:w-auto"
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
                        className={`inline-flex min-h-[2.35rem] items-center justify-center rounded-[0.95rem] px-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] transition sm:min-h-[2.85rem] sm:px-3 sm:text-sm sm:normal-case sm:tracking-normal ${
                          active
                            ? "bg-espresso text-sugar shadow-[0_14px_26px_rgba(73,12,31,0.2)]"
                            : "text-espresso/76 hover:bg-oat/92"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="grid gap-3 lg:min-w-[23rem]">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={openCart}
                    className="group inline-flex min-h-[2.7rem] items-center justify-between gap-2 rounded-[1rem] border border-caramel/16 bg-[linear-gradient(135deg,rgba(134,20,50,0.98),rgba(93,13,40,0.98))] px-3 py-2 text-sugar shadow-[0_14px_28px_rgba(92,24,44,0.2)] sm:min-h-[3rem] sm:gap-3 sm:rounded-[1.2rem] sm:px-3.5 sm:py-2.5"
                    aria-label={`Abrir carrinho. ${itemCount} ${itemCount === 1 ? "item" : "itens"}.`}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/10 sm:h-9 sm:w-9">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 fill-none stroke-current stroke-[2] sm:h-4 sm:w-4"
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
                    <span className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="text-[0.56rem] font-extrabold uppercase tracking-[0.14em] text-sugar/68 sm:text-[0.64rem] sm:tracking-[0.16em]">
                        Carrinho
                      </span>
                      <span className="truncate text-xs font-extrabold text-sugar sm:text-sm">
                        {itemCount === 0
                          ? "Abrir pedido"
                          : `${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
                      </span>
                    </span>
                    <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-sugar px-2 py-1 text-[0.66rem] font-extrabold text-espresso sm:min-w-10 sm:px-2.5 sm:text-[0.72rem]">
                      {itemCount}
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
