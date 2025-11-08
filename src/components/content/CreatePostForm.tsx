import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contentCreationService, CreatePostData } from '@/services/contentCreationService';
import { useToast } from '@/components/ui/use-toast';

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSuccess, onCancel }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'image' | 'video'>('text');
  const [privacy, setPrivacy] = useState<'public' | 'private' | 'friends'>('public');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const postData: CreatePostData = {
        content,
        type,
        privacy,
        media_urls: mediaUrls,
      };

      await contentCreationService.createPost(postData);
      
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      
      // Clear form
      setContent('');
      setMediaUrls([]);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMediaUrl = () => {
    setMediaUrls([...mediaUrls, '']);
  };

  const updateMediaUrl = (index: number, value: string) => {
    const newMediaUrls = [...mediaUrls];
    newMediaUrls[index] = value;
    setMediaUrls(newMediaUrls);
  };

  const removeMediaUrl = (index: number) => {
    const newMediaUrls = [...mediaUrls];
    newMediaUrls.splice(index, 1);
    setMediaUrls(newMediaUrls);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Post Type
              </label>
              <Select value={type} onValueChange={(value: 'text' | 'image' | 'video') => setType(value)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="privacy" className="block text-sm font-medium mb-1">
                Privacy
              </label>
              <Select value={privacy} onValueChange={(value: 'public' | 'private' | 'friends') => setPrivacy(value)} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type !== 'text' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Media URLs
              </label>
              <div className="space-y-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => updateMediaUrl(index, e.target.value)}
                      placeholder="Enter media URL"
                      className="flex-1 p-2 border rounded"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMediaUrl(index)}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMediaUrl}
                  disabled={isSubmitting}
                >
                  Add Media URL
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;