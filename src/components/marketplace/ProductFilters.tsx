import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { MarketplaceService } from "@/services/marketplaceService";

interface ProductFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
}

const ProductFilters = ({ 
  activeCategory, 
  onCategoryChange, 
  onSearch 
}: ProductFiltersProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const { setFilter } = useMarketplace();
  
  // Fetch real product tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const tags = await MarketplaceService.getProductTags();
        setProductTags(tags);
      } catch (error) {
        console.error("Error fetching product tags:", error);
        // Fallback to hardcoded tags if real data fetch fails
        setProductTags([
          "wireless", "audio", "electronics", "wearable", "fitness", 
          "apparel", "casual", "fashion", "skincare", "kitchen", 
          "home", "organic", "sports"
        ]);
      } finally {
        setLoadingTags(false);
      }
    };
    
    fetchTags();
  }, []);
  
  const handleSearch = () => {
    onSearch(searchInput);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const handleClearSearch = () => {
    setSearchInput("");
    onSearch("");
  };
  
  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setFilter({ minPrice: value[0], maxPrice: value[1] });
  };
  
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setFilter({ tags: newTags.length > 0 ? newTags : undefined });
  };
  
  const handleClearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedTags([]);
    setSearchInput("");
    onSearch("");
    onCategoryChange("all");
    setFilter({});
  };
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          placeholder="Search products"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-9 pr-9"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Accordion type="multiple" defaultValue={["price", "tags"]} className="w-full">
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[0, 1000]}
                value={priceRange}
                max={1000}
                step={10}
                onValueChange={handlePriceChange}
              />
              <div className="flex justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="tags">
          <AccordionTrigger>Tags</AccordionTrigger>
          <AccordionContent>
            {loadingTags ? (
              <div className="flex flex-wrap gap-2">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {productTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={handleClearFilters}
      >
        <Filter className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    </div>
  );
};

export default ProductFilters;