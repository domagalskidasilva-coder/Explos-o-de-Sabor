"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { CartProvider } from "@/src/contexts/CartContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>{children}</CartProvider>
    </MotionConfig>
  );
}
