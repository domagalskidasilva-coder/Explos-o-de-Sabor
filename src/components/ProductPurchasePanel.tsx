"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/src/contexts/CartContext";
import { formatCurrency } from "@/src/lib/format";
import type { Product } from "@/src/types/product";

export default function ProductPurchasePanel({
  product,
  beverageOptions,
}: {
  product: Product;
  beverageOptions: Product[];
}) {
  const router = useRouter();
  const { add, openCart } = useCart();
  const variations = product.variacoes ?? [];
  const hasFlavorOptions = variations.length > 0;
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(
    variations[0]?.id ?? null,
  );
  const [selectedBeverageId, setSelectedBeverageId] = useState<string | null>(
    null,
  );

  const selectedVariation =
    variations.length === 0
      ? null
      : (variations.find((variation) => variation.id === selectedVariationId) ??
        variations[0]);
  const selectedBeverage =
    beverageOptions.find((beverage) => beverage.id === selectedBeverageId) ??
    null;

  const resolvedPrice = selectedVariation?.preco ?? product.preco;
  const totalPrice = resolvedPrice + (selectedBeverage?.preco ?? 0);

  function handleAdd() {
    add(product.id, selectedVariation?.id ?? null, 1);
    if (selectedBeverage) {
      add(selectedBeverage.id, null, 1);
    }
    openCart();
  }

  return (
    <section className="panel overflow-hidden p-6 sm:p-8">
      <p className="section-kicker text-cocoa/82">Escolha do pedido</p>
      <h2 className="mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
        {hasFlavorOptions
          ? "Escolha o sabor ou opção antes de adicionar."
          : "Escolha adicionais antes de adicionar."}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-8 text-espresso/76">
        {hasFlavorOptions
          ? "Cada opção pode mudar o sabor e o preço final do produto."
          : "Para esse item, você pode incluir uma bebida como adicional junto do pedido."}
      </p>

      {hasFlavorOptions ? (
        <div className="mt-6 grid gap-3">
          {variations.map((variation) => {
            const active = variation.id === selectedVariation?.id;

            return (
              <button
                key={variation.id}
                type="button"
                onClick={() => setSelectedVariationId(variation.id)}
                className={`flex items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition sm:px-5 ${
                  active
                    ? "border-caramel/30 bg-white shadow-[0_16px_30px_rgba(73,12,31,0.08)]"
                    : "border-caramel/14 bg-white/72 hover:bg-white/90"
                }`}
              >
                <span>
                  <span className="section-kicker text-cocoa/70">Sabor</span>
                  <span className="mt-2 block text-xl text-espresso">
                    {variation.nome}
                  </span>
                </span>
                <span className="text-lg font-extrabold text-espresso">
                  {formatCurrency(variation.preco)}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => setSelectedBeverageId(null)}
            className={`flex items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition sm:px-5 ${
              selectedBeverageId === null
                ? "border-caramel/30 bg-white shadow-[0_16px_30px_rgba(73,12,31,0.08)]"
                : "border-caramel/14 bg-white/72 hover:bg-white/90"
            }`}
          >
            <span>
              <span className="section-kicker text-cocoa/70">Adicional</span>
              <span className="mt-2 block text-xl text-espresso">
                Sem bebida
              </span>
            </span>
            <span className="text-lg font-extrabold text-espresso">
              {formatCurrency(0)}
            </span>
          </button>

          {beverageOptions.map((beverage) => {
            const active = beverage.id === selectedBeverageId;

            return (
              <button
                key={beverage.id}
                type="button"
                onClick={() => setSelectedBeverageId(beverage.id)}
                className={`flex items-center justify-between rounded-[1.4rem] border px-4 py-4 text-left transition sm:px-5 ${
                  active
                    ? "border-caramel/30 bg-white shadow-[0_16px_30px_rgba(73,12,31,0.08)]"
                    : "border-caramel/14 bg-white/72 hover:bg-white/90"
                }`}
              >
                <span>
                  <span className="section-kicker text-cocoa/70">Adicional</span>
                  <span className="mt-2 block text-xl text-espresso">
                    {beverage.nome}
                  </span>
                </span>
                <span className="text-lg font-extrabold text-espresso">
                  {formatCurrency(beverage.preco)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-[1.5rem] border border-caramel/14 bg-white/76 p-5">
        <p className="section-kicker text-cocoa/70">Valor selecionado</p>
        <p className="mt-3 text-4xl font-extrabold text-espresso">
          {formatCurrency(totalPrice)}
        </p>
        {selectedVariation ? (
          <p className="mt-3 text-sm leading-7 text-espresso/72">
            Opção escolhida: {selectedVariation.nome}
          </p>
        ) : null}
        {!hasFlavorOptions && selectedBeverage ? (
          <p className="mt-3 text-sm leading-7 text-espresso/72">
            Adicional escolhido: {selectedBeverage.nome}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.disponivel}
          className="button-primary justify-center px-6 disabled:cursor-not-allowed disabled:brightness-75"
        >
          {product.disponivel ? "Adicionar ao carrinho" : "Produto pausado"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="button-secondary justify-center px-6"
        >
          Voltar
        </button>
      </div>
    </section>
  );
}
