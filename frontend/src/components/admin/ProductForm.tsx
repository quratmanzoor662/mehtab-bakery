"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Product, ProductInput } from "@/services/product";
import { uploadProductImage } from "@/services/upload";
import { getErrorMessage } from "@/services/api";
import { mediaUrl } from "@/lib/api-config";

type ProductFormProps = {
  initial?: Product | null;
  saving: boolean;
  onSubmit: (payload: ProductInput, previousImage?: string) => Promise<void>;
  onClose: () => void;
};

const empty: ProductInput = {
  name: "",
  price: 20,
  description: "",
  image: "",
  min_order: 1,
  available: true,
  stock: 0,
  featured: false,
};

/** Always return defined values so inputs stay controlled. */
function toFormState(product?: Product | null): ProductInput {
  if (!product) return { ...empty };
  return {
    name: product.name ?? "",
    price: product.price ?? 20,
    description: product.description ?? "",
    image: product.image ?? "",
    min_order: product.min_order ?? 1,
    available: product.available ?? true,
    stock: product.stock ?? 0,
    featured: product.featured ?? false,
  };
}

export function ProductForm({
  initial,
  saving,
  onSubmit,
  onClose,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductInput>(() => toFormState(initial));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(() =>
    initial?.image ? mediaUrl(initial.image) : "",
  );

  useEffect(() => {
    setForm(toFormState(initial));
    setPreview(initial?.image ? mediaUrl(initial.image) : "");
    setError("");
  }, [initial]);

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadProductImage(file);
      setForm((prev) => ({ ...prev, image: uploaded.image }));
      setPreview(mediaUrl(uploaded.image));
    } catch (err) {
      setError(getErrorMessage(err, "Image upload failed"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.image) {
      setError("Upload a product image first");
      return;
    }
    try {
      await onSubmit(form, initial?.image);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save product"));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl">
            {initial ? "Edit Product" : "Add Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#6B5344] hover:text-[#2C1810]"
          >
            Close
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
            {uploading ? (
              <p className="mt-1 text-xs text-[#6B5344]">Uploading…</p>
            ) : null}
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="mt-3 h-28 w-28 rounded-xl object-cover"
              />
            ) : null}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Name</span>
            <input
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-[#6B5344]">Price (₹)</span>
              <input
                required
                type="number"
                min={1}
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-[#6B5344]">Stock</span>
              <input
                required
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
                className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Description</span>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[#6B5344]">Min order</span>
            <input
              type="number"
              min={1}
              value={form.min_order}
              onChange={(e) =>
                setForm({
                  ...form,
                  min_order:
                    e.target.value === "" ? 1 : Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-[#E8D5C4] px-3 py-2 outline-none focus:border-[#8B4513]"
            />
          </label>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.checked })
                }
              />
              Available
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({ ...form, featured: e.target.checked })
                }
              />
              Featured
            </label>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full rounded-xl bg-[#8B4513] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#6B3410] disabled:opacity-60"
          >
            {saving ? "Saving…" : initial ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
