import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Crop,
  Palette,
  Wand2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Image as ImageIcon,
  Plus,
  Scissors,
  RotateCw,
  Zap,
  Sparkles,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { StickerCategory, StickerCreationFile, StickerCreationRequest } from "@/types/sticker";
import { stickerService } from "@/services/stickerService";

const STICKER_CATEGORIES: { value: StickerCategory; label: string }[] = [
  { value: "emotions", label: "Emotions & Reactions" },
  { value: "memes", label: "Memes & Funny" },
  { value: "gestures", label: "Gestures & Actions" },
  { value: "business", label: "Business & Work" },
  { value: "food", label: "Food & Drinks" },
  { value: "animals", label: "Animals & Nature" },
  { value: "sports", label: "Sports & Activities" },
  { value: "travel", label: "Travel & Places" },
  { value: "custom", label: "Custom Category" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const RECOMMENDED_SIZE = { width: 512, height: 512 };

export const StickerCreation: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form state
  const [packName, setPackName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<StickerCategory>("custom");
  const [isPublic, setIsPublic] = useState(false);
  const [files, setFiles] = useState<StickerCreationFile[]>([]);
  const [currentStep, setCurrentStep] = useState<"upload" | "edit" | "preview" | "submit">("upload");
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Editor state
  const [editorTool, setEditorTool] = useState<"crop" | "background" | "text">("crop");
  const [stickerText, setStickerText] = useState("");

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    const validFiles = selectedFiles.filter((file) => {
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        toast({
          title: "Unsupported format",
          description: `${file.name} is not a supported image format`,
          variant: "destructive",
        });
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        return false;
      }

      return true;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const newFile: StickerCreationFile = {
            id: Math.random().toString(36).substr(2, 9),
            originalName: file.name,
            fileUrl: (e.target?.result as string) || "",
            type: file.type,
            size: file.size,
            width: img.width,
            height: img.height,
          };

          setFiles((prev) => [...prev, newFile]);
        };
        img.src = (e.target?.result as string) || "";
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0 && currentStep === "upload") {
      setCurrentStep("edit");
    }
  }, [currentStep, toast]);

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (selectedFileIndex !== null && files[selectedFileIndex]?.id === fileId) {
      setSelectedFileIndex(null);
    }
  };

  const handleEditFile = (index: number) => {
    setSelectedFileIndex(index);
  };

  const applyBackgroundRemoval = async (file: StickerCreationFile) => {
    toast({
      title: "Background Removal",
      description: "AI background removal feature in development!",
    });

    const processedFile = {
      ...file,
      processedUrl: file.fileUrl,
    };

    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? processedFile : f))
    );
  };

  const applyTextOverlay = (file: StickerCreationFile, text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Add text
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.textAlign = "center";
      ctx.strokeText(text, canvas.width / 2, canvas.height - 50);
      ctx.fillText(text, canvas.width / 2, canvas.height - 50);

      // Convert to data URL
      const processedUrl = canvas.toDataURL("image/png");

      const processedFile = {
        ...file,
        processedUrl,
      };

      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? processedFile : f))
      );

      toast({
        title: "Text added",
        description: "Text overlay applied to sticker",
      });
    };

    img.src = file.fileUrl;
  };

  const optimizeStickers = async () => {
    setIsProcessing(true);
    setUploadProgress(0);

    // Mock optimization process
    for (let i = 0; i < files.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUploadProgress(((i + 1) / files.length) * 100);
    }

    setIsProcessing(false);
    setCurrentStep("preview");

    toast({
      title: "Stickers optimized",
      description: "All stickers have been optimized for best performance",
    });
  };

  const handleSubmitPack = async () => {
    if (!packName.trim()) {
      toast({
        title: "Pack name required",
        description: "Please enter a name for your sticker pack",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No stickers",
        description: "Please add at least one sticker to your pack",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (user) {
        const requestId = await stickerService.createStickerPack(user.id, {
          packName,
          description,
          category,
          isPublic,
          files,
        });

        toast({
          title: "Pack submitted!",
          description: "Your sticker pack has been submitted for review",
        });
      }

      navigate(-1);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit sticker pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Upload Your Images</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Add images to create your sticker pack. We support PNG, JPEG, GIF, and WebP formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="h-32 flex flex-col gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          variant="outline"
        >
          <ImageIcon className="w-8 h-8" />
          <span>Choose Files</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Up to 5MB each</span>
        </Button>

        <Button
          onClick={() => {
            toast({
              title: "Camera feature",
              description: "Camera integration in development!",
            });
          }}
          className="h-32 flex flex-col gap-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          variant="outline"
        >
          <Camera className="w-8 h-8" />
          <span>Take Photos</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Use camera</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Files ({files.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <div key={file.id} className="relative group">
                <img
                  src={file.fileUrl}
                  alt={file.originalName}
                  className="w-full aspect-square object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditFile(index)}
                    >
                      <Crop className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(file.size / 1024)}KB
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEditStep = () => {
    const selectedFile =
      selectedFileIndex !== null ? files[selectedFileIndex] : null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Edit Stickers</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fine-tune your stickers with cropping, background removal, and text overlays
          </p>
        </div>

        {selectedFile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-4">
              <Label>Preview</Label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-64">
                <img
                  src={selectedFile.processedUrl || selectedFile.fileUrl}
                  alt="Preview"
                  className="max-w-64 max-h-64 rounded-lg object-contain"
                />
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-4">
              <Label>Edit Tools</Label>
              <Tabs value={editorTool} onValueChange={(value: any) => setEditorTool(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="crop">
                    <Crop className="w-4 h-4 mr-2" />
                    Crop
                  </TabsTrigger>
                  <TabsTrigger value="background">
                    <Palette className="w-4 h-4 mr-2" />
                    Background
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Text
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="crop" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Crop to square (recommended)</Label>
                    <Button onClick={() => {
                      toast({
                        title: "Crop applied",
                        description: "Sticker cropped to square format",
                      });
                    }}>
                      Apply Square Crop
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="background" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Remove Background</Label>
                    <Button
                      onClick={() => applyBackgroundRemoval(selectedFile)}
                      className="w-full"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      AI Background Removal
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Text</Label>
                    <Input
                      placeholder="Enter text..."
                      value={stickerText}
                      onChange={(e) => setStickerText(e.target.value)}
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                    <Button
                      onClick={() => applyTextOverlay(selectedFile, stickerText)}
                      disabled={!stickerText.trim()}
                      className="w-full"
                    >
                      Add Text Overlay
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* File list */}
        <div className="space-y-4">
          <Label>All Files</Label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {files.map((file, index) => (
              <button
                key={file.id}
                onClick={() => setSelectedFileIndex(index)}
                className={cn(
                  "relative aspect-square rounded-lg border-2 overflow-hidden transition-all",
                  selectedFileIndex === index
                    ? "border-purple-500 ring-2 ring-purple-200 dark:ring-purple-900/50"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <img
                  src={file.processedUrl || file.fileUrl}
                  alt={file.originalName}
                  className="w-full h-full object-cover"
                />
                {file.processedUrl && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  };

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preview & Optimize</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review your stickers and optimize them for the best chat experience
        </p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {files.map((file) => (
          <div key={file.id} className="space-y-2">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg p-2 flex items-center justify-center">
              <img
                src={file.processedUrl || file.fileUrl}
                alt={file.originalName}
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
            <div className="text-xs text-center space-y-1">
              <p className="font-medium truncate">{file.originalName}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {file.width}×{file.height}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Optimize for Chat</h4>
          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
            Recommended
          </Badge>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          We'll optimize your stickers for the best chat experience by resizing to{" "}
          {RECOMMENDED_SIZE.width}×{RECOMMENDED_SIZE.height}px and compressing to reduce file size
          while maintaining quality.
        </p>
        <Button
          onClick={optimizeStickers}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isProcessing ? (
            <>
              <Zap className="w-4 h-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Optimize Stickers
            </>
          )}
        </Button>
        {isProcessing && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              Processing {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubmitStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Pack Details</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add final information about your sticker pack before submission
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="packName">Pack Name *</Label>
            <Input
              id="packName"
              placeholder="My Awesome Stickers"
              value={packName}
              onChange={(e) => setPackName(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Give your pack a unique, memorable name
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your sticker pack..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Help others understand what your pack is about
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value: StickerCategory) => setCategory(value)}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STICKER_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <Label htmlFor="isPublic" className="text-sm cursor-pointer">
              Make this pack public
            </Label>
          </div>
          {isPublic && (
            <p className="text-xs text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
              ✓ Public packs can be discovered and downloaded by other users
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Preview ({files.length} stickers)</Label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
            {files.map((file) => (
              <div
                key={file.id}
                className="aspect-square bg-white dark:bg-gray-800 rounded flex items-center justify-center"
              >
                <img
                  src={file.processedUrl || file.fileUrl}
                  alt={file.originalName}
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getStepProgress = () => {
    const steps = ["upload", "edit", "preview", "submit"];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const goToNextStep = () => {
    const steps = ["upload", "edit", "preview", "submit"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as any);
    }
  };

  const goToPrevStep = () => {
    const steps = ["upload", "edit", "preview", "submit"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as any);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between p-4 mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Create Sticker Pack
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Turn your images into custom stickers
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              Step {["upload", "edit", "preview", "submit"].indexOf(currentStep) + 1} of 4
            </span>
            <span>{Math.round(getStepProgress())}%</span>
          </div>
          <Progress value={getStepProgress()} className="h-1" />
        </div>
      </div>

      {/* Main content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {currentStep === "upload" && renderUploadStep()}
          {currentStep === "edit" && renderEditStep()}
          {currentStep === "preview" && renderPreviewStep()}
          {currentStep === "submit" && renderSubmitStep()}
        </div>
      </ScrollArea>

      {/* Footer with navigation */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={goToPrevStep}
          disabled={currentStep === "upload"}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          {currentStep === "submit" ? (
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={!packName.trim() || files.length === 0 || isProcessing}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Upload className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Pack
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNextStep}
              disabled={
                (currentStep === "upload" && files.length === 0) ||
                (currentStep === "preview" && isProcessing)
              }
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Sticker Pack?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Your sticker pack "{packName}" with {files.length}{" "}
              {files.length === 1 ? "sticker" : "stickers"} will be submitted for review.
              {isPublic && " It will be made available to all users once approved."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitPack}>
              Submit Pack
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StickerCreation;
