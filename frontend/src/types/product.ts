export type ProductId = "girda" | "tailwoor" | "kulcha" | "bakirkhani";

export type Product = {
  id: ProductId;
  name: string;
  price: number;
  minOrder: number;
  description: string;
  image: string;
  alt: string;
};
