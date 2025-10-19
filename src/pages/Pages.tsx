import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { Plus, Search, Building, Crown, Verified, Globe, MapPin, Phone, Mail, ExternalLink, TrendingUp, MessageSquare, UserPlus, Settings, Eye, Loader2 } from "lucide-react";

interface Page {
  id: string;
  name: string;
  followers: number;
  category: string;
  verified: boolean;
  avatar: string;
  description?: string;
  pageType: "business" | "brand" | "public_figure" | "community" | "organization";
  isFollowing?: boolean;
  isOwner?: boolean;
  website?: string;
  location?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  posts?: number;
  engagement?: number;
}

const Badge: React.FC<{ children: React.ReactNode; className?: string }>= ({ children, className }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className || 'border-gray-300 text-gray-700'}`}>{children}</span>
);

const Pages: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("followers");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [followedPages, setFollowedPages] = useState<Page[]>([]);
  const [myPages, setMyPages] = useState<Page[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageForm, setPageForm] = useState({ name: "", description: "", category: "", pageType: "business", website: "", location: "", email: "", phone: "", avatar: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPages();
      const pagesData = response.data || response;
      setAllPages(pagesData);
      setFollowedPages(pagesData.filter((p: Page) => p.isFollowing));
      setMyPages(pagesData.filter((p: Page) => p.isOwner));
    } catch (error) {
      console.error('Error loading pages:', error);
      toast({ title: "Error", description: "Failed to load pages", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const filteredPages = allPages.filter((page: Page) => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) || (page.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) || page.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
    const matchesType = selectedType === "all" || page.pageType === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  }).sort((a: Page, b: Page) => {
    switch (sortBy) {
      case "followers": return b.followers - a.followers;
      case "recent": return (new Date(b.createdAt || new Date().toISOString()).getTime() - new Date(a.createdAt || new Date().toISOString()).getTime());
      case "name": return a.name.localeCompare(b.name);
      case "verified": return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      default: return 0;
    }
  });

  const categories = ["Technology","Business","Marketing","Finance","Healthcare","Education"];

  const handleCreatePage = async () => {
    if (!pageForm.name) return toast({ title: "Error", description: "Page name is required", variant: "destructive" });
    try {
      const res = await apiClient.request('/pages', { method: 'POST', body: JSON.stringify(pageForm) });
      const newPage = res.data || res;
      setMyPages(prev => [newPage, ...prev]);
      setAllPages(prev => [newPage, ...prev]);
      setShowCreateDialog(false);
      toast({ title: 'Page Created', description: `${newPage.name} created` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to create page', variant: 'destructive' });
    }
  };

  const renderPageCard = (page: Page) => (
    <Card key={page.id} className="hover:shadow-lg transition duration-200 cursor-pointer" onClick={() => navigate(`/app/pages/${page.id}`)}>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar>
          <AvatarImage src={page.avatar} alt={page.name} />
          <AvatarFallback>{page.name?.slice(0,2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{page.name}</h3>
            {page.verified && <Verified className="w-4 h-4 text-blue-600" />}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{page.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <span>{formatNumber(page.followers)} followers</span>
            {page.location && <span>• {page.location}</span>}
          </div>
        </div>
        <div>
          {page.isFollowing ? <Button variant="outline" size="sm">Following</Button> : <Button size="sm">Follow</Button>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Pages</h1>
            <p className="text-muted-foreground">Discover and follow pages from businesses, brands, and public figures</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="w-4 h-4" /> Create Page</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Page</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label htmlFor="pageName">Page Name</Label><Input id="pageName" value={pageForm.name} onChange={(e) => setPageForm(prev => ({ ...prev, name: e.target.value }))} /></div>
                <div><Label>Category</Label><Select value={pageForm.category} onValueChange={(v) => setPageForm(prev => ({ ...prev, category: v }))}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Description</Label><Textarea value={pageForm.description} onChange={(e) => setPageForm(prev => ({ ...prev, description: e.target.value }))} rows={3} /></div>
                <div className="flex gap-2"><Button onClick={handleCreatePage} className="flex-1">Create Page</Button><Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button></div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left filters */}
          <aside className="md:col-span-1 sticky top-24">
            <div className="bg-card p-4 rounded-lg shadow-sm space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder="Search pages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger className="w-full"><SelectValue placeholder="All Categories" /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
              <Select value={selectedType} onValueChange={setSelectedType}><SelectTrigger className="w-full"><SelectValue placeholder="All Types" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="brand">Brand</SelectItem><SelectItem value="public_figure">Public Figure</SelectItem></SelectContent></Select>
              <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-full"><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent><SelectItem value="followers">Most Followers</SelectItem><SelectItem value="recent">Recently Created</SelectItem></SelectContent></Select>
            </div>
          </aside>

          {/* Main */}
          <main className="md:col-span-2">
            {loading && <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
            {!loading && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredPages.length > 0 ? filteredPages.map(p => renderPageCard(p)) : <div className="col-span-full text-center py-12">No pages found</div>}
                </div>
              </div>
            )}
          </main>

          {/* Right */}
          <aside className="hidden md:block md:col-span-1">
            <div className="space-y-4">
              <Card className="p-4"><h5 className="font-medium">Popular Pages</h5><div className="mt-3 space-y-3">{allPages.slice(0,5).map(p => (<div key={p.id} className="flex items-center gap-3"><Avatar><AvatarImage src={p.avatar} /><AvatarFallback>{p.name?.slice(0,2)}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{p.name}</div><div className="text-xs text-muted-foreground">{formatNumber(p.followers)} followers</div></div></div>))}</div></Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Pages;
