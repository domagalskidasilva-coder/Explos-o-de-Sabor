import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description:
    "Resumo simples sobre o uso dos dados informados no checkout da Explosão de Sabor.",
};

export default function PrivacyPage() {
  return (
    <main
      id="conteudo"
      className="mx-auto max-w-4xl px-4 pb-16 pt-8 lg:px-6 lg:pb-24"
    >
      <section className="panel overflow-hidden p-6 sm:p-8 lg:p-10">
        <p className="section-kicker text-cocoa/82">Política de privacidade</p>
        <h1 className="mt-3 text-4xl leading-tight text-espresso sm:text-5xl">
          Uso objetivo dos dados informados no pedido.
        </h1>
        <div className="mt-6 space-y-5 text-base leading-8 text-espresso/80">
          <p>
            Os dados informados no checkout são usados para registrar o pedido,
            montar a mensagem enviada ao WhatsApp da loja e permitir o
            acompanhamento operacional da empresa no painel interno.
          </p>
          <p>
            O site não exige cadastro público. O carrinho pode usar o
            armazenamento local do navegador para manter os itens até a
            finalização do pedido.
          </p>
          <p>
            Se quiser remover os itens salvos, basta esvaziar o carrinho ou
            limpar os dados do navegador.
          </p>
          <p>
            Caso a operação passe a incluir pagamentos online, histórico público
            de pedidos ou novos meios de atendimento, esta política deve ser
            revisada.
          </p>
        </div>
      </section>
    </main>
  );
}
