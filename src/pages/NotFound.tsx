
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-checkered-pattern rounded-full animate-spin-slow"></div>
          <Flag className="absolute inset-0 m-auto h-12 w-12 text-f1-papaya" />
        </div>
        <h1 className="text-6xl font-bold text-f1-papaya">404</h1>
        <p className="text-xl mb-6">Oops! Looks like you took a detour off the track.</p>
        <Link to="/">
          <Button className="bg-f1-papaya hover:bg-f1-papaya/90">
            Back to the Starting Grid
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
