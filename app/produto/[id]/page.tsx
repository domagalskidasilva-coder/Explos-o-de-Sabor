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
      className="mx-auto max-w-7xl px-4 pb-16 pt-6 lg:px-6 lg:pb-24 lg:pt-8"
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <article className="panel-soft overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(140deg,rgba(255,253,249,1),rgba(236,210,152,1))]">
            <Image
              src={product.imagem}
              alt={`Foto de ${product.nome}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(47,7,22,0.04)_0%,rgba(47,7,22,0.2)_55%,rgba(47,7,22,0.74)_100%)]" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-kicker text-biscuit/80">{product.subcategoria}</p>
                <h1 className="mt-2 text-4xl leading-tight text-sugar sm:text-5xl">
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

          <div className="p-6 sm:p-8">
            <p className="text-base leading-8 text-espresso/78">
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
                <p className="section-kicker text-cocoa/72">Fluxo</p>
                <p className="mt-2 text-sm leading-7 text-espresso/74">
                  {product.variacoes && product.variacoes.length > 0
                    ? "Escolha o sabor, veja o valor e adicione ao carrinho."
                    : "Confira o produto, escolha adicionais e siga com o pedido."}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/cardapio" className="button-secondary px-6">
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
