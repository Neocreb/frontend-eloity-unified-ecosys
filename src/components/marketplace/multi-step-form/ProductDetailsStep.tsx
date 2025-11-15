// @ts-nocheck
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { categoryService } from '@/services/categoryService';
import { 
  BookOpen, 
  Play, 
  File, 
  Palette, 
  Code, 
  Music, 
  Video as VideoIcon 
} from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  category: string;
  subcategory?: string;
  tags: string;
  digitalProductType?: string;
  author?: string;
  coAuthor?: string;
  pages?: string;
  language?: string;
  ageGroup?: string;
  skillLevel?: string;
  courseDuration?: string;
  courseModules?: string;
  includesSourceFiles?: boolean;
  weight?: string;
  size?: string;
  color?: string;
  material?: string;
  careInstructions?: string;
  assemblyRequired?: boolean;
  assemblyTime?: string;
}

export const ProductDetailsStep = ({ 
  formData, 
  updateFormData,
  productType
}: { 
  formData: FormData; 
  updateFormData: (data: Partial<FormData>) => void;
  productType: "physical" | "digital" | "service";
}) => {
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  
  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await categoryService.getCategories();
        setCategories(categoryData.map(cat => ({ id: cat.id, name: cat.name })));
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories([]);
      }
    };
    
    loadCategories();
  }, []);
  
  const digitalProductTypes = [
    { id: "ebook", name: "E-book / Guide", icon: BookOpen },
    { id: "online_course", name: "Online Course", icon: Play },
    { id: "template", name: "Template", icon: File },
    { id: "digital_art", name: "Digital Art", icon: Palette },
    { id: "software", name: "Software / Tool", icon: Code },
    { id: "audio", name: "Audio File", icon: Music },
    { id: "video", name: "Video File", icon: VideoIcon },
    { id: "license", name: "License / Subscription", icon: File },
    { id: "worksheet", name: "Worksheet / Planner", icon: File },
    { id: "printable", name: "Printable", icon: File }
  ];

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Enter product name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => updateFormData({ category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Describe your product in detail"
            className="min-h-[120px]"
          />
          <p className="text-sm text-gray-500">
            Provide a comprehensive description of your product, including features, benefits, and specifications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ($) *</Label>
            <Input
              id="price"
              type="text"
              value={formData.price}
              onChange={(e) => updateFormData({ price: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discountPrice">Discount Price ($)</Label>
            <Input
              id="discountPrice"
              type="text"
              value={formData.discountPrice || ''}
              onChange={(e) => updateFormData({ discountPrice: e.target.value })}
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500">
              Optional discounted price
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateFormData({ tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-sm text-gray-500">
              Comma-separated tags to help customers find your product
            </p>
          </div>
        </div>
      </div>
      
      {/* Product Type Specific Fields */}
      {productType === 'digital' && (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold">Digital Product Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="digitalProductType">Digital Product Type *</Label>
            <Select 
              value={formData.digitalProductType || ''} 
              onValueChange={(value) => updateFormData({ digitalProductType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select digital product type" />
              </SelectTrigger>
              <SelectContent>
                {digitalProductTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          {formData.digitalProductType && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="downloadUrl">Download URL *</Label>
                  <Input
                    id="downloadUrl"
                    value={formData.downloadUrl || ''}
                    onChange={(e) => updateFormData({ downloadUrl: e.target.value })}
                    placeholder="https://example.com/download/file.zip"
                  />
                  <p className="text-sm text-gray-500">
                    Secure link to your digital product file
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fileSize">File Size (MB)</Label>
                  <Input
                    id="fileSize"
                    type="number"
                    step="0.01"
                    value={formData.fileSize || ''}
                    onChange={(e) => updateFormData({ fileSize: e.target.value })}
                    placeholder="10.5"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileFormat">File Format</Label>
                  <Input
                    id="fileFormat"
                    value={formData.fileFormat || ''}
                    onChange={(e) => updateFormData({ fileFormat: e.target.value })}
                    placeholder="PDF, ZIP, MP3, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select 
                    value={formData.licenseType || 'single'} 
                    onValueChange={(value) => updateFormData({ licenseType: value as "single" | "multiple" | "unlimited" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Use</SelectItem>
                      <SelectItem value="multiple">Multiple Use</SelectItem>
                      <SelectItem value="unlimited">Unlimited Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formData.digitalProductType === 'ebook' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="author">Author *</Label>
                      <Input
                        id="author"
                        value={formData.author || ''}
                        onChange={(e) => updateFormData({ author: e.target.value })}
                        placeholder="Author name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="coAuthor">Co-Author</Label>
                      <Input
                        id="coAuthor"
                        value={formData.coAuthor || ''}
                        onChange={(e) => updateFormData({ coAuthor: e.target.value })}
                        placeholder="Co-author name (optional)"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pages">Number of Pages</Label>
                      <Input
                        id="pages"
                        type="number"
                        value={formData.pages || ''}
                        onChange={(e) => updateFormData({ pages: e.target.value })}
                        placeholder="250"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        value={formData.language || ''}
                        onChange={(e) => updateFormData({ language: e.target.value })}
                        placeholder="English"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ageGroup">Age Group</Label>
                      <Select 
                        value={formData.ageGroup || 'all'} 
                        onValueChange={(value) => updateFormData({ ageGroup: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ages</SelectItem>
                          <SelectItem value="children">Children (0-12)</SelectItem>
                          <SelectItem value="teen">Teen (13-19)</SelectItem>
                          <SelectItem value="adult">Adult (20+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              
              {formData.digitalProductType === 'online_course' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseDuration">Course Duration</Label>
                      <Input
                        id="courseDuration"
                        value={formData.courseDuration || ''}
                        onChange={(e) => updateFormData({ courseDuration: e.target.value })}
                        placeholder="e.g., 4 hours, 2 weeks"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="courseModules">Number of Modules</Label>
                      <Input
                        id="courseModules"
                        type="number"
                        value={formData.courseModules || ''}
                        onChange={(e) => updateFormData({ courseModules: e.target.value })}
                        placeholder="10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skillLevel">Skill Level</Label>
                    <Select 
                      value={formData.skillLevel || 'beginner'} 
                      onValueChange={(value) => updateFormData({ skillLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {productType === 'physical' && (
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold">Physical Product Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight || ''}
                onChange={(e) => updateFormData({ weight: e.target.value })}
                placeholder="1.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size || ''}
                onChange={(e) => updateFormData({ size: e.target.value })}
                placeholder="e.g., Large, Medium, Small"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (cm)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                value={formData.length || ''}
                onChange={(e) => updateFormData({ length: e.target.value })}
                placeholder="20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                value={formData.width || ''}
                onChange={(e) => updateFormData({ width: e.target.value })}
                placeholder="15"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height || ''}
                onChange={(e) => updateFormData({ height: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color || ''}
                onChange={(e) => updateFormData({ color: e.target.value })}
                placeholder="e.g., Red, Blue, Black"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={formData.material || ''}
                onChange={(e) => updateFormData({ material: e.target.value })}
                placeholder="e.g., Cotton, Plastic, Metal"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="careInstructions">Care Instructions</Label>
            <Textarea
              id="careInstructions"
              value={formData.careInstructions || ''}
              onChange={(e) => updateFormData({ careInstructions: e.target.value })}
              placeholder="How to care for this product"
            />
          </div>
        </div>
      )}
    </div>
  );
};