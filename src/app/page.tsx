import Hero from "@/components/Hero";
import GigGrid from "@/components/GigGrid";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <>
      <Hero />
      <GigGrid />
      <PortfolioShowcase />
      <Cta />
    </>
  );
}
