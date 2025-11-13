// @ts-nocheck
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "@/components/explore/SearchBar";
import ExploreContent from "@/components/explore/ExploreContent";
import ExploreGroups from "@/components/explore/ExploreGroups";
import ExplorePages from "@/components/explore/ExplorePages";
import PopularHashtags from "@/components/explore/PopularHashtags";
import SuggestedUsers from "@/components/profile/SuggestedUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useExplore } from "@/hooks/use-explore";
import { SmartContentRecommendations } from "@/components/ai/SmartContentRecommendations";
import {
  ExploreGridSkeleton,
  UserCardSkeleton,
  LoadingSpinner,
} from "@/components/ui/loading-states";
import { useDebounce } from "@/hooks/use-performance";
import {
  Users,
  TrendingUp,
  Hash,
  Globe,
  Sparkles,
  Filter,
  MapPin,
  Calendar,
  Building,
  UserCheck,
} from "lucide-react";

const Explore = () => {
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    filteredTopics,
    filteredUsers,
    filteredHashtags,
    filteredGroups,
    filteredPages,
  } = useExplore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "popularity">(
    "relevance",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle URL search parameters
  useEffect(() => {
    const query = searchParams.get("q");
    const tab = searchParams.get("tab");
    if (query) setSearchQuery(query);
    if (tab) setActiveTab(tab);
  }, [searchParams, setSearchQuery, setActiveTab]);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activeTab !== "discover") params.set("tab", activeTab);
    setSearchParams(params);
  }, [searchQuery, activeTab, setSearchParams]);

  // Simulate loading when searching
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [debouncedSearchQuery, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Enhanced Search Section */}
      <div className="space-y-4">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Search results for "{searchQuery}"
              </span>
              <Badge variant="secondary" className="text-xs">
                {filteredTopics.length +
                  filteredUsers.length +
                  filteredHashtags.length}{" "}
                results
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <Filter className="w-3 h-3" />
                Filters
              </Button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="relevance">Most Relevant</option>
                <option value="date">Recent</option>
                <option value="popularity">Popular</option>
              </select>
            </div>
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Location
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <select className="flex-1 text-sm border rounded px-2 py-1 bg-background">
                    <option>All locations</option>
                    <option>New York</option>
                    <option>Los Angeles</option>
                    <option>London</option>
                    <option>Tokyo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Time Range
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <select className="flex-1 text-sm border rounded px-2 py-1 bg-background">
                    <option>All time</option>
                    <option>Last 24 hours</option>
                    <option>Last week</option>
                    <option>Last month</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Content Type
                </label>
                <select className="w-full text-sm border rounded px-2 py-1 bg-background">
                  <option>All types</option>
                  <option>Posts</option>
                  <option>Videos</option>
                  <option>Images</option>
                  <option>Articles</option>
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile-friendly tabs */}
        <div className="sm:hidden">
          <TabsList className="flex w-full overflow-x-auto gap-1 p-1 h-auto min-h-[60px] mobile-tabs-scroll">
            <TabsTrigger
              value="discover"
              className="flex flex-col items-center gap-1 text-xs min-w-[55px] h-auto py-2 px-1 mobile-tab-item touch-target"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] leading-tight">Discover</span>
            </TabsTrigger>
            <TabsTrigger
              value="trending"
              className="flex flex-col items-center gap-1 text-xs min-w-[55px] h-auto py-2 px-1 mobile-tab-item touch-target"
            >
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] leading-tight">Trending</span>
            </TabsTrigger>
            <TabsTrigger
              value="hashtags"
              className="flex flex-col items-center gap-1 text-xs min-w-[55px] h-auto py-2 px-1 mobile-tab-item touch-target"
            >
              <Hash className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] leading-tight">Tags</span>
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="flex flex-col items-center gap-1 text-xs min-w-[55px] h-auto py-2 px-1 mobile-tab-item touch-target"
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] leading-tight">People</span>
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="flex flex-col items-center gap-1 text-xs min-w-[55px] h-auto py-2 px-1 mobile-tab-item touch-target"
            >
              <UserCheck className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] leading-tight">Groups</span>
            </TabsTrigger>
            <TabsTrigger
              value="pages"
              className="flex flex-col items-center gap-1 text-xs min-w-[55px] h-auto py-2 px-1 mobile-tab-item touch-target"
            >
              <Building className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] leading-tight">Pages</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Desktop tabs */}
        <div className="hidden sm:block">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              <span>Hashtags</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>People</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Groups</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>Pages</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="discover" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="space-y-6">
              <ExploreGridSkeleton />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <UserCardSkeleton key={i} />
                  ))}
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <UserCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* AI Powered Recommendations */}
              <SmartContentRecommendations
                contentType="mixed"
                availableContent={[
                  ...filteredTopics.map((topic, index) => ({
                    ...topic,
                    id: topic.id || `topic-${index}`,
                  })),
                  ...filteredUsers.map((user, index) => ({
                    ...user,
                    id: user.id || `user-${index}`,
                  })),
                  ...filteredHashtags.map((hashtag, index) => ({
                    ...hashtag,
                    id: hashtag.id || `hashtag-${index}`,
                  })),
                ]}
                onContentSelect={(content) => {
                  console.log("Selected content from explore:", content);
                }}
                maxItems={6}
                className="mb-6"
                layout="grid"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SuggestedUsers
                    title="Featured Users"
                    variant="grid"
                    maxUsers={6}
                  />
                </div>
                <div className="space-y-4">
                  <SuggestedUsers
                    title="New Users"
                    variant="card"
                    maxUsers={4}
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Sellers</CardTitle>
              </CardHeader>
              <CardContent>
                <SuggestedUsers variant="list" maxUsers={3} showTitle={false} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Freelancers</CardTitle>
              </CardHeader>
              <CardContent>
                <SuggestedUsers variant="list" maxUsers={3} showTitle={false} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Traders</CardTitle>
              </CardHeader>
              <CardContent>
                <SuggestedUsers variant="list" maxUsers={3} showTitle={false} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="people" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <SuggestedUsers
                title={
                  searchQuery
                    ? `People matching "${searchQuery}"`
                    : "Discover People"
                }
                variant="grid"
                maxUsers={12}
                users={filteredUsers}
                loading={isLoading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hashtags" className="mt-6">
          <PopularHashtags hashtags={filteredHashtags} />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <ExploreGroups groups={filteredGroups} />
        </TabsContent>

        <TabsContent value="pages" className="mt-6">
          <ExplorePages pages={filteredPages} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;
