import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, ChevronLeft, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileData {
  displayName: string;
  username: string;
  bio: string;
  avatar: string;
  banner: string;
  location: string;
  website: string;
  email: string;
  phone: string;
  company: string;
  education: string;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData>({
    displayName: user?.user_metadata?.full_name || '',
    username: user?.user_metadata?.username || '',
    bio: user?.user_metadata?.bio || '',
    avatar: user?.user_metadata?.avatar_url || '',
    banner: user?.user_metadata?.banner_url || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    company: user?.user_metadata?.company || '',
    education: user?.user_metadata?.education || '',
  });

  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    username: profile.username,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    company: profile.company,
    education: profile.education
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(profile.avatar);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }
    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let avatar_url: string | null = null;
      if (avatarFile) {
        const bucket = 'avatars';
        const path = `${user.id}/${Date.now()}-${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, avatarFile, {
          upsert: false,
          cacheControl: '3600',
          contentType: avatarFile.type,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        avatar_url = data.publicUrl;
      }

      const updates: any = {
        full_name: formData.displayName,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        company: formData.company,
        education: formData.education,
      };
      if (avatar_url) updates.avatar_url = avatar_url;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Your profile has been updated",
      });

      navigate(-1);
    } catch (e) {
      console.error('Profile save failed:', (e as any)?.message || e);
      toast({
        title: "Error",
        description: (e as any)?.message || 'Failed to save profile',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = 
    formData.displayName !== profile.displayName ||
    formData.username !== profile.username ||
    formData.bio !== profile.bio ||
    formData.location !== profile.location ||
    formData.website !== profile.website ||
    formData.company !== profile.company ||
    formData.education !== profile.education ||
    !!avatarFile;

  return (
    <div className="min-h-screen bg-background flex flex-col dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Edit Profile</h1>
          </div>
          {hasChanges && (
            <div className="text-xs text-muted-foreground">
              Unsaved changes
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <div className="space-y-6 sm:space-y-8">
            {/* Profile Picture Section */}
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-900/50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-white dark:border-gray-800 shadow-lg">
                      <AvatarImage src={avatarPreview} alt={formData.displayName} />
                      <AvatarFallback className="text-2xl sm:text-3xl font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {formData.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id="avatar-input" 
                      onChange={handleAvatarSelect} 
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                      onClick={() => document.getElementById('avatar-input')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change avatar</span>
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the camera icon to change your profile picture. Images must be under 5MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Display Name */}
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="displayName" className="text-base font-semibold">
                    Display Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="Your display name"
                    className={cn("h-10", errors.displayName && "border-red-500")}
                  />
                  {errors.displayName && (
                    <p className="text-sm text-red-500">{errors.displayName}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="username" className="text-base font-semibold">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="@username"
                    className={cn("h-10", errors.username && "border-red-500")}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="location" className="text-base font-semibold">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className="h-10"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="website" className="text-base font-semibold">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className={cn("h-10", errors.website && "border-red-500")}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="company" className="text-base font-semibold">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your company"
                    className="h-10"
                  />
                </div>

                {/* Education */}
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="education" className="text-base font-semibold">
                    Education
                  </Label>
                  <Input
                    id="education"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    placeholder="Your education"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-base font-semibold">
                    Bio
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.bio.length}/500
                  </span>
                </div>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell people about yourself..."
                  className={cn("min-h-24 resize-none", errors.bio && "border-red-500")}
                  maxLength={500}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio}</p>
                )}
              </div>
            </div>

            {/* Information Alert */}
            <Alert className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm text-muted-foreground">
                Your profile information is public and visible to other users on the platform.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-4 px-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin mr-2 border-2 border-white border-t-transparent rounded-full" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
