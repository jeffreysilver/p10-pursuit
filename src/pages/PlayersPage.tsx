
import React from 'react';
import { players, getDriverById, getRaceById } from '@/data/mock-data';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

const PlayersPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Users className="mr-2 h-6 w-6 text-f1-blue" />
          Players
        </h1>
        <p className="text-muted-foreground">
          View all participants in the prediction game
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {players.map(player => (
          <Card key={player.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback className="bg-f1-black text-white">
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <CardDescription>@{player.username}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">{player.score} pts</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm mb-2">Recent predictions:</div>
              <div className="space-y-2">
                {Object.entries(player.predictions)
                  .slice(-3)
                  .reverse()
                  .map(([raceId, driverId]) => {
                    const race = getRaceById(raceId);
                    const driver = getDriverById(driverId);
                    const isCorrect = race?.tenthPlaceDriver === driverId;
                    
                    return race && driver ? (
                      <div key={raceId} className="flex items-center justify-between text-sm p-2 bg-f1-black/5 rounded">
                        <div className="truncate">
                          <span className="font-medium">{race.name.split(' ').slice(0, 2).join(' ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="inline-flex items-center justify-center h-5 w-5 bg-f1-black text-white text-xs rounded-full">
                            {driver.code}
                          </span>
                          {race.status === 'completed' && (
                            <Badge className={
                              isCorrect 
                                ? 'bg-green-100 text-green-800 text-xs' 
                                : 'bg-red-100 text-red-800 text-xs'
                            }>
                              {isCorrect ? '+10' : 'X'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Player Predictions</CardTitle>
          <CardDescription>
            Complete record of predictions made by all players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Race</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.flatMap(player => 
                Object.entries(player.predictions).map(([raceId, driverId]) => {
                  const race = getRaceById(raceId);
                  const driver = getDriverById(driverId);
                  const isCorrect = race?.tenthPlaceDriver === driverId;
                  
                  return race && driver ? (
                    <TableRow key={`${player.id}-${raceId}`}>
                      <TableCell>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-muted-foreground">@{player.username}</div>
                      </TableCell>
                      <TableCell>
                        <div>{race.name}</div>
                        <div className="text-xs text-muted-foreground">{race.circuit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-f1-black text-white text-xs font-bold mr-2">
                            {driver.code}
                          </div>
                          <span>{driver.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {race.status === 'completed' ? (
                          <Badge className={
                            isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {isCorrect ? '+10 Points' : 'Incorrect'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {race.status === 'upcoming' ? 'Upcoming' : 'Live'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : null;
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayersPage;
