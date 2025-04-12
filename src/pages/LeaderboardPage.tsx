
import React from 'react';
import { players } from '@/data/mock-data';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';

const LeaderboardPage = () => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Trophy className="mr-2 h-6 w-6 text-f1-yellow" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          See who's leading the predictions championship
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {sortedPlayers.slice(0, 3).map((player, index) => (
          <Card key={player.id} className={`
            ${index === 0 ? 'border-yellow-400 shadow-md' : ''}
            ${index === 1 ? 'border-gray-400' : ''}
            ${index === 2 ? 'border-amber-700' : ''}
          `}>
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">
                {index === 0 ? '🥇 Champion' : index === 1 ? '🥈 Runner-up' : '🥉 Third Place'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`
                mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full
                ${index === 0 ? 'bg-yellow-100' : ''}
                ${index === 1 ? 'bg-gray-100' : ''}
                ${index === 2 ? 'bg-amber-100' : ''}
              `}>
                <span className="text-2xl font-bold">
                  {player.name.charAt(0)}
                </span>
              </div>
              <div className="mb-1 text-xl font-bold">{player.name}</div>
              <div className="text-sm text-muted-foreground">@{player.username}</div>
              <div className="mt-3 text-2xl font-bold">{player.score} points</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Full Standings</CardTitle>
          <CardDescription>
            Complete leaderboard of all players and their scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player, index) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    {index + 1}
                    {index === 0 && ' 🥇'}
                    {index === 1 && ' 🥈'}
                    {index === 2 && ' 🥉'}
                  </TableCell>
                  <TableCell>
                    <div>{player.name}</div>
                    <div className="text-xs text-muted-foreground">@{player.username}</div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {player.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardPage;
