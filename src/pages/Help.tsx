// @ts-nocheck
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  User,
  Shield,
  CreditCard,
  ShoppingBag,
  Users,
  Briefcase,
  Coins,
  BookOpen,
  FileText,
  Video,
  Globe,
  Zap,
  Star,
  ThumbsUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Settings,
  Download,
  Upload,
  Lock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Flag,
  Filter,
  SortAsc,
} from "lucide-react";

const Help = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const helpCategories = [
    { id: "account", name: "Account & Profile", icon: User, color: "bg-blue-500" },
    { id: "privacy", name: "Privacy & Security", icon: Shield, color: "bg-green-500" },
    { id: "billing", name: "Billing & Payments", icon: CreditCard, color: "bg-purple-500" },
    { id: "marketplace", name: "Marketplace", icon: ShoppingBag, color: "bg-orange-500" },
    { id: "social", name: "Social Features", icon: Users, color: "bg-pink-500" },
    { id: "freelance", name: "Freelance", icon: Briefcase, color: "bg-indigo-500" },
    { id: "crypto", name: "Cryptocurrency", icon: Coins, color: "bg-yellow-500" },
    { id: "content", name: "Content & Media", icon: Video, color: "bg-red-500" },
  ];

  const faqs = [
    {
      id: "1",
      category: "account",
      question: "How do I change my profile picture?",
      answer: "To change your profile picture, go to your profile page and click on your current profile image. Select 'Change Photo' and upload a new image from your device. Make sure the image meets our guidelines: under 5MB, JPG or PNG format."
    },
    {
      id: "2",
      category: "account",
      question: "How do I verify my account?",
      answer: "To get verified, go to Settings > Account > Verification. You'll need to provide a government-issued ID and complete our verification process. Verified accounts receive a blue badge and additional features."
    },
    {
      id: "3",
      category: "privacy",
      question: "How can I control who sees my content?",
      answer: "You can control your privacy settings in Settings > Privacy. Choose who can see your posts (public, friends, or private), who can send you messages, and manage your profile visibility."
    },
    {
      id: "4",
      category: "billing",
      question: "How do I upgrade to Premium?",
      answer: "To upgrade to Premium, go to Settings > Subscription. Choose your preferred plan and complete the payment process. Premium features include ad-free browsing, enhanced analytics, and exclusive content."
    },
    {
      id: "5",
      category: "marketplace",
      question: "How do I list a product for sale?",
      answer: "To list a product, go to the Marketplace section and click 'Sell Item'. Fill in the product details, add photos, set your price, and choose shipping options. Your listing will be reviewed before going live."
    },
    {
      id: "6",
      category: "social",
      question: "How do I create a group?",
      answer: "To create a group, go to Groups and click 'Create Group'. Enter a name, description, and privacy settings. You can invite friends or make it public for anyone to join."
    },
    {
      id: "7",
      category: "freelance",
      question: "How do I become a freelancer?",
      answer: "To become a freelancer, go to the Freelance section and complete your profile. Add your skills, portfolio, and set your rates. Clients can then browse and hire you for projects."
    },
    {
      id: "8",
      category: "crypto",
      question: "How do I set up my crypto wallet?",
      answer: "To set up your crypto wallet, go to Wallet > Setup. Follow the prompts to create a secure wallet, backup your recovery phrase, and verify your identity. You can then buy, sell, and trade cryptocurrencies."
    },
    {
      id: "9",
      category: "content",
      question: "What video formats are supported?",
      answer: "We support MP4, MOV, AVI, and WMV formats. Videos should be under 5GB in size and have a resolution of at least 720p. For best results, use MP4 with H.264 encoding."
    },
    {
      id: "10",
      category: "account",
      question: "How do I delete my account?",
      answer: "To delete your account, go to Settings > Account > Delete Account. Note that this action is irreversible and will permanently remove all your data. You'll need to confirm your decision via email."
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send to the backend
    console.log("Contact form submitted:", contactForm);
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24-48 hours.",
    });
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setShowContactForm(false);
  };

  const getCategoryName = (categoryId: string) => {
    const category = helpCategories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = helpCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : HelpCircle;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Help Center</h1>
                <p className="text-muted-foreground">
                  Find answers to your questions and get support
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowContactForm(true)}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Contact Support</h3>
                <p className="text-sm text-muted-foreground">Get help from our team</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Documentation</h3>
                <p className="text-sm text-muted-foreground">Comprehensive guides</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Video Tutorials</h3>
                <p className="text-sm text-muted-foreground">Step-by-step guides</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Contact Support
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowContactForm(false)}
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  Our support team will respond within 24-48 hours
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={5}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowContactForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Browse Help Topics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => setActiveCategory("all")}
            >
              <HelpCircle className="w-6 h-6" />
              <span className="text-xs">All Topics</span>
            </Button>
            
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setActiveCategory(category.id)}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredFaqs.length} articles</span>
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq) => {
                const CategoryIcon = getCategoryIcon(faq.category);
                return (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${helpCategories.find(c => c.id === faq.category)?.color || 'bg-gray-500'} text-white`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <span className="text-left">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-muted-foreground">{faq.answer}</p>
                        <div className="flex items-center gap-2 mt-3 text-sm">
                          <Badge variant="secondary">
                            {getCategoryName(faq.category)}
                          </Badge>
                          <span className="text-muted-foreground">Helpful?</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Yes
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <Card className="p-8 text-center">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or browse different categories
              </p>
              <Button onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}>
                Clear Filters
              </Button>
            </Card>
          )}
        </div>

        {/* Additional Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Comprehensive guides for all platform features
              </p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-between">
                  <span>Getting Started Guide</span>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>API Documentation</span>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Best Practices</span>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Keyboard Shortcuts</h4>
                    <p className="text-sm text-muted-foreground">
                      Press '?' to see all available shortcuts
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Premium Features</h4>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to unlock advanced analytics and tools
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Settings className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Customization</h4>
                    <p className="text-sm text-muted-foreground">
                      Personalize your experience in Settings
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Channels */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Other Ways to Get Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">Email Support</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Send us an email and we'll respond within 24 hours
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  support@eloity.com
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold">Phone Support</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Call us Monday-Friday, 9AM-5PM EST
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  +1 (800) 123-4567
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Community Forum</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Connect with other users and get help
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/app/community")}>
                  Visit Forum
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">All systems operational</p>
              <p className="text-sm text-green-700">
                Last updated: Today at 10:30 AM EST
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto text-green-700 border-green-300 hover:bg-green-100">
              View Status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;