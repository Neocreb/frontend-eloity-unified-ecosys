// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  X,
  FileText,
  DollarSign,
  Clock,
  Plus,
  ChevronLeft,
  Sparkles,
  Tag,
  AlertCircle,
  Users,
} from "lucide-react";
import { useFreelance } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { JobPosting } from "@/types/freelance";

interface JobFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  skills: string[];
  experienceLevel: "entry" | "intermediate" | "expert";
  budgetType: "fixed" | "hourly";
  budgetAmount?: number;
  budgetMin?: number;
  budgetMax?: number;
  duration: string;
  deadline?: string;
  isPublic: boolean;
  requiresVerification: boolean;
  attachments: File[];
  customSkill: string;
}

const CATEGORIES = [
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
];

const SUBCATEGORIES: { [key: string]: string[] } = {
  "Web Development": [
    "Frontend",
    "Backend",
    "Full Stack",
    "E-commerce",
    "CMS",
    "API Development",
  ],
  "Mobile Development": [
    "iOS",
    "Android",
    "React Native",
    "Flutter",
    "Cross-platform",
  ],
  "Design & Creative": [
    "UI/UX Design",
    "Graphic Design",
    "Logo Design",
    "Branding",
    "Illustration",
  ],
  "Writing & Content": [
    "Blog Writing",
    "Technical Writing",
    "Copywriting",
    "Content Strategy",
  ],
  "Digital Marketing": [
    "SEO",
    "Social Media",
    "PPC",
    "Email Marketing",
    "Analytics",
  ],
  "Data Science": [
    "Data Analysis",
    "Machine Learning",
    "Data Visualization",
    "Statistics",
  ],
};

const POPULAR_SKILLS = [
  "React",
  "JavaScript",
  "TypeScript",
  "Node.js",
  "Python",
  "PHP",
  "Java",
  "C#",
  "HTML/CSS",
  "Vue.js",
  "Angular",
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "PostgreSQL",
  "MongoDB",
  "MySQL",
  "AWS",
  "Docker",
  "Git",
  "Figma",
  "Photoshop",
  "WordPress",
  "Shopify",
  "Magento",
  "Laravel",
  "Django",
  "Express.js",
];

