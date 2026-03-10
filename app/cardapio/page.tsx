import type { Metadata } from "next";
import Link from "next/link";
import MenuExplorer from "@/src/components/MenuExplorer";
import { LOJA_INFO } from "@/src/data/loja";
import { getStoreSettings, listProducts } from "@/src/lib/repositories";
import { getConfiguredStoreValue } from "@/src/lib/store-info";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cardapio",
  description:
    "Catalogo completo com combos, porcoes e pedidos diretos pelo WhatsApp.",
};

export default async function CardapioPage() {
  const products = await listProducts({ onlyAvailable: true });
  const storeSettings = await getStoreSettings();
  const totalProdutos = products.length;
  const destaques = products.filter((product) => product.destaque).length;
  const subcategorias = new Set(products.map((product) => product.subcategoria))
    .size;
  const horario = `${storeSettings.openingTime} as ${storeSettings.closingTime}`;
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);

  return (
    <main
      id="conteudo"
      className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-6 lg:pb-24"
    >
      <section className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
        <aside className="panel-dark h-fit px-5 py-6 text-sugar lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto">
          <p className="section-kicker text-biscuit/84">Cardapio oficial</p>
          <h1 className="mt-3 text-4xl leading-tight text-sugar">
            Monte seu pedido
          </h1>
          <p className="mt-4 text-sm leading-8 text-sugar/74">
            Catalogo direto da loja, atualizado pelo painel administrativo e
            pronto para pedido rapido.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4">
              <p className="section-kicker text-biscuit/78">Itens totais</p>
              <p className="mt-2 text-3xl font-extrabold text-sugar">
                {totalProdutos}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4">
              <p className="section-kicker text-biscuit/78">Destaques</p>
              <p className="mt-2 text-3xl font-extrabold text-sugar">
                {destaques}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4">
              <p className="section-kicker text-biscuit/78">Subcategorias</p>
              <p className="mt-2 text-3xl font-extrabold text-sugar">
                {subcategorias}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="section-kicker text-biscuit/82">Atendimento</p>
            <p className="mt-3 text-sm leading-7 text-sugar/74">
              {storeSettings.serviceDays}
            </p>
            <p className="text-sm leading-7 text-sugar/74">{horario}</p>
            <p className="text-sm leading-7 text-sugar/74">
              {telefone ?? "Telefone ainda nao configurado."}
            </p>
            <p className="mt-2 text-sm leading-7 text-sugar/74">
              {LOJA_INFO.observacaoKit}
            </p>
            {storeSettings.effectiveIsClosed ? (
              <p className="mt-2 text-sm font-bold text-biscuit">
                Estabelecimento fechado temporariamente.
                {storeSettings.closureReason
                  ? ` Motivo: ${storeSettings.closureReason}`
                  : ""}
              </p>
            ) : null}
          </div>

          <Link
            href="/"
            className="button-secondary mt-6 w-full border-white/10 bg-white/10 text-sugar hover:bg-white/16 hover:text-sugar"
          >
            Voltar para inicio
          </Link>
        </aside>

        <div className="space-y-6">
          <header className="panel p-6 sm:p-8">
            <p className="section-kicker text-cocoa/82">Catalogo conectado</p>
            <h2 className="mt-3 max-w-4xl text-4xl leading-tight text-espresso sm:text-5xl">
              Cardapio organizado para leitura, filtro e decisao rapida.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-8 text-espresso/76">
              Tudo o que aparece aqui vem do mesmo cadastro usado no painel
              interno da empresa. O site exibe apenas o que esta ativo para
              venda.
            </p>
          </header>
          <MenuExplorer products={products} />
        </div>
      </section>
    </main>
  );
}
