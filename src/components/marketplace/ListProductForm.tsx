// @ts-nocheck
import { useState } from 'react';
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
import { Card } from '@/components/ui/card';
import { ImagePlus, Loader2, Sparkles } from 'lucide-react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { categoryService } from '@/services/categoryService';
import EdithAIGenerator from "@/components/ai/EdithAIGenerator";
import { supabase } from "@/integrations/supabase/client";

interface ListProductFormProps {
  onSuccess: () => void;
  editProductId?: string;
}

type FormValues = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
};

const ListProductForm = ({ onSuccess, editProductId }: ListProductFormProps) => {
  const { createProduct, getProduct, updateProduct } = useMarketplace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  // Load categories
  useState(() => {
    const loadCategories = async () => {
      try {
        const categoryData = await categoryService.getCategories();
        setCategories(categoryData.map(cat => ({ id: cat.id, name: cat.name })));
      } catch (error) {
        console.error("Error loading categories:", error);
        // Fallback to empty array if real data fetch fails
        setCategories([]);
      }
    };
    
    loadCategories();
  });
  
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      inStock: true,
    }
  });
  
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
      form.setValue('imageUrl', imageUrl);
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
    // For now, we'll just show a toast. In a real implementation, you might want to:
    // 1. Download the content from the URL
    // 2. Convert it to a File object
    // 3. Set it as the product image
    toast({
      title: "AI Content Generated!",
      description: `Your ${content.type} has been generated. You can now use it for your product.`,
    });
    
    // In a full implementation, you would:
    // 1. Fetch the content from the URL
    // 2. Convert it to a File object
    // 3. Upload it using Supabase storage
    // 4. Set the preview image and form value
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
      if (isNaN(price) || price <= 0) {
        toast({
          title: "Invalid Price",
          description: "Please enter a valid price",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Use the uploaded image URL or a placeholder
      const imageUrl = data.imageUrl || 'https://placehold.co/600x400?text=Product+Image';
      
      if (editProductId) {
        // Update existing product
        await updateProduct(editProductId, {
          name: data.name,
          description: data.description,
          price,
          category: data.category,
          image: imageUrl,
          inStock: data.inStock,
        });
        
        toast({
          title: "Product Updated",
          description: "Your product has been updated successfully"
        });
      } else {
        // Create new product
        await createProduct({
          name: data.name,
          description: data.description,
          price,
          category: data.category,
          image: imageUrl,
          rating: 0,
          inStock: true,
          isNew: true,
          reviewCount: 0,
        });
        
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
      <h2 className="text-xl font-semibold">{editProductId ? 'Edit Product' : 'List a Product'}</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Product name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
                      <FormLabel>Price ($)</FormLabel>
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
                  name="category"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
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
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>In Stock</FormLabel>
                      <FormDescription>
                        Check if this product is currently available for purchase
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
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
                      Upload a high-quality image of your product
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editProductId ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                editProductId ? 'Update Product' : 'List Product'
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

export default ListProductForm;