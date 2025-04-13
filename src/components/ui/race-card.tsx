import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, MapPin } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { RaceStatusBadge } from '@/components/ui/race-status-badge';
import {  Race } from '@/lib/api';



export interface RaceCardProps {
  race: Race;
  className?: string;
  onClick?: () => void;
}

export function RaceCard({ race, className, onClick }: RaceCardProps) {
  return (
    <Card 
      className={cn(
        "race-card cursor-pointer transition-all hover:translate-y-[-4px] border-b-4 border-b-f1-papaya",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between">
          <CardTitle className="mr-2 text-xl font-bold">{race.name}</CardTitle>
          {/* @ts-expect-error */}
          <RaceStatusBadge race={race} hasResults={(race.race_results?.[0]?.count || 0) > 0}/> 
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{formatDate(race.date)}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{race.circuit}, {race.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
