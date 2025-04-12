
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Flag, 
  Trophy, 
  Users, 
  ArrowLeft 
} from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { 
  getRaceById, 
  getDriverById, 
  getAvailableDriversForRace,
  players, 
  drivers 
} from '@/data/mock-data';
import { toast } from 'sonner';

const RaceDetailPage = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  
  if (!raceId) {
    return <div>Race not found</div>;
  }
  
  const race = getRaceById(raceId);
  
  if (!race) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Race not found</h1>
        <Button 
          variant="link" 
          onClick={() => navigate('/races')}
          className="mt-4"
        >
          Back to Races
        </Button>
      </div>
    );
  }
  
  const isPastRace = race.status === 'completed';
  
  // For demo purposes, assume current user is the first player
  const currentPlayer = players[0];
  const currentPrediction = currentPlayer.predictions[raceId];
  const tenthPlaceDriverId = race.tenthPlaceDriver;
  const tenthPlaceDriver = tenthPlaceDriverId ? getDriverById(tenthPlaceDriverId) : undefined;
  
  // Get all available drivers for this race (not selected by other players)
  const availableDrivers = getAvailableDriversForRace(raceId);
  
  // Add current user's selection to available drivers if they've already made a prediction
  if (currentPrediction) {
    const playerDriver = getDriverById(currentPrediction);
    if (playerDriver && !availableDrivers.find(d => d.id === playerDriver.id)) {
      availableDrivers.push(playerDriver);
    }
  }
  
  const handlePredictionSubmit = () => {
    if (!selectedDriver) {
      toast.error('Please select a driver');
      return;
    }
    
    // In a real app, this would be an API call to save the prediction
    toast.success('Your prediction has been saved!');
    
    // Mock updating the local state
    currentPlayer.predictions[raceId] = selectedDriver;
  };
  
  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/races')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Races
      </Button>
      
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{race.name}</h1>
        <div className="flex items-center space-x-2">
          <Badge className={
            race.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            race.status === 'live' ? 'bg-green-100 text-green-800 border-green-200' :
            'bg-blue-100 text-blue-800 border-blue-200'
          }>
            {race.status === 'upcoming' ? 'Upcoming' : 
             race.status === 'live' ? 'Live' : 'Completed'}
          </Badge>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              Race Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>{race.circuit}, {race.location}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>{formatDate(race.date)}</span>
            </div>
            {race.time && (
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>{race.time}</span>
              </div>
            )}
            {isPastRace && tenthPlaceDriver && (
              <div className="mt-6 p-4 bg-f1-black/5 rounded-lg">
                <p className="font-medium text-center">10th Place Finisher</p>
                <div className="mt-2 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-f1-red text-white font-bold">
                      {tenthPlaceDriver.code}
                    </div>
                    <p className="mt-1 font-bold">{tenthPlaceDriver.name}</p>
                    <p className="text-sm text-muted-foreground">{tenthPlaceDriver.team}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="mr-2 h-5 w-5 text-f1-red" />
              Your Prediction
            </CardTitle>
            {isPastRace ? (
              <CardDescription>
                The race has finished. See if your prediction was correct!
              </CardDescription>
            ) : (
              <CardDescription>
                Select a driver you think will finish in 10th place
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isPastRace ? (
              <div>
                {currentPrediction ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-f1-black/5 rounded-lg">
                      <p className="font-medium text-center">Your Prediction</p>
                      <div className="mt-2 flex items-center justify-center">
                        <div className="text-center">
                          {(() => {
                            const driver = getDriverById(currentPrediction);
                            const isCorrect = currentPrediction === tenthPlaceDriverId;
                            
                            return driver ? (
                              <>
                                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full ${
                                  isCorrect ? 'bg-green-500' : 'bg-f1-gray'
                                } text-white font-bold`}>
                                  {driver.code}
                                </div>
                                <p className="mt-1 font-bold">{driver.name}</p>
                                <p className="text-sm text-muted-foreground">{driver.team}</p>
                                <Badge className={`mt-2 ${
                                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isCorrect ? '+10 Points' : 'Incorrect'}
                                </Badge>
                              </>
                            ) : <p>No prediction made</p>;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You didn't make a prediction for this race.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Select 
                  value={selectedDriver || currentPrediction || ""} 
                  onValueChange={setSelectedDriver}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center">
                          <span className="font-semibold">{driver.code}</span>
                          <span className="mx-2">-</span>
                          <span>{driver.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{driver.team}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  className="w-full bg-f1-red hover:bg-f1-red/90"
                  onClick={handlePredictionSubmit}
                  disabled={!selectedDriver && !currentPrediction}
                >
                  {currentPrediction ? 'Update Prediction' : 'Submit Prediction'}
                </Button>
                
                {currentPrediction && (
                  <div className="p-4 bg-f1-black/5 rounded-lg mt-4">
                    <p className="font-medium text-center">Current Prediction</p>
                    <div className="mt-2 flex items-center justify-center">
                      <div className="text-center">
                        {(() => {
                          const driver = getDriverById(currentPrediction);
                          return driver ? (
                            <>
                              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-f1-red text-white font-bold">
                                {driver.code}
                              </div>
                              <p className="mt-1 font-bold">{driver.name}</p>
                              <p className="text-sm text-muted-foreground">{driver.team}</p>
                            </>
                          ) : <p>Error loading driver</p>;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-f1-blue" />
            Player Predictions
          </CardTitle>
          <CardDescription>
            See what drivers other players have selected for this race
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Prediction</TableHead>
                {isPastRace && <TableHead className="text-right">Result</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map(player => {
                const prediction = player.predictions[raceId];
                const driver = prediction ? getDriverById(prediction) : null;
                const isCorrect = isPastRace && prediction === tenthPlaceDriverId;
                
                return (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground">@{player.username}</div>
                    </TableCell>
                    <TableCell>
                      {driver ? (
                        <div className="flex items-center">
                          <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-f1-black text-white text-xs font-bold mr-2">
                            {driver.code}
                          </div>
                          <span>{driver.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not predicted</span>
                      )}
                    </TableCell>
                    {isPastRace && (
                      <TableCell className="text-right">
                        {prediction ? (
                          <Badge className={
                            isCorrect 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {isCorrect ? '+10 Points' : 'Incorrect'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">No prediction</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RaceDetailPage;
