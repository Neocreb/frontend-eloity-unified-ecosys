import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { blogService, createBlogPost, updateBlogPost, setBlogPostStatus, deleteBlogPost } from "@/services/blogService";
import { BlogPost, BlogCategory } from "@/types/blog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, CheckCircle2, Edit3 } from "lucide-react";

const AdminBlog: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    featuredImage: "",
    difficulty: "BEGINNER" as BlogPost["difficulty"],
    status: "draft" as BlogPost["status"],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const refreshPosts = async () => {
    const res = await blogService.getBlogPosts();
    setPosts(res.posts);
  };

  useEffect(() => {
    blogService.getCategories().then(setCategories);
    refreshPosts();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter(p => p.status === filter);
  }, [posts, filter]);

  const handleSubmit = () => {
    const category = categories.find(c => c.id === form.category);
    if (!category) {
      toast({ title: "Missing category", variant: "destructive" });
      return;
    }
    const base = {
      title: form.title.trim(),
      slug: form.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      excerpt: form.excerpt.trim(),
      content: form.content,
      category,
      author: { id: "admin", name: "Admin", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=admin" },
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      featuredImage: form.featuredImage || undefined,
      readingTime: Math.max(3, Math.round(form.content.split(/\s+/).length / 200)),
      difficulty: form.difficulty,
      status: form.status,
      relatedAssets: [],
    } as any;

    if (!base.title || !base.excerpt || !base.content) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }

    if (editingId) {
      const updated = updateBlogPost(editingId, base);
      if (updated) {
        toast({ title: "Post updated" });
        setEditingId(null);
        setForm({ title: "", excerpt: "", content: "", category: "", tags: "", featuredImage: "", difficulty: "BEGINNER", status: "draft" });
        refreshPosts();
      }
      return;
    }

    const created = createBlogPost(base);
    if (created) {
      toast({ title: form.status === "published" ? "Post published" : "Draft created" });
      setForm({ title: "", excerpt: "", content: "", category: "", tags: "", featuredImage: "", difficulty: "BEGINNER", status: "draft" });
      refreshPosts();
    }
  };

  const handlePublish = (id: string) => {
    const res = setBlogPostStatus(id, "published");
    if (res) {
      toast({ title: "Post published" });
      refreshPosts();
    }
  };

  const handleDelete = (id: string) => {
    if (deleteBlogPost(id)) {
      toast({ title: "Post deleted" });
      refreshPosts();
    }
  };

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category.id,
      tags: p.tags.join(", "),
      featuredImage: p.featuredImage || "",
      difficulty: p.difficulty || "BEGINNER",
      status: p.status,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <p className="text-muted-foreground">Create, publish, and manage blog posts</p>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create / Edit</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Post" : "New Post"}</CardTitle>
              <CardDescription>Fill in the details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} />
                <Select value={form.category} onValueChange={(v)=>setForm(f=>({...f, category: v}))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Featured image URL" value={form.featuredImage} onChange={e=>setForm(f=>({...f, featuredImage: e.target.value}))} />
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={e=>setForm(f=>({...f, tags: e.target.value}))} />
              <Textarea rows={3} placeholder="Excerpt" value={form.excerpt} onChange={e=>setForm(f=>({...f, excerpt: e.target.value}))} />
              <Textarea rows={10} placeholder="Content (Markdown supported)" value={form.content} onChange={e=>setForm(f=>({...f, content: e.target.value}))} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={form.difficulty} onValueChange={(v: any)=>setForm(f=>({...f, difficulty: v}))}>
                  <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={form.status} onValueChange={(v: any)=>setForm(f=>({...f, status: v}))}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmit}>
                  <Plus className="h-4 w-4 mr-2" /> {editingId ? "Save Changes" : form.status === "published" ? "Publish Post" : "Create Draft"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={()=>{ setEditingId(null); setForm({ title: "", excerpt: "", content: "", category: "", tags: "", featuredImage: "", difficulty: "BEGINNER", status: "draft" }); }}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Manage existing posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={filter==='all'?'default':'secondary'} onClick={()=>setFilter('all')} className="cursor-pointer">All</Badge>
                <Badge variant={filter==='draft'?'default':'secondary'} onClick={()=>setFilter('draft')} className="cursor-pointer">Drafts</Badge>
                <Badge variant={filter==='published'?'default':'secondary'} onClick={()=>setFilter('published')} className="cursor-pointer">Published</Badge>
              </div>
              <div className="space-y-3">
                {filtered.map(p => (
                  <div key={p.id} className="flex items-start justify-between rounded border p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.title}</span>
                        <Badge>{p.category.name}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{p.excerpt}</div>
                      <div className="flex flex-wrap gap-1">
                        {p.tags.map(t=> <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.status !== 'published' && (
                        <Button size="sm" onClick={()=>handlePublish(p.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1"/> Publish
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={()=>startEdit(p)}>
                        <Edit3 className="h-4 w-4 mr-1"/> Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={()=>handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 mr-1"/> Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground">No posts yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBlog;
