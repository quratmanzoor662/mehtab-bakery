import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ProductGrid } from "@/components/home/ProductGrid";
import { Contact } from "@/components/home/Contact";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Story />
      <WhyChooseUs />
      <ProductGrid />
      <Contact />
      <div id="bulk-orders" />
    </main>
  );
}
