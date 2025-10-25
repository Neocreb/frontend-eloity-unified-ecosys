import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Video,
  Upload,
  Sparkles,
  Download,
  X,
  ImageIcon,
  Scissors,
  Wand2,
  Palette,
  Crown,
  Zap,
  Bot,
  FlipHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestCameraAccess, stopCameraStream } from "@/utils/cameraPermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUserCollections } from "@/contexts/UserCollectionsContext";
import { useUserPremiumStatus } from "@/hooks/useUserPremiumStatus";
import PremiumGate from "@/components/premium/PremiumGate";

interface EnhancedMediaCreationPanelProps {
  isMobile?: boolean;
  onStickerCreate?: (stickerData: {
    type: "image" | "gif" | "meme";
    url: string;
    name: string;
    metadata?: any;
  }) => void;
  onMediaSaved?: (mediaId: string, collection: "memes" | "gifs" | "stickers") => void;
  saveToCollectionFirst?: boolean; // New prop to control behavior
}

type CreationMode = "meme" | "gif" | "photo" | "ai" | null;

export const EnhancedMediaCreationPanel: React.FC<EnhancedMediaCreationPanelProps> = ({
  isMobile = false,
  onStickerCreate,
  onMediaSaved,
  saveToCollectionFirst = true,
}) => {
  const { toast } = useToast();
  const { saveToCollection } = useUserCollections();
  const { isPremium, hasFeature, features } = useUserPremiumStatus();
  const [currentMode, setCurrentMode] = useState<CreationMode>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [memeText, setMemeText] = useState({ top: "", bottom: "" });
  const [aiPrompt, setAiPrompt] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [userCredits, setUserCredits] = useState(10); // AI generation credits
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (currentMode === "meme") {
        createMemePreview(file);
      } else if (currentMode === "gif") {
        createGifPreview(file);
      }
    }
  };

  const createMemePreview = (imageFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = Math.min(img.width, 500);
        canvas.height = (img.height * canvas.width) / img.width;

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imageFile);
  };

  const addMemeText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set font style
    const fontSize = Math.max(24, canvas.width / 15);
    ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = fontSize / 12;
    ctx.textAlign = "center";

    // Add top text
    if (memeText.top) {
      const lines = wrapText(ctx, memeText.top.toUpperCase(), canvas.width - 20);
      lines.forEach((line, index) => {
        const y = fontSize + (index * fontSize * 1.1);
        ctx.strokeText(line, canvas.width / 2, y);
        ctx.fillText(line, canvas.width / 2, y);
      });
    }

    // Add bottom text
    if (memeText.bottom) {
      const lines = wrapText(ctx, memeText.bottom.toUpperCase(), canvas.width - 20);
      const startY = canvas.height - (lines.length * fontSize * 1.1);
      lines.forEach((line, index) => {
        const y = startY + (index * fontSize * 1.1);
        ctx.strokeText(line, canvas.width / 2, y);
        ctx.fillText(line, canvas.width / 2, y);
      });
    }
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const handleCreateMeme = async () => {
    if (!uploadedFile) {
      toast({
        title: "No image selected",
        description: "Please upload an image first",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      await createMemePreview(uploadedFile);
      setTimeout(() => {
        addMemeText();
        
        canvasRef.current?.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const memeData = {
              name: `Meme - ${memeText.top || memeText.bottom || "Custom"}`,
              fileUrl: url,
              thumbnailUrl: url,
              type: "meme" as const,
              width: canvasRef.current?.width || 400,
              height: canvasRef.current?.height || 400,
              tags: ["meme", "custom", "user-generated"],
              packId: "custom-memes",
              packName: "My Memes",
              usageCount: 0,
              metadata: {
                topText: memeText.top,
                bottomText: memeText.bottom,
                originalFile: uploadedFile.name,
                createdAt: new Date().toISOString(),
              },
            };

            if (saveToCollectionFirst) {
              const mediaId = saveToCollection(memeData, "memes");
              onMediaSaved?.(mediaId, "memes");
              toast({
                title: "Meme saved!",
                description: "Your meme has been saved to your collection",
              });
            } else {
              onStickerCreate?.({
                type: "meme",
                url,
                name: memeData.name,
                metadata: memeData.metadata,
              });
              toast({
                title: "Meme created!",
                description: "Your meme sticker is ready to send",
              });
            }

            resetMode();
          }
        }, "image/png");
      }, 100);
    } catch (error) {
      toast({
        title: "Error creating meme",
        description: "Please try again with a different image",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const createGifPreview = async (videoFile: File) => {
    setProcessing(true);

    toast({
      title: "Creating animated sticker",
      description: "Processing your video...",
    });

    try {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');
      
      video.src = URL.createObjectURL(videoFile);
      
      await new Promise((resolve) => {
        video.addEventListener('loadedmetadata', resolve);
      });
      
      canvas.width = Math.min(video.videoWidth, 400);
      canvas.height = (video.videoHeight * canvas.width) / video.videoWidth;
      
      // For now, create a simplified animated preview
      // In production, you'd use gif.js or ffmpeg.wasm here
      const url = URL.createObjectURL(videoFile);

      const gifData = {
        name: `Animated - ${videoFile.name.replace(/\.[^/.]+$/, "")}`,
        fileUrl: url,
        thumbnailUrl: url,
        type: "gif" as const,
        width: canvas.width,
        height: canvas.height,
        tags: ["gif", "animated", "custom", "user-generated"],
        animated: true,
        packId: "custom-gifs",
        packName: "My GIFs",
        usageCount: 0,
        metadata: {
          originalFile: videoFile.name,
          duration: Math.min(video.duration * 1000, 5000),
          stickerType: "gif",
          animated: true,
          createdAt: new Date().toISOString(),
        },
      };

      if (saveToCollectionFirst) {
        const mediaId = saveToCollection(gifData, "gifs");
        onMediaSaved?.(mediaId, "gifs");
        toast({
          title: "GIF saved!",
          description: "Your animated GIF has been saved to your collection",
        });
      } else {
        onStickerCreate?.({
          type: "gif",
          url,
          name: gifData.name,
          metadata: gifData.metadata,
        });
        toast({
          title: "Animated sticker created!",
          description: "Your animated sticker is ready to send",
        });
      }

      resetMode();
    } catch (error) {
      console.error('GIF creation error:', error);
      toast({
        title: "Error creating GIF",
        description: "Please try with a different video",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleTakePhoto = async () => {
    setCurrentMode("photo");
    try {
      const result = await requestCameraAccess({ 
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.stream) {
        setCameraStream(result.stream);
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
        }
      }
    } catch (error: any) {
      console.error('Camera access denied:', error);
      toast({
        title: "Camera access denied",
        description: error.message || "Please allow camera access or choose from gallery",
        variant: "destructive",
      });
      // Fallback to file input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraStream) return;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const photoData = {
          name: `Photo - ${new Date().toLocaleTimeString()}`,
          fileUrl: url,
          thumbnailUrl: url,
          type: "image" as const,
          width: canvas.width,
          height: canvas.height,
          tags: ["photo", "camera", "custom", "user-generated"],
          packId: "custom-photos",
          packName: "My Photos",
          usageCount: 0,
          metadata: {
            capturedAt: new Date().toISOString(),
            camera: true,
            facingMode,
          },
        };

        if (saveToCollectionFirst) {
          const mediaId = saveToCollection(photoData, "stickers");
          onMediaSaved?.(mediaId, "stickers");
          toast({
            title: "Photo saved!",
            description: "Your photo has been saved to your collection",
          });
        } else {
          onStickerCreate?.({
            type: "image",
            url,
            name: photoData.name,
            metadata: photoData.metadata,
          });
          toast({
            title: "Photo captured!",
            description: "Your photo sticker is ready to send",
          });
        }

        resetMode();
      }
    }, 'image/png');
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    
    if (cameraStream) {
      stopCameraStream(cameraStream);
      
      try {
        const result = await requestCameraAccess({ 
          video: { 
            facingMode: newFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        if (result.stream) {
          setCameraStream(result.stream);
          if (videoRef.current) {
            videoRef.current.srcObject = result.stream;
          }
        }
      } catch (error: any) {
        console.error('Error switching camera:', error);
        toast({
          title: "Camera switch failed",
          description: error.message || "Could not switch to the other camera",
          variant: "destructive",
        });
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleAIGeneration = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI sticker generation is available for premium users only",
        variant: "destructive",
      });
      return;
    }

    if (userCredits <= 0) {
      toast({
        title: "No credits remaining",
        description: "You need credits to generate AI stickers",
        variant: "destructive",
      });
      return;
    }

    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description for your AI sticker",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      toast({
        title: "Generating AI sticker",
        description: "Creating your custom sticker...",
      });
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create a placeholder AI-generated image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');
      
      canvas.width = 256;
      canvas.height = 256;
      
      // Create gradient background with text
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#ff7eb3');
      gradient.addColorStop(1, '#ff758c');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI Generated', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText(aiPrompt.slice(0, 20) + '...', canvas.width / 2, canvas.height / 2 + 20);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const aiData = {
            name: `AI - ${aiPrompt.slice(0, 20)}`,
            fileUrl: url,
            thumbnailUrl: url,
            type: "image" as const,
            width: canvas.width,
            height: canvas.height,
            tags: ["ai-generated", "custom", "user-generated"],
            packId: "ai-stickers",
            packName: "AI Generated",
            usageCount: 0,
            metadata: {
              aiGenerated: true,
              prompt: aiPrompt,
              createdAt: new Date().toISOString(),
              creditsUsed: 1,
            },
          };

          if (saveToCollectionFirst) {
            const mediaId = saveToCollection(aiData, "stickers");
            onMediaSaved?.(mediaId, "stickers");
            toast({
              title: "AI sticker saved!",
              description: "Your AI-generated sticker has been saved to your collection",
            });
          } else {
            onStickerCreate?.({
              type: "image",
              url,
              name: aiData.name,
              metadata: aiData.metadata,
            });
            toast({
              title: "AI sticker created!",
              description: "Your AI-generated sticker is ready",
            });
          }

          resetMode();
        }
      }, 'image/png');
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: "AI generation failed",
        description: "Please try again with a different prompt",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const photoData = {
        name: `Photo - ${new Date().toLocaleTimeString()}`,
        fileUrl: url,
        thumbnailUrl: url,
        type: "image" as const,
        width: 512,
        height: 512,
        tags: ["photo", "custom", "user-generated"],
        packId: "custom-photos",
        packName: "My Photos",
        usageCount: 0,
        metadata: {
          capturedAt: new Date().toISOString(),
          originalFile: file.name,
        },
      };

      if (saveToCollectionFirst) {
        const mediaId = saveToCollection(photoData, "stickers");
        onMediaSaved?.(mediaId, "stickers");
        toast({
          title: "Photo saved!",
          description: "Your photo has been saved to your collection",
        });
      } else {
        onStickerCreate?.({
          type: "image",
          url,
          name: photoData.name,
          metadata: photoData.metadata,
        });
        toast({
          title: "Photo selected!",
          description: "Your photo sticker is ready to send",
        });
      }

      resetMode();
    }
  };

  const resetMode = () => {
    setCurrentMode(null);
    setUploadedFile(null);
    setMemeText({ top: "", bottom: "" });
    setAiPrompt("");
    stopCamera();
  };

  if (!currentMode) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className={cn("font-semibold", isMobile ? "text-lg" : "text-xl")}>
            Create Custom Content
          </h3>
          <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-base")}>
            Turn your photos and videos into fun stickers and memes
          </p>
        </div>

        <div className="grid gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentMode("meme")}
            className="justify-start h-auto p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg">
                <Palette className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">🎨 Create Meme</p>
                <p className="text-sm text-muted-foreground">
                  Turn images into fun stickers
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentMode("gif")}
            className="justify-start h-auto p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg">
                <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">🎬 Create GIF</p>
                <p className="text-sm text-muted-foreground">
                  Convert videos to animated stickers
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleTakePhoto}
            className="justify-start h-auto p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg">
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">📸 Take Photo</p>
                <p className="text-sm text-muted-foreground">
                  Capture and create instantly
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentMode("ai")}
            className="justify-start h-auto p-4 relative"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 rounded-lg">
                <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-medium flex items-center gap-2">
                  🤖 AI Generator
                  <Crown className="w-4 h-4 text-yellow-500" />
                </p>
                <p className="text-sm text-muted-foreground">
                  Generate stickers with AI
                </p>
              </div>
            </div>
          </Button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={resetMode}
        >
          <X className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold">
          {currentMode === "meme" && "🎨 Create Meme"}
          {currentMode === "gif" && "🎬 Create GIF"}
          {currentMode === "photo" && "📸 Take Photo"}
          {currentMode === "ai" && "🤖 AI Generator"}
        </h3>
      </div>

      {/* Meme Creator */}
      {currentMode === "meme" && (
        <div className="space-y-4">
          {!uploadedFile ? (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-dashed border-2"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p>Upload an image</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
              </div>
            </Button>
          ) : (
            <div className="space-y-3">
              <canvas
                ref={canvasRef}
                className="w-full border rounded-lg max-h-60 object-contain"
              />
              
              <div className="space-y-2">
                <Input
                  placeholder="Top text"
                  value={memeText.top}
                  onChange={(e) => setMemeText(prev => ({ ...prev, top: e.target.value }))}
                />
                <Input
                  placeholder="Bottom text"
                  value={memeText.bottom}
                  onChange={(e) => setMemeText(prev => ({ ...prev, bottom: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={addMemeText} variant="outline" className="flex-1">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Preview Text
                </Button>
                <Button
                  onClick={handleCreateMeme}
                  disabled={processing || (!memeText.top && !memeText.bottom)}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Meme
                    </>
                  )}
                </Button>
              </div>
              {(!memeText.top && !memeText.bottom) && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Add some text to create your meme
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* GIF Creator */}
      {currentMode === "gif" && (
        <div className="space-y-4">
          {!uploadedFile ? (
            <Button
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              className="w-full h-32 border-dashed border-2"
            >
              <div className="text-center">
                <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p>Upload a video</p>
                <p className="text-xs text-muted-foreground">MP4, WEBM, MOV</p>
              </div>
            </Button>
          ) : (
            <div className="space-y-3">
              <video
                src={URL.createObjectURL(uploadedFile)}
                controls
                className="w-full border rounded-lg max-h-60"
              />
              
              <Button
                onClick={() => createGifPreview(uploadedFile)}
                disabled={processing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {processing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Animated Sticker
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Converting your video to an animated sticker
              </p>
            </div>
          )}
        </div>
      )}

      {/* Photo Capture Mode */}
      {currentMode === "photo" && (
        <div className="space-y-4">
          {cameraStream ? (
            <div className="space-y-3">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-square object-cover rounded-lg border"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={switchCamera}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-white/30"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture
                </Button>
                <Button
                  variant="outline"
                  onClick={resetMode}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <Camera className="w-12 h-12 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-lg mb-2">Capture Photo</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Take a photo to create an instant sticker
                </p>
                <Button
                  onClick={handleTakePhoto}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Generation Mode */}
      {currentMode === "ai" && (
        <div className="space-y-4">
          <div className="text-center space-y-3">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl">
              <div className="flex justify-center items-center mb-3">
                <Bot className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                <Crown className="w-6 h-6 text-yellow-500 -ml-2 -mt-2" />
              </div>
              <h4 className="font-medium text-lg mb-2">AI Sticker Generator</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Describe your sticker and let AI create it for you
              </p>
              
              {!isPremium ? (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                    ⭐ Premium Feature
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Upgrade to premium to access AI sticker generation
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Credits remaining:</span>
                    <Badge variant="secondary">{userCredits}</Badge>
                  </div>
                  <Input
                    placeholder="Describe your sticker... (e.g., 'cute cat with sunglasses')"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    maxLength={100}
                  />
                  <Button
                    onClick={handleAIGeneration}
                    disabled={processing || !aiPrompt.trim() || userCredits <= 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Sticker (1 credit)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default EnhancedMediaCreationPanel;
