
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

export interface RaceCardProps {
  race: {
    id: string;
    name: string;
    circuit: string;
    location: string;
    date: string;
    time?: string;
    status: 'upcoming' | 'live' | 'completed';
  };
  className?: string;
  onClick?: () => void;
}

export function RaceCard({ race, className, onClick }: RaceCardProps) {
  const statusColor = {
    upcoming: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    live: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <Card 
      className={cn(
        "race-card cursor-pointer transition-all hover:translate-y-[-4px]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between">
          <CardTitle className="mr-2 text-xl font-bold">{race.name}</CardTitle>
          <Badge className={statusColor[race.status]}>
            {race.status === 'upcoming' ? 'Upcoming' : 
             race.status === 'live' ? 'Live' : 'Completed'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{formatDate(race.date)}</span>
          </div>
          {race.time && (
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{race.time}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{race.circuit}, {race.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
