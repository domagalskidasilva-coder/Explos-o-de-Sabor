"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/src/components/ProductCard";
import { CATEGORIAS } from "@/src/data/produtos";
import type { Product, ProductCategory } from "@/src/types/product";

type CategoryFilter = ProductCategory | "todos";

const ALL_SUBCATEGORIES = "Todas";

function getInitialCategoryFilter(): CategoryFilter {
  if (typeof window === "undefined") {
    return "todos";
  }

  const queryCategory = new URLSearchParams(window.location.search).get(
    "categoria",
  );
  return queryCategory === "doce" ||
    queryCategory === "salgado" ||
    queryCategory === "bebida"
    ? queryCategory
    : "todos";
}

export default function MenuExplorer({ products }: { products: Product[] }) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    getInitialCategoryFilter,
  );
  const [subCategoryFilter, setSubCategoryFilter] = useState(ALL_SUBCATEGORIES);

  const categoryCounts = useMemo(() => {
    return products.reduce(
      (counts, product) => {
        counts.todos += 1;
        counts[product.categoria] += 1;
        return counts;
      },
      {
        todos: 0,
        doce: 0,
        salgado: 0,
        bebida: 0,
      },
    );
  }, [products]);

  const resolvedCategoryFilter: CategoryFilter =
    categoryFilter !== "todos" && categoryCounts[categoryFilter] === 0
      ? "todos"
      : categoryFilter;

  const availableSubCategories = useMemo(() => {
    const filteredProducts =
      resolvedCategoryFilter === "todos"
        ? products
        : products.filter(
            (product) => product.categoria === resolvedCategoryFilter,
          );

    return [
      ALL_SUBCATEGORIES,
      ...Array.from(
        new Set(filteredProducts.map((product) => product.subcategoria)),
      ).sort((left, right) => left.localeCompare(right, "pt-BR")),
    ];
  }, [products, resolvedCategoryFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        resolvedCategoryFilter === "todos" ||
        product.categoria === resolvedCategoryFilter;
      const matchesSubCategory =
        subCategoryFilter === ALL_SUBCATEGORIES ||
        product.subcategoria === subCategoryFilter;
      return matchesCategory && matchesSubCategory;
    });
  }, [products, resolvedCategoryFilter, subCategoryFilter]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce<Record<string, Product[]>>(
      (groups, product) => {
        const currentGroup = groups[product.subcategoria] ?? [];
        groups[product.subcategoria] = [...currentGroup, product];
        return groups;
      },
      {},
    );
  }, [filteredProducts]);

  const orderedGroupEntries = useMemo(() => {
    return Object.entries(groupedProducts).sort(([left], [right]) =>
      left.localeCompare(right, "pt-BR"),
    );
  }, [groupedProducts]);

  const visibleCategories = useMemo(() => {
    return CATEGORIAS.filter((category) => categoryCounts[category.id] > 0);
  }, [categoryCounts]);

  function applyCategoryFilter(nextCategory: CategoryFilter) {
    setCategoryFilter(nextCategory);
    setSubCategoryFilter(ALL_SUBCATEGORIES);
  }

  return (
    <div className="space-y-10">
      <section className="panel overflow-hidden p-6 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <p className="section-kicker text-cocoa/82">Filtros do cardapio</p>
            <h2 className="mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
              Escolha a linha do pedido com poucos cliques.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-espresso/76">
              Tudo aqui responde ao cadastro real da empresa. Produtos
              indisponiveis ou pausados deixam de aparecer automaticamente.
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <p className="section-kicker text-cocoa/74">Categoria</p>
              <div
                className="mt-3 flex flex-wrap gap-3"
                role="tablist"
                aria-label="Filtrar por categoria"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={resolvedCategoryFilter === "todos"}
                  onClick={() => applyCategoryFilter("todos")}
                  className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-extrabold transition ${
                    resolvedCategoryFilter === "todos"
                      ? "bg-espresso text-sugar shadow-[0_14px_28px_rgba(63,11,28,0.18)]"
                      : "border border-[rgba(124,20,46,0.14)] bg-white/82 text-espresso hover:bg-oat/90"
                  }`}
                >
                  Todos ({categoryCounts.todos})
                </button>
                {visibleCategories.map((category) => {
                  const active = resolvedCategoryFilter === category.id;
                  const count = categoryCounts[category.id];

                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => applyCategoryFilter(category.id)}
                      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-extrabold transition ${
                        active
                          ? "bg-espresso text-sugar shadow-[0_14px_28px_rgba(63,11,28,0.18)]"
                          : "border border-[rgba(124,20,46,0.14)] bg-white/82 text-espresso hover:bg-oat/90"
                      }`}
                    >
                      {category.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="section-kicker text-cocoa/74">Colecao</p>
              <div
                className="mt-3 flex flex-wrap gap-2"
                aria-label="Filtrar por subcategoria"
              >
                {availableSubCategories.map((subCategory) => {
                  const active = subCategoryFilter === subCategory;
                  return (
                    <button
                      key={subCategory}
                      type="button"
                      onClick={() => setSubCategoryFilter(subCategory)}
                      aria-pressed={active}
                      className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 text-xs font-extrabold uppercase tracking-[0.1em] transition ${
                        active
                          ? "bg-espresso text-sugar shadow-[0_14px_28px_rgba(63,11,28,0.18)]"
                          : "border border-[rgba(124,20,46,0.12)] bg-sugar/88 text-espresso hover:bg-oat"
                      }`}
                    >
                      {subCategory}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {orderedGroupEntries.length === 0 ? (
        <section className="panel p-8 text-center">
          <h3 className="text-3xl text-espresso">Nenhum item encontrado.</h3>
          <p className="mt-3 text-base leading-8 text-espresso/80">
            Tente trocar os filtros para visualizar outras opcoes do cardapio.
          </p>
        </section>
      ) : (
        <>
          {orderedGroupEntries.map(([subCategory, items]) => (
            <section key={subCategory} className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-[rgba(124,20,46,0.12)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker text-cocoa/82">Subcategoria</p>
                  <h3 className="mt-2 text-4xl text-espresso">{subCategory}</h3>
                </div>
                <p className="info-chip border-[rgba(124,20,46,0.14)] bg-white/72 text-cocoa/84">
                  {items.length}{" "}
                  {items.length === 1 ? "item disponivel" : "itens disponiveis"}
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-[rgba(124,20,46,0.12)] bg-white/74 p-4">
              <p className="section-kicker text-cocoa/72">Atualizacao</p>
              <p className="mt-2 text-sm leading-7 text-espresso/74">
                Sincronizado com o painel administrativo.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[rgba(124,20,46,0.12)] bg-white/74 p-4">
              <p className="section-kicker text-cocoa/72">Fluxo</p>
              <p className="mt-2 text-sm leading-7 text-espresso/74">
                Adicione ao carrinho e confirme tudo no WhatsApp.
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
