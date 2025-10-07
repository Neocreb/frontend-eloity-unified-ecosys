// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  X,
  DollarSign,
  Clock,
  Users,
  Award,
  Target,
  Calendar,
  FileText,
  Globe,
  Star,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  Eye,
  Zap,
  Shield,
  TrendingUp,
  MapPin,
  Building,
  Upload,
  Image,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SkillFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  experienceLevel: "entry" | "intermediate" | "expert";
  rate: {
    type: "hourly" | "fixed" | "per-project";
    amount: number;
    currency: string;
  };
  availability: "available" | "busy" | "not-available";
  deliveryTime: string;
  portfolioItems: {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
  }[];
  certifications: string[];
  tools: string[];
  languages: string[];
  responseTime: string;
  featured: boolean;
  urgent: boolean;
}

const SKILL_CATEGORIES = [
  "Web Development",
  "Mobile Development", 
  "Design & Creative",
  "Writing & Content",
  "Digital Marketing",
  "Data Science",
  "DevOps & Cloud",
  "AI & Machine Learning",
  "Blockchain & Crypto",
  "Game Development",
  "Software Testing",
  "Project Management",
  "Translation",
  "Video & Animation",
  "Music & Audio",
  "Business Consulting",
  "Legal Services",
  "Accounting & Finance",
];

const SUBCATEGORIES: { [key: string]: string[] } = {
  "Web Development": ["Frontend", "Backend", "Full Stack", "E-commerce", "CMS", "API Development"],
  "Mobile Development": ["iOS", "Android", "React Native", "Flutter", "Cross-platform"],
  "Design & Creative": ["UI/UX Design", "Graphic Design", "Logo Design", "Brand Identity", "Illustration"],
  "Writing & Content": ["Blog Writing", "Copywriting", "Technical Writing", "SEO Content", "Social Media"],
  "Digital Marketing": ["SEO", "PPC", "Social Media Marketing", "Email Marketing", "Content Marketing"],
  "Data Science": ["Data Analysis", "Machine Learning", "Data Visualization", "Statistics", "Python/R"],
  "DevOps & Cloud": ["AWS", "Docker", "Kubernetes", "CI/CD", "Infrastructure"],
};

