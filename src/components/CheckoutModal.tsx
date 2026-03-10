"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/src/contexts/CartContext";
import { getCartProducts, getCartTotalCents } from "@/src/lib/cart";
import { formatCurrencyFromCents } from "@/src/lib/format";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  getPaymentLabel,
  normalizeWhatsAppNumber,
} from "@/src/lib/whatsapp";
import type { CheckoutFormData, PaymentMethod } from "@/src/types/cart";

const paymentMethods: PaymentMethod[] = [
  "credito",
  "debito",
  "dinheiro",
  "pix",
];
const whatsappNumber = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
);
const initialFormData: CheckoutState = {
  nome: "",
  telefone: "",
  endereco: "",
  bairro: "",
  complemento: "",
  pagamento: "",
};

interface CheckoutState {
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  complemento: string;
  pagamento: PaymentMethod | "";
}

interface FormErrors {
  nome?: string;
  telefone?: string;
  endereco?: string;
  bairro?: string;
  pagamento?: string;
  geral?: string;
}

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout, lines } = useCart();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const [formData, setFormData] = useState<CheckoutState>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  const items = useMemo(() => getCartProducts(lines), [lines]);
  const totalCents = useMemo(() => getCartTotalCents(lines), [lines]);

  useEffect(() => {
    if (!checkoutOpen) {
      return;
    }

    previouslyFocusedElement.current =
      document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 80);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setErrors({});
        closeCheckout();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement.current?.focus();
    };
  }, [checkoutOpen, closeCheckout]);

  function handleCloseCheckout() {
    setErrors({});
    closeCheckout();
  }

  function updateField<Key extends keyof CheckoutState>(
    field: Key,
    value: CheckoutState[Key],
  ) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      geral: undefined,
    }));
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      nextErrors.nome = "Informe seu nome.";
    }

    if (!formData.telefone.trim()) {
      nextErrors.telefone = "Informe um telefone para contato.";
    } else if (normalizeWhatsAppNumber(formData.telefone).length < 10) {
      nextErrors.telefone = "Informe um telefone valido com DDD.";
    }

    if (!formData.endereco.trim()) {
      nextErrors.endereco = "Informe seu endereco.";
    }

    if (!formData.bairro.trim()) {
      nextErrors.bairro = "Informe seu bairro.";
    }

    if (!formData.pagamento) {
      nextErrors.pagamento = "Selecione uma forma de pagamento.";
    }

    if (!whatsappNumber) {
      nextErrors.geral =
        "Configure NEXT_PUBLIC_WHATSAPP_NUMBER para liberar o envio do pedido.";
    }

    if (items.length === 0) {
      nextErrors.geral =
        "Adicione ao menos um item antes de finalizar o pedido.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const message = buildWhatsAppMessage({
      formData: formData as CheckoutFormData,
      items,
      totalCents,
    });

    const url = buildWhatsAppUrl(whatsappNumber, message);
    window.open(url, "_blank", "noopener,noreferrer");
    setFormData(initialFormData);
    handleCloseCheckout();
  }

  return (
    <AnimatePresence>
      {checkoutOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-espresso/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseCheckout}
            aria-hidden="true"
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-modal-title"
            className="fixed left-1/2 top-1/2 z-[60] flex max-h-[90vh] w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] border border-caramel/20 bg-sugar shadow-[0_24px_60px_rgba(53,33,22,0.28)]"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="border-b border-caramel/20 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">
                    Checkout
                  </p>
                  <h2
                    id="checkout-modal-title"
                    className="mt-2 text-3xl text-espresso"
                  >
                    Finalize em poucos campos.
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-espresso/75">
                    Preencha os dados para enviar um pedido organizado no
                    WhatsApp da loja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseCheckout}
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-caramel/25 bg-cream text-sm font-bold text-espresso transition hover:border-caramel hover:bg-oat"
                  aria-label="Fechar checkout"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div>
                  <label
                    htmlFor="checkout-nome"
                    className="block text-sm font-bold uppercase tracking-[0.08em] text-cocoa"
                  >
                    Nome
                  </label>
                  <input
                    ref={nameInputRef}
                    id="checkout-nome"
                    name="nome"
                    autoComplete="name"
                    value={formData.nome}
                    onChange={(event) =>
                      updateField("nome", event.target.value)
                    }
                    aria-invalid={Boolean(errors.nome)}
                    aria-describedby={
                      errors.nome ? "erro-checkout-nome" : undefined
                    }
                    className="mt-2 w-full rounded-[1.25rem] border border-caramel/25 bg-cream px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
                  />
                  {errors.nome ? (
                    <p
                      id="erro-checkout-nome"
                      role="alert"
                      className="mt-2 text-sm font-semibold text-danger"
                    >
                      {errors.nome}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="checkout-telefone"
                    className="block text-sm font-bold uppercase tracking-[0.08em] text-cocoa"
                  >
                    Telefone
                  </label>
                  <input
                    id="checkout-telefone"
                    name="telefone"
                    type="tel"
                    autoComplete="tel-national"
                    inputMode="tel"
                    value={formData.telefone}
                    onChange={(event) =>
                      updateField("telefone", event.target.value)
                    }
                    aria-invalid={Boolean(errors.telefone)}
                    aria-describedby={
                      errors.telefone
                        ? "erro-checkout-telefone"
                        : "checkout-telefone-ajuda"
                    }
                    className="mt-2 w-full rounded-[1.25rem] border border-caramel/25 bg-cream px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
                  />
                  <p
                    id="checkout-telefone-ajuda"
                    className="mt-2 text-sm leading-7 text-espresso/70"
                  >
                    Exemplo: (81) 99999-9999.
                  </p>
                  {errors.telefone ? (
                    <p
                      id="erro-checkout-telefone"
                      role="alert"
                      className="mt-2 text-sm font-semibold text-danger"
                    >
                      {errors.telefone}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="checkout-endereco"
                    className="block text-sm font-bold uppercase tracking-[0.08em] text-cocoa"
                  >
                    Endereco
                  </label>
                  <input
                    id="checkout-endereco"
                    name="endereco"
                    autoComplete="street-address"
                    value={formData.endereco}
                    onChange={(event) =>
                      updateField("endereco", event.target.value)
                    }
                    aria-invalid={Boolean(errors.endereco)}
                    aria-describedby={
                      errors.endereco
                        ? "erro-checkout-endereco"
                        : "checkout-endereco-ajuda"
                    }
                    className="mt-2 w-full rounded-[1.25rem] border border-caramel/25 bg-cream px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
                  />
                  <p
                    id="checkout-endereco-ajuda"
                    className="mt-2 text-sm leading-7 text-espresso/70"
                  >
                    Rua, numero e ponto de referencia principal.
                  </p>
                  {errors.endereco ? (
                    <p
                      id="erro-checkout-endereco"
                      role="alert"
                      className="mt-2 text-sm font-semibold text-danger"
                    >
                      {errors.endereco}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="checkout-bairro"
                      className="block text-sm font-bold uppercase tracking-[0.08em] text-cocoa"
                    >
                      Bairro
                    </label>
                    <input
                      id="checkout-bairro"
                      name="bairro"
                      autoComplete="address-level2"
                      value={formData.bairro}
                      onChange={(event) =>
                        updateField("bairro", event.target.value)
                      }
                      aria-invalid={Boolean(errors.bairro)}
                      aria-describedby={
                        errors.bairro ? "erro-checkout-bairro" : undefined
                      }
                      className="mt-2 w-full rounded-[1.25rem] border border-caramel/25 bg-cream px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
                    />
                    {errors.bairro ? (
                      <p
                        id="erro-checkout-bairro"
                        role="alert"
                        className="mt-2 text-sm font-semibold text-danger"
                      >
                        {errors.bairro}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="checkout-complemento"
                      className="block text-sm font-bold uppercase tracking-[0.08em] text-cocoa"
                    >
                      Complemento
                    </label>
                    <input
                      id="checkout-complemento"
                      name="complemento"
                      autoComplete="address-line2"
                      value={formData.complemento}
                      onChange={(event) =>
                        updateField("complemento", event.target.value)
                      }
                      className="mt-2 w-full rounded-[1.25rem] border border-caramel/25 bg-cream px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
                    />
                  </div>
                </div>

                <fieldset className="rounded-[1.5rem] border border-caramel/20 bg-cream/75 p-4">
                  <legend className="px-1 text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                    Forma de pagamento
                  </legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {paymentMethods.map((paymentMethod) => {
                      const checked = formData.pagamento === paymentMethod;
                      return (
                        <label
                          key={paymentMethod}
                          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-[1.25rem] border px-4 py-3 text-sm font-bold transition ${
                            checked
                              ? "border-cocoa bg-sugar text-espresso"
                              : "border-caramel/20 bg-sugar/70 text-espresso/80 hover:border-caramel"
                          }`}
                        >
                          <input
                            type="radio"
                            name="pagamento"
                            value={paymentMethod}
                            checked={checked}
                            onChange={() =>
                              updateField("pagamento", paymentMethod)
                            }
                            aria-describedby={
                              errors.pagamento
                                ? "erro-checkout-pagamento"
                                : undefined
                            }
                          />
                          <span>{getPaymentLabel(paymentMethod)}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.pagamento ? (
                    <p
                      id="erro-checkout-pagamento"
                      role="alert"
                      className="mt-3 text-sm font-semibold text-danger"
                    >
                      {errors.pagamento}
                    </p>
                  ) : null}
                </fieldset>

                <section className="rounded-[1.5rem] border border-caramel/20 bg-cream/75 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                        Resumo
                      </p>
                      <p className="mt-1 text-sm leading-7 text-espresso/75">
                        {items.length} {items.length === 1 ? "item" : "itens"}{" "}
                        no pedido.
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-espresso">
                      {formatCurrencyFromCents(totalCents)}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-espresso/80">
                    {items.map((item) => (
                      <li
                        key={item.productId}
                        className="flex items-start justify-between gap-4"
                      >
                        <span>
                          {item.quantity}x {item.product.nome}
                        </span>
                        <span className="whitespace-nowrap font-bold text-espresso">
                          {formatCurrencyFromCents(item.subtotalCents)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                {errors.geral ? (
                  <p
                    role="alert"
                    className="rounded-[1.25rem] border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
                  >
                    {errors.geral}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-espresso px-6 text-base font-bold text-sugar shadow-[0_16px_30px_rgba(53,33,22,0.18)] transition hover:bg-cocoa"
                >
                  Enviar pedido no WhatsApp
                </button>
                <p className="text-sm leading-7 text-espresso/70">
                  O site abre uma nova aba com a mensagem pronta no formato
                  usado pela loja.
                </p>
              </form>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
