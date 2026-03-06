import type { Metadata } from "next";
import { Bree_Serif, Nunito_Sans } from "next/font/google";
import "./globals.css";
import AppProviders from "@/src/components/AppProviders";
import CartDrawer from "@/src/components/CartDrawer";
import CheckoutModal from "@/src/components/CheckoutModal";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";

const displayFont = Bree_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: "Confeitaria Duas Vontades",
    template: "%s | Confeitaria Duas Vontades",
  },
  description:
    "Confeitaria Duas Vontades: bolos salgados e doces com pedido simples, acessivel e confirmado pelo WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} bg-cream text-espresso antialiased`}
      >
        <a
          href="#conteudo"
          className="sr-only relative z-20 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-espresso focus:px-4 focus:py-3 focus:text-sugar"
        >
          Pular para o conteudo
        </a>
        <div aria-hidden="true" className="site-atmosphere">
          <div className="site-atmosphere__veil" />
          <div className="site-atmosphere__grid" />
          <div className="site-atmosphere__blob site-atmosphere__blob--rose" />
          <div className="site-atmosphere__blob site-atmosphere__blob--gold" />
          <div className="site-atmosphere__blob site-atmosphere__blob--mint" />
          <div className="site-atmosphere__blob site-atmosphere__blob--cocoa" />
        </div>
        <AppProviders>
          <div className="relative z-10 min-h-screen overflow-x-clip">
            <Header />
            {children}
            <Footer />
            <CartDrawer />
            <CheckoutModal />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
