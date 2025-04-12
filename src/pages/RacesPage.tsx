
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRaces } from '@/lib/api';
import { RaceCard } from '@/components/ui/race-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flag } from 'lucide-react';

const RacesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: races = [], isLoading } = useQuery({
    queryKey: ['races'],
    queryFn: getRaces,
  });
  
  if (isLoading) {
    return <div className="py-12 text-center">Loading races...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Flag className="mr-2 h-6 w-6 text-f1-red" />
          F1 Race Calendar
        </h1>
        <p className="text-muted-foreground">
          View all races, make predictions, and see results
        </p>
      </div>
      

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {races.map(race => (
              <RaceCard 
                key={race.id}
                race={race}
                onClick={() => navigate(`/races/${race.id}`)}
              />
            ))}
          </div>

    </div>
  );
};

export default RacesPage;
