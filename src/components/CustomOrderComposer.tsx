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
    <section className="mt-8 overflow-hidden rounded-[1.9rem] border border-caramel/18 bg-[linear-gradient(180deg,rgba(255,252,249,0.95),rgba(247,239,229,0.92))] shadow-[0_24px_60px_rgba(92,35,17,0.08)]">
      <div className="border-b border-caramel/12 bg-[linear-gradient(135deg,rgba(70,9,27,0.94),rgba(107,14,38,0.92),rgba(167,123,43,0.86))] px-5 py-5 text-sugar sm:px-6">
        <p className="section-kicker text-biscuit/84">Pedido personalizado</p>
        <h3 className="mt-2 text-3xl leading-tight text-sugar sm:text-4xl">
          Monte um pedido sob medida com antecedência
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-sugar/76">
          Se quiser algo fora do cardápio, descreva a ideia e envie a solicitação
          pronta no WhatsApp da loja.
        </p>
      </div>

      <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="soft-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="custom-order-description"
                className="field-label"
              >
                Descrição do pedido
              </label>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-cocoa/62">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              id="custom-order-description"
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Quero uma bandeja personalizada com combinação de doces e salgados, tema da festa e horário de entrega."
              className="textarea-surface mt-3 min-h-36"
            />
            <p className="mt-2 text-sm leading-7 text-espresso/68">
              Seja específico sobre quantidade, tema, data e preferências. Isso
              ajuda a loja a responder mais rápido.
            </p>
            <p className="mt-2 text-xs text-espresso/62">
              {remainingChars >= 0
                ? `${remainingChars} caracteres restantes`
                : "Limite excedido"}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="soft-card p-5">
              <label htmlFor="custom-order-name" className="field-label">
                Nome
              </label>
              <input
                id="custom-order-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Seu nome"
                className="input-surface mt-3"
              />
            </div>

            <div className="soft-card p-5">
              <label htmlFor="custom-order-address" className="field-label">
                Endereço
              </label>
              <input
                id="custom-order-address"
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Rua, número e referência"
                className="input-surface mt-3"
              />
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-danger/20 bg-danger/8 px-4 py-3">
            <p className="text-sm font-semibold text-danger">
              Aviso: pedidos personalizados só podem ser aceitos com antecedência.
            </p>
          </div>

          {error ? (
            <p className="rounded-[1.1rem] border border-danger/20 bg-danger/8 px-4 py-3 text-sm font-semibold text-danger">
              {error}
            </p>
          ) : null}

          {!whatsappReady ? (
            <p className="rounded-[1.1rem] border border-danger/20 bg-danger/8 px-4 py-3 text-xs font-semibold text-danger">
              WhatsApp indisponível no momento. Tente novamente mais tarde.
            </p>
          ) : null}

          <button
            type="submit"
            className="button-primary px-6"
            disabled={!whatsappReady}
          >
            Enviar pedido personalizado
          </button>
        </form>

        <aside className="space-y-4">
          <section className="dark-card p-5 text-sugar">
            <p className="section-kicker text-biscuit/84">Como funciona</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-sugar/76">
              <li>Descreva o pedido com o máximo de contexto relevante.</li>
              <li>Informe nome e endereço para facilitar o retorno.</li>
              <li>A solicitação abre pronta no WhatsApp da loja.</li>
            </ul>
          </section>

          <section className="soft-card p-5">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-cocoa/76">
              Ideal para
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-espresso/74">
              <li>Bandejas e combos fora do cardápio</li>
              <li>Pedidos temáticos ou para eventos</li>
              <li>Solicitações com antecedência e ajuste fino</li>
            </ul>
          </section>
        </aside>
      </div>
    </section>
  );
}
