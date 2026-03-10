import Image from "next/image";
import Link from "next/link";
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
  const totalProdutos = products.length;
  const totalDestaques = destaques.length;
  const horarioTexto = `${storeSettings.openingTime} as ${storeSettings.closingTime}`;
  const atendimentoTexto = `${storeSettings.serviceDays} - ${horarioTexto}`;

  return (
    <main
      id="conteudo"
      className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-6 lg:pb-24"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-caramel/20 bg-[linear-gradient(135deg,rgba(255,250,252,0.96),rgba(245,229,204,0.9))] px-6 py-8 shadow-[var(--surface-shadow)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,180,92,0.12),transparent_28%),radial-gradient(circle_at_left,rgba(194,28,67,0.08),transparent_35%)]"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center">
          <article className="order-2 lg:order-1">
            <p className="inline-flex rounded-full border border-caramel/24 bg-white/78 px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-cocoa/84">
              Delivery oficial
            </p>
            <h1 className="hero-title-animate mt-6 max-w-[10ch] text-[3.5rem] leading-none sm:text-[4.8rem] lg:text-[6.2rem]">
              {LOJA_INFO.nome}
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-cocoa sm:text-[1.9rem] sm:leading-9">
              {LOJA_INFO.assinatura}
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-espresso/80 sm:text-lg">
              {LOJA_INFO.slogan} Catalogo conectado ao painel da empresa,
              vitrine clara e fechamento direto no WhatsApp sem complicacao.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cardapio" className="button-primary px-6">
                Abrir cardapio
              </Link>
              <Link href="/cardapio" className="button-secondary px-6">
                Ver cardapio
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-caramel/18 bg-white/78 px-4 py-4">
                <p className="section-kicker text-cocoa/82">Itens</p>
                <p className="mt-2 text-3xl font-extrabold text-espresso">
                  {totalProdutos}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-caramel/18 bg-white/78 px-4 py-4">
                <p className="section-kicker text-cocoa/82">Destaques</p>
                <p className="mt-2 text-3xl font-extrabold text-espresso">
                  {totalDestaques}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-caramel/18 bg-white/78 px-4 py-4">
                <p className="section-kicker text-cocoa/82">Atendimento</p>
                <p className="mt-2 text-3xl font-extrabold text-espresso">
                  {storeSettings.effectiveIsClosed ? "Fechado" : "Aberto"}
                </p>
              </div>
            </div>
          </article>

          <article className="order-1 lg:order-2">
            <div className="rounded-[2rem] border border-caramel/18 bg-white/44 p-4 sm:p-5">
              <div className="rounded-[1.75rem] border border-caramel/14 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.58),rgba(255,255,255,0.12),transparent_70%)] p-4 sm:p-6">
                <div className="relative mx-auto max-w-[15rem] sm:max-w-[18rem] lg:max-w-[21rem]">
                  <div className="absolute left-0 right-0 top-4 h-[82%] rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),rgba(217,174,73,0.2),transparent_72%)] blur-2xl" />
                  <Image
                    src="/images/mascote-explosao.png"
                    alt="Mascote da Explosao de sabor"
                    width={760}
                    height={760}
                    sizes="(min-width: 1024px) 40vw, 70vw"
                    className="relative z-10 h-auto w-full object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-caramel/18 bg-white/72 p-4">
                  <p className="section-kicker text-cocoa/80">Atendimento</p>
                  <p className="mt-2 text-sm leading-7 text-espresso/76">
                    {storeSettings.serviceDays}
                  </p>
                  <p className="text-sm leading-7 text-espresso/76">
                    {horarioTexto}
                  </p>
                  <p className="text-sm leading-7 text-espresso/76">
                    {telefone ?? "Telefone ainda nao configurado."}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-caramel/18 bg-white/72 p-4">
                  <p className="section-kicker text-cocoa/80">
                    {storeSettings.effectiveIsClosed ? "Aviso" : "Entrega"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-espresso/76">
                    {storeSettings.effectiveIsClosed
                      ? storeSettings.closureReason ||
                        "Estabelecimento fechado temporariamente."
                      : LOJA_INFO.retirada}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <article className="panel overflow-hidden p-6 sm:p-8 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker text-cocoa/82">Produtos</p>
              <h2 className="mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
                Veja alguns itens direto na pagina inicial.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-espresso/76">
                Para explorar tudo com filtro e categorias, use a aba
                `Cardapio`.
              </p>
            </div>
            <Link href="/cardapio" className="button-secondary px-6">
              Ver todos
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {produtosHome.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>

        <article className="panel overflow-hidden p-6 sm:p-8">
          <p className="section-kicker text-cocoa/82">Atendimento</p>
          <h2 className="mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
            Estrutura pronta para vender sem ruido.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-espresso/76">
            A operacao do site prioriza leitura rapida, contato direto e
            atualizacao pelo painel interno da empresa.
          </p>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.6rem] border border-[rgba(124,20,46,0.12)] bg-white/70 p-4">
              <p className="section-kicker text-cocoa/74">Endereco</p>
              <p className="mt-2 text-sm leading-7 text-espresso/76">
                {endereco ?? "Endereco ainda nao configurado."}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-[rgba(124,20,46,0.12)] bg-white/70 p-4">
              <p className="section-kicker text-cocoa/74">Contato</p>
              <p className="mt-2 text-sm leading-7 text-espresso/76">
                {telefone ?? "Contato ainda nao configurado."}
              </p>
              <p className="text-sm leading-7 text-espresso/76">
                Atendimento: {atendimentoTexto}
              </p>
              <p className="mt-2 text-sm leading-7 text-espresso/76">
                {LOJA_INFO.observacaoKit}
              </p>
            </div>
            {storeSettings.effectiveIsClosed ? (
              <div className="rounded-[1.6rem] border border-danger/18 bg-danger/8 p-4">
                <p className="section-kicker text-danger">Aviso</p>
                <p className="mt-2 text-sm leading-7 text-danger">
                  Estabelecimento fechado temporariamente.
                  {storeSettings.closureReason
                    ? ` Motivo: ${storeSettings.closureReason}`
                    : ""}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <article className="panel-dark overflow-hidden px-6 py-7 text-sugar sm:px-8 sm:py-8">
          <p className="section-kicker text-biscuit/84">Como funciona</p>
          <h2 className="mt-3 text-4xl leading-tight text-sugar sm:text-5xl">
            Escolha curta, decisao rapida e confirmacao humana.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-sugar/74">
            O fluxo foi organizado para reduzir atrito sem perder contato direto
            com a empresa.
          </p>

          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            <li className="rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
              <p className="text-3xl text-biscuit">01</p>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.12em] text-biscuit/82">
                Escolha
              </p>
              <p className="mt-2 text-sm leading-7 text-sugar/74">
                Abra o cardapio e escolha os itens do pedido.
              </p>
            </li>
            <li className="rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
              <p className="text-3xl text-biscuit">02</p>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.12em] text-biscuit/82">
                Carrinho
              </p>
              <p className="mt-2 text-sm leading-7 text-sugar/74">
                Revise quantidades, cupom e dados do pedido.
              </p>
            </li>
            <li className="rounded-[1.6rem] border border-white/10 bg-white/7 p-4">
              <p className="text-3xl text-biscuit">03</p>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-[0.12em] text-biscuit/82">
                Confirmacao
              </p>
              <p className="mt-2 text-sm leading-7 text-sugar/74">
                O pedido segue para o WhatsApp da empresa.
              </p>
            </li>
          </ol>

          <Link href="/cardapio" className="button-primary mt-6 px-6">
            Ir para o cardapio
          </Link>
        </article>
      </section>
    </main>
  );
}
