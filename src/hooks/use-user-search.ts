import { useState, useEffect } from 'react';
import { UserService, UserWithProfile } from '@/services/userService';

export const useUserSearch = (query: string, limit = 20) => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query || query.trim().length < 2) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await UserService.searchUsers(query, limit);
        setUsers(results);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, limit]);

  return { users, loading, error };
};