const PostSkill: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newTool, setNewTool] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [progress, setProgress] = useState(0);

  const [skillData, setSkillData] = useState<SkillFormData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    experienceLevel: "intermediate",
    rate: {
      type: "hourly",
      amount: 0,
      currency: "USD",
    },
    availability: "available",
    deliveryTime: "",
    portfolioItems: [],
    certifications: [],
    tools: [],
    languages: [],
    responseTime: "within-24-hours",
    featured: false,
    urgent: false,
  });

  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    imageUrl: "",
    projectUrl: "",
  });

  // Calculate progress based on filled fields
  React.useEffect(() => {
    const fields = [
      skillData.title,
      skillData.description,
      skillData.category,
      skillData.rate.amount > 0,
      skillData.deliveryTime,
      skillData.tools.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    setProgress((filledFields / fields.length) * 100);
  }, [skillData]);

  const handleInputChange = (field: keyof SkillFormData, value: any) => {
    setSkillData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRateChange = (field: keyof SkillFormData['rate'], value: any) => {
    setSkillData(prev => ({
      ...prev,
      rate: {
        ...prev.rate,
        [field]: value
      }
    }));
  };

  const addTool = () => {
    if (newTool.trim() && !skillData.tools.includes(newTool.trim())) {
      setSkillData(prev => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()]
      }));
      setNewTool("");
    }
  };

  const removeTool = (tool: string) => {
    setSkillData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t !== tool)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !skillData.certifications.includes(newCertification.trim())) {
      setSkillData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setSkillData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim()) {
      const portfolioItem = {
        id: Date.now().toString(),
        ...newPortfolioItem
      };
      setSkillData(prev => ({
        ...prev,
        portfolioItems: [...prev.portfolioItems, portfolioItem]
      }));
      setNewPortfolioItem({
        title: "",
        description: "",
        imageUrl: "",
        projectUrl: "",
      });
    }
  };

  const removePortfolioItem = (id: string) => {
    setSkillData(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter(item => item.id !== id)
    }));
  };

  const handleSubmit = async () => {
    if (!skillData.title || !skillData.description || !skillData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Here you would call your API to create the skill posting
      // await skillService.createSkillPosting(skillData);
      
      toast.success("Skill posted successfully!");
      navigate("/app/freelance");
    } catch (error) {
      toast.error("Failed to post skill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Save as draft
      toast.success("Draft saved successfully!");
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/app/freelance")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Freelance Hub
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Your Skill</h1>
              <p className="text-gray-600 mt-2">
                Showcase your talent and attract clients looking for your expertise
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress</div>
              <Progress value={progress} className="w-32" />
              <div className="text-xs text-gray-400 mt-1">{Math.round(progress)}% complete</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Tabs value={currentStep.toString()} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1">Basic Info</TabsTrigger>
                <TabsTrigger value="2">Details & Pricing</TabsTrigger>
                <TabsTrigger value="3">Portfolio & Finish</TabsTrigger>
              </TabsList>

              <TabsContent value="1" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Skill Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Professional React Developer, Expert Logo Designer"
                        value={skillData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your skill, experience, and what makes you unique..."
                        rows={4}
                        value={skillData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={skillData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <Select
                          value={skillData.subcategory}
                          onValueChange={(value) => handleInputChange("subcategory", value)}
                          disabled={!skillData.category || !SUBCATEGORIES[skillData.category]}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {skillData.category && SUBCATEGORIES[skillData.category]?.map((sub) => (
                              <SelectItem key={sub} value={sub}>
                                {sub}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experienceLevel">Experience Level</Label>
                      <Select
                        value={skillData.experienceLevel}
                        onValueChange={(value: "entry" | "intermediate" | "expert") => 
                          handleInputChange("experienceLevel", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                          <SelectItem value="expert">Expert (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="2" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Pricing & Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="rateType">Rate Type</Label>
                        <Select
                          value={skillData.rate.type}
                          onValueChange={(value: "hourly" | "fixed" | "per-project") => 
                            handleRateChange("type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly Rate</SelectItem>
                            <SelectItem value="fixed">Fixed Price</SelectItem>
                            <SelectItem value="per-project">Per Project</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0"
                          value={skillData.rate.amount}
                          onChange={(e) => handleRateChange("amount", parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={skillData.rate.currency}
                          onValueChange={(value) => handleRateChange("currency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="NGN">NGN</SelectItem>
                            <SelectItem value="KES">KES</SelectItem>
                            <SelectItem value="ZAR">ZAR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="availability">Availability</Label>
                        <Select
                          value={skillData.availability}
                          onValueChange={(value: "available" | "busy" | "not-available") => 
                            handleInputChange("availability", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available Now</SelectItem>
                            <SelectItem value="busy">Busy (Limited Availability)</SelectItem>
                            <SelectItem value="not-available">Not Available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="deliveryTime">Typical Delivery Time</Label>
                        <Select
                          value={skillData.deliveryTime}
                          onValueChange={(value) => handleInputChange("deliveryTime", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-day">Within 24 hours</SelectItem>
                            <SelectItem value="2-3-days">2-3 days</SelectItem>
                            <SelectItem value="1-week">Within 1 week</SelectItem>
                            <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                            <SelectItem value="1-month">Within 1 month</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tools">Tools & Technologies</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add a tool or technology"
                          value={newTool}
                          onChange={(e) => setNewTool(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addTool()}
                        />
                        <Button onClick={addTool} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillData.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="flex items-center gap-1">
                            {tool}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => removeTool(tool)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="certifications">Certifications</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add a certification"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addCertification()}
                        />
                        <Button onClick={addCertification} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillData.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {cert}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => removeCertification(cert)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="3" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Portfolio & Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="portfolioTitle">Project Title</Label>
                          <Input
                            id="portfolioTitle"
                            placeholder="Enter project title"
                            value={newPortfolioItem.title}
                            onChange={(e) => setNewPortfolioItem(prev => ({
                              ...prev,
                              title: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="portfolioDescription">Project Description</Label>
                          <Textarea
                            id="portfolioDescription"
                            placeholder="Describe this project..."
                            value={newPortfolioItem.description}
                            onChange={(e) => setNewPortfolioItem(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="portfolioImage">Image URL (optional)</Label>
                            <Input
                              id="portfolioImage"
                              placeholder="https://example.com/image.jpg"
                              value={newPortfolioItem.imageUrl}
                              onChange={(e) => setNewPortfolioItem(prev => ({
                                ...prev,
                                imageUrl: e.target.value
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="portfolioUrl">Project URL (optional)</Label>
                            <Input
                              id="portfolioUrl"
                              placeholder="https://example.com"
                              value={newPortfolioItem.projectUrl}
                              onChange={(e) => setNewPortfolioItem(prev => ({
                                ...prev,
                                projectUrl: e.target.value
                              }))}
                            />
                          </div>
                        </div>
                        <Button onClick={addPortfolioItem} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Portfolio Item
                        </Button>
                      </div>
                    </div>

                    {skillData.portfolioItems.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Portfolio Items</h4>
                        {skillData.portfolioItems.map((item) => (
                          <Card key={item.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm text-gray-600">{item.description}</p>
                                {item.projectUrl && (
                                  <a 
                                    href={item.projectUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    View Project
                                  </a>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePortfolioItem(item.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                
                {currentStep < 3 ? (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? "Posting..." : "Post Skill"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">
                      {skillData.title || "Your Skill Title"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {skillData.category && skillData.subcategory 
                        ? `${skillData.category} • ${skillData.subcategory}`
                        : skillData.category || "Category not selected"
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{skillData.experienceLevel}</Badge>
                    <Badge 
                      variant={skillData.availability === "available" ? "default" : "secondary"}
                    >
                      {skillData.availability === "available" ? "Available" : 
                       skillData.availability === "busy" ? "Busy" : "Not Available"}
                    </Badge>
                  </div>

                  {skillData.rate.amount > 0 && (
                    <div className="text-lg font-semibold">
                      ${skillData.rate.amount}/{skillData.rate.type === "hourly" ? "hr" : "project"}
                    </div>
                  )}

                  <p className="text-sm text-gray-600">
                    {skillData.description || "Add a description to preview here..."}
                  </p>

                  {skillData.tools.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Tools:</p>
                      <div className="flex flex-wrap gap-1">
                        {skillData.tools.slice(0, 3).map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {skillData.tools.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{skillData.tools.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• Write a clear, specific skill title</p>
                <p>• Include relevant tools and technologies</p>
                <p>• Add portfolio examples to showcase your work</p>
                <p>• Set competitive but fair pricing</p>
                <p>• Keep your availability status updated</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSkill;