const DURATIONS = [
  "1-3 days",
  "1-2 weeks",
  "3-4 weeks",
  "1-3 months",
  "3-6 months",
  "6+ months",
];

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    skills: [],
    experienceLevel: "intermediate",
    budgetType: "fixed",
    budgetAmount: undefined,
    budgetMin: undefined,
    budgetMax: undefined,
    duration: "",
    deadline: "",
    isPublic: true,
    requiresVerification: false,
    attachments: [],
    customSkill: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { createJob } = useFreelance();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
        customSkill: "",
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: { [key: string]: string } = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (formData.skills.length === 0)
        newErrors.skills = "At least one skill is required";
    }

    if (stepNumber === 2) {
      if (!formData.experienceLevel)
        newErrors.experienceLevel = "Experience level is required";
      if (!formData.duration) newErrors.duration = "Duration is required";

      if (formData.budgetType === "fixed") {
        if (!formData.budgetAmount || formData.budgetAmount <= 0) {
          newErrors.budgetAmount = "Budget amount is required";
        }
      } else {
        if (!formData.budgetMin || formData.budgetMin <= 0) {
          newErrors.budgetMin = "Minimum rate is required";
        }
        if (!formData.budgetMax || formData.budgetMax <= 0) {
          newErrors.budgetMax = "Maximum rate is required";
        }
        if (
          formData.budgetMin &&
          formData.budgetMax &&
          formData.budgetMin >= formData.budgetMax
        ) {
          newErrors.budgetMax = "Maximum must be greater than minimum";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const calculateBudgetDisplay = () => {
    if (formData.budgetType === "fixed") {
      return formData.budgetAmount
        ? `$${formData.budgetAmount.toLocaleString()}`
        : "$0";
    } else {
      const min = formData.budgetMin || 0;
      const max = formData.budgetMax || 0;
      return `$${min}-$${max}/hr`;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2) || !user) return;

    setIsSubmitting(true);

    try {
      const jobData: Omit<
        JobPosting,
        "id" | "postedDate" | "applicationsCount" | "status"
      > = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        skills: formData.skills,
        experienceLevel: formData.experienceLevel,
        budget: {
          type: formData.budgetType,
          amount: formData.budgetAmount,
          min: formData.budgetMin,
          max: formData.budgetMax,
        },
        duration: formData.duration,
        deadline: formData.deadline,
        attachments: formData.attachments.map((f) => f.name),
        client: {
          id: user.id,
          name: user.profile?.full_name || user.email || "Client",
          email: user.email,
          avatar: user.profile?.avatar_url || "/placeholder.svg",
          location: "Unknown",
          verified: false,
          rating: 4.5,
          totalSpent: 0,
          jobsPosted: 0,
          hireRate: 0,
          paymentVerified: false,
        },
        visibility: formData.isPublic ? "public" : "private",
        requiresVerification: formData.requiresVerification,
      };

      const result = await createJob(jobData);
      if (result) {
        toast({
          title: "Job Posted Successfully!",
          description:
            "Your job has been posted and is now visible to freelancers.",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Build a responsive e-commerce website"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Project Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your project in detail. Include requirements, deliverables, and any specific preferences..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={6}
          className={`resize-none ${errors.description ? "border-red-500" : ""}`}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
        <div className="text-xs text-muted-foreground">
          {formData.description.length}/2000 characters
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => {
              handleInputChange("category", value);
              handleInputChange("subcategory", "");
            }}
          >
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Subcategory</Label>
          <Select
            value={formData.subcategory}
            onValueChange={(value) => handleInputChange("subcategory", value)}
            disabled={!formData.category}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent>
              {formData.category &&
                SUBCATEGORIES[formData.category]?.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Required Skills *</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-sm">
              {skill}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSkill(skill)}
                className="ml-1 h-auto p-0 text-xs"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add custom skill"
              value={formData.customSkill}
              onChange={(e) => handleInputChange("customSkill", e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addSkill(formData.customSkill);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addSkill(formData.customSkill)}
              disabled={!formData.customSkill.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Popular skills:</p>
          <div className="flex flex-wrap gap-1">
            {POPULAR_SKILLS.filter((skill) => !formData.skills.includes(skill))
              .slice(0, 15)
              .map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => addSkill(skill)}
                  className="text-xs h-7"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {skill}
                </Button>
              ))}
          </div>
        </div>
        {errors.skills && (
          <p className="text-sm text-red-500">{errors.skills}</p>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload project files, mockups, or requirements (Optional)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Choose Files</span>
                </Button>
              </label>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Experience Level *</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value: "entry" | "intermediate" | "expert") =>
              handleInputChange("experienceLevel", value)
            }
          >
            <SelectTrigger
              className={errors.experienceLevel ? "border-red-500" : ""}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          {errors.experienceLevel && (
            <p className="text-sm text-red-500">{errors.experienceLevel}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Project Duration *</Label>
          <Select
            value={formData.duration}
            onValueChange={(value) => handleInputChange("duration", value)}
          >
            <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((duration) => (
                <SelectItem key={duration} value={duration}>
                  {duration}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.duration && (
            <p className="text-sm text-red-500">{errors.duration}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="fixed"
                checked={formData.budgetType === "fixed"}
                onCheckedChange={() => handleInputChange("budgetType", "fixed")}
              />
              <Label htmlFor="fixed">Fixed Price</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hourly"
                checked={formData.budgetType === "hourly"}
                onCheckedChange={() =>
                  handleInputChange("budgetType", "hourly")
                }
              />
              <Label htmlFor="hourly">Hourly Rate</Label>
            </div>
          </div>

          {formData.budgetType === "fixed" ? (
            <div className="space-y-2">
              <Label>Total Project Budget *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.budgetAmount || ""}
                  onChange={(e) =>
                    handleInputChange("budgetAmount", Number(e.target.value))
                  }
                  className={`pl-10 ${errors.budgetAmount ? "border-red-500" : ""}`}
                />
              </div>
              {errors.budgetAmount && (
                <p className="text-sm text-red-500">{errors.budgetAmount}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Rate/Hour *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="25"
                    value={formData.budgetMin || ""}
                    onChange={(e) =>
                      handleInputChange("budgetMin", Number(e.target.value))
                    }
                    className={`pl-10 ${errors.budgetMin ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.budgetMin && (
                  <p className="text-sm text-red-500">{errors.budgetMin}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Maximum Rate/Hour *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="75"
                    value={formData.budgetMax || ""}
                    onChange={(e) =>
                      handleInputChange("budgetMax", Number(e.target.value))
                    }
                    className={`pl-10 ${errors.budgetMax ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.budgetMax && (
                  <p className="text-sm text-red-500">{errors.budgetMax}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="deadline">Project Deadline (Optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => handleInputChange("deadline", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Job Posting</Label>
              <p className="text-sm text-muted-foreground">
                Make this job visible to all freelancers
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) =>
                handleInputChange("isPublic", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Verified Freelancers</Label>
              <p className="text-sm text-muted-foreground">
                Only allow verified freelancers to apply
              </p>
            </div>
            <Switch
              checked={formData.requiresVerification}
              onCheckedChange={(checked) =>
                handleInputChange("requiresVerification", checked)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Review Your Job Posting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">{formData.title}</h3>
            <div className="flex gap-2 mb-3">
              <Badge variant="secondary">{formData.category}</Badge>
              {formData.subcategory && (
                <Badge variant="outline">{formData.subcategory}</Badge>
              )}
              <Badge>{formData.experienceLevel} level</Badge>
            </div>
            <p className="text-muted-foreground text-sm whitespace-pre-line">
              {formData.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">
                {calculateBudgetDisplay()}
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.budgetType === "fixed"
                  ? "Fixed price"
                  : "Hourly rate"}
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-lg font-semibold">{formData.duration}</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-lg font-semibold">
                {formData.isPublic ? "Public" : "Private"}
              </div>
              <div className="text-sm text-muted-foreground">Visibility</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {formData.attachments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Attachments</h4>
              <div className="space-y-1">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="text-sm">
              <p className="font-medium">Before posting:</p>
              <p className="text-muted-foreground">
                Review all details carefully. You can edit your job after
                posting, but changes may affect existing proposals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex gap-2 flex-1 ml-4">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`h-2 flex-1 rounded ${
                    stepNum <= step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            Post a New Job - Step {step} of 3
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Posting..." : "Post Job"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
