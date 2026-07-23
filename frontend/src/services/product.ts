import { api } from "@/services/api";

export type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  min_order: number;
  available: boolean;
  stock: number;
  featured: boolean;
  slug?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductInput = {
  name: string;
  price: number;
  description: string;
  image: string;
  min_order: number;
  available: boolean;
  stock: number;
  featured: boolean;
};

export type ProductsResponse = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  products: Product[];
};

export async function fetchProducts(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<ProductsResponse>("/products/", { params });
  return data;
}

export async function createProduct(payload: ProductInput) {
  const { data } = await api.post<{ id: string; message: string }>(
    "/products/",
    payload,
  );
  return data;
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductInput>,
) {
  const { data } = await api.put<{ message: string }>(
    `/products/${id}`,
    payload,
  );
  return data;
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete<{ message: string }>(`/products/${id}`);
  return data;
}
