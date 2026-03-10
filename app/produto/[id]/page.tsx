import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ProductPurchasePanel from "@/src/components/ProductPurchasePanel";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import { listProducts, listProductsByIds } from "@/src/lib/repositories";
import { LOJA_INFO } from "@/src/data/loja";
import { formatCurrency } from "@/src/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product] = await listProductsByIds([id]);

  if (!product) {
    notFound();
  }

  if (product.categoria === "bebida") {
    redirect("/cardapio");
  }

  const allProducts = await listProducts({ onlyAvailable: true });
  const beverageOptions = allProducts.filter(
    (item) => item.categoria === "bebida" && item.disponivel,
  );

  const basePrice =
    product.variacoes && product.variacoes.length > 0
      ? Math.min(...product.variacoes.map((variation) => variation.preco))
      : product.preco;
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);

  return (
    <main
      id="conteudo"
      className="mx-auto max-w-6xl px-4 pb-16 pt-4 lg:px-6 lg:pb-24 lg:pt-6"
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
        <article className="panel-soft overflow-hidden">
          <div className="relative aspect-[1.08/1] overflow-hidden bg-[linear-gradient(140deg,rgba(255,253,249,1),rgba(236,210,152,1))] sm:aspect-[4/3]">
            <Image
              src={product.imagem}
              alt={`Foto de ${product.nome}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,7,22,0.04)_0%,rgba(47,7,22,0.2)_55%,rgba(47,7,22,0.74)_100%)]" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 sm:bottom-5 sm:left-5 sm:right-5 sm:gap-4">
              <div>
                <p className="section-kicker text-biscuit/80">{product.subcategoria}</p>
                <h1 className="mt-2 max-w-[12ch] text-3xl leading-tight text-sugar sm:text-5xl">
                  {product.nome}
                </h1>
              </div>
              <div className="rounded-full border border-white/14 bg-[rgba(62,8,24,0.8)] px-4 py-2 text-sm font-extrabold text-biscuit backdrop-blur">
                {product.variacoes && product.variacoes.length > 0
                  ? `a partir de ${formatCurrency(basePrice)}`
                  : formatCurrency(basePrice)}
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-sm leading-7 text-espresso/78 sm:text-base sm:leading-8">
              {product.descricaoCurta}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="panel-inset p-4">
                <p className="section-kicker text-cocoa/72">Contato</p>
                <p className="mt-2 text-sm leading-7 text-espresso/74">
                  {telefone ?? "Telefone ainda não configurado."}
                </p>
              </div>
              <div className="panel-inset p-4">
                <p className="section-kicker text-cocoa/72">Pedido</p>
                <p className="mt-2 text-sm leading-7 text-espresso/74">
                  {product.variacoes && product.variacoes.length > 0
                    ? "Escolha sabor, veja o valor e adicione."
                    : "Escolha adicionais e siga com o pedido."}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/cardapio" className="button-secondary px-5">
                Voltar para o cardápio
              </Link>
            </div>
          </div>
        </article>

        <ProductPurchasePanel
          product={product}
          beverageOptions={beverageOptions}
        />
      </section>
    </main>
  );
}
