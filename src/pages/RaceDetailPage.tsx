
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
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  X
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
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [currentDriverSelection, setCurrentDriverSelection] = useState<string>('');
  
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
  const currentPredictions = currentPlayer.predictions[raceId] || [];
  const tenthPlaceDriverId = race.tenthPlaceDriver;
  const tenthPlaceDriver = tenthPlaceDriverId ? getDriverById(tenthPlaceDriverId) : undefined;
  
  // Initialize selected drivers from existing predictions if available
  React.useEffect(() => {
    if (currentPredictions.length > 0 && selectedDrivers.length === 0) {
      setSelectedDrivers([...currentPredictions]);
    }
  }, [currentPredictions, selectedDrivers.length]);
  
  // Get all available drivers for this race (not selected by other players)
  const availableDrivers = getAvailableDriversForRace(raceId);
  
  // Add current user's selections to available drivers if they've already made predictions
  if (currentPredictions.length > 0) {
    currentPredictions.forEach(driverId => {
      const playerDriver = getDriverById(driverId);
      if (playerDriver && !availableDrivers.find(d => d.id === playerDriver.id)) {
        availableDrivers.push(playerDriver);
      }
    });
  }

  // Filtered available drivers (exclude already selected ones)
  const filteredAvailableDrivers = availableDrivers.filter(
    driver => !selectedDrivers.includes(driver.id)
  );
  
  const handleAddDriver = () => {
    if (!currentDriverSelection) {
      toast.error('Please select a driver');
      return;
    }
    
    if (selectedDrivers.length >= 5) {
      toast.error('You can only select up to 5 drivers');
      return;
    }
    
    setSelectedDrivers([...selectedDrivers, currentDriverSelection]);
    setCurrentDriverSelection('');
  };
  
  const handleRemoveDriver = (driverId: string) => {
    setSelectedDrivers(selectedDrivers.filter(id => id !== driverId));
  };
  
  const handleMoveDriverUp = (index: number) => {
    if (index <= 0) return;
    const newDrivers = [...selectedDrivers];
    [newDrivers[index], newDrivers[index - 1]] = [newDrivers[index - 1], newDrivers[index]];
    setSelectedDrivers(newDrivers);
  };
  
  const handleMoveDriverDown = (index: number) => {
    if (index >= selectedDrivers.length - 1) return;
    const newDrivers = [...selectedDrivers];
    [newDrivers[index], newDrivers[index + 1]] = [newDrivers[index + 1], newDrivers[index]];
    setSelectedDrivers(newDrivers);
  };
  
  const handlePredictionSubmit = () => {
    if (selectedDrivers.length === 0) {
      toast.error('Please select at least one driver');
      return;
    }
    
    // In a real app, this would be an API call to save the prediction
    toast.success('Your predictions have been saved!');
    
    // Mock updating the local state
    currentPlayer.predictions[raceId] = [...selectedDrivers];
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
              Your Predictions
            </CardTitle>
            {isPastRace ? (
              <CardDescription>
                The race has finished. See if your predictions were correct!
              </CardDescription>
            ) : (
              <CardDescription>
                Select up to 5 drivers in order of preference
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {isPastRace ? (
              <div>
                {currentPredictions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-f1-black/5 rounded-lg">
                      <p className="font-medium text-center mb-3">Your Predictions</p>
                      <div className="space-y-2">
                        {currentPredictions.map((driverId, index) => {
                          const driver = getDriverById(driverId);
                          const isCorrect = driverId === tenthPlaceDriverId;
                          
                          return driver ? (
                            <div key={driver.id} className="flex items-center justify-between p-2 rounded-lg bg-white shadow-sm">
                              <div className="flex items-center">
                                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                                  isCorrect ? 'bg-green-500' : 'bg-f1-gray'
                                } text-white font-bold mr-3`}>
                                  {driver.code}
                                </div>
                                <div>
                                  <p className="font-semibold">{driver.name}</p>
                                  <p className="text-xs text-muted-foreground">{driver.team}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${
                                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {isCorrect ? '+10 Points' : 'Incorrect'}
                                </Badge>
                                <div className="w-6 h-6 rounded-full bg-f1-black/10 flex items-center justify-center">
                                  {index + 1}
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You didn't make any predictions for this race.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select 
                    value={currentDriverSelection} 
                    onValueChange={setCurrentDriverSelection}
                  >
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailableDrivers.map(driver => (
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
                    onClick={handleAddDriver}
                    disabled={!currentDriverSelection || selectedDrivers.length >= 5}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Selected Drivers ({selectedDrivers.length}/5)</h3>
                  <div className="space-y-2">
                    {selectedDrivers.map((driverId, index) => {
                      const driver = getDriverById(driverId);
                      
                      return driver ? (
                        <div key={driver.id} className="flex items-center justify-between p-2 rounded-lg bg-f1-black/5">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-f1-red text-white font-bold mr-3">
                              {driver.code}
                            </div>
                            <div>
                              <p className="font-semibold">{driver.name}</p>
                              <p className="text-xs text-muted-foreground">{driver.team}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 rounded-full bg-f1-black/10 flex items-center justify-center">
                              {index + 1}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMoveDriverUp(index)}
                              disabled={index === 0}
                              className="h-7 w-7"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleMoveDriverDown(index)}
                              disabled={index === selectedDrivers.length - 1}
                              className="h-7 w-7"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveDriver(driver.id)}
                              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : null;
                    })}
                    
                    {selectedDrivers.length === 0 && (
                      <div className="text-center py-4 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">No drivers selected</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-f1-red hover:bg-f1-red/90 mt-4"
                  onClick={handlePredictionSubmit}
                  disabled={selectedDrivers.length === 0}
                >
                  {currentPredictions.length > 0 ? 'Update Predictions' : 'Submit Predictions'}
                </Button>
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
                <TableHead>Predictions</TableHead>
                {isPastRace && <TableHead className="text-right">Result</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map(player => {
                const predictions = player.predictions[raceId] || [];
                const hasCorrectPrediction = isPastRace && 
                  predictions.includes(tenthPlaceDriverId || '');
                
                return (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-muted-foreground">@{player.username}</div>
                    </TableCell>
                    <TableCell>
                      {predictions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {predictions.map((driverId, idx) => {
                            const driver = getDriverById(driverId);
                            return driver ? (
                              <div key={driver.id} className="flex items-center">
                                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-f1-black text-white text-xs font-bold mr-1">
                                  {driver.code}
                                </div>
                                <span className="text-xs">{idx + 1}</span>
                                {idx < predictions.length - 1 && <span className="mx-1">,</span>}
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not predicted</span>
                      )}
                    </TableCell>
                    {isPastRace && (
                      <TableCell className="text-right">
                        {predictions.length > 0 ? (
                          <Badge className={
                            hasCorrectPrediction 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {hasCorrectPrediction ? '+10 Points' : 'Incorrect'}
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
