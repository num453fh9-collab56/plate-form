"use client";

import { useAuth } from "@/lib/auth";
import Hero from "@/components/Hero";
import GigGrid from "@/components/GigGrid";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import Cta from "@/components/Cta";
import Landing from "@/components/Landing";

function BuyerHome() {
  return (
    <>
      <Hero variant="buyer" />
      <GigGrid />
      <Cta />
    </>
  );
}

function FreelancerHome() {
  return (
    <>
      <Hero />
      <GigGrid />
      <PortfolioShowcase />
      <Cta />
    </>
  );
}

export default function HomeView() {
  const { user, profile } = useAuth();
  if (!user) return <Landing />;

  if (profile.role === "buyer") return <BuyerHome />;
  return <FreelancerHome />;
}
