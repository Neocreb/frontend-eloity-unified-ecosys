import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllCourseData, createCourse, deleteCourse } from "@/services/courseService";
import { Course } from "@/services/courseService";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

const AdminCourses: React.FC = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<string>("all");

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "Beginner" as Course["level"],
    duration: "1 hour",
    color: "from-blue-500 to-indigo-600",
  });

  const refresh = () => setCourses(getAllCourseData());

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return courses;
    return courses.filter(c => c.level === (filter as any));
  }, [courses, filter]);

  const handleCreate = () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Fill all required fields", variant: "destructive" });
      return;
    }
    const c = createCourse({
      id: `course_${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      level: form.level,
      duration: form.duration,
      students: 0,
      rating: 0,
      totalLessons: 0,
      lessons: [],
      icon: undefined as any,
      color: form.color,
      instructor: { name: "Admin", title: "", avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=admin", bio: "" },
      objectives: [],
      requirements: [],
      tags: [],
      enrolled: false,
      progress: 0,
      completedLessons: 0,
      certificate: true,
      rewardPoints: { enrollment: 0.25, completion: 3, certificate: 5 },
    });
    if (c) {
      toast({ title: "Course created" });
      setForm({ title: "", description: "", level: "Beginner", duration: "1 hour", color: "from-blue-500 to-indigo-600" });
      refresh();
    }
  };

  const handleDelete = (id: string) => {
    if (deleteCourse(id)) {
      toast({ title: "Course deleted" });
      refresh();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crypto Learn - Courses</h1>
        <p className="text-muted-foreground">Add or remove courses available in the Learn page</p>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Add Course</TabsTrigger>
          <TabsTrigger value="list">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>New Course</CardTitle>
              <CardDescription>Basic details for a course; lessons can be added later in code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} />
              <Textarea rows={4} placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f, description: e.target.value}))} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={form.level} onValueChange={(v: any)=>setForm(f=>({...f, level: v}))}>
                  <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                  <SelectContent>
                    {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Duration (e.g. 2 hours)" value={form.duration} onChange={e=>setForm(f=>({...f, duration: e.target.value}))} />
                <Input placeholder="Color (Tailwind gradient)" value={form.color} onChange={e=>setForm(f=>({...f, color: e.target.value}))} />
              </div>
              <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-2"/>Create Course</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Manage courses in Learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={filter==='all'?'default':'secondary'} onClick={()=>setFilter('all')} className="cursor-pointer">All</Badge>
                {levels.map(l => (
                  <Badge key={l} variant={filter===l?'default':'secondary'} onClick={()=>setFilter(l)} className="cursor-pointer">{l}</Badge>
                ))}
              </div>
              <div className="space-y-3">
                {filtered.map(c => (
                  <div key={c.id} className="flex items-start justify-between rounded border p-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.title}</span>
                        <Badge>{c.level}</Badge>
                        <span className="text-xs text-muted-foreground">{c.duration}</span>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{c.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="destructive" onClick={()=>handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4 mr-1"/> Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-sm text-muted-foreground">No courses yet.</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCourses;
