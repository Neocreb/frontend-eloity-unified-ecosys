import { useState, useEffect } from 'react';
import { Page, PageFollower, pagesService } from '@/services/pagesService';
import { useAuth } from '@/hooks/useAuth';

export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPages = async (search?: string, category?: string) => {
    try {
      setLoading(true);
      const data = await pagesService.getPages(search, category);
      setPages(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch pages');
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageById = async (pageId: string) => {
    try {
      setLoading(true);
      const data = await pagesService.getPageById(pageId);
      if (data) {
        setPages(prev => {
          const filtered = prev.filter(p => p.id !== pageId);
          return [...filtered, data];
        });
      }
      setError(null);
      return data;
    } catch (err) {
      setError('Failed to fetch page');
      console.error('Error fetching page:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (pageData: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      const newPage = await pagesService.createPage(pageData, user.id);
      setPages(prev => [newPage, ...prev]);
      setError(null);
      return newPage;
    } catch (err) {
      setError('Failed to create page');
      console.error('Error creating page:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePage = async (pageId: string, pageData: any) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      const updatedPage = await pagesService.updatePage(pageId, pageData, user.id);
      setPages(prev => prev.map(p => p.id === pageId ? updatedPage : p));
      setError(null);
      return updatedPage;
    } catch (err) {
      setError('Failed to update page');
      console.error('Error updating page:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (pageId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      await pagesService.deletePage(pageId, user.id);
      setPages(prev => prev.filter(p => p.id !== pageId));
      setError(null);
    } catch (err) {
      setError('Failed to delete page');
      console.error('Error deleting page:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    pages,
    loading,
    error,
    fetchPages,
    fetchPageById,
    createPage,
    updatePage,
    deletePage,
  };
};

export const usePage = (pageId: string) => {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const data = await pagesService.getPageById(pageId);
      setPage(data);
      setError(null);
      
      // Check if user is following
      if (user && data) {
        const following = await pagesService.isFollowingPage(pageId, user.id);
        setIsFollowing(following);
      }
    } catch (err) {
      setError('Failed to fetch page');
      console.error('Error fetching page:', err);
    } finally {
      setLoading(false);
    }
  };

  const followPage = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await pagesService.followPage(pageId, user.id);
      setIsFollowing(true);
      
      // Update page follower count
      if (page) {
        setPage({ ...page, follower_count: page.follower_count + 1 });
      }
      
      return true;
    } catch (err) {
      console.error('Error following page:', err);
      throw err;
    }
  };

  const unfollowPage = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await pagesService.unfollowPage(pageId, user.id);
      setIsFollowing(false);
      
      // Update page follower count
      if (page) {
        setPage({ ...page, follower_count: Math.max(0, page.follower_count - 1) });
      }
      
      return true;
    } catch (err) {
      console.error('Error unfollowing page:', err);
      throw err;
    }
  };

  return {
    page,
    loading,
    error,
    isFollowing,
    followPage,
    unfollowPage,
    refresh: fetchPage,
  };
};

export const useUserPages = () => {
  const [userPages, setUserPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserPages();
    }
  }, [user]);

  const fetchUserPages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await pagesService.getUserPages(user.id);
      setUserPages(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user pages');
      console.error('Error fetching user pages:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    userPages,
    loading,
    error,
    refresh: fetchUserPages,
  };
};

export const useFollowedPages = () => {
  const [followedPages, setFollowedPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFollowedPages();
    }
  }, [user]);

  const fetchFollowedPages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await pagesService.getUserFollowedPages(user.id);
      setFollowedPages(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch followed pages');
      console.error('Error fetching followed pages:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    followedPages,
    loading,
    error,
    refresh: fetchFollowedPages,
  };
};