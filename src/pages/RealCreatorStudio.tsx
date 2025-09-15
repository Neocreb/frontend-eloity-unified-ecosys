import React from "react";
import { Helmet } from "react-helmet-async";
import { RealDataAnalytics } from "@/components/real-data/RealDataAnalytics";
import { RealDataDashboard } from "@/components/real-data/RealDataDashboard";

const RealCreatorStudio = () => {
  return (
    <>
      <Helmet>
        <title>Creator Studio | Eloity</title>
        <meta
          name="description"
          content="Analytics dashboard and creator tools for content management"
        />
      </Helmet>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Creator Studio</h1>
            <p className="text-muted-foreground">Real-time analytics and insights for your content</p>
          </div>

          {/* Real Analytics */}
          <RealDataAnalytics />
          
          {/* Real Dashboard */}
          <RealDataDashboard />
        </div>
      </div>
    </>
  );
};

export default RealCreatorStudio;