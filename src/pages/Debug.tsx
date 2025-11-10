import { Helmet } from "react-helmet-async";
import { NotificationServiceHealthCheck } from '@/components/debug/NotificationServiceHealthCheck';
import { useAuth } from '@/contexts/AuthContext';

const Debug = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8">
      <Helmet>
        <title>Debug Tools - Eloity</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Debug Tools</h1>
      
      {user ? (
        <div className="space-y-6">
          <NotificationServiceHealthCheck />
        </div>
      ) : (
        <p>Please log in to use debug tools.</p>
      )}
    </div>
  );
};

export default Debug;