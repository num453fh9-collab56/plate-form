"use client";

import { useAuth } from "@/lib/auth";
import Hero from "@/components/Hero";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import Cta from "@/components/Cta";
import Landing from "@/components/Landing";

function LoggedInHome() {
  return (
    <>
      <Hero />
      <PortfolioShowcase />
      <Cta />
    </>
  );
}

export default function HomeView() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  return <LoggedInHome />;
}
