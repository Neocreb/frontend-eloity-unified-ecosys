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
import { ImagePlus, Loader2 } from 'lucide-react';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ListProductFormProps {
  onSuccess: () => void;
  editProductId?: string;
}

const CATEGORIES = [
  "electronics",
  "clothing",
  "accessories",
  "home",
  "beauty",
  "footwear",
  "sports",
  "books",
  "toys",
  "digital",
  "other"
];

type FormValues = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
};

const ListProductForm = ({ onSuccess, editProductId }: ListProductFormProps) => {
  const { createProduct, getProduct } = useMarketplace();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  
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
  
  // For image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For now we're just using the URL.createObjectURL for preview
    // In a real app, this would upload to storage and return a URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    form.setValue('imageUrl', objectUrl);
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
      // In a real app with proper backend, imageUrl would be the result of an upload
      // For this demo, we'll use the preview or a placeholder
      const imageUrl = data.imageUrl || previewImage || 'https://placehold.co/600x400?text=Product+Image';
      
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
      <h2 className="text-xl font-semibold">List a Product</h2>
      
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
                          {CATEGORIES.map(category => (
                            <SelectItem 
                              key={category} 
                              value={category}
                              className="capitalize"
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                  Submitting...
                </>
              ) : (
                'List Product'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ListProductForm;
