import { api } from "@/services/api";

export type UploadResponse = {
  filename: string;
  image: string;
};

export async function uploadProductImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadResponse>("/uploads/products", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteProductImage(filename: string) {
  const { data } = await api.delete<{ filename: string; message: string }>(
    `/uploads/products/${encodeURIComponent(filename)}`,
  );
  return data;
}
