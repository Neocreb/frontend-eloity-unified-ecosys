// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { Product } from "@/types/marketplace";
import { MultiStepProductForm } from "@/components/marketplace/multi-step-form/MultiStepProductForm";

const MarketplaceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getProduct } = useMarketplace();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | undefined>(undefined);

  // Check if we're editing a product
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const editId = urlParams.get("edit");

    if (editId) {
      setIsEditing(true);
      setCurrentProductId(editId);

      // Load product data for editing
      const product = getProduct(editId);
      if (product) {
        setEditProduct(product);
      }
    }
  }, [location.search, getProduct]);

  const handleSuccess = () => {
    navigate("/app/marketplace/my");
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/marketplace/my")}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Product" : "List New Product"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Update your product details"
              : "Add a new product to your marketplace"}
          </p>
        </div>
      </div>

      <MultiStepProductForm 
        onSuccess={handleSuccess} 
        editProduct={editProduct} 
      />
    </div>
  );
};

export default MarketplaceList;