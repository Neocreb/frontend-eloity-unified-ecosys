import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contentCreationService, CreateProductData } from '@/services/contentCreationService';
import { useToast } from '@/components/ui/use-toast';

interface CreateProductFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateProductForm: React.FC<CreateProductFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('new');
  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [images, setImages] = useState<string[]>(['']);
  const [tags, setTags] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    if (price <= 0) {
      toast({
        title: "Error",
        description: "Price must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const productData: CreateProductData = {
        title,
        description,
        price,
        currency,
        category,
        subcategory,
        brand,
        condition,
        stock_quantity: stockQuantity,
        images: images.filter(url => url.trim() !== ''),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      };

      await contentCreationService.createProduct(productData);
      
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
      
      // Clear form
      setTitle('');
      setDescription('');
      setPrice(0);
      setImages(['']);
      setTags('');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImageUrl = () => {
    setImages([...images, '']);
  };

  const updateImageUrl = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const removeImageUrl = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Product Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter product title"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-1">
                Price
              </label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium mb-1">
                Currency
              </label>
              <Select value={currency} onValueChange={setCurrency} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium mb-1">
                Condition
              </label>
              <Select value={condition} onValueChange={setCondition} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Electronics"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium mb-1">
                Subcategory
              </label>
              <Input
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g., Smartphones"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium mb-1">
                Brand
              </label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., Apple"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-1">
                Stock Quantity
              </label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                placeholder="1"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                Tags (comma separated)
              </label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., tech, smartphone, apple"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Image URLs
            </label>
            <div className="space-y-2">
              {images.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="text"
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="Enter image URL"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageUrl(index)}
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageUrl}
                disabled={isSubmitting}
              >
                Add Image URL
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateProductForm;