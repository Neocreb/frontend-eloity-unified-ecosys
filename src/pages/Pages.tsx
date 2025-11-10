import React, { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Page {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  follower_count: number;
  is_verified: boolean;
  privacy: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  isFollowing?: boolean;
  isOwner?: boolean;
  new_count?: number | null;
}

const pillButton =
  "rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 h-9 px-4 text-[15px] font-medium whitespace-nowrap";

const referenceImages = [
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2Fe1f736c1d9194a97864842c1cff41f2b?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F4289cafbcb294f99a2042d8a20774a90?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F4b2aebacd0d2483c8d3adb237b556f47?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F3122527c5e794c1ba0d125d050131c17?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F0d91107625374da99df9125220500478?format=webp&width=800",
  "https://cdn.builder.io/api/v1/image/assets%2F231fa8e2838148ce81104a91aeb1b9be%2F0b874c21ccca45a7a0500f4fba50c47c?format=webp&width=800",
];

const Pages: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [myPages, setMyPages] = useState<Page[]>([]);
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageForm, setPageForm] = useState({
    name: "",
    description: "",
    category: "",
    avatar_url: "",
    cover_url: "",
    privacy: "public",
  });

  const chips = useMemo(
    () => ["Create", "Discover", "Invites", "Liked Pages"],
    []
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: pages, error: pagesError } = await supabase
        .from("pages")
        .select("*")
        .eq("privacy", "public")
        .order("follower_count", { ascending: false });

      if (pagesError) {
        toast({ title: "Error", description: "Failed to load pages", variant: "destructive" });
        setLoading(false);
        return;
      }

      const enriched = (pages || []).map((p, i) => ({
        ...p,
        isOwner: p.creator_id === user.id,
        isFollowing: false,
        avatar_url: p.avatar_url || referenceImages[i % referenceImages.length],
      }));

      setAllPages(enriched);
      setMyPages(enriched.filter((p) => p.isOwner));
    } catch (e) {
      toast({ title: "Error", description: "Failed to load pages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!pageForm.name || !user?.id) {
      toast({ title: "Error", description: "Page name is required", variant: "destructive" });
      return;
    }

    try {
      const { data: newPage, error } = await supabase
        .from("pages")
        .insert({
          name: pageForm.name,
          description: pageForm.description || null,
          category: pageForm.category || null,
          avatar_url: pageForm.avatar_url || null,
          cover_url: pageForm.cover_url || null,
          privacy: pageForm.privacy,
          creator_id: user.id,
          follower_count: 0,
          is_verified: false,
        })
        .select()
        .single();

      if (error) throw error;

      const prepared: Page = {
        ...newPage,
        isOwner: true,
        isFollowing: false,
        avatar_url: newPage.avatar_url || referenceImages[0],
      };

      setMyPages((prev) => [prepared, ...prev]);
      setAllPages((prev) => [prepared, ...prev]);
      setPageForm({ name: "", description: "", category: "", avatar_url: "", cover_url: "", privacy: "public" });
      setShowCreateDialog(false);
      toast({ title: "Success", description: `Page "${newPage.name}" created successfully!` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create page", variant: "destructive" });
    }
  };

  const Header = (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-2 sm:px-4 pt-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="h-9 w-9 p-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-[17px] font-semibold">Pages</h1>
          <div className="w-9" />
        </div>
        <div className="mt-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 pb-3 min-w-max">
            {chips.map((label) => (
              <button
                key={label}
                className={pillButton}
                onClick={() => label === "Create" && setShowCreateDialog(true)}
              >
                <span className="relative inline-flex items-center gap-2">
                  <span>{label}</span>
                  {label === "Invites" && (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-800" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {Header}

      <div className="w-full px-2 sm:px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <h2 className="text-[22px] font-semibold mb-4">Pages you manage</h2>
            <div className="space-y-5">
              {myPages.map((p, idx) => {
                const img = p.avatar_url || referenceImages[idx % referenceImages.length];
                const newCount = typeof p.new_count === "number" ? p.new_count : undefined;
                return (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-[44px] w-[44px]">
                        <AvatarImage src={img} alt={p.name} />
                        <AvatarFallback>{p.name?.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold truncate text-[17px]">{p.name}</div>
                        <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                          {newCount !== undefined ? (
                            <span>{newCount} new</span>
                          ) : (
                            <span>Updates</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => navigate(`/app/pages/${p.id}`)}>
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </div>
                );
              })}

              {myPages.length === 0 && (
                <Card className="p-4 text-sm text-muted-foreground">You don't manage any pages yet.</Card>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageName">Page Name *</Label>
              <Input
                id="pageName"
                value={pageForm.name}
                onChange={(e) => setPageForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter page name"
              />
            </div>
            <div>
              <Label htmlFor="pageCategory">Category</Label>
              <Input
                id="pageCategory"
                value={pageForm.category}
                onChange={(e) => setPageForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Business"
              />
            </div>
            <div>
              <Label htmlFor="pageDescription">Description</Label>
              <Textarea
                id="pageDescription"
                value={pageForm.description}
                onChange={(e) => setPageForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Describe your page"
              />
            </div>
            <div>
              <Label htmlFor="pagePrivacy">Privacy</Label>
              <Select value={pageForm.privacy} onValueChange={(v) => setPageForm((prev) => ({ ...prev, privacy: v }))}>
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
              <Button onClick={handleCreatePage} className="flex-1">Create</Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pages;
