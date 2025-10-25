import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Camera,
  FileText,
  Phone,
  Mail,
  Eye,
  Star,
  Award,
  Lock,
  Zap,
  User,
  Calendar,
  MapPin,
  CreditCard,
  Scan,
  RefreshCw,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { requestCameraAccess, stopCameraStream } from "@/utils/cameraPermissions";

interface EnhancedKYCVerificationProps {
  onComplete?: () => void;
}

type KYCStep = 'documents' | 'selfie' | 'contact' | 'review';
type DocumentType = 'passport' | 'drivers_license' | 'national_id';
type DocumentSide = 'front' | 'back';

interface DocumentUpload {
  type: DocumentType;
  front?: File;
  back?: File;
}

interface ContactInfo {
  phone: string;
  email: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}

const EnhancedKYCVerification: React.FC<EnhancedKYCVerificationProps> = ({
  onComplete
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [currentStep, setCurrentStep] = useState<KYCStep>('documents');
  const [documentUpload, setDocumentUpload] = useState<DocumentUpload>({ type: 'national_id' });
  const [selfieData, setSelfieData] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    email: '',
    phoneVerified: false,
    emailVerified: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [livenessCheck, setLivenessCheck] = useState(false);

  const steps = [
    { id: 'documents', name: 'ID Documents', icon: FileText },
    { id: 'selfie', name: 'Selfie Verification', icon: Camera },
    { id: 'contact', name: 'Contact Verification', icon: Phone },
    { id: 'review', name: 'Review & Submit', icon: CheckCircle },
  ];

  const documentTypes = [
    { value: 'national_id', label: 'National ID Card', requiresBack: true },
    { value: 'passport', label: 'Passport', requiresBack: false },
    { value: 'drivers_license', label: 'Driver\'s License', requiresBack: true },
  ];

  const handleFileUpload = (side: DocumentSide) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDocumentUpload(prev => ({
          ...prev,
          [side]: file
        }));
        toast({
          title: "Document Uploaded",
          description: `${side === 'front' ? 'Front' : 'Back'} side uploaded successfully`,
        });
      }
    };
    input.click();
  };

  const startCamera = async () => {
    try {
      const result = await requestCameraAccess({ 
        video: { facingMode: 'user' },
        audio: false 
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.stream) {
        if (videoRef.current) {
          videoRef.current.srcObject = result.stream;
          setCameraActive(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "Camera Error",
        description: error.message || "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      setSelfieData(imageData);
      
      // Stop camera
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
      
      // Simulate liveness detection
      setLivenessCheck(true);
      setTimeout(() => {
        toast({
          title: "Liveness Verified",
          description: "Real person detected successfully",
        });
      }, 2000);
    }
  };

  const sendPhoneVerification = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "SMS Sent",
        description: "Verification code sent to your phone",
      });
    }, 1000);
  };

  const sendEmailVerification = async () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Email Sent",
        description: "Verification link sent to your email",
      });
    }, 1000);
  };

  const verifyPhone = () => {
    setContactInfo(prev => ({ ...prev, phoneVerified: true }));
    toast({
      title: "Phone Verified",
      description: "Phone number verified successfully",
    });
  };

  const verifyEmail = () => {
    setContactInfo(prev => ({ ...prev, emailVerified: true }));
    toast({
      title: "Email Verified",
      description: "Email address verified successfully",
    });
  };

  const submitKYC = async () => {
    setIsProcessing(true);
    // Simulate API submission
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "KYC Submitted",
        description: "Your verification is under review. You'll be notified within 24 hours.",
      });
      onComplete?.();
    }, 3000);
  };

  const getStepProgress = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    return ((stepIndex + 1) / steps.length) * 100;
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'documents':
        const docType = documentTypes.find(dt => dt.value === documentUpload.type);
        return documentUpload.front && (!docType?.requiresBack || documentUpload.back);
      case 'selfie':
        return selfieData && livenessCheck;
      case 'contact':
        return contactInfo.phoneVerified && contactInfo.emailVerified;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as KYCStep);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as KYCStep);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Identity Verification</h2>
          <Badge className="bg-blue-100 text-blue-800">
            <Shield className="h-4 w-4 mr-1" />
            Secure Process
          </Badge>
        </div>
        <Progress value={getStepProgress()} className="mb-4" />
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const StepIcon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`p-3 rounded-full border-2 ${
                  isCompleted ? 'bg-green-500 border-green-500 text-white' :
                  isActive ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-sm mt-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Documents Step */}
          {currentStep === 'documents' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Identity Documents</h3>
                <p className="text-gray-600 mb-4">
                  Please upload a clear photo of your government-issued ID
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">Document Type</Label>
                <Select value={documentUpload.type} onValueChange={(value) => 
                  setDocumentUpload({ type: value as DocumentType })
                }>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(docType => (
                      <SelectItem key={docType.value} value={docType.value}>
                        {docType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Front Side */}
                <div>
                  <Label className="text-base font-medium">Front Side</Label>
                  <div 
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => handleFileUpload('front')}
                  >
                    {documentUpload.front ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                        <p className="font-medium text-green-600">Front uploaded</p>
                        <p className="text-sm text-gray-500">{documentUpload.front.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-gray-600">Click to upload front side</p>
                        <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back Side */}
                {documentTypes.find(dt => dt.value === documentUpload.type)?.requiresBack && (
                  <div>
                    <Label className="text-base font-medium">Back Side</Label>
                    <div 
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                      onClick={() => handleFileUpload('back')}
                    >
                      {documentUpload.back ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                          <p className="font-medium text-green-600">Back uploaded</p>
                          <p className="text-sm text-gray-500">{documentUpload.back.name}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-gray-600">Click to upload back side</p>
                          <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Ensure your document is well-lit, in focus, and all corners are visible. 
                  Personal information will be encrypted and stored securely.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Selfie Step */}
          {currentStep === 'selfie' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Take a Selfie</h3>
                <p className="text-gray-600 mb-4">
                  Take a real-time selfie for liveness detection and identity matching
                </p>
              </div>

              <div className="max-w-md mx-auto">
                {!cameraActive && !selfieData && (
                  <div className="text-center space-y-4">
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Position your face in the center and ensure good lighting
                      </p>
                      <Button onClick={startCamera}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                    </div>
                  </div>
                )}

                {cameraActive && (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        className="w-full max-w-sm rounded-lg border-4 border-blue-500"
                      />
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-lg pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-blue-500"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-blue-500"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-blue-500"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-blue-500"></div>
                      </div>
                    </div>
                    <Button onClick={captureSelfie}>
                      <Scan className="h-4 w-4 mr-2" />
                      Capture Selfie
                    </Button>
                  </div>
                )}

                {selfieData && (
                  <div className="text-center space-y-4">
                    <img 
                      src={selfieData} 
                      alt="Captured selfie" 
                      className="w-full max-w-sm rounded-lg border"
                    />
                    <div className="space-y-2">
                      {livenessCheck ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>Liveness verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Verifying liveness...</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => {
                      setSelfieData(null);
                      setLivenessCheck(false);
                    }}>
                      Retake Photo
                    </Button>
                  </div>
                )}

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <Alert>
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  Look directly at the camera and ensure your face is clearly visible. 
                  Our system will detect that you're a real person, not a photo or video.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Contact Verification Step */}
          {currentStep === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Verify Contact Information</h3>
                <p className="text-gray-600 mb-4">
                  Verify your phone number and email address
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Phone Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Phone Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    {!contactInfo.phoneVerified ? (
                      <Button 
                        onClick={sendPhoneVerification}
                        disabled={!contactInfo.phone || isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Verification Code'
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Phone verified</span>
                      </div>
                    )}
                    {contactInfo.phone && !contactInfo.phoneVerified && (
                      <div className="space-y-2">
                        <Input placeholder="Enter verification code" />
                        <Button variant="outline" onClick={verifyPhone} className="w-full">
                          Verify Code
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Email Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    {!contactInfo.emailVerified ? (
                      <Button 
                        onClick={sendEmailVerification}
                        disabled={!contactInfo.email || isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Verification Link'
                        )}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>Email verified</span>
                      </div>
                    )}
                    {contactInfo.email && !contactInfo.emailVerified && (
                      <Button variant="outline" onClick={verifyEmail} className="w-full">
                        Mark as Verified
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Review & Submit</h3>
                <p className="text-gray-600 mb-4">
                  Review your information before submitting for verification
                </p>
              </div>

              <div className="space-y-6">
                {/* Documents Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Identity Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {documentTypes.find(dt => dt.value === documentUpload.type)?.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          Front {documentUpload.back ? 'and back' : ''} uploaded
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Selfie Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Selfie Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Liveness verification complete</p>
                        <p className="text-sm text-gray-600">Real person detected</p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Phone: {contactInfo.phone}</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Email: {contactInfo.email}</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Your information is encrypted and will only be used for identity verification. 
                  Processing typically takes 24-48 hours.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 'documents'}
        >
          Previous
        </Button>
        
        {currentStep === 'review' ? (
          <Button 
            onClick={submitKYC}
            disabled={!canProceedToNext() || isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit for Review'
            )}
          </Button>
        ) : (
          <Button 
            onClick={nextStep}
            disabled={!canProceedToNext()}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedKYCVerification;
