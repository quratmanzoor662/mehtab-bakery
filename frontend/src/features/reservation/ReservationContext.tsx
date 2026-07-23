"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProductId } from "@/types/product";
import type {
  CartItem,
  CustomerDetails,
  ReservationStatus,
  ReservationStep,
} from "@/types/reservation";
import {
  EMPTY_CUSTOMER,
  RESERVATION_STORAGE_KEY,
  buildWhatsAppMessage,
  clearAllReservationStorage,
  getCartTotals,
  getWhatsAppUrl,
  saveReservationDraft,
} from "@/lib/reservation";
import type { ReservationDraft } from "@/types/reservation";

type ReservationContextValue = {
  items: CartItem[];
  customer: CustomerDetails;
  status: ReservationStatus;
  step: ReservationStep;
  sheetOpen: boolean;
  hydrated: boolean;
  pieceCount: number;
  subtotal: number;
  isBulk: boolean;
  itemCount: number;
  /** True only while there is an active, unfinished reservation. */
  hasPendingReservation: boolean;
  addProduct: (productId: ProductId) => void;
  setQuantity: (productId: ProductId, quantity: number) => void;
  removeProduct: (productId: ProductId) => void;
  updateCustomer: (patch: Partial<CustomerDetails>) => void;
  openSheet: (step?: ReservationStep) => void;
  closeSheet: () => void;
  setStep: (step: ReservationStep) => void;
  continueReservation: () => void;
  confirmAndOpenWhatsApp: () => void;
  clearReservation: () => void;
};

const ReservationContext = createContext<ReservationContextValue | null>(null);

function readPendingDraft(): ReservationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESERVATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReservationDraft;
    if (!parsed?.items?.length || parsed.status === "awaiting_whatsapp") {
      return null;
    }
    return { ...parsed, status: "draft" };
  } catch {
    return null;
  }
}

function clearLegacyKeysOnly() {
  if (typeof window === "undefined") return;
  const legacy = [
    "reservation",
    "reservationItems",
    "reservationCustomer",
    "reservationStatus",
  ] as const;
  for (const key of legacy) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }
}

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [status, setStatus] = useState<ReservationStatus>("draft");
  const [step, setStep] = useState<ReservationStep>("cart");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const skipPersistRef = useRef(false);

  useEffect(() => {
    clearLegacyKeysOnly();

    const pending = readPendingDraft();
    if (pending) {
      setItems(pending.items);
      setCustomer({ ...EMPTY_CUSTOMER, ...pending.customer });
      setStatus("draft");
      setStep(pending.step ?? "cart");
    } else {
      // No pending draft — ensure all reservation keys are gone.
      clearAllReservationStorage();
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || skipPersistRef.current) return;
    if (items.length === 0 || status !== "draft") {
      clearAllReservationStorage();
      return;
    }
    saveReservationDraft({
      items,
      customer,
      status: "draft",
      step,
      updatedAt: new Date().toISOString(),
    });
  }, [items, customer, status, step, hydrated]);

  const totals = useMemo(() => getCartTotals(items), [items]);

  const resetLocalState = useCallback(() => {
    setItems([]);
    setCustomer(EMPTY_CUSTOMER);
    setStatus("draft");
    setStep("cart");
    setSheetOpen(false);
  }, []);

  const clearReservation = useCallback(() => {
    skipPersistRef.current = true;
    clearAllReservationStorage();
    resetLocalState();
    window.setTimeout(() => {
      skipPersistRef.current = false;
    }, 0);
  }, [resetLocalState]);

  const addProduct = useCallback((productId: ProductId) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // Start at 1 — ₹50 minimum applies to the whole cart mix.
      return [...current, { productId, quantity: 1 }];
    });
    setStatus("draft");
  }, []);

  const setQuantity = useCallback((productId: ProductId, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== productId);
      }
      const exists = current.some((item) => item.productId === productId);
      if (!exists) {
        return [...current, { productId, quantity }];
      }
      return current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );
    });
    setStatus("draft");
  }, []);

  const removeProduct = useCallback((productId: ProductId) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
    setStatus("draft");
  }, []);

  const updateCustomer = useCallback((patch: Partial<CustomerDetails>) => {
    setCustomer((current) => ({ ...current, ...patch }));
  }, []);

  const openSheet = useCallback((nextStep: ReservationStep = "cart") => {
    setStep(nextStep);
    setSheetOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
  }, []);

  const continueReservation = useCallback(() => {
    setSheetOpen(true);
  }, []);

  const confirmAndOpenWhatsApp = useCallback(() => {
    const message = buildWhatsAppMessage(items, customer);
    const url = getWhatsAppUrl(message);

    window.open(url, "_blank", "noopener,noreferrer");

    skipPersistRef.current = true;
    clearAllReservationStorage();
    resetLocalState();

    window.location.assign("/");
  }, [items, customer, resetLocalState]);

  const hasPendingReservation =
    hydrated && items.length > 0 && status === "draft";

  const value: ReservationContextValue = {
    items,
    customer,
    status,
    step,
    sheetOpen,
    hydrated,
    pieceCount: totals.pieceCount,
    subtotal: totals.subtotal,
    isBulk: totals.isBulk,
    itemCount: totals.itemCount,
    hasPendingReservation,
    addProduct,
    setQuantity,
    removeProduct,
    updateCustomer,
    openSheet,
    closeSheet,
    setStep,
    continueReservation,
    confirmAndOpenWhatsApp,
    clearReservation,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation must be used within ReservationProvider");
  }
  return context;
}
