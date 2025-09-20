
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    // Only redirect after we know the authentication state
    if (!isLoading) {
      console.log("Index page: Auth state determined", { isAuthenticated, isLoading });
      
      if (isAuthenticated) {
        console.log("Index page: User is authenticated, redirecting to /feed");
        navigate("/app/feed", { replace: true });
      } else {
        console.log("Index page: User is not authenticated, redirecting to /auth");
        navigate("/auth", { replace: true });
      }
      
      setRedirectAttempted(true);
    }
  }, [navigate, isAuthenticated, isLoading]);

  // Show a more informative loading state
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          {isLoading 
            ? "Checking authentication status..." 
            : redirectAttempted 
              ? "Redirecting..." 
              : "Initializing..."}
        </p>
        {isLoading && <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>}
      </div>
    </div>
  );
};

export default Index;
