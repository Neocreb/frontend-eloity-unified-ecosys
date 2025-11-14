import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  Download,
  BookOpen,
  FileText,
  Package as PhysicalIcon
} from "lucide-react";

const AdminMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 1247,
    activeSellers: 89,
    totalSales: 45620,
    pendingApprovals: 23,
  });

  const mockProducts = [
    {
      id: "1",
      name: "Wireless Headphones",
      seller: "TechStore",
      price: 129.99,
      status: "active",
      sales: 45,
      category: "Electronics",
      productType: "physical"
    },
    {
      id: "2",
      name: "Coffee Mug",
      seller: "HomeGoods",
      price: 15.99,
      status: "pending",
      sales: 12,
      category: "Home & Garden",
      productType: "physical"
    },
    {
      id: "3",
      name: "Programming Course",
      seller: "EduTech",
      price: 99.99,
      status: "active",
      sales: 234,
      category: "Digital",
      productType: "digital"
    },
    {
      id: "4",
      name: "Business Consulting",
      seller: "BizExperts",
      price: 150.00,
      status: "active",
      sales: 67,
      category: "Services",
      productType: "service"
    },
    {
      id: "5",
      name: "E-book: Marketing Guide",
      seller: "AuthorPro",
      price: 29.99,
      status: "active",
      sales: 156,
      category: "Digital",
      productType: "digital"
    },
  ];

  const mockSellers = [
    {
      id: "1",
      name: "TechStore",
      products: 45,
      sales: 12340,
      rating: 4.8,
      status: "verified",
    },
    {
      id: "2",
      name: "HomeGoods",
      products: 23,
      sales: 5670,
      rating: 4.5,
      status: "active",
    },
    {
      id: "3",
      name: "EduTech",
      products: 67,
      sales: 23400,
      rating: 4.9,
      status: "verified",
    },
  ];

  // Filter products by search term
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group products by type
  const physicalProducts = filteredProducts.filter(p => p.productType === "physical");
  const digitalProducts = filteredProducts.filter(p => p.productType === "digital");
  const serviceProducts = filteredProducts.filter(p => p.productType === "service");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Marketplace Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage products, sellers, and marketplace operations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-blue-500/10 p-3 rounded-full mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {stats.totalProducts.toLocaleString()}
            </CardTitle>
            <CardDescription>Total Products</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-500/10 p-3 rounded-full mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {stats.activeSellers}
            </CardTitle>
            <CardDescription>Active Sellers</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-yellow-500/10 p-3 rounded-full mb-4">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              ${stats.totalSales.toLocaleString()}
            </CardTitle>
            <CardDescription>Total Sales</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-red-500/10 p-3 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {stats.pendingApprovals}
            </CardTitle>
            <CardDescription>Pending Approvals</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>
                    View and manage all marketplace products
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Product Type Tabs */}
              <Tabs defaultValue="all" className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">All ({filteredProducts.length})</TabsTrigger>
                  <TabsTrigger value="physical">Physical ({physicalProducts.length})</TabsTrigger>
                  <TabsTrigger value="digital">Digital ({digitalProducts.length})</TabsTrigger>
                  <TabsTrigger value="service">Services ({serviceProducts.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <ProductTable products={filteredProducts} />
                </TabsContent>
                
                <TabsContent value="physical">
                  <ProductTable products={physicalProducts} />
                </TabsContent>
                
                <TabsContent value="digital">
                  <ProductTable products={digitalProducts} />
                </TabsContent>
                
                <TabsContent value="service">
                  <ProductTable products={serviceProducts} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Seller Management</CardTitle>
                  <CardDescription>
                    View and manage marketplace sellers
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search sellers..."
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSellers.map((seller) => (
                  <div
                    key={seller.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div>
                        <h3 className="font-medium">{seller.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{seller.products} products</span>
                          <span>${seller.sales.toLocaleString()} sales</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1">{seller.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          seller.status === "verified"
                            ? "default"
                            : seller.status === "active"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {seller.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Analytics</CardTitle>
              <CardDescription>
                Insights and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Sales Overview</h3>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Sales chart visualization</span>
                  </div>
                </div>
                
                <div className="p-6 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Top Categories</h3>
                    <Package className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Electronics</span>
                        <span className="text-sm">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Digital Products</span>
                        <span className="text-sm">25%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Home & Garden</span>
                        <span className="text-sm">20%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Product Table Component
const ProductTable = ({ products }: { products: any[] }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>by {product.seller}</span>
                <span>{product.category}</span>
                <div className="flex items-center">
                  {product.productType === "digital" ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Digital
                    </Badge>
                  ) : product.productType === "service" ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Service
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <PhysicalIcon className="w-3 h-3" />
                      Physical
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{product.sales} sales</p>
            </div>
            <Badge
              variant={
                product.status === "active"
                  ? "default"
                  : product.status === "pending"
                  ? "secondary"
                  : "outline"
              }
            >
              {product.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Star Icon Component
const Star = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

export default AdminMarketplace;