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
  const horario = getConfiguredStoreValue(LOJA_INFO.horario);
  const contactDetails = [
    telefone && `Tel.: ${telefone}`,
    endereco,
    horario,
    LOJA_INFO.retirada,
  ].filter(Boolean);

  return (
    <footer className="border-t border-caramel/20 bg-espresso text-sugar">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <BrandLockup compact showText={false} />
            <h2 className="mt-3 text-3xl">{LOJA_INFO.nome}</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-sugar/80">
              {LOJA_INFO.assinatura}. Pedidos simples, fluxo acessivel e
              confirmacao final pelo WhatsApp.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-biscuit">
              Atendimento
            </p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-sugar/80">
              {contactDetails.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-biscuit">
              Informacoes
            </p>
            <div className="mt-3 flex flex-col items-start gap-3 text-sm font-bold">
              <Link
                href="/cardapio"
                className="underline decoration-biscuit/50"
              >
                Ver cardapio
              </Link>
              <Link
                href="/politica-de-privacidade"
                className="underline decoration-biscuit/50"
              >
                Politica de privacidade
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {whatsappLink ? (
            <>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-biscuit px-6 text-base font-bold text-espresso transition hover:bg-cream"
              >
                Falar no WhatsApp
              </a>
              <p className="text-sm text-sugar/70">
                Pedidos confirmados em uma nova aba do WhatsApp.
              </p>
            </>
          ) : null}
          {!whatsappLink ? (
            <p className="text-sm text-sugar/70">
              Numero de WhatsApp ainda nao configurado neste ambiente.
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
