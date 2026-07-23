"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { mediaUrl, imageFilename } from "@/lib/api-config";
import { getErrorMessage } from "@/services/api";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
  type Product,
  type ProductInput,
} from "@/services/product";
import { deleteProductImage } from "@/services/upload";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProducts({
        search: query || undefined,
        page,
        limit: 10,
      });
      setProducts(res.products);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(payload: ProductInput, previousImage?: string) {
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing._id, payload);
        if (
          previousImage &&
          payload.image &&
          previousImage !== payload.image
        ) {
          const oldName = imageFilename(previousImage);
          if (oldName) {
            try {
              await deleteProductImage(oldName);
            } catch {
              // Non-fatal: product already updated
            }
          }
        }
      } else {
        await createProduct(payload);
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete “${product.name}”?`)) return;
    try {
      await deleteProduct(product._id);
      const filename = imageFilename(product.image);
      if (filename) {
        try {
          await deleteProductImage(filename);
        } catch {
          // ignore orphan image cleanup failures
        }
      }
      await load();
    } catch (err) {
      alert(getErrorMessage(err, "Delete failed"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5344]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-[#E8D5C4] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#8B4513]"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-[#E8D5C4] bg-white px-4 text-sm hover:bg-[#FFF8F0]"
          >
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B4513] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6B3410]"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#E8D5C4] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#FFF8F0] text-[#6B5344]">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Available</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6B5344]">
                    Loading…
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6B5344]">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-t border-[#E8D5C4]/70">
                    <td className="px-4 py-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl(p.image)}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">₹{p.price}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      {p.available ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      {p.featured ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                          className="rounded-lg border border-[#E8D5C4] px-2.5 py-1 text-xs hover:bg-[#FFF8F0]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(p)}
                          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#E8D5C4] px-4 py-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-[#E8D5C4] px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-[#6B5344]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-[#E8D5C4] px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {formOpen ? (
        <ProductForm
          initial={editing}
          saving={saving}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSave}
        />
      ) : null}
    </div>
  );
}
