import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface RaceCountdownTimerProps {
  lockTime: string;
  raceId: string;
}

export const RaceCountdownTimer = ({ lockTime, raceId }: RaceCountdownTimerProps) => {
  const queryClient = useQueryClient();
  const [timeUntilLock, setTimeUntilLock] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const lockTimeMs = new Date(lockTime).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = lockTimeMs - now;
      
      if (distance <= 0) {
        setTimeUntilLock(null);
        // Refresh the page to update UI
        queryClient.invalidateQueries({ queryKey: ['race', raceId] });
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeUntilLock({ days, hours, minutes, seconds });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [lockTime, queryClient, raceId]);

  if (!timeUntilLock) return null;

  return (
    <Badge variant="outline" className="ml-2 bg-amber-50 border-amber-200 text-amber-800 animate-pulse">
      <Clock className="mr-1 h-3 w-3" />
      Picks lock in: {timeUntilLock.days > 0 ? `${timeUntilLock.days}d ` : ''}
      {String(timeUntilLock.hours).padStart(2, '0')}:{String(timeUntilLock.minutes).padStart(2, '0')}:{String(timeUntilLock.seconds).padStart(2, '0')}
    </Badge>
  );
}; 