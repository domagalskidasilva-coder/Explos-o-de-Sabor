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
  const logoSize = compact ? 78 : 220;
  const frameClasses = compact
    ? "h-[5.4rem] w-[5.4rem] p-[0.38rem]"
    : "h-[15rem] w-[15rem] p-[0.8rem]";
  const imageClasses = compact
    ? "h-[4.6rem] w-[4.6rem]"
    : "h-[13.3rem] w-[13.3rem]";

  return (
    <div
      className={`flex items-center gap-4 ${compact ? "" : "flex-col text-center"} ${className}`.trim()}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-full border border-caramel/32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(247,228,186,0.96))] shadow-[0_18px_42px_rgba(63,11,28,0.2)] ${frameClasses}`}
      >
        <div className="absolute inset-[6px] rounded-full border border-caramel/34" />
        <div className="absolute inset-[14px] rounded-full border border-espresso/10" />
        <Image
          src="/images/logo-explosao.jpeg"
          alt={`Logo da ${LOJA_INFO.nome}`}
          width={logoSize}
          height={logoSize}
          className={`${imageClasses} rounded-full bg-cream object-cover`}
          priority
        />
      </div>
      {showText ? (
        <div className={compact ? "min-w-0" : "max-w-sm"}>
          <p
            className={`font-extrabold uppercase tracking-[0.16em] text-cocoa/80 ${
              compact ? "text-[0.62rem]" : "text-xs"
            }`}
          >
            Delivery
          </p>
          <h2
            className={`mt-1 text-espresso ${compact ? "text-xl leading-tight sm:text-2xl" : "text-2xl sm:text-3xl"}`}
          >
            {LOJA_INFO.nome}
          </h2>
          <p
            className={`mt-1 text-espresso/72 ${compact ? "text-xs leading-5 sm:text-sm" : "text-sm leading-6"}`}
          >
            {LOJA_INFO.assinatura}
          </p>
        </div>
      ) : null}
    </div>
  );
}
