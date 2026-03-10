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
    <footer className="mt-12 px-4 pb-5 pt-3 lg:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[1.8rem] border border-biscuit/18 bg-[linear-gradient(145deg,rgba(59,8,25,0.97),rgba(35,7,19,0.99))] px-5 py-6 text-sugar shadow-[0_20px_40px_rgba(20,4,12,0.28)] sm:px-8 sm:py-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(209,161,52,0.16),transparent_28%),radial-gradient(circle_at_right,rgba(194,28,67,0.14),transparent_32%)]"
          />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-4">
              <BrandLockup inverted />
              <p className="max-w-2xl text-sm leading-7 text-sugar/72">
                Delivery direto pelo cardápio, com pedido simples e confirmação
                no WhatsApp.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/cardapio" className="button-primary px-6">
                  Ver cardápio
                </Link>
                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary border-white/14 bg-white/10 px-6 text-sugar hover:bg-white/16 hover:text-sugar"
                  >
                    Pedir no WhatsApp
                  </a>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/10 p-4">
                <p className="section-kicker text-biscuit/82">Contato</p>
                <p className="mt-2 text-sm font-semibold text-sugar/84">
                  {telefone ?? "Telefone ainda não configurado."}
                </p>
                <p className="mt-2 text-sm leading-6 text-sugar/68">
                  {LOJA_INFO.retirada}
                </p>
              </div>

              <div className="rounded-[1.3rem] border border-white/10 bg-white/10 p-4">
                <p className="section-kicker text-biscuit/82">Endereço</p>
                <p className="mt-2 text-sm leading-6 text-sugar/68">
                  {endereco ?? "Endereço ainda não configurado."}
                </p>
              </div>

              <div className="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 sm:col-span-2">
                <p className="section-kicker text-biscuit/82">Navegação</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href="/"
                    className="inline-flex rounded-full border border-white/12 px-3 py-2 text-sm font-semibold text-sugar/78 transition hover:bg-white/10 hover:text-sugar"
                  >
                    Início
                  </Link>
                  <Link
                    href="/cardapio"
                    className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-sugar/78 transition hover:bg-white/10 hover:text-sugar"
                  >
                    Cardápio
                  </Link>
                  <Link
                    href="/politica-de-privacidade"
                    className="inline-flex rounded-full border border-white/12 px-4 py-2 text-sm font-semibold text-sugar/78 transition hover:bg-white/10 hover:text-sugar"
                  >
                    Privacidade
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-sugar/46 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {new Date().getFullYear()} {LOJA_INFO.nome}
            </p>
            <p>{LOJA_INFO.observacaoKit}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
