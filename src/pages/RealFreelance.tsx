import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { Briefcase, DollarSign, Users, TrendingUp } from "lucide-react";

const RealFreelance = () => {
  const { user } = useAuth();
  const { profiles, posts } = useRealTimeData();

  // Filter posts for freelance-related content
  const freelancePosts = posts.filter(post => 
    post.content.toLowerCase().includes('freelance') || 
    post.content.toLowerCase().includes('job') ||
    post.content.toLowerCase().includes('project')
  );

  const freelancers = profiles.filter(profile => 
    profile.bio?.toLowerCase().includes('freelance') ||
    profile.bio?.toLowerCase().includes('developer') ||
    profile.bio?.toLowerCase().includes('designer')
  );

  return (
    <>
      <Helmet>
        <title>Freelance Hub | Eloity</title>
        <meta
          name="description"
          content="Connect with talented freelancers and discover exciting project opportunities"
        />
      </Helmet>
      
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Freelance Hub</h1>
            <p className="text-muted-foreground">Connect with talent and opportunities</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{freelancePosts.length}</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{freelancers.length}</p>
                  <p className="text-sm text-muted-foreground">Freelancers</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">$12.5K</p>
                  <p className="text-sm text-muted-foreground">Avg. Project Value</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Project Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {freelancePosts.length > 0 ? (
                freelancePosts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{post.content.substring(0, 100)}...</h3>
                        <p className="text-sm text-muted-foreground">
                          Posted by User {post.user_id.substring(0, 8)}...
                        </p>
                      </div>
                      <Badge variant="outline">{post.type}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">View Details</Button>
                      <Button size="sm" variant="outline">Apply</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No freelance projects found</p>
                  <Button className="mt-4">Post Your Project</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Freelancers */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Freelancers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {freelancers.length > 0 ? (
                freelancers.map((freelancer) => (
                  <div key={freelancer.user_id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {freelancer.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{freelancer.name || 'Anonymous User'}</h3>
                      <p className="text-sm text-muted-foreground">{freelancer.bio || 'No bio available'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">Level {freelancer.level}</Badge>
                        <span className="text-sm">⭐ 4.9 (25 reviews)</span>
                      </div>
                    </div>
                    <Button size="sm">Hire Now</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No freelancers found</p>
                  <Button className="mt-4">Join as Freelancer</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RealFreelance;