import Hero from "@/components/Hero";
import SuccessShowcase from "@/components/SuccessShowcase";
import Experience from "@/components/Experience";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import Cta from "@/components/Cta";

export default function Home() {
  return (
    <>
      <Hero />
      <SuccessShowcase />
      <Experience />
      <PortfolioShowcase />
      <Cta />
    </>
  );
}
