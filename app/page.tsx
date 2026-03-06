import Image from "next/image";
import Link from "next/link";
import BrandLockup from "@/src/components/BrandLockup";
import ProductCard from "@/src/components/ProductCard";
import { LOJA_INFO } from "@/src/data/loja";
import { PRODUTOS, PRODUTOS_EM_DESTAQUE } from "@/src/data/produtos";
import { getConfiguredStoreValue } from "@/src/lib/store-info";

const colecoes = [
  {
    titulo: "Doces de festa",
    descricao:
      "Brigadeiro, beijinho, cajuzinho, quindim e vitrines pensadas para mesa, caixa ou lembranca.",
    imagem: "/images/produtos/brigadeiro.webp",
    href: "/cardapio?categoria=doce",
    rotulo: "Delicias da casa",
  },
  {
    titulo: "Bolos e sobremesas",
    descricao:
      "Bolo de cenoura, pudim, bolo de milho e fatias para acompanhar cafe ou comemorar com calma.",
    imagem: "/images/produtos/bolo-cenoura.webp",
    href: "/cardapio?categoria=doce",
    rotulo: "Vitrine afetiva",
  },
  {
    titulo: "Salgados fritos",
    descricao:
      "Coxinha, risoles, bolinha de queijo e kibe com cara de padaria tradicional e lanche de fim de tarde.",
    imagem: "/images/produtos/coxinha.webp",
    href: "/cardapio?categoria=salgado",
    rotulo: "Produtos e delicias",
  },
  {
    titulo: "Assados da casa",
    descricao:
      "Empadas, pao de queijo, enroladinhos e tortas para montar pedidos simples e rapidos pelo WhatsApp.",
    imagem: "/images/produtos/empada.webp",
    href: "/cardapio?categoria=salgado",
    rotulo: "Saindo do forno",
  },
] as const;

const galeria = [
  {
    titulo: "Bolo macio com cobertura generosa",
    imagem: "/images/produtos/bolo-cenoura.webp",
  },
  {
    titulo: "Doces de vitrine e festa",
    imagem: "/images/produtos/beijinho.webp",
  },
  {
    titulo: "Salgados para retirada",
    imagem: "/images/produtos/coxinha.webp",
  },
] as const;

const destaques = PRODUTOS_EM_DESTAQUE.slice(0, 4);
const contagemDoces = PRODUTOS.filter(
  (product) => product.categoria === "doce",
).length;
const contagemSalgados = PRODUTOS.filter(
  (product) => product.categoria === "salgado",
).length;
const totalProdutos = contagemDoces + contagemSalgados;
const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
const endereco = getConfiguredStoreValue(LOJA_INFO.endereco);

