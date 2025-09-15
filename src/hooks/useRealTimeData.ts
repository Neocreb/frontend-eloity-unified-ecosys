import { useEffect, useState } from "react";

export const useRealTimeData = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    // Minimal stub: keep empty arrays to avoid breaking consumers
    setProfiles([]);
    setPosts([]);
  }, []);

  return { profiles, posts };
};
