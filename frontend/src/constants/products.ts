import type { Product } from "@/types/product";
import { CONTACT } from "@/constants/contact";

export const PRODUCTS: Product[] = [
  {
    id: "girda",
    name: "Girda",
    price: 10,
    minOrder: 1,
    description:
      "Soft, round Kashmiri bread—fresh from the tandoor and perfect for every morning.",
    image: "/images/products/girda.jpg",
    alt: "Fresh Girda bread from Mehtab Bakery",
  },
  {
    id: "tailwoor",
    name: "Tailwoor",
    price: 5,
    minOrder: 1,
    description:
      "Light and flaky traditional Tailwoor, baked daily for a crisp, comforting bite.",
    image: "/images/products/tailwoor.jpeg",
    alt: "Traditional Tailwoor bread",
  },
  {
    id: "kulcha",
    name: "Kulcha",
    price: 10,
    minOrder: 1,
    description:
      "Golden Kashmiri Kulcha with a tender crumb—ideal with tea or a hearty meal.",
    image: "/images/products/kulcha.jpeg",
    alt: "Kashmiri Kulcha bread",
  },
  {
    id: "bakirkhani",
    name: "Bakirkhani",
    price: 10,
    minOrder: 1,
    description:
      "Layered, buttery Bakirkhani crafted with authentic recipes and quality ingredients.",
    image: "/images/products/bakirkhani.jpeg",
    alt: "Layered Bakirkhani bread",
  },
];

export const PRODUCT_MAP = Object.fromEntries(
  PRODUCTS.map((product) => [product.id, product]),
) as Record<Product["id"], Product>;

/** Minimum total reservation value in rupees (cart total, any mix of breads). */
export const MIN_RESERVATION_AMOUNT = 50;

export const BULK_THRESHOLD = 50;
export const BULK_MIN_CUSTOM_PRICE = 7;

export const PICKUP_TIME_SLOTS = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
] as const;

export const WHATSAPP_NUMBER = "919320630345";
