import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import { chatInitiationService } from "@/services/chatInitiationService";
import {
  Plus,
  Search,
  Users,
  Crown,
  Shield,
  Lock,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  MessageSquare,
  UserPlus,
  UserMinus,
  Settings,
  Eye,
  Loader2,
  Star,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// Small Badge fallback for consistent styling
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
}
const Badge: React.FC<BadgeProps> = ({ children, className, variant }) => {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  const variantClasses =
    variant === "outline"
      ? "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
      : variant === "secondary"
      ? "border-transparent bg-secondary text-secondary-foreground"
      : variant === "destructive"
      ? "border-transparent bg-destructive text-destructive-foreground"
      : "border-transparent bg-primary text-primary-foreground";
  return <span className={`${base} ${variantClasses} ${className || ""}`}>{children}</span>;
};

interface Group {
  id: string;
  name: string;
  members: number;
  category: string;
  cover: string;
  description?: string;
  privacy: "public" | "private";
  isJoined?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  location?: string;
  createdAt?: string;
}

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("members");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupForm, setGroupForm] = useState({ name: "", description: "", category: "", privacy: "public", location: "", cover: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getGroups();
      const groupsData = response.data || response;
      setAllGroups(groupsData);
      setJoinedGroups(groupsData.filter((g: Group) => g.isJoined));
      setMyGroups(groupsData.filter((g: Group) => g.isOwner));
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({ title: "Error", description: "Failed to load groups", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const filteredGroups = allGroups
    .filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        group.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || group.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "members": return b.members - a.members;
        case "recent": return (new Date(b.createdAt || new Date().toISOString()).getTime() - new Date(a.createdAt || new Date().toISOString()).getTime());
        case "name": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const categories = ["Technology","Finance","Travel","Food","Business","Art & Design","Music","Gaming","Sports","Health & Fitness","Education","Lifestyle"];

  const handleCreateGroup = async () => {
    if (!groupForm.name || !groupForm.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    try {
      const response = await apiClient.request('/groups', { method: 'POST', body: JSON.stringify(groupForm) });
      const newGroup: Group = response.data || response;
      setMyGroups(prev => [newGroup, ...prev]);
      setAllGroups(prev => [newGroup, ...prev]);
      setGroupForm({ name: "", description: "", category: "", privacy: "public", location: "", cover: "" });
      setShowCreateDialog(false);
      toast({ title: "Group Created", description: `${newGroup.name} has been created successfully!` });
    } catch (error) {
      console.error('Error creating group:', error);
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
    }
  };

  const handleJoinGroup = async (group: Group) => {
    if (group.isJoined) return;
    try {
      await apiClient.request(`/groups/${group.id}/join`, { method: 'POST' });
      const updated = { ...group, isJoined: true };
      setJoinedGroups(prev => [updated, ...prev]);
      setAllGroups(prev => prev.map(g => g.id === group.id ? updated : g));
      toast({ title: "Joined Group", description: `You've successfully joined ${group.name}!` });
    } catch (error) {
      console.error('Error joining group:', error);
      toast({ title: "Error", description: "Failed to join group", variant: "destructive" });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await apiClient.request(`/groups/${groupId}/leave`, { method: 'POST' });
      setJoinedGroups(prev => prev.filter(g => g.id !== groupId));
      setAllGroups(prev => prev.map(g => g.id === groupId ? { ...g, isJoined: false } : g));
      toast({ title: "Left Group", description: "You've left the group successfully" });
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({ title: "Error", description: "Failed to leave group", variant: "destructive" });
    }
  };

  const handleViewGroup = (groupId: string) => navigate(`/app/groups/${groupId}`);

  const renderGroupCard = (group: Group, showManageButton = false) => (
    <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer" onClick={() => handleViewGroup(group.id)}>
      <div className="relative">
        <div className="w-full h-44 sm:h-48 md:h-40 lg:h-48 overflow-hidden">
          <img src={group.cover} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-bold text-white text-base sm:text-lg mb-1 line-clamp-2">{group.name}</h3>
          <div className="flex items-center text-white/80 text-xs sm:text-sm gap-3">
            <div className="flex items-center"><Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{formatNumber(group.members)}</div>
            {group.location && <div className="flex items-center min-w-0"><MapPin className="w-3 h-3 mr-1" /><span className="truncate">{group.location}</span></div>}
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {group.description && <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {!group.isJoined && !group.isOwner ? (
              <Button onClick={() => handleJoinGroup(group)} className="flex-1 text-sm h-9" size="sm">Join</Button>
            ) : group.isJoined ? (
              <div className="flex gap-2 flex-1">
                <Button variant="outline" className="flex-1 text-sm h-9" size="sm" onClick={() => handleViewGroup(group.id)}>View Posts</Button>
                <Button variant="outline" size="sm" onClick={() => handleLeaveGroup(group.id)} className="h-9 w-9 p-0"><UserMinus className="w-4 h-4" /></Button>
              </div>
            ) : group.isOwner ? (
              <Button variant="outline" className="flex-1 text-sm h-9" size="sm" onClick={() => handleViewGroup(group.id)}>Manage</Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2"><svg className="w-4 h-4"/><span>Back</span></Button>
            <div>
              <h1 className="text-3xl font-bold">Groups</h1>
              <p className="text-muted-foreground">Connect with communities that share your interests</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2"><Plus className="w-4 h-4" /> Create Group</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name *</Label>
                  <Input id="groupName" value={groupForm.name} onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter group name" />
                </div>
                <div>
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea id="groupDescription" value={groupForm.description} onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))} rows={3} />
                </div>
                <div>
                  <Label htmlFor="groupCategory">Category *</Label>
                  <Select value={groupForm.category} onValueChange={(v) => setGroupForm(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateGroup} className="flex-1">Create Group</Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar included above in the layout using render logic - but keep placeholder for accessibility */}
          <div className="md:col-span-4">
            {/* The content area is rendered inside the render logic above for clarity */}
          </div>

          {/* Use existing layout rendering by reusing earlier JSX - to keep HMR minimal we render the content directly below */}
          <div className="md:col-span-1"></div>
        </div>

        {/* Render main Tabs and content below (kept for HMR simplicity) */}
        <div className="mt-4">
          {/* The primary layout for desktop/mobile uses the existing components above (filters, main, right) handled earlier in code for readability */}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Filters column */}
              <aside className="md:col-span-1">
                <div className="space-y-4">
                  <div className="bg-card p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Explore Groups</h4>
                      <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />Create
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search groups..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger className="w-full"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select>
                      <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-full"><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent><SelectItem value="members">Most Members</SelectItem><SelectItem value="recent">Recently Created</SelectItem><SelectItem value="name">Name A-Z</SelectItem></SelectContent></Select>
                    </div>
                  </div>

                  <div className="bg-card p-4 rounded-lg shadow-sm">
                    <h5 className="font-medium mb-2">Suggested Groups</h5>
                    <div className="space-y-2">
                      {allGroups.slice(0,4).map(g => (
                        <div key={g.id} className="flex items-center gap-3">
                          <img src={g.cover} alt={g.name} className="w-10 h-10 rounded-md object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{g.name}</div>
                            <div className="text-xs text-muted-foreground">{formatNumber(g.members)} members</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleJoinGroup(g); }}>Join</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main content */}
              <main className="md:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="discover" className="flex items-center gap-2"><Eye className="w-4 h-4" />Discover</TabsTrigger>
                    <TabsTrigger value="joined" className="flex items-center gap-2"><Users className="w-4 h-4" />My Groups ({joinedGroups.length})</TabsTrigger>
                    <TabsTrigger value="owned" className="flex items-center gap-2"><Crown className="w-4 h-4" />Created ({myGroups.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="discover" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{allGroups.length}</p><p className="text-sm text-muted-foreground">Total Groups</p></div></div></Card>
                      <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{categories.length}</p><p className="text-sm text-muted-foreground">Categories</p></div></div></Card>
                      <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Activity className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold">{allGroups.filter(g => g.privacy === 'public').length}</p><p className="text-sm text-muted-foreground">Public Groups</p></div></div></Card>
                      <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Star className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold">{Math.round(allGroups.reduce((acc,g) => acc + g.members, 0) / 1000)}K</p><p className="text-sm text-muted-foreground">Total Members</p></div></div></Card>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredGroups.length > 0 ? filteredGroups.map(group => renderGroupCard(group)) : (
                        <div className="col-span-full text-center py-12"><Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">No groups found</h3><p className="text-muted-foreground mb-4">Try adjusting your search criteria or browse different categories</p><Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>Clear Filters</Button></div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="joined" className="space-y-6">
                    {joinedGroups.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{joinedGroups.map(g => renderGroupCard(g, true))}</div>) : (<div className="text-center py-12"><Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">You haven't joined any groups yet</h3><p className="text-muted-foreground mb-6">Explore groups that match your interests and connect with like-minded people</p><Button onClick={() => setActiveTab('discover')}>Discover Groups</Button></div>)}
                  </TabsContent>

                  <TabsContent value="owned" className="space-y-6">
                    {myGroups.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{myGroups.map(g => renderGroupCard(g, true))}</div>) : (<div className="text-center py-12"><Crown className="w-16 h-16 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">You haven't created any groups yet</h3><p className="text-muted-foreground mb-6">Start building your own community by creating your first group</p><Button onClick={() => setShowCreateDialog(true)}><Plus className="w-4 h-4 mr-2" />Create Your First Group</Button></div>)}
                  </TabsContent>
                </Tabs>
              </main>

              {/* Right recommendations */}
              <aside className="hidden md:block md:col-span-1">
                <div className="space-y-4">
                  <div className="bg-card p-4 rounded-lg shadow-sm">
                    <h5 className="font-medium mb-2">Trending Topics</h5>
                    <div className="flex flex-wrap gap-2"><Badge variant="outline">Technology</Badge><Badge variant="outline">Design</Badge><Badge variant="outline">Freelance</Badge><Badge variant="outline">E-commerce</Badge></div>
                  </div>
                  <div className="bg-card p-4 rounded-lg shadow-sm">
                    <h5 className="font-medium mb-2">Popular Groups</h5>
                    <div className="space-y-3">{allGroups.slice(0,5).map(g => (<div key={g.id} className="flex items-center gap-3"><img src={g.cover} alt={g.name} className="w-12 h-12 rounded-md object-cover" /><div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{g.name}</div><div className="text-xs text-muted-foreground">{formatNumber(g.members)} members</div></div></div>))}</div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
