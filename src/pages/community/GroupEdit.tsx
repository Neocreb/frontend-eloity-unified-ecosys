import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  X,
  Loader,
  Camera,
} from "lucide-react";
import GroupService from "@/services/groupService";
import { useAuth } from "@/contexts/AuthContext";

interface Group {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  member_count: number;
  privacy: "public" | "private";
  is_owner?: boolean;
  creator_id: string;
}

const GroupEdit: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [previewAvatar, setPreviewAvatar] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!groupId || !user) return;

      try {
        setLoading(true);
        setError(null);

        const groupData = await GroupService.getGroupById(groupId, user.id);

        if (!groupData) {
          setError("Group not found");
          return;
        }

        // Only allow owner to edit
        if (groupData.creator_id !== user.id) {
          setError("You don't have permission to edit this group");
          return;
        }

        const transformedGroup: Group = {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description || "",
          cover_url: groupData.cover_url || "",
          member_count: groupData.member_count,
          privacy: groupData.privacy as "public" | "private",
          is_owner: groupData.creator_id === user.id,
          creator_id: groupData.creator_id,
        };

        setGroup(transformedGroup);
        setName(transformedGroup.name);
        setDescription(transformedGroup.description || "");
        setAvatar(transformedGroup.cover_url || "");
        setPreviewAvatar(transformedGroup.cover_url || "");
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("Failed to fetch group data");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setHasChanges(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setHasChanges(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please choose an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please choose an image file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatar(result);
        setPreviewAvatar(result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    setPreviewAvatar("");
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!group || !groupId) return;

    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    if (name.length < 3) {
      toast({
        title: "Validation Error",
        description: "Group name must be at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    if (name.length > 100) {
      toast({
        title: "Validation Error",
        description: "Group name cannot exceed 100 characters",
        variant: "destructive",
      });
      return;
    }

    if (description.length > 500) {
      toast({
        title: "Validation Error",
        description: "Description cannot exceed 500 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      await GroupService.updateGroup(groupId, {
        groupId: groupId,
        name: name.trim(),
        description: description.trim() || undefined,
        avatar: avatar || undefined,
      });

      toast({
        title: "Success",
        description: "Group updated successfully",
      });

      setHasChanges(false);
      // Navigate back after a short delay
      setTimeout(() => navigate(-1), 1000);
    } catch (error) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "Failed to update group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading group data...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {error || "Error"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || "Unable to load group data"}
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Edit Group</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Avatar Section */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Group Avatar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewAvatar ? (
              <div className="relative inline-block">
                <img
                  src={previewAvatar}
                  alt="Group avatar preview"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <Camera className="w-8 h-8 text-white opacity-60" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-500">
              Recommended size: 512x512px. Max file size: 5MB
            </p>
          </CardContent>
        </Card>

        {/* Group Name */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Group Name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Name</Label>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder="Enter group name"
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              maxLength={100}
            />
            <div className="flex justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Minimum 3 characters required
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {name.length}/100
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Description</Label>
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Tell members what this group is about..."
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Optional. Max 500 characters.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {description.length}/500
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              💡 <strong>Tip:</strong> Changes to group information will be visible to all members
              immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupEdit;
