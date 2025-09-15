import React, { useState } from 'react';
import {
  X,
  Upload,
  Calendar,
  Gift,
  Hash,
  FileText,
  Image,
  DollarSign,
  Users,
  Star,
  Crown,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreateChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge: (challengeData: ChallengeFormData) => void;
  userBalance: number;
}

interface ChallengeFormData {
  title: string;
  description: string;
  hashtag: string;
  startDate: string;
  endDate: string;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  participationReward: number;
  bannerUrl?: string;
  rules: string;
  tags: string[];
  isSponsored: boolean;
  isFeatured: boolean;
}

const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  isOpen,
  onClose,
  onCreateChallenge,
  userBalance,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ChallengeFormData>({
    title: '',
    description: '',
    hashtag: '',
    startDate: '',
    endDate: '',
    firstPrize: 100,
    secondPrize: 50,
    thirdPrize: 25,
    participationReward: 5,
    bannerUrl: '',
    rules: '',
    tags: [],
    isSponsored: false,
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();

  const handleInputChange = (field: keyof ChallengeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getTotalPrizePool = () => {
    return formData.firstPrize + formData.secondPrize + formData.thirdPrize + (formData.participationReward * 50); // Estimate 50 participants
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.hashtag.trim();
      case 2:
        return formData.startDate && formData.endDate && new Date(formData.endDate) > new Date(formData.startDate);
      case 3:
        return formData.firstPrize > 0 && formData.secondPrize > 0 && formData.thirdPrize > 0;
      case 4:
        return formData.rules.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields before continuing',
        variant: 'destructive',
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (getTotalPrizePool() > userBalance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough SoftPoints for this prize pool',
        variant: 'destructive',
      });
      return;
    }

    onCreateChallenge(formData);
    toast({
      title: 'Challenge Created! 🎉',
      description: 'Your challenge has been published and is now live',
    });
    onClose();
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      // Simulate upload
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          bannerUrl: URL.createObjectURL(file)
        }));
        setUploading(false);
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Create Challenge</h2>
            <p className="text-gray-400 text-sm">Step {currentStep} of 5</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={cn(
                  "flex-1 h-2 rounded-full",
                  step <= currentStep ? "bg-purple-500" : "bg-gray-700"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300">Challenge Title *</Label>
                <Input
                  placeholder="Enter an engaging title for your challenge"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-2 bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300">Description *</Label>
                <Textarea
                  placeholder="Describe what creators should do in this challenge..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="mt-2 bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300">Hashtag *</Label>
                <div className="relative mt-2">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ChallengeHashtag"
                    value={formData.hashtag}
                    onChange={(e) => handleInputChange('hashtag', e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be unique and contain only letters and numbers</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300">Tags</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    <Button onClick={addTag} size="sm">Add</Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Challenge Timeline</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="mt-2 bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300">End Date *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate || new Date().toISOString().slice(0, 16)}
                    className="mt-2 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Timeline Tips</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Challenges typically run for 1-4 weeks</li>
                    <li>• Allow enough time for creators to participate</li>
                    <li>• Consider your target audience's time zones</li>
                    <li>• Featured challenges get 2-3x more submissions</li>
                  </ul>
                </CardContent>
              </Card>

              <div>
                <Label className="text-sm font-medium text-gray-300">Banner Image</Label>
                <div className="mt-2">
                  {formData.bannerUrl ? (
                    <div className="relative">
                      <img 
                        src={formData.bannerUrl} 
                        alt="Challenge banner"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('bannerUrl', '')}
                        className="absolute top-2 right-2"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label htmlFor="banner-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-400">
                          {uploading ? 'Uploading...' : 'Click to upload banner image'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Recommended: 400x200px</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Prize Structure</h3>
                <p className="text-gray-400 text-sm">Set rewards to motivate participation</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-300">1st Place Prize (SP) *</Label>
                  <Input
                    type="number"
                    value={formData.firstPrize}
                    onChange={(e) => handleInputChange('firstPrize', parseInt(e.target.value) || 0)}
                    min="1"
                    className="mt-2 bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300">2nd Place Prize (SP) *</Label>
                  <Input
                    type="number"
                    value={formData.secondPrize}
                    onChange={(e) => handleInputChange('secondPrize', parseInt(e.target.value) || 0)}
                    min="1"
                    className="mt-2 bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300">3rd Place Prize (SP) *</Label>
                  <Input
                    type="number"
                    value={formData.thirdPrize}
                    onChange={(e) => handleInputChange('thirdPrize', parseInt(e.target.value) || 0)}
                    min="1"
                    className="mt-2 bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-300">Participation Reward (SP)</Label>
                  <Input
                    type="number"
                    value={formData.participationReward}
                    onChange={(e) => handleInputChange('participationReward', parseInt(e.target.value) || 0)}
                    min="0"
                    className="mt-2 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-300">Estimated Total Prize Pool</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {getTotalPrizePool().toLocaleString()} SP
                      </div>
                      <div className="text-xs text-gray-400">
                        Includes winners + ~50 participation rewards
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">Your Balance</div>
                      <div className="text-lg font-bold text-white">
                        {userBalance.toLocaleString()} SP
                      </div>
                      {getTotalPrizePool() > userBalance && (
                        <div className="text-xs text-red-400">Insufficient balance</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">Challenge Type</Label>
                
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">Sponsored Challenge</div>
                      <div className="text-sm text-gray-400">Higher visibility, featured placement</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isSponsored}
                    onCheckedChange={(checked) => handleInputChange('isSponsored', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-medium text-white">Featured Challenge</div>
                      <div className="text-sm text-gray-400">Premium placement on homepage</div>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Challenge Rules</h3>
                <p className="text-gray-400 text-sm">Set clear guidelines for participants</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-300">Rules and Guidelines *</Label>
                <Textarea
                  placeholder="Enter detailed rules for your challenge..."
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  rows={6}
                  className="mt-2 bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Suggested Rule Categories</span>
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Content requirements (style, length, theme)</li>
                    <li>• Technical requirements (audio quality, resolution)</li>
                    <li>• Content guidelines (appropriate, original, etc.)</li>
                    <li>• Submission deadlines and format</li>
                    <li>• Judging criteria and timeline</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Review & Publish</h3>
                <p className="text-gray-400 text-sm">Review your challenge details before publishing</p>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">{formData.title}</h4>
                    <p className="text-gray-400 text-sm">{formData.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Hashtag:</span>
                      <span className="text-blue-400 ml-2">#{formData.hashtag}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white ml-2">
                        {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">1st Prize:</span>
                      <span className="text-yellow-400 font-bold ml-2">{formData.firstPrize} SP</span>
                    </div>
                    <div>
                      <span className="text-gray-400">2nd Prize:</span>
                      <span className="text-yellow-400 font-bold ml-2">{formData.secondPrize} SP</span>
                    </div>
                    <div>
                      <span className="text-gray-400">3rd Prize:</span>
                      <span className="text-yellow-400 font-bold ml-2">{formData.thirdPrize} SP</span>
                    </div>
                  </div>

                  {formData.tags.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-green-600/20 border-green-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">Ready to Publish</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    Your challenge will be live immediately after publishing. 
                    Prize pool will be deducted from your balance.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          <div className="flex gap-2">
            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={getTotalPrizePool() > userBalance}
                className="bg-green-600 hover:bg-green-700"
              >
                Publish Challenge
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallengeModal;
