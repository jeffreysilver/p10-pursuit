
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { races, players } from '@/data/mock-data';
import { Flag, Trophy, Users, Calendar } from 'lucide-react';
import { RaceCard } from '@/components/ui/race-card';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  
  // Get the next race
  const upcomingRaces = races.filter(race => race.status === 'upcoming');
  const nextRace = upcomingRaces.length > 0 ? upcomingRaces[0] : null;
  
  // Get the live race if any
  const liveRace = races.find(race => race.status === 'live');
  
  // Get top 3 players
  const topPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="pt-6 pb-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Welcome to <span className="text-f1-red">Checkered</span> Picks
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Predict the 10th place finisher in each Formula One race and compete with your cousins!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/races">
                <Button className="bg-f1-red hover:bg-f1-red/90">View Race Calendar</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-checkered-pattern"></div>
        <div className="container px-4 md:px-6 relative">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center">
                  <Flag className="mr-2 h-5 w-5 text-f1-red animate-bounce-subtle" />
                  <CardTitle>Upcoming Races</CardTitle>
                </div>
                <CardDescription>Make your predictions before the race</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {liveRace && (
                    <RaceCard 
                      race={liveRace} 
                      onClick={() => navigate(`/races/${liveRace.id}`)}
                    />
                  )}
                  
                  {nextRace && (
                    <RaceCard 
                      race={nextRace} 
                      onClick={() => navigate(`/races/${nextRace.id}`)}
                    />
                  )}
                  
                  {upcomingRaces.length > 1 && (
                    <RaceCard 
                      race={upcomingRaces[1]} 
                      onClick={() => navigate(`/races/${upcomingRaces[1].id}`)}
                    />
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/races">
                    <Button variant="outline" className="mt-2">View All Races</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-f1-yellow" />
                  <CardTitle>Leaderboard</CardTitle>
                </div>
                <CardDescription>Top players this season</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPlayers.map((player, i) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          i === 0 ? 'bg-yellow-100 text-yellow-800' :
                          i === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {i + 1}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{player.name}</p>
                          <p className="text-xs text-muted-foreground">@{player.username}</p>
                        </div>
                      </div>
                      <div className="font-bold">{player.score} pts</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/leaderboard">
                    <Button variant="outline" className="mt-2">Full Leaderboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <Calendar className="h-10 w-10 mb-4 text-f1-red" />
              <CardTitle className="text-xl">Race Calendar</CardTitle>
              <CardDescription className="mt-2">
                View the full Formula One calendar and upcoming races
              </CardDescription>
              <Link to="/races" className="mt-4 w-full">
                <Button className="w-full" variant="outline">View Calendar</Button>
              </Link>
            </Card>
            
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <Flag className="h-10 w-10 mb-4 text-f1-red" />
              <CardTitle className="text-xl">Make Predictions</CardTitle>
              <CardDescription className="mt-2">
                Predict which driver will finish 10th in each race
              </CardDescription>
              <Link to="/races" className="mt-4 w-full">
                <Button className="w-full" variant="outline">Predict Now</Button>
              </Link>
            </Card>
            
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <Trophy className="h-10 w-10 mb-4 text-f1-yellow" />
              <CardTitle className="text-xl">Leaderboard</CardTitle>
              <CardDescription className="mt-2">
                See who's leading the prediction championship
              </CardDescription>
              <Link to="/leaderboard" className="mt-4 w-full">
                <Button className="w-full" variant="outline">View Standings</Button>
              </Link>
            </Card>
            
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <Users className="h-10 w-10 mb-4 text-f1-blue" />
              <CardTitle className="text-xl">Players</CardTitle>
              <CardDescription className="mt-2">
                Check out other players and their predictions
              </CardDescription>
              <Link to="/players" className="mt-4 w-full">
                <Button className="w-full" variant="outline">View Players</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
