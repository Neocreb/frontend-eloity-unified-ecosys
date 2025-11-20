import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  FileText,
  Plus,
  X,
  ChevronLeft,
  Globe,
  Github,
  Figma,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ExternalWork {
  id: string;
  title: string;
  description: string;
  type: "link" | "image" | "video" | "document";
  url: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  created_at: string;
}

const categories = [
  { id: "web_development", name: "Web Development" },
  { id: "mobile_app", name: "Mobile Apps" },
  { id: "ui_ux", name: "UI/UX Design" },
  { id: "backend", name: "Backend Development" },
  { id: "frontend", name: "Frontend Development" },
  { id: "fullstack", name: "Full Stack" },
  { id: "design", name: "Graphic Design" },
  { id: "branding", name: "Branding" },
  { id: "photography", name: "Photography" },
  { id: "video", name: "Video Production" },
  { id: "marketing", name: "Marketing" },
  { id: "writing", name: "Content Writing" },
  { id: "other", name: "Other" },
];

const workTypes = [
  {
    id: "link",
    name: "Website/Portfolio Link",
    icon: LinkIcon,
    description: "Link to your work online",
  },
  {
    id: "image",
    name: "Image/Screenshot",
    icon: ImageIcon,
    description: "Upload images of your work",
  },
  {
    id: "video",
    name: "Video Demo",
    icon: Play,
    description: "Video showcasing your work",
  },
  {
    id: "document",
    name: "Document/PDF",
    icon: FileText,
    description: "PDF or document file",
  },
];

const platformSuggestions = [
  { name: "GitHub", icon: Github, url: "https://github.com/" },
  { name: "Portfolio", icon: Globe, url: "https://" },
  { name: "Figma", icon: Figma, url: "https://figma.com/" },
  { name: "Dribbble", icon: ExternalLink, url: "https://dribbble.com/" },
  { name: "Behance", icon: ExternalLink, url: "https://behance.net/" },
];

export default function AddExternalWork() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "link" as "link" | "image" | "video" | "document",
    url: "",
    category: "",
    tags: [] as string[],
    thumbnail: "",
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.url || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newWork: ExternalWork = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
      };

      toast({
        title: "Work Added!",
        description: "Your external work has been added to your portfolio",
      });

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error adding work:", error);
      toast({
        title: "Error",
        description: "Failed to add work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const getCurrentTypeConfig = () => {
    return workTypes.find((t) => t.id === formData.type);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 p-4 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-0 h-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add External Work
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Work Type Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What type of work would you like to add?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: type.id as any }))}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <Icon className={cn("h-5 w-5 mb-2", 
                        isSelected ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                      )} />
                      <p className={cn(
                        "font-semibold",
                        isSelected
                          ? "text-blue-900 dark:text-blue-300"
                          : "text-gray-900 dark:text-white"
                      )}>
                        {type.name}
                      </p>
                      <p className={cn(
                        "text-sm",
                        isSelected
                          ? "text-blue-800 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      )}>
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-900 dark:text-white">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="e.g., E-commerce Platform Redesign"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-900 dark:text-white">
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your work, responsibilities, technologies used, and any achievements..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-24"
                rows={4}
              />
            </div>

            {/* URL/Link */}
            <div className="space-y-2">
              <Label htmlFor="url" className="text-gray-900 dark:text-white">
                URL/Link *
              </Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                type="url"
                required
              />

              {/* Platform Suggestions */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Quick Links:
                </p>
                <div className="flex flex-wrap gap-2">
                  {platformSuggestions.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <button
                        key={platform.name}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, url: platform.url }))
                        }
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                      >
                        <Icon className="h-3 w-3" />
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-900 dark:text-white">
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag and press Add"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 flex items-center gap-2 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>Tips:</strong> Add links to your best work, include
                portfolio pieces, GitHub repositories, live projects, or any
                professional content that showcases your skills.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Work"}
          </Button>
        </div>
      </div>
    </div>
  );
}
