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
  const logoSize = compact ? 58 : 188;
  const frameClasses = compact
    ? "h-[2.9rem] w-[2.9rem] p-[0.14rem] sm:h-[3.5rem] sm:w-[3.5rem] sm:p-[0.18rem]"
    : "h-[12.5rem] w-[12.5rem] p-[0.7rem]";
  const imageClasses = compact
    ? "h-[2.55rem] w-[2.55rem] sm:h-[3.1rem] sm:w-[3.1rem]"
    : "h-[11rem] w-[11rem]";
  const eyebrowClass = inverted ? "text-biscuit/78" : "text-cocoa/60";
  const headingClass = inverted ? "text-sugar" : "text-espresso";
  const copyClass = inverted ? "text-sugar/68" : "text-espresso/66";

  return (
    <div
      className={[
        "flex items-center gap-2.5 sm:gap-3",
        compact ? "min-w-0" : "flex-col text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "relative shrink-0 rounded-full border border-caramel/22",
          "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(248,232,194,0.92))]",
          "shadow-[0_12px_24px_rgba(63,11,28,0.12)]",
          frameClasses,
        ].join(" ")}
      >
        <div className="absolute inset-[3px] rounded-full border border-caramel/20" />
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
            className={`font-extrabold uppercase tracking-[0.18em] ${eyebrowClass} ${
              compact ? "hidden sm:block sm:text-[0.5rem]" : "text-[0.72rem]"
            }`}
          >
            Delivery
          </p>
          <h2
            className={`text-balance ${headingClass} ${
              compact
                ? "text-[0.98rem] leading-tight sm:text-[1.12rem]"
                : "text-[2.1rem] leading-none sm:text-[2.7rem]"
            }`}
          >
            {LOJA_INFO.nome}
          </h2>
          <p
            className={`hidden ${copyClass} ${
              compact ? "sm:block sm:text-[0.72rem] sm:leading-5" : "text-sm leading-6"
            }`}
          >
            {LOJA_INFO.assinatura}
          </p>
        </div>
      ) : null}
    </div>
  );
}
