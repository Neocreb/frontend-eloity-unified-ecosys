// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductTypeStep } from './ProductTypeStep';
import { ProductDetailsStep } from './ProductDetailsStep';
import { ProductMediaStep } from './ProductMediaStep';
import { ProductInventoryStep } from './ProductInventoryStep';
import { ProductReviewStep } from './ProductReviewStep';
import { useToast } from '@/components/ui/use-toast';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/marketplace';
import { ChevronLeft, ChevronRight, Home, Package, Download, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FormData {
  // Product type
  productType: "physical" | "digital" | "service";
  
  // Basic info
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  category: string;
  subcategory?: string;
  tags: string;
  
  // Digital product fields
  digitalProductType?: string;
  downloadUrl?: string;
  licenseType?: "single" | "multiple" | "unlimited";
  downloadLimit?: string;
  downloadExpiryDays?: string;
  fileSize?: string;
  fileFormat?: string;
  author?: string;
  coAuthor?: string;
  publisher?: string;
  publicationDate?: string;
  isbn?: string;
  pages?: string;
  language?: string;
  ageGroup?: string;
  skillLevel?: string;
  courseDuration?: string;
  courseModules?: string;
  includesSourceFiles?: boolean;
  
  // Physical product fields
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  size?: string;
  color?: string;
  material?: string;
  careInstructions?: string;
  assemblyRequired?: boolean;
  assemblyTime?: string;
  packageLength?: string;
  packageWidth?: string;
  packageHeight?: string;
  packageWeight?: string;
  
  // Media
  mainImage: string;
  additionalImages: string[];
  videos: string[];
  
  // Inventory
  inStock: boolean;
  stockQuantity?: string;
  isNew: boolean;
}

const INITIAL_FORM_DATA: FormData = {
  productType: "physical",
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  subcategory: "",
  tags: "",
  digitalProductType: "",
  downloadUrl: "",
  licenseType: "single",
  downloadLimit: "",
  downloadExpiryDays: "",
  fileSize: "",
  fileFormat: "",
  author: "",
  coAuthor: "",
  publisher: "",
  publicationDate: "",
  isbn: "",
  pages: "",
  language: "",
  ageGroup: "all",
  skillLevel: "beginner",
  courseDuration: "",
  courseModules: "",
  includesSourceFiles: false,
  weight: "",
  length: "",
  width: "",
  height: "",
  size: "",
  color: "",
  material: "",
  careInstructions: "",
  assemblyRequired: false,
  assemblyTime: "",
  packageLength: "",
  packageWidth: "",
  packageHeight: "",
  packageWeight: "",
  mainImage: "",
  additionalImages: [],
  videos: [],
  inStock: true,
  stockQuantity: "",
  isNew: true
};

export const MultiStepProductForm = ({ onSuccess, editProduct }: { onSuccess: () => void; editProduct?: Product }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(editProduct ? {
    ...INITIAL_FORM_DATA,
    ...editProduct,
    price: editProduct.price?.toString() || "",
    discountPrice: editProduct.discountPrice?.toString() || "",
    stockQuantity: editProduct.stockQuantity?.toString() || "",
    weight: editProduct.weight?.toString() || "",
    length: editProduct.dimensions?.length?.toString() || "",
    width: editProduct.dimensions?.width?.toString() || "",
    height: editProduct.dimensions?.height?.toString() || "",
    packageLength: editProduct.packageDimensions?.length?.toString() || "",
    packageWidth: editProduct.packageDimensions?.width?.toString() || "",
    packageHeight: editProduct.packageDimensions?.height?.toString() || "",
    packageWeight: editProduct.packageWeight?.toString() || "",
    pages: editProduct.pages?.toString() || "",
    downloadLimit: editProduct.downloadLimit?.toString() || "",
    downloadExpiryDays: editProduct.downloadExpiryDays?.toString() || "",
    fileSize: editProduct.fileSize?.toString() || "",
    courseModules: editProduct.courseModules?.toString() || "",
  } : INITIAL_FORM_DATA);
  
  const { toast } = useToast();
  const { createProduct, updateProduct } = useMarketplace();
  const { user } = useAuth();
  
  const steps = [
    { id: 'type', title: 'Product Type', description: 'Select the type of product you want to list' },
    { id: 'details', title: 'Product Details', description: 'Provide essential information about your product' },
    { id: 'media', title: 'Media', description: 'Upload images and videos to showcase your product' },
    { id: 'inventory', title: 'Inventory', description: 'Manage your product stock and availability' },
    { id: 'review', title: 'Review', description: 'Review and submit your product listing' }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const updateFormData = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to list a product",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const price = parseFloat(formData.price);
      const discountPrice = formData.discountPrice ? parseFloat(formData.discountPrice) : undefined;
      
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price",
          variant: "destructive"
        });
        return;
      }
      
      if (discountPrice && (isNaN(discountPrice) || discountPrice <= 0 || discountPrice >= price)) {
        toast({
          title: "Invalid Discount Price",
          description: "Discount price must be greater than 0 and less than the regular price",
          variant: "destructive"
        });
        return;
      }
      
      // Use the uploaded image URL or a placeholder
      const imageUrl = formData.mainImage || 'https://placehold.co/600x400?text=Product+Image';
      
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price,
        discountPrice,
        category: formData.category,
        subcategory: formData.subcategory,
        image: imageUrl,
        images: [imageUrl, ...formData.additionalImages],
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        inStock: formData.inStock,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : undefined,
        isNew: formData.isNew,
        productType: formData.productType,
        rating: 0,
        reviewCount: 0,
      };
      
      // Add digital product fields if applicable
      if (formData.productType === 'digital' && formData.digitalProductType) {
        productData.digitalProductType = formData.digitalProductType;
        productData.downloadUrl = formData.downloadUrl;
        productData.licenseType = formData.licenseType;
        productData.downloadLimit = formData.downloadLimit ? parseInt(formData.downloadLimit) : undefined;
        productData.downloadExpiryDays = formData.downloadExpiryDays ? parseInt(formData.downloadExpiryDays) : undefined;
        productData.fileSize = formData.fileSize ? parseFloat(formData.fileSize) : undefined;
        productData.fileFormat = formData.fileFormat;
        productData.author = formData.author;
        productData.coAuthor = formData.coAuthor;
        productData.publisher = formData.publisher;
        productData.publicationDate = formData.publicationDate;
        productData.isbn = formData.isbn;
        productData.pages = formData.pages ? parseInt(formData.pages) : undefined;
        productData.language = formData.language;
        productData.ageGroup = formData.ageGroup;
        productData.skillLevel = formData.skillLevel;
        productData.courseDuration = formData.courseDuration;
        productData.courseModules = formData.courseModules ? parseInt(formData.courseModules) : undefined;
        productData.includesSourceFiles = formData.includesSourceFiles;
      }
      
      // Add physical product fields if applicable
      if (formData.productType === 'physical') {
        productData.weight = formData.weight ? parseFloat(formData.weight) : undefined;
        productData.size = formData.size;
        productData.color = formData.color;
        productData.material = formData.material;
        productData.careInstructions = formData.careInstructions;
        productData.assemblyRequired = formData.assemblyRequired;
        productData.assemblyTime = formData.assemblyTime;
        
        if (formData.length && formData.width && formData.height) {
          productData.dimensions = {
            length: parseFloat(formData.length),
            width: parseFloat(formData.width),
            height: parseFloat(formData.height),
            unit: "cm"
          };
        }
        
        if (formData.packageLength && formData.packageWidth && formData.packageHeight) {
          productData.packageDimensions = {
            length: parseFloat(formData.packageLength),
            width: parseFloat(formData.packageWidth),
            height: parseFloat(formData.packageHeight),
            unit: "cm"
          };
        }
        
        productData.packageWeight = formData.packageWeight ? parseFloat(formData.packageWeight) : undefined;
      }
      
      if (editProduct) {
        // Update existing product
        await updateProduct(editProduct.id, productData);
        
        toast({
          title: "Product Updated",
          description: "Your product has been updated successfully"
        });
      } else {
        // Create new product
        await createProduct(productData);
        
        toast({
          title: "Product Created",
          description: "Your product has been listed successfully"
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ProductTypeStep formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <ProductDetailsStep formData={formData} updateFormData={updateFormData} productType={formData.productType} />;
      case 2:
        return <ProductMediaStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <ProductInventoryStep formData={formData} updateFormData={updateFormData} productType={formData.productType} />;
      case 4:
        return <ProductReviewStep formData={formData} onEditStep={(step) => setCurrentStep(step)} />;
      default:
        return null;
    }
  };
  
  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Package className="w-5 h-5" />;
      case 'digital':
        return <Download className="w-5 h-5" />;
      case 'service':
        return <FileText className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };
  
  const getProductTypeName = (type: string) => {
    switch (type) {
      case 'physical':
        return 'Physical Product';
      case 'digital':
        return 'Digital Product';
      case 'service':
        return 'Service';
      default:
        return 'Product';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {editProduct ? 'Edit Product' : 'List a New Product'}
        </h1>
        <p className="text-gray-600">
          {editProduct 
            ? `Update your ${getProductTypeName(formData.productType).toLowerCase()}` 
            : `Create a new ${getProductTypeName(formData.productType).toLowerCase()} listing`}
        </p>
      </div>
      
      {/* Progress Indicator */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
          
          <div className="flex mt-4 space-x-2 overflow-x-auto">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center flex-shrink-0 px-3 py-2 rounded-lg text-sm ${
                  index === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : index < currentStep 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span className="mr-2">{getProductTypeIcon(formData.productType)}</span>
                <span className="whitespace-nowrap">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getProductTypeIcon(formData.productType)}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              className="flex items-center gap-2"
            >
              {editProduct ? 'Update Product' : 'List Product'}
              <Home className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};