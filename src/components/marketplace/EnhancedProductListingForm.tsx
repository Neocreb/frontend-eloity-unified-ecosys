// @ts-nocheck
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ImagePlus, Video, FileText, BookOpen, Play, Music, Palette, Code, File, Download, Package, Sparkles } from 'lucide-react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/services/categoryService';
import EdithAIGenerator from "@/components/ai/EdithAIGenerator";
import { Product } from '@/types/marketplace';
import { supabase } from "@/integrations/supabase/client";

interface EnhancedProductListingFormProps {
  onSuccess: () => void;
  editProduct?: Product;
}

type FormValues = {
  // Basic info
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  category: string;
  subcategory?: string;
  tags: string;
  
  // Product type
  productType: "physical" | "digital" | "service";
  
  // Media
  mainImage: string;
  additionalImages: string[];
  videos: string[];
  
  // Inventory
  inStock: boolean;
  stockQuantity?: string;
  isNew: boolean;
  
  // Digital product fields
  digitalProductType?: "ebook" | "online_course" | "template" | "digital_art" | "software" | "audio" | "video" | "license" | "worksheet" | "printable";
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
};

const EnhancedProductListingForm = ({ onSuccess, editProduct }: EnhancedProductListingFormProps) => {
  const { createProduct, updateProduct, getProduct } = useMarketplace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [subcategories, setSubcategories] = useState<Array<{id: string, name: string}>>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [productType, setProductType] = useState<"physical" | "digital" | "service">("physical");
  const [digitalProductType, setDigitalProductType] = useState<string>("");

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

  const form = useForm<FormValues>({
    defaultValues: {
      // Basic info
      name: editProduct?.name || '',
      description: editProduct?.description || '',
      price: editProduct?.price?.toString() || '',
      discountPrice: editProduct?.discountPrice?.toString() || '',
      category: editProduct?.category || '',
      subcategory: editProduct?.subcategory || '',
      tags: editProduct?.tags?.join(', ') || '',

      // Product type
      productType: editProduct?.productType || 'physical',

      // Media
      mainImage: editProduct?.image || '',
      additionalImages: editProduct?.images || [],
      videos: [],

      // Inventory
      inStock: editProduct?.inStock ?? true,
      stockQuantity: editProduct?.stockQuantity?.toString() || '',
      isNew: editProduct?.isNew ?? true,

      // Digital product fields
      digitalProductType: editProduct?.digitalProductType || undefined,
      downloadUrl: editProduct?.downloadUrl || undefined,
      licenseType: editProduct?.licenseType || undefined,
      downloadLimit: editProduct?.downloadLimit?.toString() || undefined,
      downloadExpiryDays: editProduct?.downloadExpiryDays?.toString() || undefined,
      fileSize: editProduct?.fileSize?.toString() || undefined,
      fileFormat: editProduct?.fileFormat || undefined,
      author: editProduct?.author || undefined,
      coAuthor: editProduct?.coAuthor || undefined,
      publisher: editProduct?.publisher || undefined,
      publicationDate: editProduct?.publicationDate || undefined,
      isbn: editProduct?.isbn || undefined,
      pages: editProduct?.pages?.toString() || undefined,
      language: editProduct?.language || undefined,
      ageGroup: editProduct?.ageGroup || undefined,
      skillLevel: editProduct?.skillLevel || undefined,
      courseDuration: editProduct?.courseDuration || undefined,
      courseModules: editProduct?.courseModules?.toString() || undefined,
      includesSourceFiles: editProduct?.includesSourceFiles || undefined,

      // Physical product fields
      weight: editProduct?.weight?.toString() || undefined,
      length: editProduct?.dimensions?.length?.toString() || undefined,
      width: editProduct?.dimensions?.width?.toString() || undefined,
      height: editProduct?.dimensions?.height?.toString() || undefined,
      size: editProduct?.size || undefined,
      color: editProduct?.color || undefined,
      material: editProduct?.material || undefined,
      careInstructions: editProduct?.careInstructions || undefined,
      assemblyRequired: editProduct?.assemblyRequired || false,
      assemblyTime: editProduct?.assemblyTime || undefined,
      packageLength: editProduct?.packageDimensions?.length?.toString() || undefined,
      packageWidth: editProduct?.packageDimensions?.width?.toString() || undefined,
      packageHeight: editProduct?.packageDimensions?.height?.toString() || undefined,
      packageWeight: editProduct?.packageWeight?.toString() || undefined,
    }
  });

  // Set product type when form loads
  useEffect(() => {
    if (editProduct) {
      setProductType(editProduct.productType || 'physical');
      setDigitalProductType(editProduct.digitalProductType || '');
    }
  }, [editProduct]);

  // For image preview and upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload image to Supabase storage
      const bucket = 'products';
      const path = `${user?.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: false,
        cacheControl: '3600',
        contentType: file.type,
      });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const imageUrl = data.publicUrl;

      // Set preview and form value
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      form.setValue('mainImage', imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAIContentGenerated = (content: { type: "image" | "video"; url: string; prompt: string }) => {
    toast({
      title: "AI Content Generated!",
      description: `Your ${content.type} has been generated. You can now use it for your product.`,
    });
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to list a product",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const price = parseFloat(data.price);
      const discountPrice = data.discountPrice ? parseFloat(data.discountPrice) : undefined;

      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (discountPrice && (isNaN(discountPrice) || discountPrice <= 0 || discountPrice >= price)) {
        toast({
          title: "Invalid Discount Price",
          description: "Discount price must be greater than 0 and less than the regular price",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Use the uploaded image URL or a placeholder
      const imageUrl = data.mainImage || 'https://placehold.co/600x400?text=Product+Image';

      const productData: any = {
        name: data.name,
        description: data.description,
        price,
        discountPrice,
        category: data.category,
        subcategory: data.subcategory,
        image: imageUrl,
        images: [imageUrl, ...data.additionalImages],
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        inStock: data.inStock,
        stockQuantity: data.stockQuantity ? parseInt(data.stockQuantity) : undefined,
        isNew: data.isNew,
        productType: data.productType,
        rating: 0,
        reviewCount: 0,
      };

      // Add digital product fields if applicable
      if (data.productType === 'digital' && data.digitalProductType) {
        productData.digitalProductType = data.digitalProductType;
        productData.downloadUrl = data.downloadUrl;
        productData.licenseType = data.licenseType;
        productData.downloadLimit = data.downloadLimit ? parseInt(data.downloadLimit) : undefined;
        productData.downloadExpiryDays = data.downloadExpiryDays ? parseInt(data.downloadExpiryDays) : undefined;
        productData.fileSize = data.fileSize ? parseFloat(data.fileSize) : undefined;
        productData.fileFormat = data.fileFormat;
        productData.author = data.author;
        productData.coAuthor = data.coAuthor;
        productData.publisher = data.publisher;
        productData.publicationDate = data.publicationDate;
        productData.isbn = data.isbn;
        productData.pages = data.pages ? parseInt(data.pages) : undefined;
        productData.language = data.language;
        productData.ageGroup = data.ageGroup;
        productData.skillLevel = data.skillLevel;
        productData.courseDuration = data.courseDuration;
        productData.courseModules = data.courseModules ? parseInt(data.courseModules) : undefined;
        productData.includesSourceFiles = data.includesSourceFiles;
      }

      // Add physical product fields if applicable
      if (data.productType === 'physical') {
        productData.weight = data.weight ? parseFloat(data.weight) : undefined;
        productData.size = data.size;
        productData.color = data.color;
        productData.material = data.material;
        productData.careInstructions = data.careInstructions;
        productData.assemblyRequired = data.assemblyRequired;
        productData.assemblyTime = data.assemblyTime;

        if (data.length && data.width && data.height) {
          productData.dimensions = {
            length: parseFloat(data.length),
            width: parseFloat(data.width),
            height: parseFloat(data.height),
            unit: "cm"
          };
        }

        if (data.packageLength && data.packageWidth && data.packageHeight) {
          productData.packageDimensions = {
            length: parseFloat(data.packageLength),
            width: parseFloat(data.packageWidth),
            height: parseFloat(data.packageHeight),
            unit: "cm"
          };
        }

        productData.packageWeight = data.packageWeight ? parseFloat(data.packageWeight) : undefined;
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

      form.reset();
      setPreviewImage('');
      onSuccess();
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{editProduct ? 'Edit Product' : 'List a New Product'}</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Product Type</CardTitle>
              <CardDescription>
                Select the type of product you want to list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            productType === 'physical' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            field.onChange('physical');
                            setProductType('physical');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Physical Product</h3>
                              <p className="text-sm text-gray-500">Tangible items that require shipping</p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            productType === 'digital' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            field.onChange('digital');
                            setProductType('digital');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <Download className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Digital Product</h3>
                              <p className="text-sm text-gray-500">Downloadable files and digital content</p>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            productType === 'service' 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            field.onChange('service');
                            setProductType('service');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">Service</h3>
                              <p className="text-sm text-gray-500">Professional services and consultations</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential details about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Product name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem 
                              key={category.id} 
                              value={category.id}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product in detail" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a comprehensive description of your product, including features, benefits, and specifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  rules={{ 
                    required: "Price is required",
                    pattern: {
                      value: /^\d+(\.\d{1,2})?$/,
                      message: "Enter a valid price (e.g. 9.99)"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional discounted price
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="tag1, tag2, tag3" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags to help customers find your product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product-Specific Fields */}
          {productType === 'digital' && (
            <DigitalProductFields 
              form={form} 
              digitalProductType={digitalProductType} 
              setDigitalProductType={setDigitalProductType} 
            />
          )}

          {productType === 'physical' && (
            <PhysicalProductFields form={form} />
          )}

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
              <CardDescription>
                Upload images and videos to showcase your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="mainImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Product Image *</FormLabel>
                    <FormControl>
                      <div className="mt-1">
                        <Card className="border-2 border-dashed rounded-lg cursor-pointer overflow-hidden">
                          {previewImage ? (
                            <div className="relative group h-[300px]">
                              <img 
                                src={previewImage} 
                                alt="Product Preview" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" type="button" onClick={() => {
                                  setPreviewImage('');
                                  field.onChange('');
                                }}>
                                  Change Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-[300px] cursor-pointer">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImagePlus className="w-10 h-10 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  SVG, PNG, JPG or GIF (max. 2MB)
                                </p>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="mt-4 flex items-center gap-2"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowAIGenerator(true);
                                  }}
                                >
                                  <Sparkles className="w-4 h-4" />
                                  Generate with Edith AI
                                </Button>
                              </div>
                              <input 
                                id="fileUpload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                          )}
                        </Card>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload a high-quality image of your product (minimum 800x600 pixels)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Additional Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {[1, 2, 3, 4].map((index) => (
                    <div key={index} className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center">
                      <ImagePlus className="w-6 h-6 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Videos</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center">
                      <Video className="w-6 h-6 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Manage your product stock and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">In Stock</FormLabel>
                        <FormDescription>
                          Is this product currently available for purchase?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isNew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">New Product</FormLabel>
                        <FormDescription>
                          Mark as a new arrival to highlight in your store
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {productType !== 'digital' && (
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Enter quantity" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Number of items available in stock
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setPreviewImage('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {editProduct ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                editProduct ? 'Update Product' : 'List Product'
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Edith AI Generator Modal */}
      {showAIGenerator && (
        <EdithAIGenerator
          onContentGenerated={handleAIContentGenerated}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
};

// Digital Product Fields Component
const DigitalProductFields = ({ form, digitalProductType, setDigitalProductType }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Product Details</CardTitle>
        <CardDescription>
          Provide specific information about your digital product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="digitalProductType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Digital Product Type *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  setDigitalProductType(value);
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select digital product type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ebook">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      E-book / Guide
                    </div>
                  </SelectItem>
                  <SelectItem value="online_course">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Online Course
                    </div>
                  </SelectItem>
                  <SelectItem value="template">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      Template
                    </div>
                  </SelectItem>
                  <SelectItem value="digital_art">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Digital Art
                    </div>
                  </SelectItem>
                  <SelectItem value="software">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Software / Tool
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Audio File
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video File
                    </div>
                  </SelectItem>
                  <SelectItem value="license">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      License / Subscription
                    </div>
                  </SelectItem>
                  <SelectItem value="worksheet">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      Worksheet / Planner
                    </div>
                  </SelectItem>
                  <SelectItem value="printable">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      Printable
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {digitalProductType && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="downloadUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Download URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/download/file.zip" {...field} />
                    </FormControl>
                    <FormDescription>
                      Secure link to your digital product file
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fileSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Size (MB)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="10.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fileFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Format</FormLabel>
                    <FormControl>
                      <Input placeholder="PDF, ZIP, MP3, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select license type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Single Use</SelectItem>
                        <SelectItem value="multiple">Multiple Use</SelectItem>
                        <SelectItem value="unlimited">Unlimited Use</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {digitalProductType === 'ebook' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author *</FormLabel>
                        <FormControl>
                          <Input placeholder="Author name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coAuthor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Co-Author</FormLabel>
                        <FormControl>
                          <Input placeholder="Co-author name (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Pages</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="250" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input placeholder="English" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Ages</SelectItem>
                            <SelectItem value="children">Children (0-12)</SelectItem>
                            <SelectItem value="teen">Teen (13-19)</SelectItem>
                            <SelectItem value="adult">Adult (20+)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {digitalProductType === 'online_course' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="courseDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 4 hours, 2 weeks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseModules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Modules</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includesSourceFiles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Includes Source Files</FormLabel>
                        <FormDescription>
                          Does this course include source code or project files?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Physical Product Fields Component
const PhysicalProductFields = ({ form }: any) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Product Details</CardTitle>
        <CardDescription>
          Provide specific information about your physical product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Large, Medium, Small" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="length"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Length (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Red, Blue, Black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Cotton, Plastic, Metal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="careInstructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Care Instructions</FormLabel>
              <FormControl>
                <Textarea placeholder="How to care for this product" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assemblyRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Assembly Required</FormLabel>
                <FormDescription>
                  Does this product require assembly?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('assemblyRequired') && (
          <FormField
            control={form.control}
            name="assemblyTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assembly Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 30 minutes, 2 hours" {...field} />
                </FormControl>
                <FormDescription>
                  Estimated time required for assembly
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Packaging Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="packageLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Length (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packageWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Width (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="packageHeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="packageWeight"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Package Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="2.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProductListingForm;