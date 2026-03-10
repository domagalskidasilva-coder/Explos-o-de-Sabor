import type { Metadata } from "next";
import Link from "next/link";
import MenuExplorer from "@/src/components/MenuExplorer";
import { LOJA_INFO } from "@/src/data/loja";
import { listProducts } from "@/src/lib/repositories";
import { getConfiguredStoreValue } from "@/src/lib/store-info";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cardápio",
  description:
    "Catálogo completo com combos, porções e pedidos diretos pelo WhatsApp.",
};

export default async function CardapioPage() {
  const products = await listProducts({ onlyAvailable: true });
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
  const totalProducts = products.length;
  const totalFeatured = products.filter((product) => product.destaque).length;

  return (
    <main
      id="conteudo"
      className="mx-auto max-w-7xl px-3 pb-16 pt-3 sm:px-4 lg:px-6 lg:pb-24"
    >
      <section className="space-y-4">
        <header className="panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className="section-kicker text-cocoa/72">Cardápio</p>
              <h1 className="mt-2 text-[2rem] leading-[1.05] text-espresso sm:text-[2.5rem] lg:text-[3.25rem]">
                Escolha rápido.
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-espresso/72 sm:text-base">
                Busca, categorias e pedido direto sem excesso de informação.
              </p>
            </div>
            <Link
              href="/"
              className="button-ghost h-11 w-full justify-center px-5 sm:w-auto"
            >
              Voltar
            </Link>
          </div>

          <div className="mt-4 grid gap-2.5 sm:flex sm:flex-wrap">
            <span className="info-chip bg-white/78 text-cocoa/84">
              {totalProducts} itens
            </span>
            <span className="info-chip bg-white/78 text-cocoa/84">
              {totalFeatured} destaques
            </span>
            {telefone ? (
              <span className="info-chip max-w-full bg-white/78 text-cocoa/84 sm:max-w-none">
                WhatsApp {telefone}
              </span>
            ) : null}
          </div>
        </header>

        <MenuExplorer products={products} />
      </section>
    </main>
  );
}
