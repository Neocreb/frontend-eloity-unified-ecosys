// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  DollarSign,
  MapPin,
  Star,
  Users,
  Filter,
  Search,
} from "lucide-react";
import { JobPosting, SearchFilters } from "@/types/freelance";
import { useFreelance } from "@/hooks/use-freelance";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface JobListProps {
  onJobSelect?: (job: JobPosting) => void;
  filters?: Partial<SearchFilters>;
  showFilters?: boolean;
}

export const JobList: React.FC<JobListProps> = ({
  onJobSelect,
  filters: initialFilters = {},
  showFilters = true,
}) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    ...initialFilters,
    sortBy: "newest",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { searchJobs, getCategories, getSkills, loading } = useFreelance();

  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      const [categoriesData, skillsData] = await Promise.all([
        getCategories(),
        getSkills(),
      ]);

      if (categoriesData) setCategories(categoriesData);
      if (skillsData) setSkills(skillsData);
    };

    loadInitialData();
  }, [getCategories, getSkills]);

  // Search jobs when filters change
  useEffect(() => {
    const searchWithFilters = async () => {
      const searchFilters: SearchFilters = {
        ...filters,
      };

      const jobsData = await searchJobs(searchFilters);
      if (jobsData) {
        setJobs(jobsData);
      }
    };

    searchWithFilters();
  }, [filters, searchJobs]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real implementation, you'd add text search to the API
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatBudget = (job: JobPosting) => {
    if (job.budget.type === "fixed") {
      return `$${job.budget.amount?.toLocaleString()}`;
    } else {
      return `$${job.budget.min}-$${job.budget.max}/hr`;
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case "entry":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const JobCard: React.FC<{ job: JobPosting }> = ({ job }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onJobSelect?.(job)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {job.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="secondary">{job.category}</Badge>
              <Badge className={getExperienceLevelColor(job.experienceLevel)}>
                {job.experienceLevel}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {formatBudget(job)}
            </div>
            <div className="text-sm text-muted-foreground">
              {job.budget.type === "fixed" ? "Fixed price" : "Hourly"}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {job.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 4} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{job.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{job.applicationsCount} proposals</span>
            </div>
          </div>
          <div className="text-xs">
            Posted {new Date(job.postedDate).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={job.client?.avatar || ''} />
              <AvatarFallback>{(job.client?.name || 'U')[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{job.client?.name || 'Unknown'}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {job.client?.location || 'Unknown'}
                {job.client?.verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{job.client?.rating ?? 0}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              ${((job.client?.totalSpent) || 0).toLocaleString()} spent
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const JobSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton className="h-6 w-20 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-16 w-full mb-4" />
        <div className="flex gap-1 mb-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {showAdvancedFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) =>
                        handleFilterChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Experience Level
                    </label>
                    <Select
                      value={filters.experienceLevel?.[0] || ""}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "experienceLevel",
                          value ? [value] : [],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Budget Range
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.budgetMin || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "budgetMin",
                            Number(e.target.value) || undefined,
                          )
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.budgetMax || ""}
                        onChange={(e) =>
                          handleFilterChange(
                            "budgetMax",
                            Number(e.target.value) || undefined,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) =>
                        handleFilterChange("sortBy", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="budget">
                          Budget (High to Low)
                        </SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="proposals">
                          Fewest Proposals
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {jobs.length} Job{jobs.length !== 1 ? "s" : ""} Found
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse available freelance opportunities
          </p>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <JobSkeleton key={index} />
          ))
        ) : jobs.length > 0 ? (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No jobs found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setFilters({ sortBy: "newest" })}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobList;
