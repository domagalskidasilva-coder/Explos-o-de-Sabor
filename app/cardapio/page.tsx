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
      className="mx-auto max-w-7xl px-4 pb-16 pt-6 lg:px-6 lg:pb-24 lg:pt-8"
    >
      <section className="space-y-6">
        <header className="editorial-shell px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
          <div>
            <p className="section-kicker text-cocoa/78">Cardápio oficial</p>
            <h1 className="mt-3 max-w-5xl text-4xl leading-tight text-espresso sm:text-5xl lg:text-[3.6rem]">
              Explore o menu com leitura rápida e foco no que realmente está
              disponível.
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-8 text-espresso/74 sm:text-base">
              O cardápio foi reorganizado para facilitar a decisão em qualquer
              tela. Filtre por categoria, navegue por coleção e avance para o
              pedido sem ficar caçando informação.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="info-chip bg-white/78 text-cocoa/84">
                {totalProducts} {totalProducts === 1 ? "item ativo" : "itens ativos"}
              </span>
              <span className="info-chip bg-white/78 text-cocoa/84">
                {totalFeatured} em destaque
              </span>
              <span className="info-chip bg-white/78 text-cocoa/84">
                Contato: {telefone ?? "Telefone ainda não configurado."}
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            <MenuExplorer products={products} />
          </div>

          <aside className="space-y-4 xl:sticky xl:top-28 xl:h-fit">
            <div className="panel-soft px-5 py-5">
              <p className="section-kicker text-cocoa/76">Pedido direto</p>
              <h2 className="mt-3 text-3xl leading-tight text-espresso">
                Escolha a categoria e monte seu pedido com menos atrito.
              </h2>
              <p className="mt-3 text-sm leading-7 text-espresso/72">
                Os produtos exibidos aqui seguem o cadastro ativo da empresa e
                já refletem a disponibilidade atual.
              </p>
            </div>

            <div className="dark-card px-5 py-5 text-sugar">
              <p className="section-kicker text-biscuit/84">Contato</p>
              <p className="mt-3 text-sm leading-7 text-sugar/78">
                {telefone ?? "Telefone ainda não configurado."}
              </p>
              <p className="mt-2 text-sm leading-7 text-sugar/68">
                {LOJA_INFO.observacaoKit}
              </p>

            </div>

            <Link href="/" className="button-secondary w-full">
              Voltar para início
            </Link>
          </aside>
        </section>
      </section>
    </main>
  );
}
