import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import AppProviders from "@/src/components/AppProviders";
import RootShell from "@/src/components/RootShell";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Explosão de Sabor",
    template: "%s | Explosão de Sabor",
  },
  description:
    "Explosão de Sabor: bolos salgados e doces com pedido simples, acessível e confirmado pelo WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} bg-cream text-espresso antialiased`}
      >
        <AppProviders>
          <RootShell>{children}</RootShell>
        </AppProviders>
      </body>
    </html>
  );
}
