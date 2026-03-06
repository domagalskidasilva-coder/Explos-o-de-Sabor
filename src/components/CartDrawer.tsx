"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { useCart } from "@/src/contexts/CartContext";
import { getCartProducts, getCartTotalCents } from "@/src/lib/cart";
import { formatCurrencyFromCents } from "@/src/lib/format";

export default function CartDrawer() {
  const { cartOpen, closeCart, lines, openCheckout, remove, setQty } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const items = useMemo(() => getCartProducts(lines), [lines]);
  const totalCents = useMemo(() => getCartTotalCents(lines), [lines]);

  useEffect(() => {
    if (!cartOpen) {
      return;
    }

    previouslyFocusedElement.current = document.activeElement as HTMLElement | null;
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
            className="fixed inset-0 z-50 bg-espresso/45 backdrop-blur-[2px]"
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
            className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-xl flex-col border-l border-caramel/20 bg-sugar shadow-[0_24px_60px_rgba(53,33,22,0.28)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="border-b border-caramel/20 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">Carrinho</p>
                  <h2 id="cart-drawer-title" className="mt-2 text-3xl text-espresso">
                    Revise seus itens antes de enviar.
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeCart}
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-caramel/25 bg-cream text-sm font-bold text-espresso transition hover:border-caramel hover:bg-oat"
                  aria-label="Fechar carrinho"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {items.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-caramel/30 bg-cream/90 p-6 text-center">
                  <h3 className="text-2xl text-espresso">Seu carrinho esta vazio.</h3>
                  <p className="mt-3 text-sm leading-7 text-espresso/75">
                    Escolha algum item no cardapio para abrir o checkout.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.productId} className="rounded-[1.75rem] border border-caramel/18 bg-cream/85 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xl text-espresso">{item.product.nome}</p>
                          <p className="mt-2 text-sm leading-7 text-espresso/75">{item.product.descricaoCurta}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.productId)}
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-caramel/25 bg-sugar px-4 text-sm font-bold text-espresso transition hover:border-caramel hover:bg-oat"
                          aria-label={`Remover ${item.product.nome}`}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-caramel/25 bg-sugar p-1">
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, item.quantity - 1)}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-cream text-xl text-espresso transition hover:bg-oat"
                            aria-label={`Diminuir quantidade de ${item.product.nome}`}
                          >
                            -
                          </button>
                          <span className="min-w-10 text-center text-base font-bold text-espresso" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.productId, item.quantity + 1)}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-cream text-xl text-espresso transition hover:bg-oat"
                            aria-label={`Aumentar quantidade de ${item.product.nome}`}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">Subtotal</p>
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

            <div className="border-t border-caramel/20 px-5 py-5 sm:px-6">
              <div className="rounded-[1.75rem] bg-espresso px-5 py-5 text-sugar">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.08em] text-biscuit">Total</p>
                    <p className="mt-1 text-3xl">{formatCurrencyFromCents(totalCents)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={openCheckout}
                    disabled={items.length === 0}
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-biscuit px-5 text-base font-bold text-espresso transition hover:bg-cream disabled:cursor-not-allowed disabled:bg-biscuit/40 disabled:text-sugar/70"
                  >
                    Finalizar pedido
                  </button>
                </div>
                <p className="mt-3 text-sm leading-7 text-sugar/80">
                  O checkout abre um formulario curto e depois envia o pedido para confirmacao no WhatsApp.
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
