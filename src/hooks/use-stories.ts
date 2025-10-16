// @ts-nocheck

// hooks/use-stories.ts
import { useEffect, useState } from "react";
import { useStoriesHook } from "@/hooks/useStories";
import { Story } from "@/components/feed/Stories";

export const useStories = () => {
    const { stories: realStories, loading, error, refresh } = useStoriesHook();
    const [stories, setStories] = useState<Story[]>([]);

    useEffect(() => {
        // Transform the real stories data to match the expected format
        const transformedStories = realStories.map(story => ({
            id: story.id,
            username: story.username,
            avatar: story.avatar,
            hasNewStory: story.hasNewStory,
            isUser: true // Add the isUser property that the component expects
        }));
        
        setStories(transformedStories);
    }, [realStories]);

    return { stories, loading, error, refresh };
};