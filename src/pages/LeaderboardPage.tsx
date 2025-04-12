
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfiles } from '@/lib/api';
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
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: getProfiles,
  });
  
  if (isLoading) {
    return <div className="py-12 text-center">Loading leaderboard...</div>;
  }
  
  // Profiles are already sorted by score in descending order from the API
  const topProfiles = profiles.slice(0, 3);
  
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
        {topProfiles.map((profile, index) => (
          <Card key={profile.id} className={`
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
                  {profile.name.charAt(0)}
                </span>
              </div>
              <div className="mb-1 text-xl font-bold">{profile.name}</div>
              <div className="text-sm text-muted-foreground">@{profile.username}</div>
              <div className="mt-3 text-2xl font-bold">{profile.score} points</div>
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
              {profiles.map((profile, index) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    {index + 1}
                    {index === 0 && ' 🥇'}
                    {index === 1 && ' 🥈'}
                    {index === 2 && ' 🥉'}
                  </TableCell>
                  <TableCell>
                    <div>{profile.name}</div>
                    <div className="text-xs text-muted-foreground">@{profile.username}</div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {profile.score}
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
