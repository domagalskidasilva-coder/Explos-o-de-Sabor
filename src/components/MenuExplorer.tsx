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

  const queryCategory = new URLSearchParams(window.location.search).get("categoria");
  return queryCategory === "doce" || queryCategory === "salgado" ? queryCategory : "todos";
}

export default function MenuExplorer({ products }: { products: Product[] }) {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(getInitialCategoryFilter);
  const [subCategoryFilter, setSubCategoryFilter] = useState(ALL_SUBCATEGORIES);

  const categoryCounts = useMemo(() => {
    return {
      todos: products.length,
      doce: products.filter((product) => product.categoria === "doce").length,
      salgado: products.filter((product) => product.categoria === "salgado").length,
    };
  }, [products]);

  const availableSubCategories = useMemo(() => {
    const filteredProducts =
      categoryFilter === "todos"
        ? products
        : products.filter((product) => product.categoria === categoryFilter);

    return [
      ALL_SUBCATEGORIES,
      ...Array.from(new Set(filteredProducts.map((product) => product.subcategoria))).sort((left, right) =>
        left.localeCompare(right, "pt-BR"),
      ),
    ];
  }, [categoryFilter, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = categoryFilter === "todos" || product.categoria === categoryFilter;
      const matchesSubCategory =
        subCategoryFilter === ALL_SUBCATEGORIES || product.subcategoria === subCategoryFilter;
      return matchesCategory && matchesSubCategory;
    });
  }, [categoryFilter, products, subCategoryFilter]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce<Record<string, Product[]>>((groups, product) => {
      const currentGroup = groups[product.subcategoria] ?? [];
      groups[product.subcategoria] = [...currentGroup, product];
      return groups;
    }, {});
  }, [filteredProducts]);

  const orderedGroupEntries = useMemo(() => {
    return Object.entries(groupedProducts).sort(([left], [right]) => left.localeCompare(right, "pt-BR"));
  }, [groupedProducts]);

  function applyCategoryFilter(nextCategory: CategoryFilter) {
    setCategoryFilter(nextCategory);
    setSubCategoryFilter(ALL_SUBCATEGORIES);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-caramel/20 bg-sugar/90 p-5 shadow-[var(--surface-shadow)] sm:p-6">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">Filtros</p>
            <h2 className="mt-2 text-3xl text-espresso">Encontre o que deseja com poucos toques.</h2>
          </div>
          <div className="flex flex-wrap gap-3" role="tablist" aria-label="Filtrar por categoria">
            <button
              type="button"
              role="tab"
              aria-selected={categoryFilter === "todos"}
              onClick={() => applyCategoryFilter("todos")}
              className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-bold transition ${
                categoryFilter === "todos"
                  ? "bg-espresso text-sugar"
                  : "border border-caramel/25 bg-cream text-espresso hover:border-caramel hover:bg-oat"
              }`}
            >
              Todos ({categoryCounts.todos})
            </button>
            {CATEGORIAS.map((category) => {
              const active = categoryFilter === category.id;
              const count = category.id === "doce" ? categoryCounts.doce : categoryCounts.salgado;

              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => applyCategoryFilter(category.id)}
                  className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-bold transition ${
                    active
                      ? "bg-espresso text-sugar"
                      : "border border-caramel/25 bg-cream text-espresso hover:border-caramel hover:bg-oat"
                  }`}
                >
                  {category.label} ({count})
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filtrar por subcategoria">
            {availableSubCategories.map((subCategory) => {
              const active = subCategoryFilter === subCategory;
              return (
                <button
                  key={subCategory}
                  type="button"
                  onClick={() => setSubCategoryFilter(subCategory)}
                  aria-pressed={active}
                  className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold transition ${
                    active
                      ? "bg-caramel text-sugar"
                      : "border border-caramel/20 bg-sugar text-espresso hover:border-caramel hover:bg-cream"
                  }`}
                >
                  {subCategory}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {orderedGroupEntries.length === 0 ? (
        <section className="rounded-[2rem] border border-caramel/20 bg-sugar/90 p-8 text-center shadow-[var(--surface-shadow)]">
          <h3 className="text-3xl text-espresso">Nenhum item encontrado.</h3>
          <p className="mt-3 text-base leading-8 text-espresso/80">
            Tente trocar os filtros para visualizar outras opcoes do cardapio.
          </p>
        </section>
      ) : (
        orderedGroupEntries.map(([subCategory, items]) => (
          <section key={subCategory} className="space-y-5">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">Subcategoria</p>
              <h3 className="text-3xl text-espresso">{subCategory}</h3>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
