// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Camera,
  Upload,
  Save,
  User,
  Briefcase,
  Settings,
  Star,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Award,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  DollarSign,
  Clock,
  Languages,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  hourlyRate: number;
  availability: string;
  skills: string[];
  languages: string[];
  experience: {
    years: number;
    level: "beginner" | "intermediate" | "expert";
  };
  portfolio: {
    id: string;
    title: string;
    description: string;
    image?: string;
    url?: string;
    tags: string[];
  }[];
  education: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    year: string;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    year: string;
    url?: string;
  }[];
}

const UpdateProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [profileCompletion, setProfileCompletion] = useState(0);

  const [profile, setProfile] = useState<FreelancerProfile>({
    id: user?.id || "1",
    name: user?.name || "John Doe",
    title: "Full Stack Developer",
    bio: "Passionate developer with 5+ years of experience in modern web technologies...",
    avatar: user?.avatar || "",
    email: user?.email || "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    hourlyRate: 75,
    availability: "available",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
    languages: ["English (Native)", "Spanish (Conversational)"],
    experience: {
      years: 5,
      level: "expert",
    },
    portfolio: [
      {
        id: "1",
        title: "E-commerce Platform",
        description: "Built a full-stack e-commerce solution with React and Node.js",
        tags: ["React", "Node.js", "MongoDB"],
      },
      {
        id: "2",
        title: "Mobile Banking App",
        description: "Developed a secure mobile banking application",
        tags: ["React Native", "Firebase", "Security"],
      },
    ],
    education: [
      {
        id: "1",
        institution: "Stanford University",
        degree: "Bachelor's",
        field: "Computer Science",
        year: "2019",
      },
    ],
    certifications: [
      {
        id: "1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        year: "2023",
      },
    ],
  });

  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    tags: "",
  });

  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    year: "",
  });

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    year: "",
    url: "",
  });

  useEffect(() => {
    calculateProfileCompletion();
  }, [profile]);

  const calculateProfileCompletion = () => {
    const fields = [
      profile.name,
      profile.title,
      profile.bio,
      profile.email,
      profile.phone,
      profile.location,
      profile.hourlyRate > 0,
      profile.skills.length > 0,
      profile.languages.length > 0,
      profile.portfolio.length > 0,
      profile.education.length > 0,
    ];
    
    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProfileCompletion(percentage);
  };

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FreelancerProfile],
        [field]: value
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const addPortfolioItem = () => {
    if (newPortfolioItem.title.trim()) {
      const portfolioItem = {
        id: Date.now().toString(),
        title: newPortfolioItem.title,
        description: newPortfolioItem.description,
        tags: newPortfolioItem.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      };
      
      setProfile(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, portfolioItem]
      }));
      
      setNewPortfolioItem({ title: "", description: "", tags: "" });
    }
  };

  const removePortfolioItem = (id: string) => {
    setProfile(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter(item => item.id !== id)
    }));
  };

  const addEducation = () => {
    if (newEducation.institution.trim()) {
      const education = {
        id: Date.now().toString(),
        ...newEducation,
      };
      
      setProfile(prev => ({
        ...prev,
        education: [...prev.education, education]
      }));
      
      setNewEducation({ institution: "", degree: "", field: "", year: "" });
    }
  };

  const removeEducation = (id: string) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter(item => item.id !== id)
    }));
  };

  const addCertification = () => {
    if (newCertification.name.trim()) {
      const certification = {
        id: Date.now().toString(),
        ...newCertification,
      };
      
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, certification]
      }));
      
      setNewCertification({ name: "", issuer: "", year: "", url: "" });
    }
  };

  const removeCertification = (id: string) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter(item => item.id !== id)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Update Profile</h1>
          <p className="text-muted-foreground">Keep your profile up to date to attract more clients</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleSave} disabled={loading} className="flex-1 sm:flex-none">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Profile Completion */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Profile Completion</h3>
              <p className="text-sm text-muted-foreground">
                Complete your profile to attract more clients
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{profileCompletion}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={profileCompletion} className="h-2" />
          {profileCompletion < 100 && (
            <div className="mt-2 text-sm text-muted-foreground">
              A complete profile gets 3x more visibility!
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Profile Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-20 h-20 mx-auto">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-lg">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-semibold mt-2">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.title}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.9 (127 reviews)</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>${profile.hourlyRate}/hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Badge variant={profile.availability === "available" ? "default" : "secondary"}>
                    {profile.availability === "available" ? "Available" : "Busy"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Top Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="basic">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="professional">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Professional</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                <FileText className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="education">
                <GraduationCap className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Education</span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Professional Title</Label>
                      <Input
                        id="title"
                        value={profile.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="e.g. Full Stack Developer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell clients about yourself, your experience, and what you can offer..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Professional Information */}
            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={profile.hourlyRate}
                        onChange={(e) => handleInputChange("hourlyRate", Number(e.target.value))}
                        placeholder="75"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience-years">Years of Experience</Label>
                      <Input
                        id="experience-years"
                        type="number"
                        value={profile.experience.years}
                        onChange={(e) => handleNestedChange("experience", "years", Number(e.target.value))}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience-level">Experience Level</Label>
                      <select
                        id="experience-level"
                        className="w-full px-3 py-2 border rounded-md"
                        value={profile.experience.level}
                        onChange={(e) => handleNestedChange("experience", "level", e.target.value)}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <select
                      id="availability"
                      className="w-full px-3 py-2 border rounded-md"
                      value={profile.availability}
                      onChange={(e) => handleInputChange("availability", e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label>Skills</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={addSkill} type="button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <Label>Languages</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="e.g. English (Native)"
                        onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                      />
                      <Button onClick={addLanguage} type="button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {language}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeLanguage(language)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Portfolio */}
            <TabsContent value="portfolio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <p className="text-muted-foreground">Showcase your best work to attract clients</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add New Portfolio Item */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Add Portfolio Item</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Project title"
                        value={newPortfolioItem.title}
                        onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Input
                        placeholder="Tags (comma separated)"
                        value={newPortfolioItem.tags}
                        onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                    <Textarea
                      placeholder="Project description"
                      value={newPortfolioItem.description}
                      onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                    <Button onClick={addPortfolioItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Portfolio Item
                    </Button>
                  </div>

                  {/* Portfolio Items */}
                  <div className="space-y-4">
                    {profile.portfolio.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{item.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePortfolioItem(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education */}
            <TabsContent value="education" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Education */}
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Education */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium">Add Education</h4>
                      <Input
                        placeholder="Institution"
                        value={newEducation.institution}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Degree"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                        />
                        <Input
                          placeholder="Year"
                          value={newEducation.year}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                        />
                      </div>
                      <Input
                        placeholder="Field of study"
                        value={newEducation.field}
                        onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
                      />
                      <Button onClick={addEducation} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* Education List */}
                    <div className="space-y-3">
                      {profile.education.map((edu) => (
                        <div key={edu.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                              <p className="text-sm text-muted-foreground">{edu.institution}</p>
                              <p className="text-xs text-muted-foreground">{edu.year}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Certification */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-medium">Add Certification</h4>
                      <Input
                        placeholder="Certification name"
                        value={newCertification.name}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Issuer"
                          value={newCertification.issuer}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                        />
                        <Input
                          placeholder="Year"
                          value={newCertification.year}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, year: e.target.value }))}
                        />
                      </div>
                      <Input
                        placeholder="Certificate URL (optional)"
                        value={newCertification.url}
                        onChange={(e) => setNewCertification(prev => ({ ...prev, url: e.target.value }))}
                      />
                      <Button onClick={addCertification} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {/* Certifications List */}
                    <div className="space-y-3">
                      {profile.certifications.map((cert) => (
                        <div key={cert.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{cert.name}</h4>
                              <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                              <p className="text-xs text-muted-foreground">{cert.year}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCertification(cert.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground">Make your profile visible to clients</p>
                    </div>
                    <Button variant="outline">
                      Public
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Job Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified about matching jobs</p>
                    </div>
                    <Button variant="outline">
                      Enabled
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Profile Badge</h4>
                      <p className="text-sm text-muted-foreground">Show verification status</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
