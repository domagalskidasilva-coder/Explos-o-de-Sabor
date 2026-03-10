import Image from "next/image";
import Link from "next/link";
import CustomOrderComposer from "@/src/components/CustomOrderComposer";
import ProductCard from "@/src/components/ProductCard";
import { LOJA_INFO } from "@/src/data/loja";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import { getStoreSettings, listProducts } from "@/src/lib/repositories";

export const dynamic = "force-dynamic";

const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
const endereco = getConfiguredStoreValue(LOJA_INFO.endereco);

const categoryShortcuts = [
  { label: "Doces", href: "/cardapio?categoria=doce" },
  { label: "Salgados", href: "/cardapio?categoria=salgado" },
  { label: "Bebidas", href: "/cardapio?categoria=bebida" },
];

export default async function HomePage() {
  const products = await listProducts({ onlyAvailable: true });
  const storeSettings = await getStoreSettings();
  const destaques = products.filter((product) => product.destaque).slice(0, 6);
  const produtosHome = (destaques.length > 0 ? destaques : products).slice(
    0,
    6,
  );
  const lojaAbertaTexto = storeSettings.effectiveIsClosed
    ? "Fechado agora"
    : "Aberto agora";

  return (
    <main
      id="conteudo"
      className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-16 pt-4 sm:gap-8 lg:px-6 lg:pb-24"
    >
      <section className="panel overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_22rem] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`status-pill ${
                  storeSettings.effectiveIsClosed
                    ? "status-pill--warn"
                    : "status-pill--success"
                }`}
              >
                {lojaAbertaTexto}
              </span>
              <span className="badge-flour">Delivery local</span>
            </div>

            <h1 className="mt-4 max-w-[12ch] text-[2.4rem] leading-[0.92] text-espresso sm:text-[3.6rem] lg:text-[4.5rem]">
              Peça rápido o que está saindo mais.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-espresso/72 sm:text-lg">
              {LOJA_INFO.assinatura}. Escolha a categoria, monte o pedido e
              confirme no WhatsApp.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/cardapio" className="button-primary px-6">
                Ver cardápio
              </Link>
              {telefone ? (
                <a href={`tel:${telefone}`} className="button-secondary px-6">
                  Ligar agora
                </a>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {categoryShortcuts.map((shortcut) => (
                <Link key={shortcut.href} href={shortcut.href} className="pill-link">
                  {shortcut.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="panel-inset px-4 py-4">
                <p className="section-kicker text-cocoa/72">Itens ativos</p>
                <p className="mt-2 text-2xl font-extrabold text-espresso">
                  {products.length}
                </p>
              </div>
              <div className="panel-inset px-4 py-4">
                <p className="section-kicker text-cocoa/72">Destaques</p>
                <p className="mt-2 text-2xl font-extrabold text-espresso">
                  {destaques.length}
                </p>
              </div>
              <div className="panel-inset px-4 py-4">
                <p className="section-kicker text-cocoa/72">Atendimento</p>
                <p className="mt-2 text-sm font-extrabold text-espresso">
                  {storeSettings.serviceDays}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="panel-soft hidden overflow-hidden p-4 lg:block">
              <div className="relative mx-auto max-w-[13rem]">
                <div className="absolute inset-x-5 top-6 h-[72%] rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.68),rgba(217,174,73,0.2),transparent_72%)] blur-2xl" />
                <Image
                  src="/images/mascote-explosao.png"
                  alt="Mascote da Explosão de Sabor"
                  width={760}
                  height={760}
                  sizes="22rem"
                  className="relative z-10 h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="panel-inset p-4">
                <p className="section-kicker text-cocoa/72">Contato</p>
                <p className="mt-2 text-sm leading-7 text-espresso/74">
                  {telefone ?? "Telefone ainda não configurado."}
                </p>
              </div>
              <div className="panel-inset p-4">
                <p className="section-kicker text-cocoa/72">Entrega</p>
                <p className="mt-2 text-sm leading-7 text-espresso/74">
                  {LOJA_INFO.retirada}
                </p>
                <p className="mt-2 text-sm leading-7 text-espresso/74">
                  {endereco ?? "Endereço ainda não configurado."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="panel overflow-hidden px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 border-b border-caramel/14 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker text-cocoa/82">Mais pedidos</p>
            <h2 className="mt-2 text-3xl leading-tight text-espresso sm:text-4xl">
              Escolha um destaque e siga rápido para o pedido.
            </h2>
          </div>
          <Link href="/cardapio" className="button-secondary px-5">
            Abrir tudo
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {produtosHome.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <CustomOrderComposer />
    </main>
  );
}
