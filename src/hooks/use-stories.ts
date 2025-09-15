// hooks/use-stories.ts
import { useEffect, useState } from "react";
import { Story } from "@/components/feed/Stories";
import { apiClient } from "@/lib/api";

export const useStories = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await apiClient.getPosts(20, 0) as any;
                const items = (Array.isArray((data as any)?.data) ? (data as any).data : Array.isArray(data) ? data : []) as any[];
                const mapped: Story[] = items
                  .filter((p: any) => (p.type || "").toLowerCase() === "story")
                  .map((p: any) => ({
                      id: p.id,
                      username: p.author?.username || "user",
                      avatar: p.author?.avatar || "/placeholder.svg",
                      hasNewStory: true,
                      isUser: false,
                  }));
                setStories(mapped);
            } catch (error) {
                console.error("Error fetching stories:", error);
                setStories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    return { stories, loading };
};
