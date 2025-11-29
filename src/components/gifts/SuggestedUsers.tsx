import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Users } from 'lucide-react';
import { VirtualGift } from '@/types/gifts';
import { supabase } from '@/lib/supabase';

interface SuggestedUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_online?: boolean;
  followers_count?: number;
}

interface SuggestedUsersProps {
  maxUsers?: number;
  showGiftButton?: boolean;
  onSendGift?: (gift: VirtualGift, quantity: number, userId: string) => void;
  variant?: 'grid' | 'list';
}

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  maxUsers = 6,
  showGiftButton = true,
  onSendGift,
  variant = 'grid'
}) => {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      // Fetch users with highest follower counts
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, followers_count')
        .order('followers_count', { ascending: false })
        .limit(maxUsers);

      if (error) throw error;
      
      setSuggestedUsers(data || []);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      // Fallback to empty array
      setSuggestedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendGift = (userId: string) => {
    // This would typically use a default gift or prompt user to select one
    if (onSendGift) {
      // Mock gift for demonstration - in a real app, this would be fetched from DB
      const mockGift: VirtualGift = {
          id: 'heart',
          name: 'Heart',
          emoji: '❤️',
          description: 'Show some love',
          price: 0.99,
          currency: 'USD',
          category: 'basic',
          rarity: 'common',
          available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          animation: null,
          sound: null,
          effects: null,
          seasonal_start: null,
          seasonal_end: null
      };
      onSendGift(mockGift, 1, userId);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading suggested users...</p>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No suggested users found.</p>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {suggestedUsers.map((user) => (
          <Card key={user.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="font-medium text-sm">{user.display_name || user.username}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{user.followers_count || 0} followers</span>
                  </div>
                </div>
              </div>
              {showGiftButton && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleSendGift(user.id)}
                >
                  Send Gift
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {suggestedUsers.map((user) => (
        <Card key={user.id} className="p-3 sm:p-4 text-center hover:shadow-md transition-shadow">
          <div className="relative inline-block mb-2">
            <Avatar className="h-14 sm:h-16 w-14 sm:w-16 mx-auto">
              <AvatarImage src={user.avatar_url || ''} alt={user.username} />
              <AvatarFallback>
                <User className="h-6 w-6 sm:h-8 sm:w-8" />
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="font-medium text-xs sm:text-sm truncate">{user.display_name || user.username}</h3>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
            <Users className="h-3 w-3" />
            <span className="text-xs">{user.followers_count || 0}</span>
          </div>
          {showGiftButton && (
            <Button
              size="sm"
              className="w-full mt-3 text-xs"
              onClick={() => handleSendGift(user.id)}
            >
              Send Gift
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
};
