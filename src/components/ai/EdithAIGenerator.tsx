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
        <CardHeader className={`flex flex-row items-center justify-between ${isEmbedded ? "px-0 py-3 border-b" : ""}`}>
          <CardTitle className={`flex items-center gap-2 ${isEmbedded ? "text-base sm:text-lg" : ""}`}>
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span className={isEmbedded ? "" : ""}>Edith AI Content Generator</span>
          </CardTitle>
          {!isEmbedded && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
          {isEmbedded && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs sm:text-sm h-8">
              Back to Post
            </Button>
          )}
        </CardHeader>
        <CardContent className={`${isEmbedded ? "space-y-4 px-0 py-4" : "space-y-6"}`}>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className={`grid grid-cols-2 gap-2 sm:gap-4`}>
            <Button
              variant={contentType === "image" ? "default" : "outline"}
              onClick={() => setContentType("image")}
              className={`flex items-center justify-center gap-1 sm:gap-2 ${isEmbedded ? "text-xs sm:text-sm h-9" : ""}`}
              size={isEmbedded ? "sm" : "default"}
            >
              <Image className="w-4 h-4" />
              <span className={isEmbedded ? "hidden sm:inline" : ""}>Generate Image</span>
              <span className={isEmbedded ? "inline sm:hidden" : "hidden"}>Image</span>
            </Button>
            <Button
              variant={contentType === "video" ? "default" : "outline"}
              onClick={() => setContentType("video")}
              className={`flex items-center justify-center gap-1 sm:gap-2 ${isEmbedded ? "text-xs sm:text-sm h-9" : ""}`}
              size={isEmbedded ? "sm" : "default"}
            >
              <Video className="w-4 h-4" />
              <span className={isEmbedded ? "hidden sm:inline" : ""}>Generate Video</span>
              <span className={isEmbedded ? "inline sm:hidden" : "hidden"}>Video</span>
            </Button>
          </div>

          {contentType === "image" && (
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="space-y-1">
                <Label className={isEmbedded ? "text-xs sm:text-sm" : ""}>Width</Label>
                <Input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({...dimensions, width: parseInt(e.target.value) || 512})}
                  min="256"
                  max="1024"
                  step="64"
                  className={isEmbedded ? "text-xs sm:text-sm h-8" : ""}
                />
              </div>
              <div className="space-y-1">
                <Label className={isEmbedded ? "text-xs sm:text-sm" : ""}>Height</Label>
                <Input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions({...dimensions, height: parseInt(e.target.value) || 512})}
                  min="256"
                  max="1024"
                  step="64"
                  className={isEmbedded ? "text-xs sm:text-sm h-8" : ""}
                />
              </div>
            </div>
          )}

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="prompt" className={isEmbedded ? "text-xs sm:text-sm" : ""}>Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want to generate in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={isEmbedded ? 3 : 4}
              className={isEmbedded ? "text-xs sm:text-sm" : ""}
            />
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="negativePrompt" className={isEmbedded ? "text-xs sm:text-sm" : ""}>Negative Prompt (Optional)</Label>
            <Textarea
              id="negativePrompt"
              placeholder="Describe what you want to avoid in the generation..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={isEmbedded ? 2 : 2}
              className={isEmbedded ? "text-xs sm:text-sm" : ""}
            />
          </div>

          <div className={`flex ${isEmbedded ? "justify-center sm:justify-end" : "justify-end"}`}>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`${isEmbedded ? "w-full sm:w-auto" : "w-full"} ${isEmbedded ? "text-xs sm:text-sm h-9" : ""}`}
              size={isEmbedded ? "sm" : "default"}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  <span className={isEmbedded ? "hidden sm:inline" : ""}>Generating...</span>
                  <span className={isEmbedded ? "inline sm:hidden" : "hidden"}>Generating</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={isEmbedded ? "hidden sm:inline" : ""}>Generate with Edith AI</span>
                  <span className={isEmbedded ? "inline sm:hidden" : "hidden"}>Generate</span>
                </>
              )}
            </Button>
          </div>

          {generatedContent && (
            <div className={`space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4 ${isEmbedded ? "-mx-0" : ""}`}>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {generatedContent.type === "image" ? (
                  <img
                    src={generatedContent.url}
                    alt="Generated content"
                    className={`w-full h-auto object-contain ${isEmbedded ? "max-h-48 sm:max-h-64" : "max-h-96"}`}
                  />
                ) : (
                  <video
                    src={generatedContent.url}
                    controls
                    className={`w-full h-auto ${isEmbedded ? "max-h-48 sm:max-h-64" : "max-h-96"}`}
                  />
                )}
              </div>

              <div className={`flex flex-col sm:flex-row gap-2 ${isEmbedded ? "gap-2" : ""}`}>
                <Button
                  onClick={handleUseContent}
                  className={`flex-1 ${isEmbedded ? "text-xs sm:text-sm h-9" : ""}`}
                  size={isEmbedded ? "sm" : "default"}
                >
                  <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={isEmbedded ? "hidden sm:inline" : ""}>Use Content</span>
                  <span className={isEmbedded ? "inline sm:hidden" : "hidden"}>Use</span>
                </Button>
                {generatedContent.type === "image" && (
                  <Button
                    onClick={handleUpscale}
                    disabled={isGenerating}
                    variant="secondary"
                    className={`flex-1 ${isEmbedded ? "text-xs sm:text-sm h-9" : ""}`}
                    size={isEmbedded ? "sm" : "default"}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        <span className={isEmbedded ? "hidden sm:inline" : ""}>Upscaling...</span>
                        <span className={isEmbedded ? "inline sm:hidden" : "hidden"}>Upscale</span>
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className={isEmbedded ? "hidden sm:inline" : ""}>Upscale 2x</span>
                        <span className={isEmbedded ? "inline sm:hidden" : "hidden"}>2x</span>
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
