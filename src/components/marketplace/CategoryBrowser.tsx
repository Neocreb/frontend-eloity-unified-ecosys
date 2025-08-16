import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Grid3x3,
  Smartphone,
  Shirt,
  Home,
  Gamepad2,
  Dumbbell,
  Book,
  Car,
  Heart,
  Package,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  image?: string;
  subcategories?: Category[];
  isPopular?: boolean;
  isTrending?: boolean;
  description?: string;
}

interface CategoryBrowserProps {
  categories?: Category[];
  onCategorySelect?: (category: Category) => void;
  showSubcategories?: boolean;
  layout?: "grid" | "list" | "sidebar";
  className?: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  smartphone: Smartphone,
  shirt: Shirt,
  home: Home,
  gamepad: Gamepad2,
  dumbbell: Dumbbell,
  book: Book,
  car: Car,
  grid: Grid3x3,
  package: Package,
};

// Default categories for production
const defaultCategories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "smartphone",
    productCount: 0,
    isPopular: true,
    description: "Latest gadgets and tech",
    subcategories: [
      {
        id: "smartphones",
        name: "Smartphones",
        icon: "smartphone",
        productCount: 0,
      },
      { id: "laptops", name: "Laptops", icon: "package", productCount: 0 },
      {
        id: "headphones",
        name: "Headphones",
        icon: "package",
        productCount: 0,
      },
      { id: "tablets", name: "Tablets", icon: "package", productCount: 0 },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: "shirt",
    productCount: 0,
    isTrending: true,
    description: "Trendy clothing and accessories",
    subcategories: [
      {
        id: "mens-clothing",
        name: "Men's Clothing",
        icon: "shirt",
        productCount: 0,
      },
      {
        id: "womens-clothing",
        name: "Women's Clothing",
        icon: "shirt",
        productCount: 12340,
      },
      { id: "shoes", name: "Shoes", icon: "package", productCount: 5890 },
      {
        id: "accessories",
        name: "Accessories",
        icon: "package",
        productCount: 2000,
      },
    ],
  },
  {
    id: "home-garden",
    name: "Home & Garden",
    icon: "home",
    productCount: 18930,
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
    description: "Everything for your home",
    subcategories: [
      { id: "furniture", name: "Furniture", icon: "home", productCount: 6780 },
      { id: "decor", name: "Home Decor", icon: "home", productCount: 4320 },
      { id: "kitchen", name: "Kitchen", icon: "package", productCount: 3890 },
      { id: "garden", name: "Garden", icon: "package", productCount: 3940 },
    ],
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    icon: "dumbbell",
    productCount: 12450,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
    isPopular: true,
    description: "Sports and outdoor gear",
    subcategories: [
      { id: "fitness", name: "Fitness", icon: "dumbbell", productCount: 4560 },
      { id: "outdoor", name: "Outdoor", icon: "package", productCount: 3890 },
      {
        id: "team-sports",
        name: "Team Sports",
        icon: "package",
        productCount: 2100,
      },
      {
        id: "water-sports",
        name: "Water Sports",
        icon: "package",
        productCount: 1900,
      },
    ],
  },
  {
    id: "toys-games",
    name: "Toys & Games",
    icon: "gamepad",
    productCount: 9820,
    image:
      "https://images.unsplash.com/photo-1558060370-d532d3d4c2dc?w=300&h=200&fit=crop",
    isTrending: true,
    description: "Fun for all ages",
    subcategories: [
      {
        id: "video-games",
        name: "Video Games",
        icon: "gamepad",
        productCount: 3240,
      },
      {
        id: "board-games",
        name: "Board Games",
        icon: "package",
        productCount: 1890,
      },
      {
        id: "kids-toys",
        name: "Kids Toys",
        icon: "package",
        productCount: 3690,
      },
      {
        id: "educational",
        name: "Educational",
        icon: "book",
        productCount: 1000,
      },
    ],
  },
  {
    id: "automotive",
    name: "Automotive",
    icon: "car",
    productCount: 7650,
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=200&fit=crop",
    description: "Car parts and accessories",
    subcategories: [
      { id: "car-parts", name: "Car Parts", icon: "car", productCount: 3420 },
      {
        id: "accessories",
        name: "Accessories",
        icon: "package",
        productCount: 2130,
      },
      { id: "tools", name: "Tools", icon: "package", productCount: 1100 },
      { id: "tires", name: "Tires", icon: "package", productCount: 1000 },
    ],
  },
];

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  categories = defaultCategories,
  onCategorySelect,
  showSubcategories = true,
  layout = "grid",
  className,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category.id);
    onCategorySelect?.(category);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Package;
    return <IconComponent className="w-6 h-6" />;
  };

  const formatProductCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (layout === "sidebar") {
    return (
      <div className={cn("w-64 bg-white border-r border-gray-200", className)}>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getIcon(category.icon)}
                    <div>
                      <span className="font-medium">{category.name}</span>
                      <div className="text-xs text-gray-500">
                        {formatProductCount(category.productCount)} items
                      </div>
                    </div>
                  </div>
                  {category.subcategories && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Subcategories */}
                {showSubcategories &&
                  selectedCategory === category.id &&
                  category.subcategories && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => onCategorySelect?.(sub)}
                          className="w-full flex items-center justify-between p-2 rounded text-left text-sm hover:bg-gray-50"
                        >
                          <span>{sub.name}</span>
                          <span className="text-xs text-gray-500">
                            {formatProductCount(sub.productCount)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div className={cn("w-full", className)}>
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => handleCategoryClick(category)}
                className="w-full p-4 flex items-center gap-4 text-left"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    getIcon(category.icon)
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {category.isTrending && (
                      <Badge variant="destructive" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {category.description}
                  </p>
                  <span className="text-sm text-gray-500">
                    {category.productCount.toLocaleString()} products
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              </button>

              {/* Subcategories */}
              {showSubcategories && category.subcategories && (
                <div className="px-4 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCategorySelect?.(sub);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                      >
                        {sub.name}
                        <span className="text-gray-500">
                          ({formatProductCount(sub.productCount)})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleCategoryClick(category)}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {/* Category Image/Icon */}
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  {getIcon(category.icon)}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {category.isPopular && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
                {category.isTrending && (
                  <Badge variant="destructive" className="text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>

              {/* Hover overlay with subcategories */}
              {showSubcategories &&
                category.subcategories &&
                hoveredCategory === category.id && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2">
                    <div className="text-center">
                      <div className="text-white text-xs space-y-1">
                        {category.subcategories.slice(0, 4).map((sub) => (
                          <div key={sub.id} className="hover:text-blue-300">
                            {sub.name}
                          </div>
                        ))}
                        {category.subcategories.length > 4 && (
                          <div className="text-blue-300">
                            +{category.subcategories.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Category Info */}
            <div className="p-3">
              <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {category.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatProductCount(category.productCount)} products
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBrowser;
