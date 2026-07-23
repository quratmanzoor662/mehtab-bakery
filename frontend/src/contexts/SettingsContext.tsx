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
import {
  canAcceptOrders,
  fetchSettings,
  forcesFuturePickup,
  isTemporarilyClosed,
  type BakerySettings,
} from "@/services/settings";

type SettingsContextValue = {
  settings: BakerySettings | null;
  loading: boolean;
  closed: boolean;
  orderingAllowed: boolean;
  futurePickupOnly: boolean;
  refresh: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BakerySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchSettings();
      setSettings(data);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      closed: isTemporarilyClosed(settings),
      orderingAllowed: canAcceptOrders(settings),
      futurePickupOnly: forcesFuturePickup(settings),
      refresh,
    }),
    [settings, loading, refresh],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useBakerySettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useBakerySettings must be used within SettingsProvider");
  }
  return ctx;
}
