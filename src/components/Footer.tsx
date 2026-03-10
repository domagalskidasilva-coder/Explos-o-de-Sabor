import Link from "next/link";
import BrandLockup from "@/src/components/BrandLockup";
import { LOJA_INFO } from "@/src/data/loja";
import { getConfiguredStoreValue } from "@/src/lib/store-info";
import { normalizeWhatsAppNumber } from "@/src/lib/whatsapp";

const whatsappNumber = normalizeWhatsAppNumber(
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
);
const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

export default function Footer() {
  const telefone = getConfiguredStoreValue(LOJA_INFO.telefone);
  const endereco = getConfiguredStoreValue(LOJA_INFO.endereco);

  return (
    <footer className="mt-20 px-4 pb-4 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="panel-dark overflow-hidden px-6 py-8 text-sugar sm:px-8 sm:py-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
            <div>
              <div className="flex items-center gap-4">
                <BrandLockup compact showText={false} />
                <div>
                  <p className="section-kicker text-biscuit/84">
                    Explosão de Sabor
                  </p>
                  <h2 className="mt-2 text-4xl leading-tight text-sugar sm:text-5xl">
                    Delivery com imagem forte e pedido sem atrito.
                  </h2>
                </div>
              </div>
              <p className="mt-5 max-w-2xl text-base leading-8 text-sugar/76">
                Catálogo sincronizado com o painel interno, atendimento direto
                da empresa e finalização em poucos passos.
              </p>
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary mt-6 px-6"
                >
                  Pedir no WhatsApp
                </a>
              ) : null}
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="section-kicker text-biscuit/82">Loja</p>
                <p className="mt-3 text-sm leading-7 text-sugar/74">
                  {LOJA_INFO.nome}
                </p>
                <p className="text-sm leading-7 text-sugar/74">
                  {endereco ?? "Endereço ainda não configurado."}
                </p>
              </div>
              <div>
                <p className="section-kicker text-biscuit/82">Contato</p>
                <p className="mt-3 text-sm leading-7 text-sugar/74">
                  {telefone ?? "Telefone ainda não configurado."}
                </p>
                <p className="text-sm leading-7 text-sugar/74">
                  {LOJA_INFO.retirada}
                </p>
                <p className="mt-2 text-sm leading-7 text-sugar/74">
                  {LOJA_INFO.observacaoKit}
                </p>
              </div>
              <div>
                <p className="section-kicker text-biscuit/82">Navegação</p>
                <div className="mt-3 flex flex-col items-start gap-2 text-sm font-semibold text-sugar/76">
                  <Link href="/">Início</Link>
                  <Link href="/cardapio">Cardápio</Link>
                  <Link href="/politica-de-privacidade">Privacidade</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.14em] text-sugar/48">
            {new Date().getFullYear()} {LOJA_INFO.nome}
          </div>
        </div>
      </div>
    </footer>
  );
}
