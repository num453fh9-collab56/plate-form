"use client";

import { useAuth } from "@/lib/auth";
import Hero from "@/components/Hero";
import GigGrid from "@/components/GigGrid";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import Cta from "@/components/Cta";
import Landing from "@/components/Landing";

export default function HomeView() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  return (
    <>
      <Hero />
      <GigGrid />
      <PortfolioShowcase />
      <Cta />
    </>
  );
}
