"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

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
    const normalizedSearch = deferredSearchTerm.trim().toLocaleLowerCase("pt-BR");

    return products.filter((product) => {
      const matchesCategory =
        resolvedCategoryFilter === "todos" ||
        product.categoria === resolvedCategoryFilter;
      const matchesSubCategory =
        subCategoryFilter === ALL_SUBCATEGORIES ||
        product.subcategoria === subCategoryFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${product.nome} ${product.descricaoCurta} ${product.subcategoria}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);
      return matchesCategory && matchesSubCategory && matchesSearch;
    });
  }, [products, resolvedCategoryFilter, subCategoryFilter, deferredSearchTerm]);

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
    startTransition(() => {
      setCategoryFilter(nextCategory);
      setSubCategoryFilter(ALL_SUBCATEGORIES);
    });
  }

  const highlightedCount = useMemo(
    () => filteredProducts.filter((product) => product.destaque).length,
    [filteredProducts],
  );

  return (
    <div className="space-y-10">
      <section className="panel-soft overflow-hidden p-5 sm:p-6 lg:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] xl:items-end">
          <div>
            <p className="section-kicker text-cocoa/82">Explorar produtos</p>
            <h2 className="mt-3 text-3xl leading-tight text-espresso sm:text-4xl lg:text-[3.15rem]">
              Filtros compactos, leitura direta e navegação rápida entre as opções.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-espresso/76 sm:text-base">
              Use a busca para chegar no produto com mais velocidade ou refine
              por categoria e coleção sem perder o contexto do cardápio.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="info-chip border-[rgba(124,20,46,0.12)] bg-white/74 text-cocoa/82">
                {filteredProducts.length} resultados
              </span>
              <span className="info-chip border-[rgba(124,20,46,0.12)] bg-white/74 text-cocoa/82">
                {highlightedCount} destaques
              </span>
              <span className="info-chip border-[rgba(124,20,46,0.12)] bg-white/74 text-cocoa/82">
                {availableSubCategories.length - 1} coleções
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="panel-inset p-4 sm:p-5">
              <label
                htmlFor="menu-search"
                className="section-kicker text-cocoa/74"
              >
                Buscar no cardápio
              </label>
              <input
                id="menu-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ex.: bolo, combo, suco..."
                className="input-surface mt-3 text-sm font-semibold"
              />
            </div>

            <div className="panel-inset p-4 sm:p-5">
              <p className="section-kicker text-cocoa/74">Categoria</p>
              <div
                className="mt-3 flex flex-wrap gap-2.5"
                role="tablist"
                aria-label="Filtrar por categoria"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={resolvedCategoryFilter === "todos"}
                  onClick={() => applyCategoryFilter("todos")}
                  className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-extrabold transition sm:px-5 ${
                    resolvedCategoryFilter === "todos"
                      ? "bg-espresso text-sugar shadow-[0_14px_28px_rgba(63,11,28,0.18)]"
                      : "border border-[rgba(124,20,46,0.14)] bg-white/88 text-espresso hover:bg-oat/90"
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
                      className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-extrabold transition sm:px-5 ${
                        active
                          ? "bg-espresso text-sugar shadow-[0_14px_28px_rgba(63,11,28,0.18)]"
                          : "border border-[rgba(124,20,46,0.14)] bg-white/88 text-espresso hover:bg-oat/90"
                      }`}
                    >
                      {category.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="panel-inset p-4 sm:p-5">
              <p className="section-kicker text-cocoa/74">Coleção</p>
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
                      onClick={() =>
                        startTransition(() => setSubCategoryFilter(subCategory))
                      }
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
        <section className="panel p-8 text-center sm:p-10">
          <p className="section-kicker text-cocoa/72">Sem resultados</p>
          <h3 className="mt-3 text-3xl text-espresso sm:text-4xl">
            Nenhum item encontrado com os filtros atuais.
          </h3>
          <p className="mt-3 text-base leading-8 text-espresso/80">
            Ajuste a categoria, limpe a busca ou escolha outra coleção para ver
            opções disponíveis.
          </p>
        </section>
      ) : (
        <>
          {orderedGroupEntries.map(([subCategory, items]) => (
            <section key={subCategory} className="space-y-5">
              <div className="flex flex-col gap-3 border-b border-[rgba(124,20,46,0.12)] pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker text-cocoa/82">Coleção</p>
                  <h3 className="mt-2 text-3xl text-espresso sm:text-4xl">
                    {subCategory}
                  </h3>
                </div>
                <p className="info-chip border-[rgba(124,20,46,0.14)] bg-white/72 text-cocoa/84">
                  {items.length}{" "}
                  {items.length === 1 ? "item disponível" : "itens disponíveis"}
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
