"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CartLine } from "@/src/types/cart";

interface CartState {
  lines: CartLine[];
  cartOpen: boolean;
  checkoutOpen: boolean;
}

type CartAction =
  | { type: "HYDRATE"; lines: CartLine[] }
  | {
      type: "ADD";
      productId: string;
      variationId?: string | null;
      quantity?: number;
    }
  | {
      type: "SET_QTY";
      productId: string;
      variationId?: string | null;
      quantity: number;
    }
  | { type: "REMOVE"; productId: string; variationId?: string | null }
  | { type: "CLEAR" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "OPEN_CHECKOUT" }
  | { type: "CLOSE_CHECKOUT" };

interface CartContextValue extends CartState {
  add: (
    productId: string,
    variationId?: string | null,
    quantity?: number,
  ) => void;
  setQty: (
    productId: string,
    variationId: string | null | undefined,
    quantity: number,
  ) => void;
  remove: (productId: string, variationId?: string | null) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
}

const STORAGE_KEY = "doceria-explosao.cart.v1";

const initialState: CartState = {
  lines: [],
  cartOpen: false,
  checkoutOpen: false,
};

function sanitizeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const quantities = new Map<
    string,
    { productId: string; variationId: string | null; quantity: number }
  >();

  value.forEach((line) => {
    if (
      !line ||
      typeof line !== "object" ||
      !("productId" in line) ||
      !("quantity" in line) ||
      typeof line.productId !== "string" ||
      typeof line.quantity !== "number" ||
      !Number.isFinite(line.quantity)
    ) {
      return;
    }

    const nextQuantity = Math.max(0, Math.floor(line.quantity));
    if (nextQuantity === 0) {
      return;
    }

    const variationId =
      "variationId" in line && typeof line.variationId === "string"
        ? line.variationId
        : null;
    const lineKey = `${line.productId}:${variationId ?? "padrao"}`;
    const current = quantities.get(lineKey);

    quantities.set(lineKey, {
      productId: line.productId,
      variationId,
      quantity: (current?.quantity ?? 0) + nextQuantity,
    });
  });

  return Array.from(quantities.values()).map(
    ({ productId, variationId, quantity }) => ({
      productId,
      variationId,
      quantity,
    }),
  );
}

function matchesLine(
  line: CartLine,
  productId: string,
  variationId?: string | null,
) {
  return (
    line.productId === productId &&
    (line.variationId ?? null) === (variationId ?? null)
  );
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, lines: sanitizeLines(action.lines) };
    case "ADD": {
      const quantity = Math.max(1, Math.floor(action.quantity ?? 1));
      const existingLine = state.lines.find((line) =>
        matchesLine(line, action.productId, action.variationId),
      );

      if (existingLine) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            matchesLine(line, action.productId, action.variationId)
              ? { ...line, quantity: line.quantity + quantity }
              : line,
          ),
        };
      }

      return {
        ...state,
        lines: [
          ...state.lines,
          {
            productId: action.productId,
            variationId: action.variationId ?? null,
            quantity,
          },
        ],
      };
    }
    case "SET_QTY": {
      const nextQuantity = Math.max(0, Math.floor(action.quantity));
      return {
        ...state,
        lines:
          nextQuantity === 0
            ? state.lines.filter(
                (line) =>
                  !matchesLine(line, action.productId, action.variationId),
              )
            : state.lines.map((line) =>
                matchesLine(line, action.productId, action.variationId)
                  ? { ...line, quantity: nextQuantity }
                  : line,
              ),
      };
    }
    case "REMOVE":
      return {
        ...state,
        lines: state.lines.filter(
          (line) => !matchesLine(line, action.productId, action.variationId),
        ),
      };
    case "CLEAR":
      return { ...state, lines: [] };
    case "OPEN_CART":
      return { ...state, cartOpen: true };
    case "CLOSE_CART":
      return { ...state, cartOpen: false };
    case "OPEN_CHECKOUT":
      return { ...state, cartOpen: false, checkoutOpen: true };
    case "CLOSE_CHECKOUT":
      return { ...state, checkoutOpen: false };
    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [storageReady, setStorageReady] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }

    hydratedRef.current = true;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as { lines?: CartLine[] };
      dispatch({ type: "HYDRATE", lines: sanitizeLines(parsed.lines) });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lines: state.lines }),
    );
  }, [state.lines, storageReady]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      add: (productId, variationId, quantity) =>
        dispatch({ type: "ADD", productId, variationId, quantity }),
      setQty: (productId, variationId, quantity) =>
        dispatch({ type: "SET_QTY", productId, variationId, quantity }),
      remove: (productId, variationId) =>
        dispatch({ type: "REMOVE", productId, variationId }),
      clear: () => dispatch({ type: "CLEAR" }),
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
      openCheckout: () => dispatch({ type: "OPEN_CHECKOUT" }),
      closeCheckout: () => dispatch({ type: "CLOSE_CHECKOUT" }),
    }),
    [state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }

  return context;
}
