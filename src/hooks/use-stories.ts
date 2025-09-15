
// hooks/use-stories.ts
import { useEffect, useState } from "react";
import { Story } from "@/components/feed/Stories";
import { mockStories } from "@/data/mockFeedData";

export const useStories = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                // For now, use mock data since stories table doesn't exist
                // In the future, implement Supabase integration
                setStories(mockStories);
            } catch (error) {
                console.error("Error fetching stories:", error);
                setStories(mockStories);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    return { stories, loading };
};
