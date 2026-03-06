import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de privacidade",
  description: "Resumo simples sobre o uso dos dados digitados no checkout da doceria.",
};

export default function PrivacyPage() {
  return (
    <main id="conteudo" className="mx-auto max-w-4xl px-4 pb-16 pt-8 lg:px-6 lg:pb-20">
      <section className="rounded-[2rem] border border-caramel/20 bg-sugar/90 p-6 shadow-[var(--surface-shadow)] sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">Politica de privacidade</p>
        <h1 className="mt-3 text-4xl text-espresso">Uso simples e pontual dos dados do pedido.</h1>
        <div className="mt-6 space-y-5 text-base leading-8 text-espresso/80">
          <p>
            Os dados informados no checkout sao usados apenas para montar a mensagem enviada ao WhatsApp da loja.
          </p>
          <p>
            O site nao possui cadastro, banco de dados ou painel administrativo nesta versao MVP. O carrinho fica salvo apenas no navegador por meio de armazenamento local.
          </p>
          <p>
            Se quiser remover os itens salvos, basta esvaziar o carrinho ou limpar os dados do navegador.
          </p>
          <p>
            Para atualizacoes futuras com entregas, pagamentos online ou historico de pedidos, esta politica deve ser revisada.
          </p>
        </div>
      </section>
    </main>
  );
}
