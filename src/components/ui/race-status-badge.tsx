
import { Badge } from '@/components/ui/badge';
import { Race } from '@/lib/api';

export interface RaceStatusBadgeProps {
  race: Race;
  hasResults: boolean;
  className?: string;
}

export function RaceStatusBadge({ race, hasResults, className }: RaceStatusBadgeProps) {
  // Check if picks are locked based on picks_lock_at field
  const arePicksLocked = race?.lock_picks_at ? new Date(race.lock_picks_at) < new Date() : false;
  // Default to using status from race object
  const status = () => {
    if (arePicksLocked && hasResults) {
      return 'completed';
    }
    
    if (arePicksLocked && !hasResults) {
      return 'live';
    }
    
    return 'upcoming';
  };
  
  // Get the right styling based on status
  const badgeStyles = {
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    live: 'bg-green-100 text-green-800 border-green-200',
    upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };
  
  // Get the right label
  const statusLabel = {
    completed: 'Completed',
    live: 'Live',
    upcoming: 'Upcoming',
  };

  const currentStatus = status();
  
  return (
    <Badge className={`${badgeStyles[currentStatus]} ${className || ''}`}>
      {statusLabel[currentStatus]}
    </Badge>
  );
} 