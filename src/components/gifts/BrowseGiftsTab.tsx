import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { VirtualGift } from '@/types/gifts';
import { 
  Search, 
  Filter, 
  Gift, 
  Crown, 
  Heart, 
  Star,
  Zap,
  Flower2,
  Coffee,
  Gamepad2,
  Music,
  Film,
  Palette
} from 'lucide-react';

interface BrowseGiftsTabProps {
  onSelectGift: (gift: VirtualGift) => void;
}

const BrowseGiftsTab = ({ onSelectGift }: BrowseGiftsTabProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Sample virtual gifts data
  const virtualGifts: VirtualGift[] = [
    {
      id: '1',
      name: 'Red Rose',
      price: 1.99,
      emoji: '🌹',
      category: 'flowers',
      rarity: 'common',
      description: 'A classic symbol of love and appreciation',
      popularity: 95
    },
    {
      id: '2',
      name: 'Chocolate Box',
      price: 2.99,
      emoji: '🍫',
      category: 'food',
      rarity: 'common',
      description: 'Delicious chocolates to sweeten the moment',
      popularity: 88
    },
    {
      id: '3',
      name: 'Diamond Ring',
      price: 9.99,
      emoji: '💍',
      category: 'jewelry',
      rarity: 'rare',
      description: 'A precious token of your admiration',
      popularity: 75
    },
    {
      id: '4',
      name: 'Golden Crown',
      price: 19.99,
      emoji: '👑',
      category: 'royal',
      rarity: 'epic',
      description: 'Bestow royalty upon your favorite creator',
      popularity: 60
    },
    {
      id: '5',
      name: 'Magic Wand',
      price: 4.99,
      emoji: '🪄',
      category: 'fantasy',
      rarity: 'uncommon',
      description: 'Grant magical powers to creators',
      popularity: 70
    },
    {
      id: '6',
      name: 'Coffee Cup',
      price: 1.49,
      emoji: '☕',
      category: 'food',
      rarity: 'common',
      description: 'Fuel the creative process',
      popularity: 82
    },
    {
      id: '7',
      name: 'Gaming Controller',
      price: 7.99,
      emoji: '🎮',
      category: 'gaming',
      rarity: 'rare',
      description: 'Level up your favorite streamer',
      popularity: 68
    },
    {
      id: '8',
      name: 'Musical Note',
      price: 3.99,
      emoji: '🎵',
      category: 'music',
      rarity: 'uncommon',
      description: 'Create harmony with your favorite artist',
      popularity: 72
    }
  ];

  // Category icons mapping
  const categoryIcons: Record<string, React.ReactNode> = {
    flowers: <Flower2 className="h-4 w-4" />,
    food: <Coffee className="h-4 w-4" />,
    jewelry: <Crown className="h-4 w-4" />,
    royal: <Crown className="h-4 w-4" />,
    fantasy: <Zap className="h-4 w-4" />,
    gaming: <Gamepad2 className="h-4 w-4" />,
    music: <Music className="h-4 w-4" />,
    movies: <Film className="h-4 w-4" />,
    art: <Palette className="h-4 w-4" />
  };

  // Filter gifts based on search and filters
  const filteredGifts = virtualGifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gift.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || gift.category === categoryFilter;
    const matchesRarity = rarityFilter === 'all' || gift.rarity === rarityFilter;
    
    return matchesSearch && matchesCategory && matchesRarity;
  });

  // Sort gifts
  const sortedGifts = [...filteredGifts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.popularity - a.popularity;
      default:
        return 0;
    }
  });

  // Get unique categories
  const categories = Array.from(new Set(virtualGifts.map(gift => gift.category)));

  // Get unique rarities
  const rarities = Array.from(new Set(virtualGifts.map(gift => gift.rarity)));

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
            Browse Virtual Gifts
          </CardTitle>
          <CardDescription>
            Explore our collection of virtual gifts to show appreciation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="flex items-center">
                      <span className="flex items-center gap-2">
                        {categoryIcons[category] || <Gift className="h-4 w-4" />}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={rarityFilter} onValueChange={setRarityFilter}>
                <SelectTrigger className="w-28 text-sm">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  {rarities.map(rarity => (
                    <SelectItem key={rarity} value={rarity}>
                      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-28 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gift Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {sortedGifts.map((gift) => (
              <Card 
                key={gift.id} 
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onSelectGift(gift)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-3xl sm:text-4xl mb-2 group-hover:scale-110 transition-transform">
                      {gift.emoji}
                    </div>
                    <h3 className="font-medium text-sm sm:text-base mb-1">{gift.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{gift.description}</p>
                    <div className="flex items-center justify-between w-full mt-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs py-0.5 px-1.5"
                      >
                        {gift.rarity}
                      </Badge>
                      <span className="font-bold text-sm">${gift.price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedGifts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No gifts found matching your criteria</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrowseGiftsTab;