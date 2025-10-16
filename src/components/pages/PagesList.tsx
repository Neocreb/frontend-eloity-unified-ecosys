import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users, Building, Plus, Filter } from 'lucide-react';
import { usePages } from '@/hooks/usePages';
import { formatNumber } from '@/utils/formatters';

interface Page {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  avatar_url: string | null;
  follower_count: number;
  is_verified: boolean;
  created_at: string;
}

const PagesList = () => {
  const navigate = useNavigate();
  const { pages, loading, error, fetchPages } = usePages();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    fetchPages(searchQuery, categoryFilter || undefined);
  }, [searchQuery, categoryFilter]);

  const handleCreatePage = () => {
    navigate('/app/pages/create');
  };

  const handleViewPage = (pageId: string) => {
    navigate(`/app/pages/${pageId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Pages...</h2>
          <p className="text-muted-foreground">Please wait while we load the pages.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Pages</h2>
          <p className="text-muted-foreground mb-4">Failed to load pages. Please try again later.</p>
          <Button onClick={() => fetchPages()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Pages</h1>
            <p className="text-muted-foreground">Discover and connect with pages</p>
          </div>
          <Button onClick={handleCreatePage} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Page
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Categories</option>
              <option value="business">Business</option>
              <option value="brand">Brand</option>
              <option value="community">Community</option>
              <option value="organization">Organization</option>
              <option value="public_figure">Public Figure</option>
            </select>
          </div>
        </div>

        {/* Pages Grid */}
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">No pages found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || categoryFilter 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Be the first to create a page'}
                </p>
                <Button onClick={handleCreatePage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Card 
                key={page.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewPage(page.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={page.avatar_url || undefined} alt={page.name} />
                      <AvatarFallback>{page.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{page.name}</h3>
                        {page.is_verified && (
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {page.category || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {page.description || `This is the ${page.name} page.`}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span>{formatNumber(page.follower_count)} followers</span>
                    </div>
                    <span className="text-muted-foreground">
                      Created {new Date(page.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesList;