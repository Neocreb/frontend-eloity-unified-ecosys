// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ImagePlus, Video, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';

interface FormData {
  mainImage: string;
  additionalImages: string[];
  videos: string[];
}

export const ProductMediaStep = ({ 
  formData, 
  updateFormData 
}: { 
  formData: FormData; 
  updateFormData: (data: Partial<FormData>) => void 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string>(formData.mainImage);
  const [uploading, setUploading] = useState(false);
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, isMainImage: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
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
      
      if (isMainImage) {
        // Set preview and form value for main image
        const objectUrl = URL.createObjectURL(file);
        setPreviewImage(objectUrl);
        updateFormData({ mainImage: imageUrl });
      } else {
        // Add to additional images
        updateFormData({ 
          additionalImages: [...formData.additionalImages, imageUrl] 
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = formData.additionalImages.filter((_, i) => i !== index);
    updateFormData({ additionalImages: newImages });
  };
  
  const handleAIContentGenerated = () => {
    toast({
      title: "AI Content Generated!",
      description: "Your content has been generated. You can now use it for your product.",
    });
  };
  
  return (
    <div className="space-y-8">
      {/* Main Product Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Main Product Image</h3>
        <p className="text-gray-600 text-sm">
          Upload a high-quality image of your product (minimum 800x600 pixels)
        </p>
        
        <Card className="border-2 border-dashed rounded-lg cursor-pointer overflow-hidden">
          {previewImage ? (
            <div className="relative group h-[300px]">
              <img 
                src={previewImage} 
                alt="Product Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  type="button" 
                  onClick={() => {
                    setPreviewImage('');
                    updateFormData({ mainImage: '' });
                  }}
                >
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
                    handleAIContentGenerated();
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with Edith AI
                </Button>
              </div>
              <input 
                id="mainImageUpload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageChange(e, true)}
                disabled={uploading}
              />
            </label>
          )}
        </Card>
      </div>
      
      {/* Additional Images */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Additional Images</h3>
            <p className="text-gray-600 text-sm">
              Upload additional images to showcase different angles or features
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Trigger file input for additional images
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => handleImageChange(e as any);
              input.click();
            }}
            disabled={uploading}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Add Image
          </Button>
        </div>
        
        {formData.additionalImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.additionalImages.map((image, index) => (
              <div key={index} className="relative group">
                <Card className="overflow-hidden h-32">
                  <img 
                    src={image} 
                    alt={`Product ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </Card>
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
        ) : (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No additional images uploaded yet</p>
          </div>
        )}
      </div>
      
      {/* Videos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Product Videos</h3>
            <p className="text-gray-600 text-sm">
              Upload videos to demonstrate your product in action
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Video className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Video {index}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};