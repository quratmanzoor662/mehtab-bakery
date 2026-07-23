export type NavLink = {
  label: string;
  href: string;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#" },
  { label: "Our Breads", href: "#breads" },
  { label: "About", href: "#about" },
  { label: "Bulk Orders", href: "#bulk-orders" },
  { label: "Contact", href: "#contact" },
];

export const RESERVE_CTA = {
  label: "Reserve Fresh Bread",
  href: "#breads",
} as const;

export const SITE = {
  name: "Mehtab Bakery",
  tagline: "Fresh from the Tandoor, Served with Tradition",
} as const;
