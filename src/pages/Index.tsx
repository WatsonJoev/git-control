import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="animate-spin text-primary">
          <RefreshCw className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
};

export default Index;
