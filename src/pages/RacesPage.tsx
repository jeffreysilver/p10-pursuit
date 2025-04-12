
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
  
  const upcomingRaces = races.filter(race => race.status === 'upcoming');
  const completedRaces = races.filter(race => race.status === 'completed');
  const liveRaces = races.filter(race => race.status === 'live');
  
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
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Races</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {races.map(race => (
              <RaceCard 
                key={race.id}
                race={race}
                onClick={() => navigate(`/races/${race.id}`)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingRaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingRaces.map(race => (
                <RaceCard 
                  key={race.id}
                  race={race}
                  onClick={() => navigate(`/races/${race.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No upcoming races at the moment.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="live" className="space-y-4">
          {liveRaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveRaces.map(race => (
                <RaceCard 
                  key={race.id}
                  race={race}
                  onClick={() => navigate(`/races/${race.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No races are currently live.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedRaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedRaces.map(race => (
                <RaceCard 
                  key={race.id}
                  race={race}
                  onClick={() => navigate(`/races/${race.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed races yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RacesPage;
