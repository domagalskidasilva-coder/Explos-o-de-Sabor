import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BrandLockup from "@/src/components/BrandLockup";
import MenuExplorer from "@/src/components/MenuExplorer";
import { LOJA_INFO } from "@/src/data/loja";
import { PRODUTOS } from "@/src/data/produtos";
import { getConfiguredStoreValue } from "@/src/lib/store-info";

export const metadata: Metadata = {
  title: "Cardapio",
  description:
    "Catalogo completo com doces e salgados brasileiros para pedido pelo WhatsApp.",
};

export default function CardapioPage() {
  const totalProdutos = PRODUTOS.length;
  const doces = PRODUTOS.filter(
    (product) => product.categoria === "doce",
  ).length;
  const salgados = PRODUTOS.filter(
    (product) => product.categoria === "salgado",
  ).length;
  const subcategorias = new Set(PRODUTOS.map((product) => product.subcategoria))
    .size;
  const horario = getConfiguredStoreValue(LOJA_INFO.horario);
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);

  return (
    <main
      id="conteudo"
      className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-6 lg:pb-20"
    >
      <section className="relative overflow-hidden rounded-[2.4rem] border border-caramel/20 bg-sugar/94 shadow-[var(--surface-shadow)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(233,160,168,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(210,163,109,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.66),rgba(255,248,240,0.9))]" />
        <div className="absolute -left-20 top-12 h-52 w-52 rounded-full bg-blush/22 blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-biscuit/30 blur-3xl" />

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(22rem,0.98fr)] lg:p-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4">
              <BrandLockup compact showText={false} className="shrink-0" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">
                  Cardapio da casa
                </p>
                <p className="mt-1 text-base font-semibold text-espresso/78">
                  {LOJA_INFO.assinatura}
                </p>
              </div>
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl leading-tight text-espresso sm:text-5xl lg:text-[3.6rem]">
              Doces, salgados e bolos para escolher com calma.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-espresso/78">
              O cardapio foi organizado para leitura facil: categorias claras,
              fotos grandes e um fluxo curto ate a confirmacao do pedido no
              WhatsApp.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/cardapio?categoria=doce"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-espresso px-6 text-base font-bold text-sugar shadow-[0_14px_30px_rgba(53,33,22,0.16)] transition hover:bg-cocoa"
              >
                Ver doces
              </Link>
              <Link
                href="/cardapio?categoria=salgado"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-caramel/30 bg-cream px-6 text-base font-bold text-espresso transition hover:border-caramel hover:bg-oat"
              >
                Ver salgados
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <article className="rounded-[1.6rem] border border-caramel/16 bg-white/80 p-4 backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-cocoa">
                  Catalogo
                </p>
                <p className="mt-2 text-3xl text-espresso">{totalProdutos}</p>
                <p className="mt-1 text-sm leading-6 text-espresso/72">
                  itens entre doces, salgados e bolos.
                </p>
              </article>
              <article className="rounded-[1.6rem] border border-caramel/16 bg-white/80 p-4 backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-cocoa">
                  Categorias
                </p>
                <p className="mt-2 text-3xl text-espresso">{subcategorias}</p>
                <p className="mt-1 text-sm leading-6 text-espresso/72">
                  grupos para encontrar mais rapido.
                </p>
              </article>
              <article className="rounded-[1.6rem] border border-caramel/16 bg-white/80 p-4 backdrop-blur">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-cocoa">
                  Retirada
                </p>
                <p className="mt-2 text-xl text-espresso">
                  {LOJA_INFO.retirada}
                </p>
                <p className="mt-1 text-sm leading-6 text-espresso/72">
                  pedido confirmado em poucos passos.
                </p>
              </article>
            </div>
          </div>

          <aside className="grid gap-4">
            <article className="overflow-hidden rounded-[2rem] border border-caramel/18 bg-espresso text-sugar shadow-[0_26px_60px_rgba(53,33,22,0.22)]">
              <div className="relative h-72">
                <Image
                  src="/images/produtos/coxinha.webp"
                  alt="Salgados e doces da confeitaria"
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(46,31,22,0.04),rgba(46,31,22,0.76))]" />
                <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-biscuit backdrop-blur">
                  Pedido simples
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h2 className="max-w-md text-3xl leading-tight">
                    Escolha os itens, ajuste as quantidades e finalize no
                    WhatsApp.
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.08em] text-biscuit">
                    Pagamento
                  </p>
                  <p className="mt-2 text-sm leading-7 text-sugar/84">
                    Credito, debito e dinheiro sao pagos na retirada. Pix e o
                    unico pagamento antecipado.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
                  <p className="text-sm font-bold uppercase tracking-[0.08em] text-biscuit">
                    Fluxo
                  </p>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-sugar/84">
                    <p>{doces} doces no catalogo</p>
                    <p>{salgados} salgados no catalogo</p>
                    <p>Confirmacao final pelo WhatsApp</p>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-[1.6rem] border border-caramel/16 bg-white/82 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                  Atendimento
                </p>
                <p className="mt-2 text-base leading-7 text-espresso/80">
                  {horario ??
                    "Horario sera exibido aqui quando os dados da loja forem atualizados."}
                </p>
              </article>
              <article className="rounded-[1.6rem] border border-caramel/16 bg-white/82 p-4">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-cocoa">
                  Privacidade
                </p>
                <p className="mt-2 text-base leading-7 text-espresso/80">
                  {telefone
                    ? `Contato direto: ${telefone}.`
                    : "Seus dados entram apenas na mensagem pronta do pedido."}
                </p>
                <Link
                  href="/politica-de-privacidade"
                  className="mt-3 inline-flex text-sm font-bold text-cocoa underline decoration-caramel/40"
                >
                  Ver politica de privacidade
                </Link>
              </article>
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-8">
        <MenuExplorer products={PRODUTOS} />
      </section>
    </main>
  );
}
