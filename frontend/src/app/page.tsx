import { Hero } from "@/components/home/Hero";
import { Story } from "@/components/home/Story";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Story />
      <WhyChooseUs />
      {/* Anchors for nav links — sections to be built next */}
      <div id="breads" />
      <div id="bulk-orders" />
      <div id="contact" />
      <div id="reserve" />
    </main>
  );
}
