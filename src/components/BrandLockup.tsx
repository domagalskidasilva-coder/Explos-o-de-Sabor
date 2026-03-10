import Image from "next/image";
import { LOJA_INFO } from "@/src/data/loja";

interface BrandLockupProps {
  compact?: boolean;
  showText?: boolean;
  inverted?: boolean;
  className?: string;
}

export default function BrandLockup({
  compact = false,
  showText = true,
  inverted = false,
  className = "",
}: BrandLockupProps) {
  const logoSize = compact ? 72 : 188;
  const frameClasses = compact
    ? "h-[3.35rem] w-[3.35rem] p-[0.2rem] sm:h-[4.75rem] sm:w-[4.75rem] sm:p-[0.3rem]"
    : "h-[12.5rem] w-[12.5rem] p-[0.7rem]";
  const imageClasses = compact
    ? "h-[2.9rem] w-[2.9rem] sm:h-[4.05rem] sm:w-[4.05rem]"
    : "h-[11rem] w-[11rem]";
  const eyebrowClass = inverted ? "text-biscuit/78" : "text-cocoa/60";
  const headingClass = inverted ? "text-sugar" : "text-espresso";
  const copyClass = inverted ? "text-sugar/68" : "text-espresso/66";

  return (
    <div
      className={[
        "flex items-center gap-3.5 sm:gap-4",
        compact ? "min-w-0" : "flex-col text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "relative shrink-0 rounded-full border border-caramel/24",
          "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(248,232,194,0.92))]",
          "shadow-[0_18px_40px_rgba(63,11,28,0.16)]",
          frameClasses,
        ].join(" ")}
      >
        <div className="absolute inset-[4px] rounded-full border border-caramel/20" />
        <div className="absolute inset-[11px] rounded-full border border-white/50" />
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
            className={`font-extrabold uppercase tracking-[0.22em] ${eyebrowClass} ${
              compact ? "text-[0.45rem] sm:text-[0.6rem]" : "text-[0.72rem]"
            }`}
          >
            Cozinha artesanal
          </p>
          <h2
            className={`mt-1 text-balance ${headingClass} ${
              compact
                ? "text-[0.98rem] leading-tight sm:text-[1.45rem]"
                : "text-[2.1rem] leading-none sm:text-[2.7rem]"
            }`}
          >
            {LOJA_INFO.nome}
          </h2>
          <p
            className={`mt-1.5 ${copyClass} ${
              compact
                ? "hidden sm:line-clamp-2 sm:block sm:text-xs sm:leading-5"
                : "text-sm leading-6"
            }`}
          >
            {LOJA_INFO.assinatura}
          </p>
        </div>
      ) : null}
    </div>
  );
}
