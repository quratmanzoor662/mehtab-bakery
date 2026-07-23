"use client";

import { AlertTriangle } from "lucide-react";
import { useBakerySettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/Button";

export function ClosureBanner() {
  const { closed, orderingAllowed, settings, loading } = useBakerySettings();

  if (loading || !closed || !settings) return null;

  const title = orderingAllowed ? "Closed Today" : "Bakery Closed";
  const message =
    settings.closure_message?.trim() ||
    settings.closure_reason?.trim() ||
    "We are temporarily closed.";

  return (
    <section className="border-b border-amber-200/80 bg-amber-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-800">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-heading text-xl font-semibold text-amber-950">
              ⚠️ {title}
            </p>
            {settings.closure_reason ? (
              <p className="mt-0.5 text-xs font-semibold tracking-wide text-amber-800/80 uppercase">
                {settings.closure_reason}
              </p>
            ) : null}
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-amber-950/85">
              {message}
            </p>
            {orderingAllowed ? (
              <p className="mt-2 text-sm font-medium text-amber-900">
                Orders placed today will be prepared for tomorrow.
              </p>
            ) : (
              <p className="mt-2 text-sm font-medium text-amber-900">
                Ordering is temporarily unavailable.
              </p>
            )}
          </div>
        </div>

        {orderingAllowed ? (
          <Button href="#breads" className="shrink-0 self-start sm:self-center">
            Reserve for Tomorrow
          </Button>
        ) : null}
      </div>
    </section>
  );
}
