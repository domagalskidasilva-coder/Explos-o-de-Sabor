"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useCart } from "@/src/contexts/CartContext";
import { formatCurrencyFromCents } from "@/src/lib/format";
import { useCartProducts } from "@/src/hooks/useCartProducts";

export default function CartDrawer() {
  const { cartOpen, closeCart, lines, openCheckout, remove, setQty } =
    useCart();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const { items, totalCents } = useCartProducts(lines);
  const totalItems = items.reduce((accumulator, item) => {
    return accumulator + item.quantity;
  }, 0);

  useEffect(() => {
    if (!cartOpen) {
      return;
    }

    previouslyFocusedElement.current =
      document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [cartOpen, closeCart]);

  return (
    <AnimatePresence>
      {cartOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(34,6,17,0.54)] backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
            className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-lg flex-col border-l border-caramel/16 bg-[linear-gradient(180deg,rgba(255,252,249,0.99),rgba(248,239,229,0.99))] shadow-[0_30px_80px_rgba(34,6,17,0.3)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="relative overflow-hidden border-b border-caramel/14 bg-[linear-gradient(135deg,rgba(70,9,27,0.98),rgba(107,14,38,0.97),rgba(167,123,43,0.92))] px-4 py-4 text-sugar sm:px-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_68%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="section-kicker text-biscuit/84">Carrinho</p>
                  <h2 id="cart-drawer-title" className="mt-2 text-2xl text-sugar">
                    Seu pedido
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-sugar/76">
                    Revise rápido e siga para finalizar.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-biscuit">
                      {totalItems} {totalItems === 1 ? "item" : "itens"}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-biscuit">
                      Total {formatCurrencyFromCents(totalCents)}
                    </span>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeCart}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/14 bg-white/10 text-sm font-bold text-sugar transition hover:bg-white/16"
                  aria-label="Fechar carrinho"
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    ×
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {items.length === 0 ? (
                <div className="dark-card flex min-h-full flex-col items-center justify-center px-6 py-10 text-center text-sugar">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-white/10 text-sm font-bold uppercase tracking-[0.12em]">
                    Pedido
                  </span>
                  <h3 className="mt-5 text-2xl text-sugar">
                    Seu carrinho ainda está vazio.
                  </h3>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-sugar/72">
                    Adicione produtos do cardápio para montar o pedido e seguir
                    para o checkout.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <section className="soft-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="section-kicker text-cocoa/78">
                          Resumo rápido
                        </p>
                        <p className="mt-1 text-base font-semibold text-espresso">
                          {totalItems} {totalItems === 1 ? "unidade" : "unidades"} adicionadas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/68">
                          Total atual
                        </p>
                        <p className="mt-1 text-2xl font-extrabold text-espresso">
                          {formatCurrencyFromCents(totalCents)}
                        </p>
                      </div>
                    </div>
                  </section>

                  <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                        key={item.lineId}
                        className="soft-card overflow-hidden p-0"
                      >
                        <div className="border-b border-caramel/12 px-4 py-3.5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-bold text-espresso">
                                  {item.product.nome}
                                </p>
                                {item.variationName ? (
                                  <span className="inline-flex items-center rounded-full border border-caramel/16 bg-sugar px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-cocoa/82">
                                    {item.variationName}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1.5 text-sm leading-6 text-espresso/72">
                                {item.product.descricaoCurta}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                remove(item.productId, item.variationId)
                              }
                              className="inline-flex min-h-9 items-center justify-center rounded-full border border-caramel/14 bg-sugar px-3 text-xs font-bold uppercase tracking-[0.08em] text-espresso transition hover:bg-oat"
                            >
                              Remover
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="inline-flex items-center gap-2 rounded-full border border-caramel/14 bg-sugar p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                            <button
                              type="button"
                              onClick={() =>
                                setQty(
                                  item.productId,
                                  item.variationId,
                                  item.quantity - 1,
                                )
                              }
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-cream text-xl text-espresso transition hover:bg-oat"
                              aria-label={`Diminuir quantidade de ${item.product.nome}`}
                            >
                              -
                            </button>
                            <span className="min-w-10 text-center text-base font-bold text-espresso">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setQty(
                                  item.productId,
                                  item.variationId,
                                  item.quantity + 1,
                                )
                              }
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-cream text-xl text-espresso transition hover:bg-oat"
                              aria-label={`Aumentar quantidade de ${item.product.nome}`}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="section-kicker text-cocoa/72">
                              Subtotal
                            </p>
                            <p className="mt-1 text-xl font-bold text-espresso">
                              {formatCurrencyFromCents(item.subtotalCents)}
                            </p>
                          </div>
                        </div>
                      </li>
                  ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="border-t border-caramel/14 bg-sugar/55 px-4 py-4 backdrop-blur sm:px-5">
              <div className="dark-card px-5 py-5 text-sugar">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="section-kicker text-biscuit/84">Finalizar</p>
                    <p className="mt-2 text-sm leading-6 text-sugar/72">
                      Confira os dados e envie o pedido.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-biscuit/70">
                      Total do pedido
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-sugar">
                      {formatCurrencyFromCents(totalCents)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-7 text-sugar/72">
                    {items.length === 0
                      ? "Adicione itens para continuar."
                      : "Seu pedido será enviado com os detalhes já organizados."}
                  </p>
                  <button
                    type="button"
                    onClick={openCheckout}
                    disabled={items.length === 0}
                    className="button-primary disabled:cursor-not-allowed disabled:brightness-75"
                  >
                    Finalizar pedido
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
