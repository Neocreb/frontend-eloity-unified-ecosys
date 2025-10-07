// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Star,
  DollarSign,
  Clock,
  Eye,
  MessageCircle,
  Heart,
  HeartOff,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Calendar,
  Globe,
  Languages,
  BookmarkPlus,
  Send,
  ExternalLink,
  Sliders,
  SortAsc,
  UserCheck,
  Zap,
  Target,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  bio: string;
  location: string;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  successRate: number;
  responseTime: string;
  availability: "available" | "busy" | "unavailable";
  skills: string[];
  languages: string[];
  experience: number; // years
  level: "rising-talent" | "experienced" | "top-rated";
  badges: string[];
  portfolio: {
    id: string;
    title: string;
    image?: string;
    category: string;
  }[];
  categories: string[];
  lastActive: Date;
  totalEarnings: number;
  featured: boolean;
  isOnline: boolean;
  verified: boolean;
  saved: boolean;
}

const FindFreelancers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [savedFreelancers, setSavedFreelancers] = useState<Set<string>>(new Set());
  const [contactedFreelancers, setContactedFreelancers] = useState<Set<string>>(new Set());
  
  // Filters
  const [filters, setFilters] = useState({
    category: "all",
    minRate: "",
    maxRate: "",
    availability: "all",
    level: "all",
    location: "all",
    rating: "all",
  });
  
  const [sortBy, setSortBy] = useState("relevance");
  const [message, setMessage] = useState("");

  const [freelancers, setFreelancers] = useState<Freelancer[]>([
    {
      id: "f1",
      name: "Sarah Johnson",
      title: "Full Stack React Developer",
      avatar: "",
      bio: "Passionate full-stack developer with 6+ years of experience building scalable web applications using React, Node.js, and cloud technologies. I help businesses transform their ideas into powerful digital solutions.",
      location: "San Francisco, CA",
      hourlyRate: 85,
      rating: 4.9,
      totalReviews: 127,
      completedJobs: 89,
      successRate: 98,
      responseTime: "< 1 hour",
      availability: "available",
      skills: ["React", "Node.js", "TypeScript", "AWS", "MongoDB", "Python"],
      languages: ["English (Native)", "Spanish (Conversational)"],
      experience: 6,
      level: "top-rated",
      badges: ["Top Rated", "Rising Talent", "Expert Vetted"],
      portfolio: [
        { id: "p1", title: "E-commerce Platform", category: "Web Development" },
        { id: "p2", title: "SaaS Dashboard", category: "UI/UX Design" },
        { id: "p3", title: "Mobile Banking App", category: "Mobile Development" },
      ],
      categories: ["Web Development", "Mobile Development"],
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      totalEarnings: 125000,
      featured: true,
      isOnline: true,
      verified: true,
      saved: false,
    },
    {
      id: "f2",
      name: "Alex Chen",
      title: "UI/UX Designer & Frontend Developer",
      avatar: "",
      bio: "Creative designer and frontend developer specializing in user-centered design and modern web technologies. I create beautiful, intuitive interfaces that users love.",
      location: "Austin, TX",
      hourlyRate: 65,
      rating: 4.8,
      totalReviews: 89,
      completedJobs: 67,
      successRate: 96,
      responseTime: "< 2 hours",
      availability: "available",
      skills: ["Figma", "React", "CSS", "JavaScript", "Adobe Creative Suite", "Prototyping"],
      languages: ["English (Native)", "Mandarin (Native)"],
      experience: 4,
      level: "experienced",
      badges: ["Rising Talent", "Design Expert"],
      portfolio: [
        { id: "p4", title: "Fintech Mobile App", category: "UI/UX Design" },
        { id: "p5", title: "Corporate Website", category: "Web Design" },
      ],
      categories: ["Design", "Web Development"],
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      totalEarnings: 78000,
      featured: false,
      isOnline: true,
      verified: true,
      saved: true,
    },
    {
      id: "f3",
      name: "Maria Rodriguez",
      title: "Python Data Scientist & ML Engineer",
      avatar: "",
      bio: "Data scientist with expertise in machine learning, statistical analysis, and predictive modeling. I help businesses make data-driven decisions and build intelligent systems.",
      location: "New York, NY",
      hourlyRate: 95,
      rating: 4.9,
      totalReviews: 156,
      completedJobs: 123,
      successRate: 99,
      responseTime: "< 30 minutes",
      availability: "busy",
      skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL", "AWS"],
      languages: ["English (Fluent)", "Spanish (Native)", "French (Intermediate)"],
      experience: 8,
      level: "top-rated",
      badges: ["Top Rated", "Expert Vetted", "Python Expert"],
      portfolio: [
        { id: "p6", title: "Fraud Detection System", category: "Data Science" },
        { id: "p7", title: "Customer Analytics Dashboard", category: "Analytics" },
        { id: "p8", title: "Recommendation Engine", category: "Machine Learning" },
      ],
      categories: ["Data Science", "Machine Learning"],
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      totalEarnings: 210000,
      featured: true,
      isOnline: true,
      verified: true,
      saved: false,
    },
    {
      id: "f4",
      name: "David Kim",
      title: "Mobile App Developer (iOS & Android)",
      avatar: "",
      bio: "Mobile development specialist with 5+ years creating high-performance native and cross-platform applications. Expert in Swift, Kotlin, and React Native.",
      location: "Seattle, WA",
      hourlyRate: 75,
      rating: 4.7,
      totalReviews: 94,
      completedJobs: 72,
      successRate: 94,
      responseTime: "< 3 hours",
      availability: "available",
      skills: ["React Native", "Swift", "Kotlin", "Flutter", "Firebase", "GraphQL"],
      languages: ["English (Fluent)", "Korean (Native)"],
      experience: 5,
      level: "experienced",
      badges: ["Mobile Expert", "Rising Talent"],
      portfolio: [
        { id: "p9", title: "Fitness Tracking App", category: "Mobile Development" },
        { id: "p10", title: "Food Delivery Platform", category: "Mobile Development" },
      ],
      categories: ["Mobile Development"],
      lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
      totalEarnings: 89000,
      featured: false,
      isOnline: false,
      verified: true,
      saved: false,
    },
    {
      id: "f5",
      name: "Emma Thompson",
      title: "DevOps Engineer & Cloud Architect",
      avatar: "",
      bio: "DevOps engineer specializing in cloud infrastructure, CI/CD pipelines, and containerization. I help teams deploy faster and scale efficiently.",
      location: "London, UK",
      hourlyRate: 90,
      rating: 4.8,
      totalReviews: 78,
      completedJobs: 56,
      successRate: 97,
      responseTime: "< 4 hours",
      availability: "available",
      skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "Python"],
      languages: ["English (Native)"],
      experience: 7,
      level: "top-rated",
      badges: ["Top Rated", "DevOps Expert", "AWS Certified"],
      portfolio: [
        { id: "p11", title: "Microservices Architecture", category: "DevOps" },
        { id: "p12", title: "Cloud Migration Project", category: "Cloud Computing" },
      ],
      categories: ["DevOps", "Cloud Computing"],
      lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
      totalEarnings: 156000,
      featured: false,
      isOnline: false,
      verified: true,
      saved: false,
    },
  ]);

  useEffect(() => {
    // Load saved freelancers from localStorage
    const saved = localStorage.getItem("savedFreelancers");
    const contacted = localStorage.getItem("contactedFreelancers");
    
    if (saved) setSavedFreelancers(new Set(JSON.parse(saved)));
    if (contacted) setContactedFreelancers(new Set(JSON.parse(contacted)));
  }, []);

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filters.category === "all" || freelancer.categories.includes(filters.category);
    const matchesAvailability = filters.availability === "all" || freelancer.availability === filters.availability;
    const matchesLevel = filters.level === "all" || freelancer.level === filters.level;
    const matchesRate = (!filters.minRate || freelancer.hourlyRate >= Number(filters.minRate)) &&
                       (!filters.maxRate || freelancer.hourlyRate <= Number(filters.maxRate));
    const matchesRating = filters.rating === "all" || freelancer.rating >= Number(filters.rating);
    
    return matchesSearch && matchesCategory && matchesAvailability && matchesLevel && matchesRate && matchesRating;
  });

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "rate-low":
        return a.hourlyRate - b.hourlyRate;
      case "rate-high":
        return b.hourlyRate - a.hourlyRate;
      case "experience":
        return b.experience - a.experience;
      case "recent":
        return b.lastActive.getTime() - a.lastActive.getTime();
      default: // relevance
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
    }
  });

  const toggleSaveFreelancer = (freelancerId: string) => {
    const newSavedFreelancers = new Set(savedFreelancers);
    if (newSavedFreelancers.has(freelancerId)) {
      newSavedFreelancers.delete(freelancerId);
      toast.success("Freelancer removed from saved");
    } else {
      newSavedFreelancers.add(freelancerId);
      toast.success("Freelancer saved");
    }
    setSavedFreelancers(newSavedFreelancers);
    localStorage.setItem("savedFreelancers", JSON.stringify([...newSavedFreelancers]));
  };

  const handleContactFreelancer = async (freelancerId: string) => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }

    setLoading(true);
    try {
      // Here you would send the message to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newContactedFreelancers = new Set(contactedFreelancers);
      newContactedFreelancers.add(freelancerId);
      setContactedFreelancers(newContactedFreelancers);
      localStorage.setItem("contactedFreelancers", JSON.stringify([...newContactedFreelancers]));
      
      toast.success("Message sent successfully!");
      setShowContactModal(false);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "top-rated":
        return "bg-purple-100 text-purple-800";
      case "experienced":
        return "bg-blue-100 text-blue-800";
      case "rising-talent":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "top-rated":
        return <Award className="w-3 h-3" />;
      case "experienced":
        return <Briefcase className="w-3 h-3" />;
      case "rising-talent":
        return <TrendingUp className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const FreelancerCard: React.FC<{ freelancer: Freelancer }> = ({ freelancer }) => (
    <Card className={`hover:shadow-lg transition-all duration-200 ${freelancer.featured ? "ring-2 ring-purple-200" : ""}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={freelancer.avatar} />
                  <AvatarFallback className="text-lg font-semibold">
                    {freelancer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {freelancer.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
                {freelancer.verified && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{freelancer.name}</h3>
                  {freelancer.featured && (
                    <Badge className="bg-purple-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground font-medium mb-2">{freelancer.title}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{freelancer.rating}</span>
                    <span className="text-muted-foreground">({freelancer.totalReviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{freelancer.location}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">${freelancer.hourlyRate}/hr</div>
                <div className="text-sm text-muted-foreground">{freelancer.responseTime} response</div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveFreelancer(freelancer.id);
                }}
              >
                {savedFreelancers.has(freelancer.id) ? (
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Bio */}
          <p className="text-muted-foreground text-sm line-clamp-3">{freelancer.bio}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-bold">{freelancer.completedJobs}</div>
              <div className="text-muted-foreground">Jobs</div>
            </div>
            <div>
              <div className="font-bold">{freelancer.successRate}%</div>
              <div className="text-muted-foreground">Success</div>
            </div>
            <div>
              <div className="font-bold">{freelancer.experience}y</div>
              <div className="text-muted-foreground">Experience</div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {freelancer.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{freelancer.skills.length - 5} more
              </Badge>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1">
            <Badge className={`${getLevelColor(freelancer.level)} text-xs`}>
              {getLevelIcon(freelancer.level)}
              <span className="ml-1 capitalize">{freelancer.level.replace('-', ' ')}</span>
            </Badge>
            <Badge className={`text-xs ${
              freelancer.availability === "available" ? "bg-green-100 text-green-800" :
              freelancer.availability === "busy" ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {freelancer.availability}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              className="flex-1"
              onClick={() => {
                setSelectedFreelancer(freelancer);
                setShowContactModal(true);
              }}
              disabled={contactedFreelancers.has(freelancer.id)}
            >
              {contactedFreelancers.has(freelancer.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Contacted
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFreelancer(freelancer)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <h1 className="text-2xl sm:text-3xl font-bold">Find Freelancers</h1>
          <p className="text-muted-foreground">Discover talented professionals for your projects</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, skills, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Design">Design</option>
              <option value="Data Science">Data Science</option>
              <option value="DevOps">DevOps</option>
              <option value="Writing">Writing</option>
            </select>
            <select
              className="px-3 py-2 border rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Best Match</option>
              <option value="rating">Highest Rated</option>
              <option value="rate-low">Lowest Rate</option>
              <option value="rate-high">Highest Rate</option>
              <option value="experience">Most Experienced</option>
              <option value="recent">Recently Active</option>
            </select>
            <Button variant="outline">
              <Sliders className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <select
                className="px-3 py-2 border rounded-md"
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              >
                <option value="all">Any Availability</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
              
              <select
                className="px-3 py-2 border rounded-md"
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              >
                <option value="all">Any Level</option>
                <option value="top-rated">Top Rated</option>
                <option value="experienced">Experienced</option>
                <option value="rising-talent">Rising Talent</option>
              </select>
              
              <Input
                placeholder="Min rate"
                type="number"
                value={filters.minRate}
                onChange={(e) => setFilters(prev => ({ ...prev, minRate: e.target.value }))}
              />
              
              <Input
                placeholder="Max rate"
                type="number"
                value={filters.maxRate}
                onChange={(e) => setFilters(prev => ({ ...prev, maxRate: e.target.value }))}
              />
              
              <select
                className="px-3 py-2 border rounded-md"
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              >
                <option value="all">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
              </select>
              
              <Button variant="outline" onClick={() => setFilters({
                category: "all",
                minRate: "",
                maxRate: "",
                availability: "all",
                level: "all",
                location: "all",
                rating: "all",
              })}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{sortedFreelancers.length}</div>
              <div className="text-sm text-muted-foreground">Freelancers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{savedFreelancers.size}</div>
              <div className="text-sm text-muted-foreground">Saved</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{contactedFreelancers.size}</div>
              <div className="text-sm text-muted-foreground">Contacted</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${Math.round(sortedFreelancers.reduce((acc, f) => acc + f.hourlyRate, 0) / sortedFreelancers.length || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Freelancer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedFreelancers.length > 0 ? (
          sortedFreelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No freelancers found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters to find more freelancers
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Load More */}
      {sortedFreelancers.length >= 10 && (
        <div className="text-center mt-8">
          <Button variant="outline">Load More Freelancers</Button>
        </div>
      )}

      {/* Freelancer Details Modal */}
      {selectedFreelancer && !showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedFreelancer.avatar} />
                      <AvatarFallback className="text-xl">
                        {selectedFreelancer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {selectedFreelancer.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedFreelancer.name}</CardTitle>
                    <p className="text-muted-foreground">{selectedFreelancer.title}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{selectedFreelancer.rating} ({selectedFreelancer.totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedFreelancer.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedFreelancer(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-muted-foreground">{selectedFreelancer.bio}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Rate & Availability</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Hourly Rate</span>
                      <span className="font-bold text-green-600">${selectedFreelancer.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Availability</span>
                      <Badge className={`text-xs ${
                        selectedFreelancer.availability === "available" ? "bg-green-100 text-green-800" :
                        selectedFreelancer.availability === "busy" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {selectedFreelancer.availability}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time</span>
                      <span>{selectedFreelancer.responseTime}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Jobs Completed</span>
                      <span className="font-bold">{selectedFreelancer.completedJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-bold">{selectedFreelancer.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience</span>
                      <span className="font-bold">{selectedFreelancer.experience} years</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <div className="space-y-1">
                    {selectedFreelancer.languages.map((lang, index) => (
                      <div key={index} className="text-sm">{lang}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFreelancer.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Portfolio</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedFreelancer.portfolio.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-all">
                      <CardContent className="pt-4">
                        <h5 className="font-medium">{item.title}</h5>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => setShowContactModal(true)}
                  disabled={contactedFreelancers.has(selectedFreelancer.id)}
                >
                  {contactedFreelancers.has(selectedFreelancer.id) ? "Already Contacted" : "Contact Freelancer"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleSaveFreelancer(selectedFreelancer.id)}
                >
                  {savedFreelancers.has(selectedFreelancer.id) ? (
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedFreelancer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Contact {selectedFreelancer.name}</CardTitle>
                  <p className="text-muted-foreground">{selectedFreelancer.title}</p>
                </div>
                <Button variant="ghost" onClick={() => setShowContactModal(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Tell them about your project and why you're interested in working with them..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quick Info</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="ml-2 font-medium">${selectedFreelancer.hourlyRate}/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Response:</span>
                    <span className="ml-2 font-medium">{selectedFreelancer.responseTime}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Success:</span>
                    <span className="ml-2 font-medium">{selectedFreelancer.successRate}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jobs:</span>
                    <span className="ml-2 font-medium">{selectedFreelancer.completedJobs}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleContactFreelancer(selectedFreelancer.id)}
                  disabled={loading || !message.trim()}
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowContactModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FindFreelancers;
