import Image from "next/image";
import Link from "next/link";
import CustomOrderComposer from "@/src/components/CustomOrderComposer";
import ProductCard from "@/src/components/ProductCard";
import { LOJA_INFO } from "@/src/data/loja";
import { listProducts, getStoreSettings } from "@/src/lib/repositories";
import { getConfiguredStoreValue } from "@/src/lib/store-info";

export const dynamic = "force-dynamic";

const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
const endereco = getConfiguredStoreValue(LOJA_INFO.endereco);

export default async function HomePage() {
  const products = await listProducts({ onlyAvailable: true });
  const storeSettings = await getStoreSettings();
  const destaques = products.filter((product) => product.destaque).slice(0, 4);
  const produtosHome = (destaques.length > 0 ? destaques : products).slice(
    0,
    3,
  );
  const lojaAbertaTexto = storeSettings.effectiveIsClosed ? "Fechado agora" : "Aberto agora";
  const contatoTexto = telefone ?? "Telefone ainda nao configurado.";

  return (
    <main
      id="conteudo"
      className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-16 pt-6 lg:gap-10 lg:px-6 lg:pb-24"
    >
      <section className="relative overflow-hidden rounded-[2.75rem] border border-caramel/16 bg-[linear-gradient(135deg,rgba(255,251,252,0.98),rgba(246,235,223,0.94))] px-5 py-5 shadow-[var(--surface-shadow)] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,180,92,0.14),transparent_24%),radial-gradient(circle_at_left,rgba(194,28,67,0.08),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.2),transparent_40%)]"
        />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_25rem]">
          <article className="overflow-hidden rounded-[2.2rem] border border-caramel/12 bg-white/28 px-5 py-6 backdrop-blur-[2px] sm:px-7 sm:py-8 lg:px-8 lg:py-9">
            <div className="flex flex-wrap items-center gap-3">
              <p className="badge-flour">Cozinha autoral e delivery oficial</p>
              <span
                className={`status-pill ${
                  storeSettings.effectiveIsClosed
                    ? "status-pill--warn"
                    : "status-pill--success"
                }`}
              >
                {lojaAbertaTexto}
              </span>
            </div>

            <div className="mt-6 max-w-4xl space-y-5">
              <p className="section-kicker text-cocoa/76">Delivery da casa</p>
              <h1 className="hero-title-animate max-w-[10ch] text-[3.25rem] leading-[0.9] sm:text-[4.7rem] lg:text-[6.2rem]">
                {LOJA_INFO.nome}
              </h1>
              <p className="max-w-3xl text-xl leading-8 text-cocoa sm:text-[1.8rem] sm:leading-9">
                {LOJA_INFO.assinatura}
              </p>
              <p className="section-copy max-w-xl text-espresso/80">
                {LOJA_INFO.slogan} Escolha seu pedido e finalize direto no
                WhatsApp.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cardapio" className="button-primary min-w-[12rem] justify-center px-6">
                Pedir agora
              </Link>
              <Link href="/cardapio" className="button-secondary min-w-[12rem] justify-center px-6">
                Explorar menu
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="panel-inset px-4 py-4">
                <p className="section-kicker text-cocoa/72">Status</p>
                <p className="mt-2 text-lg font-extrabold text-espresso">
                  {lojaAbertaTexto}
                </p>
                <p className="mt-2 text-sm leading-7 text-espresso/68">
                  {storeSettings.effectiveIsClosed
                    ? storeSettings.closureReason || "Loja temporariamente fora de operacao."
                    : "Confirmacao direta no WhatsApp."}
                </p>
              </div>
              <div className="panel-inset px-4 py-4">
                <p className="section-kicker text-cocoa/72">Produtos ativos</p>
                <p className="mt-2 text-3xl font-extrabold text-espresso">
                  {products.length}
                </p>
                <p className="mt-2 text-sm leading-7 text-espresso/68">
                  Cardapio vivo e atualizado conforme a disponibilidade.
                </p>
              </div>
              <div className="panel-inset px-4 py-4">
                <p className="section-kicker text-cocoa/72">Operacao</p>
                <p className="mt-2 text-base font-extrabold text-espresso">
                  {storeSettings.serviceDays}
                </p>
                <p className="mt-2 text-sm leading-7 text-espresso/68">
                  {LOJA_INFO.retirada}
                </p>
              </div>
            </div>
          </article>

          <aside className="grid gap-4 lg:grid-rows-[minmax(0,1fr)_auto]">
            <div className="panel-soft overflow-hidden p-4 sm:p-5">
              <div className="rounded-[2rem] border border-caramel/14 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),rgba(255,255,255,0.14),transparent_74%)] p-4">
                <div className="relative mx-auto max-w-[16rem]">
                  <div className="absolute inset-x-4 top-5 h-[78%] rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.74),rgba(217,174,73,0.24),transparent_72%)] blur-2xl" />
                  <Image
                    src="/images/mascote-explosao.png"
                    alt="Mascote da Explosão de Sabor"
                    width={760}
                    height={760}
                    sizes="(min-width: 1024px) 24rem, 70vw"
                    className="relative z-10 h-auto w-full object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="panel-inset p-4">
                  <p className="section-kicker text-cocoa/72">Contato direto</p>
                  <p className="mt-2 text-sm leading-7 text-espresso/76">
                    {contatoTexto}
                  </p>
                </div>
                <div className="panel-inset p-4">
                  <p className="section-kicker text-cocoa/72">Retirada e entrega</p>
                  <p className="mt-2 text-sm leading-7 text-espresso/76">
                    {LOJA_INFO.retirada}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel-dark overflow-hidden px-5 py-5 text-sugar sm:px-6">
              <p className="section-kicker text-biscuit/80">Presenca operacional</p>
              <h2 className="mt-3 text-3xl leading-tight text-sugar">
                Tudo claro para pedir sem atrito.
              </h2>
              <div className="mt-5 space-y-3">
                <div className="surface-card-dark p-4">
                  <p className="section-kicker text-biscuit/80">Endereco</p>
                  <p className="mt-2 text-sm leading-7 text-sugar/74">
                    {endereco ?? "Endereco ainda nao configurado."}
                  </p>
                </div>
                <div className="surface-card-dark p-4">
                  <p className="section-kicker text-biscuit/80">Atendimento</p>
                  <p className="mt-2 text-sm leading-7 text-sugar/74">
                    {contatoTexto}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-sugar/74">
                    {LOJA_INFO.retirada}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-start">
        <article className="panel-dark self-start rounded-[2rem] px-6 py-7 text-sugar shadow-[0_26px_52px_rgba(20,4,12,0.28)] sm:px-8 sm:py-8">
          <p className="section-kicker text-biscuit/84">Experiencia</p>
          <h2 className="mt-3 max-w-[10ch] text-4xl leading-tight text-sugar sm:text-5xl">
            Peça rápido com leitura clara.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-8 text-sugar/74">
            Menos ruído visual, mais foco no pedido, no contato e no que a loja
            entrega melhor.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="surface-card-dark p-4">
              <p className="section-kicker text-biscuit/80">Fluxo direto</p>
              <p className="mt-2 text-sm leading-7 text-sugar/74">
                Escolha o item, revise o carrinho e envie no WhatsApp.
              </p>
            </div>
            <div className="surface-card-dark p-4">
              <p className="section-kicker text-biscuit/80">Atendimento</p>
              <p className="mt-2 text-sm leading-7 text-sugar/74">
                {contatoTexto}
              </p>
            </div>
            <div className="surface-card-dark p-4">
              <p className="section-kicker text-biscuit/80">Retirada e entrega</p>
              <p className="mt-2 text-sm leading-7 text-sugar/74">
                {LOJA_INFO.retirada}
              </p>
            </div>
          </div>
        </article>

        <article className="panel self-start rounded-[2rem] p-6 shadow-[0_22px_46px_rgba(82,14,35,0.1)] sm:p-8">
          <div className="flex flex-col gap-4 border-b border-caramel/14 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker text-cocoa/82">Destaques da casa</p>
              <h2 className="mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
                Destaques para pedir sem pensar muito.
              </h2>
              <p className="mt-4 text-sm leading-8 text-espresso/76">
                Os produtos mais pedidos ficam aqui para acelerar a decisão.
              </p>
            </div>
            <Link href="/cardapio" className="button-secondary min-w-[11rem] justify-center px-6">
              Ver cardapio
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {produtosHome.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>
      </section>

      <CustomOrderComposer />
    </main>
  );
}
