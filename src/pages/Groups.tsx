import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatNumber } from "@/utils/formatters";

interface Group {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  cover_url: string | null;
  privacy: string;
  member_count: number;
  creator_id: string;
  created_at: string;
  updated_at: string;
  category?: string;
  location?: string;
  isJoined?: boolean;
  isOwner?: boolean;
}

const tabs = ["for-you", "your", "posts", "discover"] as const;
type Tab = typeof tabs[number];

const referenceImages = [
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2Fe1f736c1d9194a97864842c1cff41f2b?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F4289cafbcb294f99a2042d8a20774a90?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F4b2aebacd0d2483c8d3adb237b556f47?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F3122527c5e794c1ba0d125d050131c17?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F0d91107625374da99df9125220500478?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F0b874c21ccca45a7a0500f4fba50c47c?format=webp&width=800",
];

const pillTab = (active: boolean) =>
  `px-3 h-9 rounded-full text-[15px] font-medium ${active ? "bg-blue-100 text-blue-700" : "text-foreground"}`;

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    category: "",
    privacy: "public",
    avatar_url: "",
    cover_url: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select("*")
        .order("member_count", { ascending: false });

      if (groupsError) {
        toast({ title: "Error", description: "Failed to load groups", variant: "destructive" });
        setLoading(false);
        return;
      }

      const { data: membershipData } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .eq("status", "active");

      const joinedIds = membershipData?.map((m) => m.group_id) || [];

      const enriched = (groups || []).map((g, i) => ({
        ...g,
        privacy: g.privacy || 'public',
        isJoined: joinedIds.includes(g.id),
        isOwner: g.creator_id === user.id,
        cover_url: g.cover_url || referenceImages[i % referenceImages.length],
        avatar_url: g.avatar_url || referenceImages[i % referenceImages.length],
      }));

      setAllGroups(enriched);
      setJoinedGroups(enriched.filter((g) => g.isJoined));
    } catch (e) {
      toast({ title: "Error", description: "Failed to load groups", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filteredJoined = useMemo(
    () => joinedGroups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [joinedGroups, search]
  );

  const handleCreateGroup = async () => {
    if (!groupForm.name || !user?.id) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      const { data: newGroup, error } = await supabase
        .from("groups")
        .insert({
          name: groupForm.name,
          description: groupForm.description,
          category: groupForm.category || null,
          privacy: groupForm.privacy,
          avatar_url: groupForm.avatar_url || null,
          cover_url: groupForm.cover_url || null,
          creator_id: user.id,
          member_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (newGroup) {
        await supabase.from("group_members").insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: "admin",
          status: "active",
        });
      }

      const prepared: Group = {
        ...newGroup,
        isOwner: true,
        isJoined: true,
        cover_url: newGroup.cover_url || referenceImages[0],
        avatar_url: newGroup.avatar_url || referenceImages[0],
      };

      setJoinedGroups((prev) => [prepared, ...prev]);
      setAllGroups((prev) => [prepared, ...prev]);
      setGroupForm({ name: "", description: "", category: "", privacy: "public", avatar_url: "", cover_url: "" });
      setShowCreateDialog(false);
      toast({ title: "Success", description: `Group "${newGroup.name}" created successfully!` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create group", variant: "destructive" });
    }
  };

  const join = async (groupId: string) => {
    if (!user?.id) return;
    await supabase.from("group_members").insert({ group_id: groupId, user_id: user.id, role: "member", status: "active" });
    setAllGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, isJoined: true, member_count: g.member_count + 1 } : g)));
    setJoinedGroups((prev) => {
      const g = allGroups.find((x) => x.id === groupId);
      return g ? [{ ...g, isJoined: true }, ...prev] : prev;
    });
  };

  const Header = (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="h-9 w-9 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-[17px] font-semibold">Groups</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => navigate('/app/profile')}>
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="h-9 w-9 p-0">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((t) => (
            <button key={t} className={pillTab(activeTab === t)} onClick={() => setActiveTab(t)}>
              {t === "for-you" && "For you"}
              {t === "your" && "Your groups"}
              {t === "posts" && "Posts"}
              {t === "discover" && "Discover"}
            </button>
          ))}
        </div>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-800" />
    </div>
  );

  const DiscoverGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {allGroups.map((g, idx) => (
        <Card key={g.id} className="overflow-hidden rounded-xl">
          <div className="relative h-36 w-full bg-muted">
            <img src={g.cover_url || referenceImages[idx % referenceImages.length]} alt={g.name} className="h-full w-full object-cover" />
            <button className="absolute right-2 top-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-1">
            <div className="font-semibold text-base">{g.name}</div>
            <div className="text-sm text-muted-foreground">
              {g.privacy.charAt(0).toUpperCase() + g.privacy.slice(1)} group · {formatNumber(g.member_count)} members
            </div>
            <Button className="mt-3 w-full" onClick={() => join(g.id)} disabled={g.isJoined}>
              {g.isJoined ? "Joined" : "Join"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const YourGroupsList = (
    <div className="space-y-4">
      <div className="px-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search group name" className="pl-9" />
        </div>
      </div>
      <div className="space-y-5">
        {filteredJoined.map((g, idx) => (
          <div key={g.id} className="flex items-center gap-3">
            <Avatar className="h-[44px] w-[44px]">
              <AvatarImage src={g.avatar_url || referenceImages[idx % referenceImages.length]} />
              <AvatarFallback>{g.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-semibold truncate text-[17px]">{g.name}</div>
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                <span>new posts</span>
              </div>
            </div>
          </div>
        ))}
        {filteredJoined.length === 0 && (
          <Card className="p-4 text-sm text-muted-foreground">You haven't joined any groups yet.</Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {Header}

      <div className="container mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {activeTab === "discover" && (
              <>
                <h2 className="text-[20px] font-semibold mb-3">Suggested for you</h2>
                {DiscoverGrid}
              </>
            )}

            {activeTab === "your" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[20px] font-semibold">Most visited</h2>
                  <button className="text-sm text-blue-600">Sort</button>
                </div>
                {YourGroupsList}
              </>
            )}

            {activeTab === "for-you" && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[20px] font-semibold">Your groups</h2>
                  <button className="text-sm text-blue-600" onClick={() => setActiveTab('your')}>See all</button>
                </div>
                {YourGroupsList}
              </>
            )}

            {activeTab === "posts" && (
              <Card className="p-4 text-sm text-muted-foreground">Posts from your groups will appear here.</Card>
            )}
          </>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName">Group Name *</Label>
              <Input id="groupName" value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))} placeholder="Enter group name" />
            </div>
            <div>
              <Label htmlFor="groupDescription">Description</Label>
              <Textarea id="groupDescription" value={groupForm.description} onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe your group" />
            </div>
            <div>
              <Label htmlFor="groupPrivacy">Privacy</Label>
              <Select value={groupForm.privacy} onValueChange={(v) => setGroupForm((p) => ({ ...p, privacy: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select privacy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
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
  );
};

export default Groups;
