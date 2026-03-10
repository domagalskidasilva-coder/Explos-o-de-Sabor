"use client";

import { FormEvent, useMemo, useState } from "react";
import { LOJA_INFO } from "@/src/data/loja";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/src/lib/whatsapp";

const MAX_DESCRIPTION_LENGTH = 250;

const configuredPhone = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    getConfiguredStoreValue(LOJA_INFO.telefone) ??
    "",
);

export default function CustomOrderComposer() {
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const remainingChars = MAX_DESCRIPTION_LENGTH - description.length;
  const whatsappReady = configuredPhone.length > 0;

  const whatsappMessage = useMemo(() => {
    if (!description.trim() || !name.trim() || !address.trim()) {
      return "";
    }

    return [
      `Olá! Gostaria de fazer um pedido personalizado na ${LOJA_INFO.nome}.`,
      "",
      "Descrição do pedido:",
      description.trim(),
      "",
      `Nome: ${name.trim()}`,
      `Endereço: ${address.trim()}`,
      "",
      "Aviso: entendo que esse tipo de pedido só pode ser aceito com antecedência.",
      "",
      "Podem confirmar disponibilidade e prazo, por favor?",
    ].join("\n");
  }, [address, description, name]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Descreva o pedido para continuar.");
      return;
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setError(
        `A descrição deve ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`,
      );
      return;
    }

    if (!name.trim()) {
      setError("Informe seu nome para continuar.");
      return;
    }

    if (!address.trim()) {
      setError("Informe seu endereço para continuar.");
      return;
    }

    if (!whatsappReady) {
      setError("WhatsApp da loja não configurado no momento.");
      return;
    }

    const whatsappUrl = buildWhatsAppUrl(configuredPhone, whatsappMessage);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mt-8 rounded-[1.7rem] border border-caramel/18 bg-white/76 p-5 sm:p-6">
      <p className="section-kicker text-cocoa/82">Pedido personalizado</p>
      <h3 className="mt-2 text-3xl leading-tight text-espresso sm:text-4xl">
        Monte seu pedido com antecedência
      </h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-espresso/76">
        Se quiser algo fora do cardápio, descreva seu pedido e envie direto no
        WhatsApp da loja.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="custom-order-description"
            className="text-xs font-extrabold uppercase tracking-[0.08em] text-cocoa/82"
          >
            Descrição do pedido (máximo 250 caracteres)
          </label>
          <textarea
            id="custom-order-description"
            maxLength={MAX_DESCRIPTION_LENGTH}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Quero uma bandeja personalizada com combinação de doces e salgados..."
            className="min-h-28 w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2 text-sm text-espresso outline-none transition focus:border-caramel/50"
          />
          <p className="text-xs text-espresso/64">
            {description.length}/{MAX_DESCRIPTION_LENGTH} caracteres
            {remainingChars >= 0 ? ` (${remainingChars} restantes)` : ""}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="custom-order-name"
              className="text-xs font-extrabold uppercase tracking-[0.08em] text-cocoa/82"
            >
              Nome
            </label>
            <input
              id="custom-order-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
              className="min-h-11 w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2 text-sm text-espresso outline-none transition focus:border-caramel/50"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="custom-order-address"
              className="text-xs font-extrabold uppercase tracking-[0.08em] text-cocoa/82"
            >
              Endereço
            </label>
            <input
              id="custom-order-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Rua, número e referência"
              className="min-h-11 w-full rounded-xl border border-caramel/25 bg-sugar px-3 py-2 text-sm text-espresso outline-none transition focus:border-caramel/50"
            />
          </div>
        </div>

        <div className="rounded-[1.2rem] border border-danger/20 bg-danger/8 px-4 py-3">
          <p className="text-sm font-semibold text-danger">
            Aviso: pedidos personalizados só podem ser aceitos com antecedência.
          </p>
        </div>

        {error ? (
          <p className="text-sm font-semibold text-danger">{error}</p>
        ) : null}

        <button
          type="submit"
          className="button-primary px-6"
          disabled={!whatsappReady}
        >
          Enviar pedido personalizado
        </button>

        {!whatsappReady ? (
          <p className="text-xs text-danger">
            WhatsApp indisponível no momento. Tente novamente mais tarde.
          </p>
        ) : null}
      </form>
    </section>
  );
}
