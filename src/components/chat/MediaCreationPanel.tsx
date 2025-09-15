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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface MediaCreationPanelProps {
  isMobile?: boolean;
  onStickerCreate: (stickerData: {
    type: "image" | "gif" | "meme";
    url: string;
    name: string;
    metadata?: any;
  }) => void;
  isPremium?: boolean;
}

type CreationMode = "meme" | "gif" | "photo" | "ai" | null;

export const MediaCreationPanel: React.FC<MediaCreationPanelProps> = ({
  isMobile = false,
  onStickerCreate,
  isPremium = false,
}) => {
  const { toast } = useToast();
  const [currentMode, setCurrentMode] = useState<CreationMode>(null);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [memeText, setMemeText] = useState({ top: "", bottom: "" });
  const [aiPrompt, setAiPrompt] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      // Recreate the image and add text
      await createMemePreview(uploadedFile);
      setTimeout(() => {
        addMemeText();
        
        // Convert canvas to blob
        canvasRef.current?.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            onStickerCreate({
              type: "meme",
              url,
              name: `Meme - ${memeText.top || memeText.bottom || "Custom"}`,
              metadata: {
                topText: memeText.top,
                bottomText: memeText.bottom,
                originalFile: uploadedFile.name,
              },
            });
            
            toast({
              title: "Meme created!",
              description: "Your meme sticker is ready to send",
            });
            
            // Reset
            setCurrentMode(null);
            setUploadedFile(null);
            setMemeText({ top: "", bottom: "" });
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

  const createGifPreview = (videoFile: File) => {
    setProcessing(true);

    // For demo purposes, we'll create a static preview using the video file
    // In a real app, you'd use a library like gif.js or ffmpeg.wasm to convert video to GIF
    const url = URL.createObjectURL(videoFile);

    toast({
      title: "Creating animated sticker",
      description: "Processing your video...",
    });

    // Simulate processing time
    setTimeout(() => {
      onStickerCreate({
        type: "gif",
        url,
        name: `Animated - ${videoFile.name.replace(/\.[^/.]+$/, "")}`,
        metadata: {
          originalFile: videoFile.name,
          duration: 3000, // Mock duration
          stickerType: "gif",
          animated: true,
        },
      });

      toast({
        title: "Animated sticker created!",
        description: "Your animated sticker is ready to send",
      });

      setCurrentMode(null);
      setUploadedFile(null);
      setProcessing(false);
    }, 2000);
  };

  const handleTakePhoto = () => {
    setCurrentMode("photo");
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onStickerCreate({
        type: "image",
        url,
        name: `Photo - ${new Date().toLocaleTimeString()}`,
        metadata: {
          capturedAt: new Date().toISOString(),
          originalFile: file.name,
        },
      });
      
      toast({
        title: "Photo captured!",
        description: "Your photo sticker is ready to send",
      });
    }
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
                <p className="font-medium">Create Meme</p>
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
                <p className="font-medium">Create GIF</p>
                <p className="text-sm text-muted-foreground">
                  Convert videos to animated stickers
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentMode("photo")}
            className="justify-start h-auto p-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg">
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">Take Photo</p>
                <p className="text-sm text-muted-foreground">
                  Capture and create instantly
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
          onClick={() => {
            setCurrentMode(null);
            setUploadedFile(null);
            setMemeText({ top: "", bottom: "" });
          }}
        >
          <X className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold">
          {currentMode === "meme" && "Create Meme"}
          {currentMode === "gif" && "Create GIF"}
          {currentMode === "photo" && "Take Photo"}
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
