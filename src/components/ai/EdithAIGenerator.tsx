import React, { useState } from "react";
import { 
  Sparkles, 
  Image, 
  Video, 
  Upload, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { replicateService } from "@/services/replicateService";
import { useToast } from "@/hooks/use-toast";

interface GeneratedContent {
  type: "image" | "video";
  url: string;
  prompt: string;
}

interface EdithAIGeneratorProps {
  onContentGenerated: (content: GeneratedContent) => void;
  onClose: () => void;
  isEmbedded?: boolean;
}

const EdithAIGenerator: React.FC<EdithAIGeneratorProps> = ({ onContentGenerated, onClose, isEmbedded = false }) => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [contentType, setContentType] = useState<"image" | "video">("image");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a detailed prompt for the AI to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      if (contentType === "image") {
        // For posts, we'll use SDXL for higher quality
        const imageUrls = await replicateService.generateImageSDXL({
          prompt,
          negativePrompt,
          width: dimensions.width,
          height: dimensions.height,
          numOutputs: 1,
        });

        if (imageUrls.length > 0) {
          setGeneratedContent({
            type: "image",
            url: imageUrls[0],
            prompt,
          });
        }
      } else {
        // For video content
        const videoUrl = await replicateService.generateVideo({
          prompt,
          negativePrompt,
          numFrames: 24,
          fps: 8,
        });

        setGeneratedContent({
          type: "video",
          url: videoUrl,
          prompt,
        });
      }

      toast({
        title: "Content Generated!",
        description: "Your AI-generated content is ready. Click 'Use Content' to add it to your post.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || "Failed to generate content. Please try again.");
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      onClose();
    }
  };

  const handleUpscale = async () => {
    if (!generatedContent || generatedContent.type !== "image") return;

    setIsGenerating(true);
    setError(null);

    try {
      const upscaledUrl = await replicateService.upscaleImage(generatedContent.url, 2);

      setGeneratedContent({
        ...generatedContent,
        url: upscaledUrl,
      });

      toast({
        title: "Image Upscaled!",
        description: "Your image has been upscaled for better quality.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || "Failed to upscale image. Please try again.");
      toast({
        title: "Upscaling Failed",
        description: "Failed to upscale image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const containerClass = isEmbedded
    ? "w-full"
    : "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4";

  const cardClass = isEmbedded
    ? "w-full border-0 shadow-none bg-transparent"
    : "w-full max-w-2xl max-h-[90vh] overflow-y-auto";

  return (
    <div className={containerClass}>
      <Card className={cardClass}>
        <CardHeader className={`flex flex-row items-center justify-between ${isEmbedded ? "px-0 py-4 border-b" : ""}`}>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Edith AI Content Generator
          </CardTitle>
          {!isEmbedded && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
          {isEmbedded && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Back to Post
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={contentType === "image" ? "default" : "outline"}
              onClick={() => setContentType("image")}
              className="flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              Generate Image
            </Button>
            <Button
              variant={contentType === "video" ? "default" : "outline"}
              onClick={() => setContentType("video")}
              className="flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Generate Video
            </Button>
          </div>

          {contentType === "image" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({...dimensions, width: parseInt(e.target.value) || 512})}
                  min="256"
                  max="1024"
                  step="64"
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({...dimensions, height: parseInt(e.target.value) || 512})}
                  min="256"
                  max="1024"
                  step="64"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want to generate in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
            <Textarea
              id="negativePrompt"
              placeholder="Describe what you want to avoid in the generation..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with Edith AI
                </>
              )}
            </Button>
          </div>

          {generatedContent && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                {generatedContent.type === "image" ? (
                  <img 
                    src={generatedContent.url} 
                    alt="Generated content" 
                    className="w-full h-auto max-h-96 object-contain"
                  />
                ) : (
                  <video 
                    src={generatedContent.url} 
                    controls 
                    className="w-full h-auto max-h-96"
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleUseContent} className="flex-1">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Use Content
                </Button>
                {generatedContent.type === "image" && (
                  <Button 
                    onClick={handleUpscale} 
                    disabled={isGenerating}
                    variant="secondary"
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Upscaling...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upscale 2x
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Tips for better results:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Be specific and descriptive in your prompts</li>
              <li>Include details like colors, lighting, and style</li>
              <li>Use negative prompts to exclude unwanted elements</li>
              <li>For videos, keep prompts simple and focused</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdithAIGenerator;
