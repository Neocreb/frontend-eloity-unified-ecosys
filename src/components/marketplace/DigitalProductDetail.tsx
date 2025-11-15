import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  BookOpen, 
  Play, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Users, 
  BarChart3,
  MessageCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DigitalProductDetailProps {
  product: any;
}

const DigitalProductDetail: React.FC<DigitalProductDetailProps> = ({ product }) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!product.downloadUrl) {
      toast({
        title: "Download Unavailable",
        description: "Download link is not available for this product.",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      // In a real implementation, this would check purchase status and generate secure download link
      // For now, we'll simulate the download process
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = product.downloadUrl;
        link.download = product.name || 'digital-product';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsDownloading(false);
        
        toast({
          title: "Download Started",
          description: "Your download will begin shortly."
        });
      }, 1000);
    } catch (error) {
      console.error("Download error:", error);
      setIsDownloading(false);
      
      toast({
        title: "Download Failed",
        description: "Failed to start download. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderDigitalProductInfo = () => {
    switch (product.digitalProductType) {
      case 'ebook':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Author:</span> {product.author}
                </span>
              </div>
              
              {product.coAuthor && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Co-Author:</span> {product.coAuthor}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Pages:</span> {product.pages || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Language:</span> {product.language || 'English'}
                </span>
              </div>
              
              {product.ageGroup && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Age Group:</span> {product.ageGroup}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'online_course':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Duration:</span> {product.courseDuration || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Skill Level:</span> {product.skillLevel || 'Beginner'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">Modules:</span> {product.courseModules || 'N/A'}
                </span>
              </div>
              
              {product.includesSourceFiles !== undefined && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">Source Files:</span> {product.includesSourceFiles ? 'Included' : 'Not Included'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Platform Integration */}
            {(product.cryptoLearnLink || product.appChatLink || product.externalPlatformLink) && (
              <Card className="border border-blue-200 bg-blue-50 mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Course Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.cryptoLearnLink && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Crypto Learn</h4>
                          <p className="text-sm text-gray-600">Access via /app/crypto-learn</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Access
                      </Button>
                    </div>
                  )}
                  
                  {product.appChatLink && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">App Chat</h4>
                          <p className="text-sm text-gray-600">Access via /app/chat</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Access
                      </Button>
                    </div>
                  )}
                  
                  {product.externalPlatformLink && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <ExternalLink className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">External Platform</h4>
                          <p className="text-sm text-gray-600">Access via external link</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={product.externalPlatformLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Access
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">File Format:</span> {product.fileFormat || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  <span className="font-medium">File Size:</span> {product.fileSize ? `${product.fileSize} MB` : 'N/A'}
                </span>
              </div>
              
              {product.licenseType && (
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <span className="font-medium">License:</span> {product.licenseType}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Digital Product Info */}
      <Card>
        <CardHeader>
          <CardTitle>Digital Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">
              {product.digitalProductType?.replace('_', ' ').toUpperCase() || 'DIGITAL PRODUCT'}
            </Badge>
            {product.fileFormat && (
              <Badge variant="outline">
                {product.fileFormat.toUpperCase()}
              </Badge>
            )}
            {product.fileSize && (
              <Badge variant="outline">
                {product.fileSize} MB
              </Badge>
            )}
          </div>
          
          {renderDigitalProductInfo()}
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle>Download Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2">
                After purchase, you'll be able to download this digital product.
              </p>
              {product.downloadLimit && (
                <p className="text-xs text-gray-500">
                  Download limit: {product.downloadLimit} times
                </p>
              )}
              {product.downloadExpiryDays && (
                <p className="text-xs text-gray-500">
                  Download available for {product.downloadExpiryDays} days after purchase
                </p>
              )}
            </div>
            
            {product.downloadUrl ? (
              <Button onClick={handleDownload} disabled={isDownloading}>
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download Now'}
              </Button>
            ) : (
              <Button disabled variant="secondary">
                <Lock className="w-4 h-4 mr-2" />
                Download Unavailable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalProductDetail;