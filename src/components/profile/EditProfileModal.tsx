import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
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
  };
  onBannerChange?: (file: File) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onBannerChange
}) => {
  const { user } = useAuth();
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
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>(profile.banner);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result as string);
      reader.readAsDataURL(file);
      onBannerChange?.(file);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      let avatar_url: string | null = null;
      if (avatarFile) {
        const bucket = 'avatars'; // Create a public bucket named "avatars" in Supabase Storage
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

      let banner_url: string | null = null;
      if (bannerFile) {
        const bucket = 'avatars';
        const path = `${user.id}/banner-${Date.now()}-${bannerFile.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(path, bannerFile, {
          upsert: false,
          cacheControl: '3600',
          contentType: bannerFile.type,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        banner_url = data.publicUrl;
      }

      const updates: any = {
        full_name: formData.displayName,
        username: formData.username,
        bio: formData.bio,
      };
      if (avatar_url) updates.avatar_url = avatar_url;
      if (banner_url) updates.banner_url = banner_url;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);
      if (error) throw error;
      onClose();
    } catch (e) {
      console.error('Profile save failed:', (e as any)?.message || e);
      alert((e as any)?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Banner Section */}
          <div className="space-y-2">
            <Label>Cover Photo</Label>
            <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
              {bannerPreview && (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              )}
              <input type="file" accept="image/*" className="hidden" id="banner-input" onChange={handleBannerSelect} />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-2 right-2"
                onClick={() => document.getElementById('banner-input')?.click()}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change banner</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to change your cover photo
            </p>
          </div>

          {/* Profile Picture Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview} alt={profile.displayName} />
                <AvatarFallback className="text-2xl">
                  {profile.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <input type="file" accept="image/*" className="hidden" id="avatar-input" onChange={handleAvatarSelect} />
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-6 w-6 rounded-full"
                onClick={() => document.getElementById('avatar-input')?.click()}
              >
                <Camera className="h-3 w-3" />
                <span className="sr-only">Change avatar</span>
              </Button>
            </div>
            <div>
              <h3 className="font-medium">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to change your profile picture
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="@username"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell people about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Your company"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Your education"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
