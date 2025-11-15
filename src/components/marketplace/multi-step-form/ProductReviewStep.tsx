// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Package, Download, FileText, Image, Video } from 'lucide-react';

interface FormData {
  productType: "physical" | "digital" | "service";
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  category: string;
  tags: string;
  digitalProductType?: string;
  mainImage: string;
  additionalImages: string[];
  videos: string[];
  inStock: boolean;
  isNew: boolean;
}

export const ProductReviewStep = ({ 
  formData,
  onEditStep
}: { 
  formData: FormData;
  onEditStep: (step: number) => void;
}) => {
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
  
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">Review Your Product Listing</h3>
        <p className="text-gray-600 mt-2">
          Please review all the information before submitting your product
        </p>
      </div>
      
      {/* Product Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getProductTypeIcon(formData.productType)}
            {formData.name || 'Untitled Product'}
          </CardTitle>
          <CardDescription>
            {getProductTypeName(formData.productType)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Price</Label>
              <p className="text-lg font-semibold">{formatPrice(formData.price)}</p>
            </div>
            
            {formData.discountPrice && (
              <div>
                <Label className="text-sm font-medium">Discount Price</Label>
                <p className="text-lg font-semibold text-green-600">{formatPrice(formData.discountPrice)}</p>
              </div>
            )}
            
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <p>{formData.category || 'Not specified'}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  formData.inStock 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {formData.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                {formData.isNew && (
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    New
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <p className="mt-1 text-gray-700">{formData.description || 'No description provided'}</p>
          </div>
          
          {formData.tags && (
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.split(',').map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Media Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Main Image</Label>
              {formData.mainImage ? (
                <div className="mt-2">
                  <img 
                    src={formData.mainImage} 
                    alt="Main product" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              ) : (
                <p className="text-gray-500 mt-2">No main image uploaded</p>
              )}
            </div>
            
            {formData.additionalImages.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Additional Images ({formData.additionalImages.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {formData.additionalImages.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Product ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {formData.videos.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Videos ({formData.videos.length})</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {formData.videos.map((_, index) => (
                    <div key={index} className="border-2 border-dashed rounded-lg h-24 flex items-center justify-center">
                      <div className="text-center">
                        <Video className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-gray-500 text-xs">Video {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Digital Product Details */}
      {formData.productType === 'digital' && formData.digitalProductType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Digital Product Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Product Type</Label>
                <p className="capitalize">{formData.digitalProductType.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Review Actions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Before You Submit</h4>
        <ul className="text-yellow-700 text-sm list-disc pl-5 space-y-1">
          <li>Double-check all product information for accuracy</li>
          <li>Ensure all required fields are filled out</li>
          <li>Verify that your images are clear and representative</li>
          <li>Confirm pricing and availability settings</li>
        </ul>
      </div>
      
      {/* Edit Steps */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEditStep(0)}
        >
          Edit Product Type
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEditStep(1)}
        >
          Edit Details
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEditStep(2)}
        >
          Edit Media
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onEditStep(3)}
        >
          Edit Inventory
        </Button>
      </div>
    </div>
  );
};