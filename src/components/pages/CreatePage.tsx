import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePages } from '@/hooks/usePages';
import { ArrowLeft, Building, Users, Star, Heart, Briefcase } from 'lucide-react';

const CreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPage } = usePages();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const getPageTypeIcon = (type: string) => {
    switch (type) {
      case 'business': return Building;
      case 'brand': return Star;
      case 'public_figure': return Users;
      case 'community': return Heart;
      case 'organization': return Briefcase;
      default: return Building;
    }
  };

  const pageCategories = [
    { value: 'business', label: 'Business', icon: Building },
    { value: 'brand', label: 'Brand', icon: Star },
    { value: 'public_figure', label: 'Public Figure', icon: Users },
    { value: 'community', label: 'Community', icon: Heart },
    { value: 'organization', label: 'Organization', icon: Briefcase },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a page name',
        variant: 'destructive'
      });
      return;
    }

    if (!category) {
      toast({
        title: 'Error',
        description: 'Please select a category',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      const pageData = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        avatar_url: avatarUrl.trim() || undefined,
        cover_url: coverUrl.trim() || undefined,
        privacy: privacy as 'public' | 'private',
      };

      await createPage(pageData);
      
      toast({
        title: 'Page Created',
        description: 'Your page has been created successfully!'
      });
      
      navigate('/app/pages');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create page. Please try again.',
        variant: 'destructive'
      });
      console.error('Error creating page:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Create Page</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Page Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter page name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your page"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageCategories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy">Privacy</Label>
                <Select value={privacy} onValueChange={setPrivacy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverUrl">Cover Image URL</Label>
                <Input
                  id="coverUrl"
                  placeholder="https://example.com/cover.jpg"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/app/pages')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Page'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePage;