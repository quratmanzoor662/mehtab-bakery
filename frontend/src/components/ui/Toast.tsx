"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: number; title: string; subtitle: string };

type ToastContextValue = {
  showAdded: (productName: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showAdded = useCallback((productName: string) => {
    const id = Date.now();
    setToast({ id, title: "✓ Added", subtitle: productName });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 1000);
  }, []);

  return (
    <ToastContext.Provider value={{ showAdded }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4 sm:top-24">
        <AnimatePresence>
          {toast ? (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[var(--radius-lg)] border border-border/70 bg-surface px-5 py-3 text-center shadow-[var(--shadow-card)]"
            >
              <p className="text-sm font-semibold text-emerald-700">
                {toast.title}
              </p>
              <p className="font-heading text-lg font-semibold text-text">
                {toast.subtitle}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
