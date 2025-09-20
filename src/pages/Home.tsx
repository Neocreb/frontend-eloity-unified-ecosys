
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to feed, others to landing
  if (isAuthenticated) {
    return <Navigate to="/app/feed" replace />;
  }

  return <Navigate to="/" replace />;
};

export default Home;
