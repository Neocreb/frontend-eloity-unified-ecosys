import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const RouteDebugger = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const testRoutes = [
    { path: "/app/feed", label: "Feed", protected: true },
    { path: "/explore", label: "Explore", protected: true },
    { path: "/videos", label: "Videos", protected: true },
    { path: "/marketplace", label: "Marketplace", protected: true },
    { path: "/crypto", label: "Crypto", protected: true },
    { path: "/freelance", label: "Freelance", protected: true },
    { path: "/messages", label: "Messages", protected: true },
    { path: "/profile", label: "Profile", protected: true },
    { path: "/wallet", label: "Wallet", protected: true },
    { path: "/rewards", label: "Rewards", protected: true },
    { path: "/settings", label: "Settings", protected: true },
    { path: "/notifications", label: "Notifications", protected: true },
    { path: "/unified-creator-studio", label: "Creator Studio", protected: true },
    { path: "/ai-assistant", label: "AI Assistant", protected: true },
    { path: "/blog", label: "Blog", protected: false },
    { path: "/", label: "Landing Page", protected: false },
    { path: "/auth", label: "Auth", protected: false },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Route Debugger
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-100 p-3 rounded">
          <strong>Current Route:</strong> {location.pathname}
          {location.search && (
            <span className="text-gray-600"> (Query: {location.search})</span>
          )}
        </div>

        {user && (
          <div className="bg-blue-50 p-3 rounded">
            <strong>User:</strong> {user.name} ({user.email})
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {testRoutes.map((route) => (
            <Button
              key={route.path}
              variant={location.pathname === route.path ? "default" : "outline"}
              size="sm"
              onClick={() => handleNavigate(route.path)}
              className="text-xs"
              disabled={route.protected && !isAuthenticated}
            >
              {route.label}
              {route.protected && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  🔒
                </Badge>
              )}
            </Button>
          ))}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>🔒 = Protected routes (requires authentication)</p>
          <p>
            Click any route to test navigation. Disabled routes require login.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteDebugger;
