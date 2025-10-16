import React from "react";
import Layout from "@/home/Layout";
import HeroSection from "@/home/HeroSection";
import FeaturesSection from "@/home/FeaturesSection";
import AdvancedFeaturesSection from "@/home/AdvancedFeaturesSection";
import ProblemSolutionSection from "@/home/ProblemSolutionSection";
import WhyEloitySection from "@/home/WhyEloitySection";
import ScreenshotCarousel from "@/home/ScreenshotCarousel";
import NewsletterSection from "@/home/NewsletterSection";

const LandingPage = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <AdvancedFeaturesSection />
      <ProblemSolutionSection />
      <WhyEloitySection />
      <ScreenshotCarousel />
      <NewsletterSection />
    </Layout>
  );
};

export default LandingPage;
