"use client";

import { FormEvent, useEffect, useState } from "react";
import { getErrorMessage } from "@/services/api";
import {
  fetchSettings,
  updateSettings,
  type BakerySettings,
} from "@/services/settings";

const empty: BakerySettings = {
  shop_open: true,
  business_hours: { open: "05:00", close: "19:00" },
  friday_break: { start: "12:30", end: "14:30" },
  today_message: "",
  phone_number: "",
  whatsapp_number: "",
  address: "",
  google_maps_url: "",
  instagram: "",
  facebook: "",
  temporary_closed: false,
  closure_reason: "",
  closure_message: "",
  allow_future_orders: true,
  reopen_date: null,
};

/** Convert API ISO datetime → datetime-local input value. */
function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // Already local-ish "2026-06-29T08:00:00"
    return value.slice(0, 16);
  }
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

/** datetime-local → ISO string (or null if empty). */
function fromDatetimeLocal(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().replace(/\.\d{3}Z$/, "");
}

function toSettingsState(data?: Partial<BakerySettings> | null): BakerySettings {
  return {
    shop_open: data?.shop_open ?? empty.shop_open,
    business_hours: {
      open: data?.business_hours?.open ?? empty.business_hours.open,
      close: data?.business_hours?.close ?? empty.business_hours.close,
    },
    friday_break: {
      start: data?.friday_break?.start ?? empty.friday_break.start,
      end: data?.friday_break?.end ?? empty.friday_break.end,
    },
    today_message: data?.today_message ?? "",
    phone_number: data?.phone_number ?? "",
    whatsapp_number: data?.whatsapp_number ?? "",
    address: data?.address ?? "",
    google_maps_url: data?.google_maps_url ?? "",
    instagram: data?.instagram ?? "",
    facebook: data?.facebook ?? "",
    temporary_closed: data?.temporary_closed ?? false,
    closure_reason: data?.closure_reason ?? "",
    closure_message: data?.closure_message ?? "",
    allow_future_orders: data?.allow_future_orders ?? true,
    reopen_date: data?.reopen_date ?? null,
  };
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<BakerySettings>(empty);
  const [reopenLocal, setReopenLocal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSettings();
        if (!alive) return;
        const next = toSettingsState(data);
        setForm(next);
        setReopenLocal(toDatetimeLocal(next.reopen_date));
      } catch (err) {
        if (alive) setError(getErrorMessage(err, "Failed to load settings"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload: BakerySettings = {
        ...form,
        reopen_date: form.temporary_closed
          ? fromDatetimeLocal(reopenLocal)
          : null,
        closure_reason: form.temporary_closed ? form.closure_reason : "",
        closure_message: form.temporary_closed ? form.closure_message : "",
      };
      const saved = await updateSettings(payload);
      const next = toSettingsState(saved);
      setForm(next);
      setReopenLocal(toDatetimeLocal(next.reopen_date));
      setMessage("Settings saved");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save settings"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-[#6B5344]">Loading settings…</p>;
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-[#E8D5C4] bg-white p-5 sm:p-6"
    >
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={form.shop_open}
          onChange={(e) => setForm({ ...form, shop_open: e.target.checked })}
        />
        Shop Open
      </label>

      <div>
        <p className="mb-2 text-sm font-medium text-[#2C1810]">Business Hours</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Opens</span>
            <input
              value={form.business_hours.open}
              onChange={(e) =>
                setForm({
                  ...form,
                  business_hours: {
                    ...form.business_hours,
                    open: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Closes</span>
            <input
              value={form.business_hours.close}
              onChange={(e) =>
                setForm({
                  ...form,
                  business_hours: {
                    ...form.business_hours,
                    close: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
            />
          </label>
        </div>
      </div>

      <fieldset className="space-y-4 rounded-2xl border border-[#E8D5C4] bg-[#FFF8F0]/60 p-4">
        <legend className="px-1 font-heading text-lg text-[#2C1810]">
          Temporary Closure
        </legend>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.temporary_closed}
            onChange={(e) =>
              setForm({ ...form, temporary_closed: e.target.checked })
            }
          />
          Temporarily Closed
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[#6B5344]">Reason</span>
          <input
            value={form.closure_reason}
            disabled={!form.temporary_closed}
            onChange={(e) =>
              setForm({ ...form, closure_reason: e.target.value })
            }
            placeholder="Eid Holiday, Heavy Snowfall…"
            className="w-full rounded-xl border border-[#E8D5C4] bg-white px-3 py-2 outline-none focus:border-[#8B4513] disabled:opacity-50"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[#6B5344]">Customer Message</span>
          <textarea
            rows={3}
            value={form.closure_message}
            disabled={!form.temporary_closed}
            onChange={(e) =>
              setForm({ ...form, closure_message: e.target.value })
            }
            placeholder="We are closed today for Eid. Orders will be prepared tomorrow."
            className="w-full rounded-xl border border-[#E8D5C4] bg-white px-3 py-2 outline-none focus:border-[#8B4513] disabled:opacity-50"
          />
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.allow_future_orders}
            disabled={!form.temporary_closed}
            onChange={(e) =>
              setForm({ ...form, allow_future_orders: e.target.checked })
            }
          />
          Allow reservations for tomorrow / future pickup
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-[#6B5344]">Automatically reopen</span>
          <input
            type="datetime-local"
            value={reopenLocal}
            disabled={!form.temporary_closed}
            onChange={(e) => setReopenLocal(e.target.value)}
            className="w-full rounded-xl border border-[#E8D5C4] bg-white px-3 py-2 outline-none focus:border-[#8B4513] disabled:opacity-50"
          />
          <span className="mt-1 block text-xs text-[#6B5344]">
            Optional. When this time passes, the bakery reopens automatically.
          </span>
        </label>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-1 block text-[#6B5344]">Phone</span>
        <input
          value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-[#6B5344]">WhatsApp</span>
        <input
          value={form.whatsapp_number}
          onChange={(e) =>
            setForm({ ...form, whatsapp_number: e.target.value })
          }
          className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-[#6B5344]">Address</span>
        <textarea
          rows={3}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-[#6B5344]">Instagram</span>
        <input
          value={form.instagram}
          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-[#6B5344]">Facebook</span>
        <input
          value={form.facebook}
          onChange={(e) => setForm({ ...form, facebook: e.target.value })}
          className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-[#6B5344]">Today&apos;s Message</span>
        <input
          value={form.today_message}
          onChange={(e) =>
            setForm({ ...form, today_message: e.target.value })
          }
          className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#8B4513] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6B3410] disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
