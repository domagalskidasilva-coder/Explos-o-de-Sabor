import Image from "next/image";
import { LOJA_INFO } from "@/src/data/loja";

interface BrandLockupProps {
  compact?: boolean;
  showText?: boolean;
  className?: string;
}

export default function BrandLockup({
  compact = false,
  showText = true,
  className = "",
}: BrandLockupProps) {
  const logoSize = compact ? 72 : 220;
  const frameClasses = compact
    ? "h-[5.25rem] w-[5.25rem] p-[0.35rem]"
    : "h-[15.5rem] w-[15.5rem] p-[0.8rem]";
  const imageClasses = compact
    ? "h-[4.55rem] w-[4.55rem]"
    : "h-[13.9rem] w-[13.9rem]";

  return (
    <div
      className={`flex items-center gap-4 ${compact ? "" : "flex-col text-center"} ${className}`.trim()}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-full border border-caramel/25 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(249,241,232,0.9))] shadow-[0_14px_36px_rgba(123,42,14,0.14)] ${frameClasses}`}
      >
        <div className="absolute inset-[6px] rounded-full border border-blush/60" />
        <div className="absolute inset-[14px] rounded-full border border-caramel/18" />
        <Image
          src="/images/logo-duas-vontades.svg"
          alt={`Logo da ${LOJA_INFO.nome}`}
          width={logoSize}
          height={logoSize}
          className={`${imageClasses} rounded-full bg-cream object-cover`}
          priority
        />
      </div>
      {showText ? (
        <div className={compact ? "min-w-0" : "max-w-sm"}>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-cocoa">
            Confeitaria artesanal
          </p>
          <h2 className="mt-1 text-2xl text-espresso sm:text-3xl">
            {LOJA_INFO.nome}
          </h2>
          <p className="mt-1 text-sm leading-6 text-espresso/75">
            {LOJA_INFO.assinatura}
          </p>
        </div>
      ) : null}
    </div>
  );
}
