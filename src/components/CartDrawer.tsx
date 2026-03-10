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
            className="fixed inset-0 z-50 bg-[rgba(34,6,17,0.54)] backdrop-blur-[3px]"
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
            className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-xl flex-col border-l border-[rgba(124,20,46,0.12)] bg-[linear-gradient(180deg,rgba(255,251,247,0.98),rgba(246,235,224,0.98))] shadow-[0_30px_80px_rgba(34,6,17,0.3)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="border-b border-[rgba(124,20,46,0.12)] bg-[linear-gradient(135deg,rgba(70,9,27,0.98),rgba(107,14,38,0.97),rgba(167,123,43,0.92))] px-5 py-5 text-sugar sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker text-biscuit/84">Carrinho</p>
                  <h2
                    id="cart-drawer-title"
                    className="mt-2 text-3xl text-sugar"
                  >
                    Revise seus itens antes de enviar.
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeCart}
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-white/14 bg-white/10 text-sm font-bold text-sugar transition hover:bg-white/16"
                  aria-label="Fechar carrinho"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {items.length === 0 ? (
                <div className="rounded-[1.9rem] border border-dashed border-[rgba(124,20,46,0.2)] bg-white/72 p-6 text-center">
                  <h3 className="text-2xl text-espresso">
                    Seu carrinho está vazio.
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-espresso/75">
                    Escolha algum item no cardápio para abrir o checkout.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.lineId}
                      className="rounded-[1.75rem] border border-[rgba(124,20,46,0.12)] bg-white/76 p-4 shadow-[0_12px_24px_rgba(63,11,28,0.06)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xl text-espresso">
                            {item.product.nome}
                          </p>
                          {item.variationName ? (
                            <p className="mt-1 text-sm font-semibold text-cocoa/78">
                              Opção: {item.variationName}
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm leading-7 text-espresso/75">
                            {item.product.descricaoCurta}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            remove(item.productId, item.variationId)
                          }
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(124,20,46,0.14)] bg-sugar px-4 text-sm font-bold text-espresso transition hover:bg-oat"
                          aria-label={`Remover ${item.product.nome}`}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,20,46,0.14)] bg-sugar p-1">
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
                          <span
                            className="min-w-10 text-center text-base font-bold text-espresso"
                            aria-live="polite"
                          >
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
                          <p className="section-kicker text-cocoa/74">
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
              )}
            </div>

            <div className="border-t border-[rgba(124,20,46,0.12)] px-5 py-5 sm:px-6">
              <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(70,9,27,0.98),rgba(47,8,22,0.98))] px-5 py-5 text-sugar">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker text-biscuit/84">Total</p>
                    <p className="mt-1 text-3xl">
                      {formatCurrencyFromCents(totalCents)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCheckout}
                    disabled={items.length === 0}
                    className="button-primary disabled:cursor-not-allowed disabled:brightness-75"
                  >
                    Finalizar pedido
                  </button>
                </div>
                <p className="mt-3 text-sm leading-7 text-sugar/80">
                  O checkout abre um formulário curto e depois envia o pedido
                  para confirmação no WhatsApp.
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
