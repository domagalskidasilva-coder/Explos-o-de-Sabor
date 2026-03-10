"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/src/contexts/CartContext";
import { formatCurrencyFromCents } from "@/src/lib/format";
import { useCartProducts } from "@/src/hooks/useCartProducts";
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

interface CheckoutState {
  nome: string;
  endereco: string;
  pagamento: PaymentMethod | "";
}

interface FormErrors {
  nome?: string;
  endereco?: string;
  pagamento?: string;
  geral?: string;
}

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout, lines, clear } = useCart();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const [formData, setFormData] = useState<CheckoutState>({
    nome: "",
    endereco: "",
    pagamento: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { items, totalCents } = useCartProducts(lines);

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
    setIsSubmitting(false);
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

    if (!formData.endereco.trim()) {
      nextErrors.endereco = "Informe seu endereco.";
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const orderResponse = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerName: formData.nome,
        customerAddress: formData.endereco,
        paymentMethod: formData.pagamento,
        lines,
        couponCode,
      }),
    });

    const orderPayload = (await orderResponse.json()) as {
      error?: string;
      items?: typeof items;
      totalCents?: number;
      discountCents?: number;
      couponCode?: string | null;
    };

    if (
      !orderResponse.ok ||
      !orderPayload.items ||
      typeof orderPayload.totalCents !== "number"
    ) {
      setErrors((current) => ({
        ...current,
        geral: orderPayload.error ?? "Falha ao registrar o pedido.",
      }));
      setIsSubmitting(false);
      return;
    }

    const message = buildWhatsAppMessage({
      formData: formData as CheckoutFormData,
      items: orderPayload.items,
      totalCents: orderPayload.totalCents,
      discountCents: orderPayload.discountCents ?? 0,
      couponCode: orderPayload.couponCode ?? null,
    });

    const url = buildWhatsAppUrl(whatsappNumber, message);
    window.open(url, "_blank", "noopener,noreferrer");
    clear();
    setIsSubmitting(false);
    handleCloseCheckout();
  }

  return (
    <AnimatePresence>
      {checkoutOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[rgba(34,6,17,0.56)] backdrop-blur-[3px]"
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
            className="fixed left-1/2 top-1/2 z-[60] flex max-h-[90vh] w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] border border-[rgba(124,20,46,0.12)] bg-[linear-gradient(180deg,rgba(255,252,249,0.98),rgba(246,235,224,0.98))] shadow-[0_32px_80px_rgba(34,6,17,0.3)]"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="border-b border-[rgba(124,20,46,0.12)] bg-[linear-gradient(135deg,rgba(70,9,27,0.98),rgba(107,14,38,0.97),rgba(167,123,43,0.92))] px-5 py-5 text-sugar sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker text-biscuit/84">Checkout</p>
                  <h2
                    id="checkout-modal-title"
                    className="mt-2 text-3xl text-sugar"
                  >
                    Finalize em poucos campos.
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-sugar/76">
                    Credito, debito e dinheiro sao pagos na retirada. Pix e o
                    unico antecipado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseCheckout}
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-white/14 bg-white/10 text-sm font-bold text-sugar transition hover:bg-white/16"
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
                    className="mt-2 w-full rounded-[1.25rem] border border-[rgba(124,20,46,0.14)] bg-white/78 px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
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
                    className="mt-2 w-full rounded-[1.25rem] border border-[rgba(124,20,46,0.14)] bg-white/78 px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
                  />
                  <p
                    id="checkout-endereco-ajuda"
                    className="mt-2 text-sm leading-7 text-espresso/70"
                  >
                    O endereco aparece apenas na mensagem do pedido para
                    facilitar o contato com a loja.
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

                <fieldset className="rounded-[1.5rem] border border-[rgba(124,20,46,0.12)] bg-white/70 p-4">
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
                              : "border-[rgba(124,20,46,0.12)] bg-sugar/70 text-espresso/80 hover:border-caramel"
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

                <div>
                  <label
                    htmlFor="checkout-cupom"
                    className="block text-sm font-bold uppercase tracking-[0.08em] text-cocoa"
                  >
                    Cupom de desconto (opcional)
                  </label>
                  <input
                    id="checkout-cupom"
                    name="cupom"
                    value={couponCode}
                    onChange={(event) =>
                      setCouponCode(event.target.value.toUpperCase())
                    }
                    className="mt-2 w-full rounded-[1.25rem] border border-[rgba(124,20,46,0.14)] bg-white/78 px-4 py-3 text-base text-espresso shadow-sm outline-none transition placeholder:text-espresso/40 focus:border-caramel"
                    placeholder="Ex.: BEMVINDO10"
                  />
                  <p className="mt-2 text-sm leading-7 text-espresso/70">
                    O desconto e validado no envio do pedido.
                  </p>
                </div>

                <section className="rounded-[1.5rem] border border-[rgba(124,20,46,0.12)] bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="section-kicker text-cocoa/74">Resumo</p>
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
                  disabled={isSubmitting}
                  className="button-primary w-full px-6 disabled:cursor-not-allowed disabled:brightness-75"
                >
                  {isSubmitting ? "Enviando..." : "Enviar pedido no WhatsApp"}
                </button>
                <p className="text-sm leading-7 text-espresso/70">
                  O site abre uma nova aba com a mensagem pronta para voce
                  revisar e confirmar.
                </p>
              </form>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
