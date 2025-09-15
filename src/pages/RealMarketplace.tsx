import React from "react";
import { Helmet } from "react-helmet-async";
import { RealMarketplace } from "@/components/real-data/RealMarketplace";

const MarketplacePage = () => {
  return (
    <>
      <Helmet>
        <title>Marketplace | Eloity</title>
        <meta
          name="description"
          content="Discover and purchase products from verified sellers in our secure marketplace"
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <RealMarketplace />
      </div>
    </>
  );
};

export default MarketplacePage;