export default function HomePage() {
  return (
    <main id="conteudo">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,0.92fr)] lg:items-start lg:px-6 lg:pb-14 lg:pt-10">
        <div className="rounded-[2.2rem] border border-caramel/20 bg-sugar/92 p-6 shadow-[var(--surface-shadow)] backdrop-blur sm:p-8 lg:p-10">
          <span className="inline-flex rounded-full border border-blush/55 bg-blush-soft px-4 py-2 text-sm font-bold tracking-[0.12em] text-cocoa uppercase">
            Confeitaria artesanal
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl leading-tight text-espresso sm:text-5xl lg:text-6xl">
            {LOJA_INFO.nome}
          </h1>
          <p className="mt-3 text-xl leading-8 text-cocoa sm:text-2xl">
            {LOJA_INFO.assinatura}
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-espresso/80">
            {LOJA_INFO.slogan} Inspirado em vitrines de padaria classica, o site
            prioriza leitura facil, fotos grandes, atendimento visivel e um
            fluxo curto para fechar o pedido.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cardapio"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-espresso px-6 text-base font-bold text-sugar shadow-[0_14px_30px_rgba(53,33,22,0.18)] transition hover:bg-cocoa"
            >
              Ver cardapio completo
            </Link>
            <a
              href="#delicias"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-caramel/30 bg-sugar px-6 text-base font-bold text-espresso transition hover:border-caramel hover:bg-cream"
            >
              Ver delicias da casa
            </a>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-caramel/15 bg-cream/80 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                Catalogo
              </p>
              <p className="mt-2 text-sm leading-7 text-espresso/80">
                {totalProdutos} itens entre doces e salgados.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-caramel/15 bg-cream/80 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                Pedido
              </p>
              <p className="mt-2 text-sm leading-7 text-espresso/80">
                Escolha online e confirme pelo WhatsApp.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-caramel/15 bg-cream/80 p-4">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                Retirada
              </p>
              <p className="mt-2 text-sm leading-7 text-espresso/80">
                {LOJA_INFO.retirada}
              </p>
            </div>
          </div>
        </div>

        <aside className="grid gap-5">
          <div className="rounded-[2.2rem] border border-caramel/20 bg-espresso p-6 text-sugar shadow-[0_24px_60px_rgba(53,33,22,0.28)] sm:p-8">
            <BrandLockup className="items-center" />
          </div>
          <div className="grid gap-5 sm:grid-cols-[1.08fr_0.92fr]">
            <article className="relative overflow-hidden rounded-[2rem] border border-caramel/20 shadow-[var(--surface-shadow)]">
              <Image
                src="/images/produtos/bolo-cenoura.webp"
                alt="Bolo de cenoura com cobertura de chocolate"
                width={900}
                height={1000}
                className="h-full w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(46,31,22,0.62)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-sugar">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-biscuit">
                  Vitrine da semana
                </p>
                <p className="mt-2 text-2xl">
                  Bolos caseiros e sobremesas com cara de feito em casa.
                </p>
              </div>
            </article>
            <div className="grid gap-5">
              <article className="relative overflow-hidden rounded-[2rem] border border-caramel/20 shadow-[var(--surface-shadow)]">
                <Image
                  src="/images/produtos/pudim.webp"
                  alt="Pudim de leite com calda"
                  width={720}
                  height={540}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(46,31,22,0.58)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-sugar">
                  <p className="text-sm font-bold uppercase tracking-[0.08em] text-biscuit">
                    Sobremesas
                  </p>
                </div>
              </article>
              <article className="grid gap-3 rounded-[2rem] border border-caramel/20 bg-sugar/92 p-5 shadow-[var(--surface-shadow)]">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                      Catalogo
                    </p>
                    <p className="mt-1 text-3xl text-espresso">
                      {contagemDoces + contagemSalgados} itens
                    </p>
                  </div>
                  <div className="rounded-full border border-blush/55 bg-blush-soft px-4 py-2 text-sm font-bold text-cocoa">
                    Pedido rapido
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.4rem] bg-cream/90 p-4">
                    <p className="text-3xl font-bold text-cocoa">
                      {contagemDoces}
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.08em] text-espresso/75">
                      Doces
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-cream/90 p-4">
                    <p className="text-3xl font-bold text-cocoa">
                      {contagemSalgados}
                    </p>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.08em] text-espresso/75">
                      Salgados
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </aside>
      </section>

      <section
        id="delicias"
        className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">
              Delicias da casa
            </p>
            <h2 className="mt-2 text-4xl text-espresso">
              Produtos com cara de vitrine, padaria e encomenda de bairro.
            </h2>
          </div>
          <p className="max-w-lg text-base leading-8 text-espresso/78">
            A referencia visual aqui e uma confeitaria mais tradicional: seções
            bem marcadas, fotografias grandes e informacoes de atendimento
            sempre visiveis.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {colecoes.map((colecao) => (
            <article
              key={colecao.titulo}
              className="group overflow-hidden rounded-[2rem] border border-caramel/20 bg-sugar/92 shadow-[var(--surface-shadow)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={colecao.imagem}
                  alt={colecao.titulo}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(46,31,22,0.62)_100%)]" />
                <div className="absolute left-4 top-4 rounded-full border border-white/55 bg-white/78 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-cocoa backdrop-blur">
                  {colecao.rotulo}
                </div>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h3 className="text-2xl text-espresso">{colecao.titulo}</h3>
                  <p className="mt-2 text-sm leading-7 text-espresso/76">
                    {colecao.descricao}
                  </p>
                </div>
                <Link
                  href={colecao.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-caramel/25 bg-cream px-5 text-sm font-bold text-espresso transition hover:border-caramel hover:bg-oat"
                >
                  Explorar categoria
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="grid gap-5 sm:grid-cols-3">
            {galeria.map((item, index) => (
              <article
                key={item.titulo}
                className={`relative overflow-hidden rounded-[2rem] border border-caramel/20 shadow-[var(--surface-shadow)] ${
                  index === 0
                    ? "sm:col-span-2 sm:row-span-2 min-h-[21rem]"
                    : "min-h-[10rem]"
                }`}
              >
                <Image
                  src={item.imagem}
                  alt={item.titulo}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(46,31,22,0.55)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-sugar">
                  <p className="text-base font-bold leading-6">{item.titulo}</p>
                </div>
              </article>
            ))}
          </div>
          <article className="rounded-[2.2rem] border border-caramel/20 bg-sugar/92 p-6 shadow-[var(--surface-shadow)] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">
              Quem somos
            </p>
            <h2 className="mt-3 text-4xl text-espresso">
              Uma confeitaria para escolher sem pressa.
            </h2>
            <p className="mt-4 text-base leading-8 text-espresso/80">
              O visual foi puxado para uma linguagem de padaria classica: blocos
              bem definidos, fotos de vitrine, informacoes claras de atendimento
              e CTA direto para pedido. Tudo continua leve no celular e facil de
              navegar para publico mais velho.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-caramel/15 bg-cream/90 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                  Endereco
                </p>
                <p className="mt-2 text-sm leading-7 text-espresso/80">
                  {endereco ??
                    "Os dados da loja entram aqui quando o endereco real for definido."}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-caramel/15 bg-cream/90 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                  Contato
                </p>
                <p className="mt-2 text-sm leading-7 text-espresso/80">
                  {telefone
                    ? `Tel.: ${telefone}`
                    : "O contato da loja aparece aqui assim que for configurado."}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/cardapio"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-cocoa px-6 text-base font-bold text-sugar transition hover:bg-espresso"
              >
                Ver todos os produtos
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-caramel/25 bg-cream px-6 text-base font-bold text-espresso transition hover:border-caramel hover:bg-oat"
              >
                Entender o pedido
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">
              Escolhas da vitrine
            </p>
            <h2 className="mt-2 text-4xl text-espresso">
              Os pedidos mais procurados da casa.
            </h2>
          </div>
          <Link
            href="/cardapio"
            className="text-base font-bold text-cocoa underline decoration-caramel/40"
          >
            Ver todos os produtos
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {destaques.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section
        id="como-funciona"
        className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12"
      >
        <div className="rounded-[2.2rem] border border-caramel/20 bg-espresso p-6 text-sugar shadow-[0_24px_60px_rgba(53,33,22,0.24)] sm:p-8 lg:p-10">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-biscuit">
                Como pedir
              </p>
              <h2 className="mt-3 text-4xl leading-tight">
                Fluxo curto, direto e com cara de atendimento humano.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-biscuit">
                  1. Escolha
                </p>
                <p className="mt-3 text-base leading-8 text-sugar/85">
                  Navegue pelas fotos, entre no cardapio e adicione itens sem
                  sair do fluxo principal.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-biscuit">
                  2. Revise
                </p>
                <p className="mt-3 text-base leading-8 text-sugar/85">
                  Ajuste quantidade no drawer lateral e confira o total antes de
                  prosseguir.
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-biscuit">
                  3. Confirme
                </p>
                <p className="mt-3 text-base leading-8 text-sugar/85">
                  Informe nome, endereco e pagamento. O site abre o WhatsApp com
                  a mensagem pronta.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
