import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Send,
  Plus,
  Image as ImageIcon,
  Video,
  File,
  Smile,
  Type,
  Crop,
  RotateCcw,
  Download,
  Trash2,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import WhatsAppEmojiPicker from "./WhatsAppEmojiPicker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (files: File[], caption?: string) => void;
  allowMultiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
}

interface FileWithPreview {
  file: File;
  preview: string;
  type: "image" | "video" | "document";
  caption?: string;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSend,
  allowMultiple = true,
  maxFiles = 10,
  maxSize = 50,
}) => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): "image" | "video" | "document" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(""); // No preview for documents
      }
    });
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const validFiles: FileWithPreview[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${maxSize}MB`,
          variant: "destructive",
        });
        continue;
      }

      // Check if we've reached max files
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        });
        break;
      }

      const preview = await createPreview(file);
      validFiles.push({
        file,
        preview,
        type: getFileType(file),
        caption: "",
      });
    }

    if (allowMultiple) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
    }

    if (validFiles.length > 0) {
      setCurrentFileIndex(selectedFiles.length);
    }
  }, [selectedFiles.length, maxFiles, maxSize, allowMultiple, toast]);

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (currentFileIndex >= updated.length && updated.length > 0) {
        setCurrentFileIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const handleSend = () => {
    if (selectedFiles.length === 0) return;

    const files = selectedFiles.map(f => f.file);
    onSend(files, caption);
    
    // Reset state
    setSelectedFiles([]);
    setCaption("");
    setCurrentFileIndex(0);
    onClose();
  };

  const handleEmojiSelect = (emoji: string) => {
    setCaption(prev => prev + emoji);
    setShowEmojiPicker(false);
    // Focus back to input
    setTimeout(() => captionInputRef.current?.focus(), 100);
  };

  const currentFile = selectedFiles[currentFileIndex];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {selectedFiles.length === 0 ? "Select Media" : `${selectedFiles.length} file(s) selected`}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => cameraInputRef.current?.click()}
                className="h-9 w-9"
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={allowMultiple}
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex-1 flex overflow-hidden">
          {selectedFiles.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select photos and videos</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose from your device or take a new photo
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Choose Files
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* File list sidebar */}
              {allowMultiple && selectedFiles.length > 1 && (
                <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <ScrollArea className="h-full p-2">
                    <div className="space-y-2">
                      {selectedFiles.map((fileData, index) => (
                        <div
                          key={index}
                          className={cn(
                            "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                            currentFileIndex === index
                              ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                          onClick={() => setCurrentFileIndex(index)}
                        >
                          {fileData.type === "image" ? (
                            <img
                              src={fileData.preview}
                              alt={fileData.file.name}
                              className="w-full h-16 object-cover"
                            />
                          ) : fileData.type === "video" ? (
                            <div className="relative w-full h-16 bg-black flex items-center justify-center">
                              <Video className="h-6 w-6 text-white" />
                              <video
                                src={fileData.preview}
                                className="absolute inset-0 w-full h-full object-cover opacity-50"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <File className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(index);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>

                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1">
                            <p className="text-xs truncate">{fileData.file.name}</p>
                            <p className="text-xs text-gray-300">{formatFileSize(fileData.file.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Main preview area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center bg-black">
                  {currentFile && (
                    <>
                      {currentFile.type === "image" ? (
                        <img
                          src={currentFile.preview}
                          alt={currentFile.file.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : currentFile.type === "video" ? (
                        <video
                          src={currentFile.preview}
                          controls
                          className="max-w-full max-h-full"
                        />
                      ) : (
                        <div className="text-center text-white p-8">
                          <File className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-semibold mb-2">{currentFile.file.name}</h3>
                          <p className="text-gray-400">{formatFileSize(currentFile.file.size)}</p>
                          <Badge variant="secondary" className="mt-2">
                            {currentFile.file.type || "Unknown type"}
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* File info bar */}
                {currentFile && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{currentFile.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(currentFile.file.size)} • {currentFile.file.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {currentFile.type === "image" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Crop className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveFile(currentFileIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Caption input */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={captionInputRef}
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="pr-10"
                  maxLength={1024}
                />
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    >
                      <Smile className="h-4 w-4 text-gray-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-auto p-0">
                    <WhatsAppEmojiPicker onEmojiSelect={handleEmojiSelect} />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                onClick={handleSend}
                disabled={selectedFiles.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send {selectedFiles.length > 1 ? `(${selectedFiles.length})` : ""}
              </Button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>{caption.length}/1024 characters</span>
              <span>{selectedFiles.length}/{maxFiles} files</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
