// @ts-nocheck
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  ShoppingCart,
  Video,
  TrendingUp,
  MessageSquare,
  Home,
  Bell,
  Search,
  User,
  Menu,
  Store,
  Camera,
  BarChart3,
  Heart
} from 'lucide-react';

// Import enhanced components
import EnhancedProductDetail from '@/components/marketplace/EnhancedProductDetail';
import EnhancedVideoCreator from '@/components/video/EnhancedVideoCreator';
import AdvancedTradingInterface from '@/components/crypto/AdvancedTradingInterface';
import EnhancedSocialFeed from '@/components/feed/EnhancedSocialFeed';

const EnhancedPlatform: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'feed' | 'marketplace' | 'videos' | 'crypto'>('feed');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { formatCompactCurrency } = require('@/utils/currencyUtils');

  const navigationItems = [
    { id: 'feed', label: 'Feed', icon: Home, description: 'Social media feed with Instagram/Facebook features' },
    { id: 'marketplace', label: 'Marketplace', icon: Store, description: 'E-commerce platform with Amazon/eBay features' },
    { id: 'videos', label: 'Videos', icon: Video, description: 'Short video platform with TikTok features' },
    { id: 'crypto', label: 'Trading', icon: BarChart3, description: 'Crypto trading with Binance features' }
  ];

  const platformStats = {
    feed: { users: '2.1M', posts: '145K', engagement: '87%' },
    marketplace: { products: '500K+', sellers: '25K+', transactions: formatCompactCurrency(2100000000, 'USD') },
    videos: { creators: '890K', views: '12.5B', uploads: '2.3M' },
    crypto: { pairs: '200+', volume: formatCompactCurrency(450000000, 'USD'), users: '180K' }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'feed':
        return <EnhancedSocialFeed />;
      case 'marketplace':
        return selectedProduct ? (
          <div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedProduct(null)}
              className="mb-4"
            >
              ← Back to Marketplace
            </Button>
            <EnhancedProductDetail productId={selectedProduct} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold mb-4">Enhanced Marketplace</h2>
              <p className="text-gray-600 mb-6">
                Amazon/eBay-level e-commerce with advanced product discovery, reviews, Q&A, and seller tools
              </p>
              <Button onClick={() => setSelectedProduct('demo-product')}>
                View Demo Product
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Advanced Search</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered search with filters, autocomplete, and visual search
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-red-600" />
                  <h3 className="font-semibold mb-2">Reviews & Ratings</h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive review system with photos, Q&A, and verified purchases
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Seller Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Professional dashboard with sales metrics and inventory management
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'videos':
        return <EnhancedVideoCreator />;
      case 'crypto':
        return <AdvancedTradingInterface />;
      default:
        return <EnhancedSocialFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold">Eloity</span>
              </div>
              
              <nav className="hidden md:flex gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      onClick={() => setActiveSection(item.id as any)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Platform Stats Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="font-semibold">{platformStats[activeSection].users || platformStats[activeSection].products}</div>
              <div className="opacity-90">Users/Products</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{platformStats[activeSection].posts || platformStats[activeSection].volume}</div>
              <div className="opacity-90">Activity/Volume</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{platformStats[activeSection].engagement || platformStats[activeSection].transactions}</div>
              <div className="opacity-90">Engagement/Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Description */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              {navigationItems.find(item => item.id === activeSection)?.label} Platform
            </h1>
            <p className="text-gray-600">
              {navigationItems.find(item => item.id === activeSection)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderMainContent()}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                onClick={() => setActiveSection(item.id as any)}
                className="flex flex-col items-center gap-1 h-auto py-2"
                size="sm"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlatform;
