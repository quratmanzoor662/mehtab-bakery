"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { PRODUCT_MAP } from "@/constants/products";
import {
  EMPTY_CUSTOMER,
  buildWhatsAppMessage,
  clearReservationDraft,
  getCartTotals,
  getWhatsAppUrl,
  loadReservationDraft,
  saveReservationDraft,
} from "@/lib/reservation";

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
  hasDraft: boolean;
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

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [status, setStatus] = useState<ReservationStatus>("draft");
  const [step, setStep] = useState<ReservationStep>("cart");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const draft = loadReservationDraft();
    if (draft?.items?.length) {
      setItems(draft.items);
      setCustomer({ ...EMPTY_CUSTOMER, ...draft.customer });
      setStatus(draft.status ?? "draft");
      setStep(draft.step ?? "cart");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      clearReservationDraft();
      return;
    }
    saveReservationDraft({
      items,
      customer,
      status,
      step,
      updatedAt: new Date().toISOString(),
    });
  }, [items, customer, status, step, hydrated]);

  const totals = useMemo(() => getCartTotals(items), [items]);

  const addProduct = useCallback((productId: ProductId) => {
    const product = PRODUCT_MAP[productId];
    setItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { productId, quantity: product.minOrder }];
    });
    setStatus("draft");
  }, []);

  const setQuantity = useCallback((productId: ProductId, quantity: number) => {
    const product = PRODUCT_MAP[productId];
    setItems((current) => {
      if (quantity < product.minOrder) {
        return current.filter((item) => item.productId !== productId);
      }
      return current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );
    });
    setStatus("draft");
  }, []);

  const removeProduct = useCallback((productId: ProductId) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
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
    setStatus("awaiting_whatsapp");
    saveReservationDraft({
      items,
      customer,
      status: "awaiting_whatsapp",
      step: "confirm",
      updatedAt: new Date().toISOString(),
    });
    window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  }, [items, customer]);

  const clearReservation = useCallback(() => {
    setItems([]);
    setCustomer(EMPTY_CUSTOMER);
    setStatus("draft");
    setStep("cart");
    setSheetOpen(false);
    clearReservationDraft();
  }, []);

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
    hasDraft: hydrated && items.length > 0,
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
