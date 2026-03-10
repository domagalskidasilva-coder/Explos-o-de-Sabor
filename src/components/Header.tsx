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
        <div className="overflow-hidden rounded-[1.6rem] border border-caramel/16 bg-[rgba(255,251,252,0.92)] shadow-[0_18px_32px_rgba(82,14,35,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-caramel/10 px-3 py-2.5 sm:px-5">
            <Link href="/" className="min-w-0 flex-1">
              <BrandLockup compact />
            </Link>

            <motion.button
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={openCart}
              className="inline-flex min-h-[2.7rem] shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(134,20,50,0.98),rgba(93,13,40,0.98))] px-3 py-2 text-sugar shadow-[0_12px_22px_rgba(92,24,44,0.22)] sm:min-h-[3rem] sm:px-4"
              aria-label={`Abrir carrinho. ${itemCount} ${itemCount === 1 ? "item" : "itens"}.`}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/10">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]"
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
              <span className="hidden text-sm font-extrabold sm:inline">
                Carrinho
              </span>
              <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-sugar px-2 py-1 text-[0.68rem] font-extrabold text-espresso">
                {itemCount}
              </span>
            </motion.button>
          </div>

          <div className="flex items-center justify-between gap-3 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cocoa/68 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 ${
                  isClosed
                    ? "bg-amber-100/80 text-amber-900"
                    : "bg-emerald-100/80 text-emerald-900"
                }`}
              >
                {isClosed ? "Fechado" : "Aberto"}
              </span>
              <span className="hidden truncate sm:inline">
                {atendimento ?? "Horário ainda não configurado"}
              </span>
            </div>
            <span className="truncate">{telefone ?? "Telefone"}</span>
          </div>

          <nav
            aria-label="Navegação principal"
            className="grid grid-cols-3 gap-2 border-t border-caramel/10 px-3 py-2.5 sm:px-5"
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
                  className={`inline-flex min-h-[2.45rem] items-center justify-center rounded-full px-2 text-[0.72rem] font-extrabold uppercase tracking-[0.08em] transition sm:text-[0.8rem] ${
                    active
                      ? "bg-espresso text-sugar shadow-[0_10px_18px_rgba(73,12,31,0.16)]"
                      : "bg-white/72 text-espresso/76 hover:bg-oat/92"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
