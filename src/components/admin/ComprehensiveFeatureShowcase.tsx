import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  ShoppingCart,
  Bitcoin,
  MessageSquare,
  Zap,
  CreditCard,
  Shield,
  Users,
  Globe,
  Rocket,
  Database,
  Activity,
} from "lucide-react";

const comprehensiveFeatures = [
  {
    title: "Multi-Admin System",
    description: "8 distinct admin roles with RBAC",
    icon: Shield,
    status: "ready",
    details:
      "Super Admin, Finance, Content, Community Mod, Support, Marketplace, Crypto, Freelance",
  },
  {
    title: "Freelance Marketplace",
    description: "Complete job management with escrow",
    icon: Briefcase,
    status: "ready",
    details: "Job posting, proposals, milestones, payments, reviews",
  },
  {
    title: "E-commerce Platform",
    description: "Full marketplace with order management",
    icon: ShoppingCart,
    status: "ready",
    details: "Product listings, cart, checkout, reviews, seller dashboard",
  },
  {
    title: "P2P Crypto Trading",
    description: "USDT, ETH, BTC trading with disputes",
    icon: Bitcoin,
    status: "ready",
    details: "Trade offers, escrow, KYC verification, dispute resolution",
  },
  {
    title: "Real-time Chat",
    description: "Unified messaging across all modules",
    icon: MessageSquare,
    status: "ready",
    details: "WebSockets, typing indicators, read receipts, file attachments",
  },
  {
    title: "Multi-Currency Wallet",
    description: "USDT, ETH, BTC + Eloits",
    icon: CreditCard,
    status: "ready",
    details: "Secure transfers, escrow integration, transaction history",
  },
  {
    title: "Boost & Premium System",
    description: "Content promotion and subscriptions",
    icon: Zap,
    status: "ready",
    details: "Featured listings, premium tiers, boost credits, analytics",
  },
  {
    title: "Advanced Analytics",
    description: "Real-time platform monitoring",
    icon: Activity,
    status: "ready",
    details: "User metrics, financial reports, system health, performance",
  },
];

export function ComprehensiveFeatureShowcase() {
  const copyCommand = () => {
    navigator.clipboard.writeText("npm run dev:comprehensive");
  };

  const openDocs = () => {
    window.open("/README.comprehensive.md", "_blank");
  };

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl">
          🚀 Eloity Comprehensive Platform
        </CardTitle>
        <CardDescription className="text-lg">
          Complete multi-module backend with advanced admin controls
        </CardDescription>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant="default" className="bg-green-600">
            Production Ready
          </Badge>
          <Badge variant="outline">8 Admin Roles</Badge>
          <Badge variant="outline">Real-time Features</Badge>
          <Badge variant="outline">Multi-Currency</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {comprehensiveFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {feature.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {feature.details}
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {feature.status}
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Quick Setup Instructions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-sm">
                Copy environment template:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  npm run setup:env
                </code>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm">
                Setup database:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  npm run setup
                </code>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm">
                Create admin:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  npm run create-admin:comprehensive
                </code>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                4
              </div>
              <span className="text-sm">
                Start server:{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  npm run dev:comprehensive
                </code>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={copyCommand}
            className="bg-blue-600 hover:bg-blue-700"
          >
            📋 Copy Start Command
          </Button>
          <Button variant="outline" onClick={openDocs}>
            📖 View Full Documentation
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              window.open("http://localhost:3000/health", "_blank")
            }
          >
            🔍 Check Server Health
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Access the comprehensive admin panel at{" "}
            <code>http://localhost:3000/admin</code>
          </p>
          <p className="mt-1">
            All features include real-time WebSocket communication and advanced
            security
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
