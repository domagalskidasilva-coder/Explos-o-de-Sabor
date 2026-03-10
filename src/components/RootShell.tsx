"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import CartDrawer from "@/src/components/CartDrawer";
import CheckoutModal from "@/src/components/CheckoutModal";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";

export default function RootShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <div className="relative z-10 min-h-screen overflow-x-hidden">
        {children}
      </div>
    );
  }

  return (
    <>
      <div aria-hidden="true" className="site-atmosphere">
        <div className="site-atmosphere__veil" />
        <div className="site-atmosphere__blob site-atmosphere__blob--rose" />
        <div className="site-atmosphere__blob site-atmosphere__blob--gold" />
        <div className="site-atmosphere__blob site-atmosphere__blob--mint" />
        <div className="site-atmosphere__blob site-atmosphere__blob--cocoa" />
      </div>
      <div className="relative z-10 min-h-screen overflow-x-clip">
        <Header />
        {children}
        <Footer />
        <CartDrawer />
        <CheckoutModal />
      </div>
    </>
  );
}
