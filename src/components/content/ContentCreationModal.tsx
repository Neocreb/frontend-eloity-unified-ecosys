import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import CreatePostForm from './CreatePostForm';
import CreateProductForm from './CreateProductForm';

interface ContentCreationModalProps {
  type: 'post' | 'product' | 'video' | 'live';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ContentCreationModal: React.FC<ContentCreationModalProps> = ({ 
  type, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const renderForm = () => {
    switch (type) {
      case 'post':
        return (
          <CreatePostForm 
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        );
      case 'product':
        return (
          <CreateProductForm 
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        );
      case 'video':
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Video Upload</h3>
            <p className="text-gray-600 mb-4">
              Video creation form would be implemented here. Users would be able to upload video files and add metadata.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        );
      case 'live':
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Start Live Stream</h3>
            <p className="text-gray-600 mb-4">
              Live stream setup form would be implemented here. Users would configure their stream settings.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        );
      default:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Content Creation</h3>
            <p className="text-gray-600">
              Creation form for {type} would be implemented here.
            </p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        );
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{getTitle()}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {renderForm()}
      </div>
    </div>
  );
};

export default ContentCreationModal;