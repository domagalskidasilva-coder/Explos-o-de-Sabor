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
    const filteredByCategory =
      resolvedCategoryFilter === "todos"
        ? products
        : products.filter(
            (product) => product.categoria === resolvedCategoryFilter,
          );

    return [
      ALL_SUBCATEGORIES,
      ...Array.from(
        new Set(filteredByCategory.map((product) => product.subcategoria)),
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
  }, [deferredSearchTerm, products, resolvedCategoryFilter, subCategoryFilter]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce<Record<string, Product[]>>((groups, product) => {
      const current = groups[product.subcategoria] ?? [];
      groups[product.subcategoria] = [...current, product];
      return groups;
    }, {});
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

  return (
    <div className="min-w-0 space-y-4 overflow-x-clip sm:space-y-5">
      <section className="panel-soft p-3 sm:sticky sm:top-4 sm:z-20 sm:p-4">
        <div className="grid gap-3">
          <div>
            <label htmlFor="menu-search" className="field-label text-[0.72rem]">
              Buscar
            </label>
            <input
              id="menu-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ex.: combo, bolo, coca"
              className="input-surface mt-2 h-12 text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="field-label text-[0.72rem]">Categorias</p>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-cocoa/54">
                {filteredProducts.length} itens
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyCategoryFilter("todos")}
                className={`min-w-0 rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.06em] transition sm:text-[0.78rem] ${
                  resolvedCategoryFilter === "todos"
                    ? "bg-espresso text-sugar shadow-[0_12px_24px_rgba(73,7,29,0.18)]"
                    : "border border-caramel/14 bg-white text-espresso"
                }`}
              >
                Todos ({categoryCounts.todos})
              </button>
              {visibleCategories.map((category) => {
                const active = resolvedCategoryFilter === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => applyCategoryFilter(category.id)}
                    className={`min-w-0 rounded-full px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.06em] transition sm:text-[0.78rem] ${
                      active
                        ? "bg-espresso text-sugar shadow-[0_12px_24px_rgba(73,7,29,0.18)]"
                        : "border border-caramel/14 bg-white text-espresso"
                    }`}
                  >
                    {category.label} ({categoryCounts[category.id]})
                  </button>
                );
              })}
            </div>
          </div>

          {availableSubCategories.length > 1 ? (
            <div className="space-y-2">
              <p className="field-label text-[0.72rem]">Coleções</p>
              <div className="flex flex-wrap gap-2">
                {availableSubCategories.map((subCategory) => {
                  const active = subCategoryFilter === subCategory;

                  return (
                    <button
                      key={subCategory}
                      type="button"
                      onClick={() =>
                        startTransition(() => setSubCategoryFilter(subCategory))
                      }
                      className={`min-w-0 rounded-full px-3 py-2 text-[0.64rem] font-extrabold uppercase tracking-[0.06em] transition sm:text-[0.68rem] ${
                        active
                          ? "bg-cocoa text-sugar"
                          : "border border-caramel/12 bg-white text-espresso/80"
                      }`}
                    >
                      {subCategory}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1.1rem] border border-caramel/10 bg-white/72 px-3.5 py-2.5">
            <p className="min-w-0 text-sm font-semibold text-espresso/74">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "produto encontrado"
                : "produtos encontrados"}
            </p>
            <button
              type="button"
              onClick={() => {
                startTransition(() => {
                  setSearchTerm("");
                  setCategoryFilter("todos");
                  setSubCategoryFilter(ALL_SUBCATEGORIES);
                });
              }}
              className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-cocoa/58"
            >
              Limpar
            </button>
          </div>
        </div>
      </section>

      {orderedGroupEntries.length === 0 ? (
        <section className="panel p-6 text-center">
          <h3 className="text-2xl text-espresso">Nenhum item encontrado.</h3>
          <p className="mt-3 text-sm leading-7 text-espresso/74">
            Tente outra busca ou troque a categoria.
          </p>
        </section>
      ) : (
        orderedGroupEntries.map(([subCategory, items]) => (
          <section key={subCategory} className="space-y-3">
            <div className="flex items-center justify-between gap-3 px-1">
              <div>
                <p className="section-kicker text-cocoa/68">Coleção</p>
                <h2 className="mt-1 text-[1.45rem] leading-tight text-espresso sm:text-[1.7rem]">
                  {subCategory}
                </h2>
              </div>
              <span className="info-chip bg-white/74 text-cocoa/82">
                {items.length} itens
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
