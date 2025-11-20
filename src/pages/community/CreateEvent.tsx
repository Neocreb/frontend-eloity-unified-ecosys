import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Tag,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

interface EventFormData {
  title: string;
  description: string;
  type: string;
  startTime: string;
  duration: number;
  maxParticipants: number;
  isPrivate: boolean;
  requiresPayment: boolean;
  price: number;
  tags: string;
}

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: 'workshop',
    startTime: '',
    duration: 60,
    maxParticipants: 100,
    isPrivate: false,
    requiresPayment: false,
    price: 0,
    tags: '',
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.type;
      case 2:
        return formData.startTime && formData.duration > 0 && formData.maxParticipants > 0;
      case 3:
        return !formData.requiresPayment || (formData.requiresPayment && formData.price > 0);
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
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
    if (validateStep(currentStep)) {
      toast({
        title: 'Event Created! 🎉',
        description: 'Your event has been scheduled successfully',
      });
      navigate(-1);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Event - Eloity</title>
      </Helmet>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 z-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-0 h-auto"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Create Event</h1>
                <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const step = index + 1;
              return (
                <div
                  key={step}
                  className={cn(
                    "flex-1 h-2 rounded-full transition-colors",
                    step <= currentStep ? "bg-blue-500" : "bg-gray-200"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Input
                      id="event-title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter event title..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="event-type">Event Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">📚 Workshop</SelectItem>
                        <SelectItem value="trading">📈 Trading Session</SelectItem>
                        <SelectItem value="marketplace">🛒 Shopping Event</SelectItem>
                        <SelectItem value="social">❤️ Social Meetup</SelectItem>
                        <SelectItem value="challenge">🏆 Challenge</SelectItem>
                        <SelectItem value="freelance">💼 Freelance Session</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="event-description">Description *</Label>
                    <Textarea
                      id="event-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your event..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Schedule & Capacity */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule & Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max-participants">Max Participants *</Label>
                    <Input
                      id="max-participants"
                      type="number"
                      min="2"
                      max="1000"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Pricing & Access */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="private-event">Private Event</Label>
                      <p className="text-xs text-muted-foreground">
                        Only invited users can join
                      </p>
                    </div>
                    <Switch
                      id="private-event"
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) => handleInputChange('isPrivate', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="paid-event">Paid Event</Label>
                      <p className="text-xs text-muted-foreground">
                        Charge participants to join
                      </p>
                    </div>
                    <Switch
                      id="paid-event"
                      checked={formData.requiresPayment}
                      onCheckedChange={(checked) => handleInputChange('requiresPayment', checked)}
                    />
                  </div>

                  {formData.requiresPayment && (
                    <div>
                      <Label htmlFor="event-price">Price ($) *</Label>
                      <Input
                        id="event-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Tags & Review */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags & Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="event-tags">Tags (comma-separated)</Label>
                    <Input
                      id="event-tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., beginner, crypto, live-trading"
                      className="mt-1"
                    />
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 space-y-4">
                      <h3 className="font-semibold text-blue-900">Event Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Title:</span>
                          <span className="font-medium">{formData.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{formData.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Participants:</span>
                          <span className="font-medium">{formData.maxParticipants}</span>
                        </div>
                        {formData.requiresPayment && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">${formData.price}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Accessibility:</span>
                          <span className="font-medium">{formData.isPrivate ? 'Private' : 'Public'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
          <div className="max-w-2xl mx-auto flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
