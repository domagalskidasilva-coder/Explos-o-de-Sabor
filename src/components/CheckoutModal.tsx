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
import type { CheckoutFormData, OrderType, PaymentMethod } from "@/src/types/cart";

const paymentMethods: PaymentMethod[] = [
  "credito",
  "debito",
  "dinheiro",
  "pix",
];
const orderTypeLabels: Record<OrderType, { title: string; description: string }> = {
  delivery: {
    title: "Delivery",
    description: "Enviamos para o endereço informado.",
  },
  retirada: {
    title: "Retirada",
    description: "Você busca na loja e pode pular o endereço.",
  },
};
const whatsappNumber = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
);

interface CheckoutState {
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  complemento: string;
  tipoPedido: OrderType;
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

interface CouponValidationState {
  status: "idle" | "valid" | "invalid" | "loading";
  message: string | null;
  discountCents: number;
  couponCode: string | null;
}

export default function CheckoutModal() {
  const { checkoutOpen, closeCheckout, lines, clear } = useCart();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const [formData, setFormData] = useState<CheckoutState>({
    nome: "",
    telefone: "",
    endereco: "",
    bairro: "",
    complemento: "",
    tipoPedido: "delivery",
    pagamento: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [couponValidation, setCouponValidation] =
    useState<CouponValidationState>({
      status: "idle",
      message: null,
      discountCents: 0,
      couponCode: null,
    });

  const { items, totalCents } = useCartProducts(lines);
  const totalItems = items.reduce((accumulator, item) => {
    return accumulator + item.quantity;
  }, 0);

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

    if (formData.tipoPedido === "delivery" && !formData.endereco.trim()) {
      nextErrors.endereco = "Informe seu endereço.";
    }

    if (!normalizeWhatsAppNumber(formData.telefone)) {
      nextErrors.telefone = "Informe seu telefone.";
    }

    if (formData.tipoPedido === "delivery" && !formData.bairro.trim()) {
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

  async function handleValidateCoupon() {
    const normalizedCoupon = couponCode.trim().toUpperCase();

    if (!normalizedCoupon) {
      setCouponValidation({
        status: "invalid",
        message: "Informe um cupom para validar.",
        discountCents: 0,
        couponCode: null,
      });
      return;
    }

    setCouponValidation({
      status: "loading",
      message: "Validando cupom...",
      discountCents: 0,
      couponCode: null,
    });

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: normalizedCoupon,
          subtotalCents: totalCents,
        }),
      });

      const payload = (await response.json()) as {
        valid?: boolean;
        message?: string;
        discountCents?: number;
        couponCode?: string | null;
      };

      setCouponValidation({
        status: payload.valid ? "valid" : "invalid",
        message: payload.message ?? "Falha ao validar cupom.",
        discountCents: payload.discountCents ?? 0,
        couponCode: payload.couponCode ?? null,
      });
    } catch {
      setCouponValidation({
        status: "invalid",
        message: "Falha ao validar cupom.",
        discountCents: 0,
        couponCode: null,
      });
    }
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
        customerPhone: normalizeWhatsAppNumber(formData.telefone),
        customerAddress: formData.endereco,
        customerNeighborhood: formData.bairro,
        customerComplement: formData.complemento,
        orderType: formData.tipoPedido,
        paymentMethod: formData.pagamento,
        lines,
        couponCode,
      }),
    });

    const orderPayload = (await orderResponse.json()) as {
      error?: string;
      orderId?: number;
      orderToken?: string | null;
      createdAt?: string;
      items?: typeof items;
      subtotalCents?: number;
      deliveryFeeCents?: number;
      totalCents?: number;
      discountCents?: number;
      couponCode?: string | null;
    };

    if (
      !orderResponse.ok ||
      typeof orderPayload.orderId !== "number" ||
      !orderPayload.items ||
      typeof orderPayload.subtotalCents !== "number" ||
      !orderPayload.createdAt ||
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
      orderId: orderPayload.orderId,
      createdAt: orderPayload.createdAt,
      formData: formData as CheckoutFormData,
      items: orderPayload.items,
      subtotalCents: orderPayload.subtotalCents,
      deliveryFeeCents: orderPayload.deliveryFeeCents ?? 0,
      totalCents: orderPayload.totalCents,
      discountCents: orderPayload.discountCents ?? 0,
      couponCode: orderPayload.couponCode ?? null,
      storefrontUrl: `${window.location.origin}/cardapio`,
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
            className="fixed inset-0 z-50 bg-[rgba(34,6,17,0.56)] backdrop-blur-[4px]"
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
            className="fixed left-1/2 top-1/2 z-[60] flex max-h-[90vh] w-[min(96vw,64rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[2rem] border border-caramel/14 bg-[linear-gradient(180deg,rgba(255,252,249,0.99),rgba(247,238,228,0.99))] shadow-[0_32px_80px_rgba(34,6,17,0.3)]"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="relative overflow-hidden border-b border-caramel/14 bg-[linear-gradient(135deg,rgba(70,9,27,0.98),rgba(107,14,38,0.97),rgba(167,123,43,0.92))] px-4 py-4 text-sugar sm:px-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_70%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="section-kicker text-biscuit/84">Checkout</p>
                  <h2
                    id="checkout-modal-title"
                    className="mt-2 text-2xl text-sugar"
                  >
                    Finalize seu pedido
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-sugar/76">
                    Preencha o essencial e envie no WhatsApp.
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
                  type="button"
                  onClick={handleCloseCheckout}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/14 bg-white/10 text-sm font-bold text-sugar transition hover:bg-white/16"
                  aria-label="Fechar checkout"
                >
                  <span aria-hidden="true" className="text-xl leading-none">
                    ×
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-5">
              <form
                className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_20rem]"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="space-y-5">
                  <section className="soft-card p-5">
                    <p className="section-kicker text-cocoa/76">
                      Dados do cliente
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="checkout-nome" className="field-label">
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
                          className="input-surface mt-3"
                          placeholder="Como devemos identificar o pedido"
                        />
                        {errors.nome ? (
                          <p className="mt-2 text-sm font-semibold text-danger">
                            {errors.nome}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label
                          htmlFor="checkout-telefone"
                          className="field-label"
                        >
                          Telefone
                        </label>
                        <input
                          id="checkout-telefone"
                          name="telefone"
                          autoComplete="tel"
                          inputMode="tel"
                          value={formData.telefone}
                          onChange={(event) =>
                            updateField("telefone", event.target.value)
                          }
                          aria-invalid={Boolean(errors.telefone)}
                          className="input-surface mt-3"
                          placeholder="Ex.: 81999999999"
                        />
                        {errors.telefone ? (
                          <p className="mt-2 text-sm font-semibold text-danger">
                            {errors.telefone}
                          </p>
                        ) : null}
                      </div>

                      <fieldset>
                        <legend className="field-label px-1">
                          Tipo do pedido
                        </legend>
                        <div className="mt-3 grid gap-3">
                          {(["delivery", "retirada"] as OrderType[]).map(
                            (type) => {
                              const checked = formData.tipoPedido === type;
                              return (
                                <label
                                  key={type}
                                  className={`flex cursor-pointer items-start gap-3 rounded-[1.2rem] border px-4 py-4 text-sm transition ${
                                    checked
                                      ? "border-cocoa bg-sugar text-espresso shadow-[0_12px_30px_rgba(92,35,17,0.12)]"
                                      : "border-caramel/12 bg-sugar/70 text-espresso/78 hover:border-caramel"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="tipo-pedido"
                                    value={type}
                                    checked={checked}
                                    onChange={() =>
                                      updateField("tipoPedido", type)
                                    }
                                    className="mt-1"
                                  />
                                  <span className="min-w-0">
                                    <span className="block font-bold">
                                      {orderTypeLabels[type].title}
                                    </span>
                                    <span className="mt-1 block text-xs leading-6 opacity-75">
                                      {orderTypeLabels[type].description}
                                    </span>
                                  </span>
                                </label>
                              );
                            },
                          )}
                        </div>
                      </fieldset>
                    </div>
                  </section>

                  <section className="soft-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker text-cocoa/76">
                          Endereço e entrega
                        </p>
                        <p className="mt-2 text-sm leading-7 text-espresso/72">
                          Esses dados deixam a mensagem do pedido organizada para
                          a loja.
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                          formData.tipoPedido === "delivery"
                            ? "border-caramel/16 bg-sugar text-cocoa/84"
                            : "border-caramel/10 bg-sugar/60 text-cocoa/64"
                        }`}
                      >
                        {formData.tipoPedido === "delivery"
                          ? "Obrigatório para delivery"
                          : "Opcional na retirada"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-5">
                      <div>
                        <label
                          htmlFor="checkout-endereco"
                          className="field-label"
                        >
                          Endereço
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
                          className="input-surface mt-3"
                          placeholder="Rua, número e ponto de referência"
                        />
                        {errors.endereco ? (
                          <p className="mt-2 text-sm font-semibold text-danger">
                            {errors.endereco}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="checkout-bairro"
                            className="field-label"
                          >
                            Bairro
                          </label>
                          <input
                            id="checkout-bairro"
                            name="bairro"
                            value={formData.bairro}
                            onChange={(event) =>
                              updateField("bairro", event.target.value)
                            }
                            aria-invalid={Boolean(errors.bairro)}
                            className="input-surface mt-3"
                            placeholder="Seu bairro"
                          />
                          {errors.bairro ? (
                            <p className="mt-2 text-sm font-semibold text-danger">
                              {errors.bairro}
                            </p>
                          ) : null}
                        </div>

                        <div>
                          <label
                            htmlFor="checkout-complemento"
                            className="field-label"
                          >
                            Complemento
                          </label>
                          <input
                            id="checkout-complemento"
                            name="complemento"
                            value={formData.complemento}
                            onChange={(event) =>
                              updateField("complemento", event.target.value)
                            }
                            className="input-surface mt-3"
                            placeholder="Apartamento, bloco, referência"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="soft-card p-5">
                    <p className="section-kicker text-cocoa/76">Pagamento</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {paymentMethods.map((paymentMethod) => {
                        const checked = formData.pagamento === paymentMethod;
                        return (
                          <label
                            key={paymentMethod}
                            className={`flex min-h-[5.4rem] cursor-pointer items-start gap-3 rounded-[1.2rem] border px-4 py-4 text-sm transition ${
                              checked
                                ? "border-cocoa bg-sugar text-espresso shadow-[0_12px_30px_rgba(92,35,17,0.12)]"
                                : "border-caramel/12 bg-sugar/70 text-espresso/78 hover:border-caramel"
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
                              className="mt-1"
                            />
                            <span className="min-w-0">
                              <span className="block font-bold">
                                {getPaymentLabel(paymentMethod)}
                              </span>
                              <span className="mt-1 block text-xs leading-6 opacity-75">
                                {paymentMethod === "pix"
                                  ? "Chave exibida na mensagem da loja."
                                  : paymentMethod === "dinheiro"
                                    ? "Pagamento na entrega ou retirada."
                                    : "Confirmação feita direto com a loja."}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.pagamento ? (
                      <p className="mt-3 text-sm font-semibold text-danger">
                        {errors.pagamento}
                      </p>
                    ) : null}

                    <div className="mt-5">
                      <label htmlFor="checkout-cupom" className="field-label">
                        Cupom de desconto
                      </label>
                      <input
                        id="checkout-cupom"
                        name="cupom"
                        value={couponCode}
                        onChange={(event) => {
                          setCouponCode(event.target.value.toUpperCase());
                          setCouponValidation({
                            status: "idle",
                            message: null,
                            discountCents: 0,
                            couponCode: null,
                          });
                        }}
                        className="input-surface mt-3"
                        placeholder="Ex.: BEMVINDO10"
                      />
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <button
                          type="button"
                          onClick={handleValidateCoupon}
                          className="button-secondary justify-center px-5"
                          disabled={couponValidation.status === "loading"}
                        >
                          {couponValidation.status === "loading"
                            ? "Validando..."
                            : "Validar cupom"}
                        </button>
                        {couponValidation.message ? (
                          <p
                            className={`text-sm font-semibold ${
                              couponValidation.status === "valid"
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {couponValidation.message}
                            {couponValidation.status === "valid" &&
                            couponValidation.discountCents > 0
                              ? ` Desconto: ${formatCurrencyFromCents(couponValidation.discountCents)}.`
                              : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="space-y-4">
                  <section className="dark-card p-5 text-sugar">
                    <p className="section-kicker text-biscuit/84">
                      Resumo do pedido
                    </p>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm leading-7 text-sugar/72">
                          {totalItems} {totalItems === 1 ? "unidade" : "unidades"} adicionadas
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-sugar">
                          {formatCurrencyFromCents(totalCents)}
                        </p>
                        {couponValidation.status === "valid" &&
                        couponValidation.discountCents > 0 ? (
                          <p className="mt-2 text-sm font-semibold text-biscuit">
                            Cupom {couponValidation.couponCode}: -
                            {formatCurrencyFromCents(couponValidation.discountCents)}
                          </p>
                        ) : null}
                      </div>
                      <span className="inline-flex items-center rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-biscuit">
                        {formData.tipoPedido === "delivery"
                          ? "Delivery"
                          : "Retirada"}
                      </span>
                    </div>
                  </section>

                  <section className="soft-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold uppercase tracking-[0.1em] text-cocoa/78">
                        Itens
                      </p>
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/62">
                        {items.length} {items.length === 1 ? "linha" : "linhas"}
                      </span>
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-espresso/80">
                      {items.map((item) => (
                        <li
                          key={item.lineId}
                          className="rounded-[1.1rem] border border-caramel/10 bg-sugar/80 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="min-w-0">
                              <span className="block font-bold text-espresso">
                                {item.quantity}x {item.product.nome}
                              </span>
                              {item.variationName ? (
                                <span className="mt-1 block text-xs uppercase tracking-[0.08em] text-cocoa/70">
                                  {item.variationName}
                                </span>
                              ) : null}
                            </span>
                            <span className="whitespace-nowrap font-bold text-espresso">
                              {formatCurrencyFromCents(item.subtotalCents)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {errors.geral ? (
                    <p className="rounded-[1.25rem] border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
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

                  <p className="text-center text-xs leading-6 text-espresso/62">
                    Ao confirmar, o pedido é registrado e a conversa abre pronta
                    no WhatsApp.
                  </p>
                </aside>
              </form>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
