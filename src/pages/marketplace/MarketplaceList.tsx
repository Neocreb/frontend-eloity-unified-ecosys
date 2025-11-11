// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronLeft, Upload, PlusCircle, X, Package, HardDrive, Wrench } from "lucide-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { Product } from "@/types/marketplace";

const categories = [
  { id: "electronics", label: "Electronics" },
  { id: "clothing", label: "Clothing" },
  { id: "accessories", label: "Accessories" },
  { id: "footwear", label: "Footwear" },
  { id: "home", label: "Home & Kitchen" },
  { id: "beauty", label: "Beauty & Health" },
  { id: "services", label: "Services" },
  { id: "food", label: "Food & Drinks" },
  { id: "books", label: "Books & Media" },
];

// Validation schema
const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  discountPrice: z.coerce
    .number()
    .positive("Discount price must be a positive number")
    .optional(),
  category: z.string().min(1, "Please select a category"),
  inStock: z.boolean().default(true),
  image: z.string().min(1, "Product image is required"),
  isNew: z.boolean().default(false),
  // Digital product fields
  digitalType: z.string().optional(),
  format: z.string().optional(),
  fileSize: z.string().optional(),
  authors: z.string().optional(),
  publisher: z.string().optional(),
  language: z.string().optional(),
  // Service product fields
  serviceType: z.string().optional(),
  deliveryTime: z.string().optional(),
  hourlyRate: z.coerce.number().optional(),
  requirements: z.string().optional(),
});

const MarketplaceList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { createProduct, updateProduct, getProduct } = useMarketplace();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [productType, setProductType] = useState<"physical" | "digital" | "service">("physical");

  // Initialize form
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: undefined,
      category: "",
      inStock: true,
      image: "",
      isNew: false,
      digitalType: undefined,
      format: undefined,
      fileSize: undefined,
      authors: undefined,
      publisher: undefined,
      language: undefined,
      serviceType: undefined,
      deliveryTime: undefined,
      hourlyRate: undefined,
      requirements: undefined,
    },
  });

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
        form.reset({
          name: product.name,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          category: product.category,
          inStock: product.inStock,
          image: product.image,
          isNew: product.isNew || false,
          digitalType: product.digitalType,
          format: product.format,
          fileSize: product.fileSize,
          authors: product.authors,
          publisher: product.publisher,
          language: product.language,
          serviceType: product.serviceType,
          deliveryTime: product.deliveryTime,
          hourlyRate: product.hourlyRate,
          requirements: product.requirements,
        });

        if (product.images) {
          setProductImages(product.images);
        }
        
        // Set product type based on existing data
        if (product.digitalType) {
          setProductType("digital");
        } else if (product.serviceType) {
          setProductType("service");
        } else {
          setProductType("physical");
        }
      }
    }
  }, [location.search, getProduct, form]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      const productData: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
        name: values.name,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice,
        category: values.category,
        inStock: values.inStock,
        image: values.image,
        images: productImages.length > 0 ? productImages : [values.image],
        sellerId: "current-user", // Replace with actual user ID
        sellerName: "Current User", // Replace with actual user name
        rating: 0,
        reviewCount: 0,
        isNew: values.isNew,
        isFeatured: false,
        tags: [],
        specifications: [],
        // Digital product fields
        digitalType: productType === "digital" ? values.digitalType : undefined,
        format: productType === "digital" ? values.format : undefined,
        fileSize: productType === "digital" ? values.fileSize : undefined,
        authors: productType === "digital" ? values.authors : undefined,
        publisher: productType === "digital" ? values.publisher : undefined,
        language: productType === "digital" ? values.language : undefined,
        // Service product fields
        serviceType: productType === "service" ? values.serviceType : undefined,
        deliveryTime: productType === "service" ? values.deliveryTime : undefined,
        hourlyRate: productType === "service" ? values.hourlyRate : undefined,
        requirements: productType === "service" ? values.requirements : undefined,
      };

      if (isEditing && currentProductId) {
        await updateProduct(currentProductId, productData);
        toast({
          title: "Product Updated",
          description: "Your product has been successfully updated.",
        });
      } else {
        await createProduct(productData);
        toast({
          title: "Product Created",
          description: "Your product has been successfully listed.",
        });
      }

      navigate("/app/marketplace/my");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageInput = (imageUrl: string) => {
    if (imageUrl.trim() && !productImages.includes(imageUrl)) {
      setProductImages([...productImages, imageUrl]);
      form.setValue("image", imageUrl);
      setCurrentImage("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages);

    // If removing the main image, set the first remaining image as main
    if (newImages.length > 0) {
      form.setValue("image", newImages[0]);
    } else {
      form.setValue("image", "");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
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

      {/* Product Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium">Product Type</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              type="button"
              variant={productType === "physical" ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-24 gap-2"
              onClick={() => setProductType("physical")}
            >
              <Package className="h-6 w-6" />
              <span>Physical Product</span>
            </Button>
            <Button
              type="button"
              variant={productType === "digital" ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-24 gap-2"
              onClick={() => setProductType("digital")}
            >
              <HardDrive className="h-6 w-6" />
              <span>Digital Product</span>
            </Button>
            <Button
              type="button"
              variant={productType === "service" ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-24 gap-2"
              onClick={() => setProductType("service")}
            >
              <Wrench className="h-6 w-6" />
              <span>Service</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium">Product Information</h2>
                </CardHeader>

                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name*</FormLabel>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your product..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
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
                          <FormLabel>Discount Price (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
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
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Product Image*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          Primary image that will be displayed for your product
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="inStock"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>In Stock</FormLabel>
                            <FormDescription>
                              Is this product currently available?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>New Product</FormLabel>
                            <FormDescription>
                              Mark as a new arrival
                            </FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Digital Product Fields */}
                  {productType === "digital" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-md font-medium">Digital Product Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="digitalType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Digital Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ebook">eBook</SelectItem>
                                  <SelectItem value="audio">Audio</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="software">Software</SelectItem>
                                  <SelectItem value="game">Game</SelectItem>
                                  <SelectItem value="template">Template</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="format"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Format</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., PDF, MP3, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fileSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>File Size</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2.5MB" {...field} />
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
                                <Input placeholder="e.g., English" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="authors"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Authors</FormLabel>
                            <FormControl>
                              <Input placeholder="Author names" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="publisher"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publisher</FormLabel>
                            <FormControl>
                              <Input placeholder="Publisher name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Service Product Fields */}
                  {productType === "service" && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-md font-medium">Service Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="serviceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="consulting">Consulting</SelectItem>
                                  <SelectItem value="freelance">Freelance</SelectItem>
                                  <SelectItem value="repair">Repair</SelectItem>
                                  <SelectItem value="training">Training</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="deliveryTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delivery Time</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 2-3 business days" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requirements</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Special requirements or information needed from customers"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-medium">Additional Images</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add More Images</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter image URL"
                        value={currentImage}
                        onChange={(e) => setCurrentImage(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleImageInput(currentImage)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {productImages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Product Images ({productImages.length})</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {productImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button type="submit" className="w-full">
                    {isEditing ? "Update Product" : "List Product"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MarketplaceList;