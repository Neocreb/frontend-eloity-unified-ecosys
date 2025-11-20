import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostForm from '@/components/content/CreatePostForm';
import CreateProductForm from '@/components/content/CreateProductForm';

type ContentType = 'post' | 'product' | 'video' | 'live';

const CreateContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const type = (searchParams.get('type') || 'post') as ContentType;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const getTitle = () => {
    switch (type) {
      case 'post': return 'Create New Post';
      case 'product': return 'List New Product';
      case 'video': return 'Upload Video';
      case 'live': return 'Start Live Stream';
      default: return 'Create Content';
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'post':
        return (
          <CreatePostForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        );
      case 'product':
        return (
          <CreateProductForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        );
      case 'video':
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Video Upload</h3>
            <p className="text-gray-600 mb-6">
              Video creation form would be implemented here. Users would be able to upload video files and add metadata.
            </p>
            <Button onClick={handleCancel}>Cancel</Button>
          </div>
        );
      case 'live':
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Start Live Stream</h3>
            <p className="text-gray-600 mb-6">
              Live stream setup form would be implemented here. Users would configure their stream settings.
            </p>
            <Button onClick={handleCancel}>Cancel</Button>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Content Creation</h3>
            <p className="text-gray-600 mb-6">
              Creation form for {type} would be implemented here.
            </p>
            <Button onClick={handleCancel} className="mt-4">Cancel</Button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="p-0 h-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">{getTitle()}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
