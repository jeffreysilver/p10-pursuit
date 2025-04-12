
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flag, Trophy, Home, Calendar, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="h-6 w-6 text-f1-red animate-race-flag" />
          <Link to="/" className="text-2xl font-bold tracking-tight">
            <span className="text-f1-red">Checkered</span> Picks
          </Link>
        </div>
        
        <nav className="flex items-center gap-4">
          {!isMobile ? (
            <>
              <Link to="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link to="/races">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Races
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/players">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Players
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/races">
                <Button variant="ghost" size="icon">
                  <Calendar className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="ghost" size="icon">
                  <Trophy className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/players">
                <Button variant="ghost" size="icon">
                  <Users className="h-5 w-5" />
                </Button>
              </Link>
            </>
          )}
          <Link to="/login">
            <Button className="bg-f1-red hover:bg-f1-red/90">Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
