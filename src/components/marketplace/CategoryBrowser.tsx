import React, { useState, useEffect } from "react";
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
import { categoryService } from "@/services/categoryService";
import { useToast } from "@/hooks/use-toast";

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

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  categories,
  onCategorySelect,
  showSubcategories = true,
  layout = "grid",
  className,
}) => {
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch real categories data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await categoryService.getCategories();
        setLocalCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
        // Fallback to empty array if real data fetch fails
        setLocalCategories([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if categories weren't passed as props
    if (!categories) {
      fetchCategories();
    } else {
      setLocalCategories(categories);
      setLoading(false);
    }
  }, [categories, toast]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categoriesToDisplay = categories || localCategories;

  if (layout === "sidebar") {
    return (
      <div className={cn("w-64 bg-white border-r border-gray-200", className)}>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <div className="space-y-1">
            {categoriesToDisplay.map((category) => (
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
          {categoriesToDisplay.map((category) => (
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
        {categoriesToDisplay.map((category) => (
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