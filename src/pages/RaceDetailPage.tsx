import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Flag, 
  Trophy, 
  Users, 
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { formatDate, isRacePast } from '@/lib/date-utils';
import { toast } from 'sonner';
import { 
  getRaceById, 
  getDrivers,
  getPredictionsByRaceId,
  getCurrentProfile,
  createOrUpdatePrediction,
  getProfiles,
  getRaceResultsByRaceId,
  getDraftPosition,
  getDraftPositionsByRaceId,
  getPicksByRaceId
} from '@/lib/api';
import { RaceStatusBadge } from '@/components/ui/race-status-badge';

const RaceDetailPage = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [currentDriverSelection, setCurrentDriverSelection] = useState<string>('');
  
  // Fetch race details
  const { data: race, isLoading: isLoadingRace, error: raceError } = useQuery({
    queryKey: ['race', raceId],
    queryFn: () => (raceId ? getRaceById(raceId) : null),
    enabled: !!raceId,
  });
  
  // Fetch all drivers
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: getDrivers,
  });
  
  // Fetch predictions for this race
  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', raceId],
    queryFn: () => (raceId ? getPredictionsByRaceId(raceId) : []),
    enabled: !!raceId,
  });
  
  // Fetch current user profile
  const { data: currentProfile } = useQuery({
    queryKey: ['currentProfile'],
    queryFn: getCurrentProfile,
  });
  
  // Fetch all profiles
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: getProfiles,
  });
  
  // Fetch user's draft position for this race
  const { data: draftPosition } = useQuery({
    queryKey: ['draftPosition', raceId],
    queryFn: () => (raceId ? getDraftPosition(raceId) : null),
    enabled: !!raceId,
  });
  
  // Fetch race results
  const { data: raceResults = [] } = useQuery({
    queryKey: ['raceResults', raceId],
    queryFn: () => (raceId ? getRaceResultsByRaceId(raceId) : []),
    enabled: !!raceId,
  });
  
  // Fetch all draft positions for this race
  const { data: draftPositions = [] } = useQuery({
    queryKey: ['draftPositions', raceId],
    queryFn: () => (raceId ? getDraftPositionsByRaceId(raceId) : []),
    enabled: !!raceId,
  });
  
  // Fetch picks for this race
  const { data: picks = [] } = useQuery({
    queryKey: ['picks', raceId],
    queryFn: () => (raceId ? getPicksByRaceId(raceId) : []),
    enabled: !!raceId,
  });


  // Get 10th place driver for scoring (if exists)
  const tenthPlaceResult = raceResults.find(result => result.position === 10);
  
  // Find current user's prediction
  const currentPrediction = predictions.find(
    p => p.player_id === currentProfile?.id
  );
  
  // Create or update prediction mutation
  const predictionMutation = useMutation({
    mutationFn: (driverIds: string[]) => {
      if (!raceId) throw new Error('Race ID is required');
      return createOrUpdatePrediction(raceId, driverIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      toast.success('Your predictions have been saved!');
    },
    onError: (error) => {
      toast.error(`Failed to save prediction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
  
  // Initialize selected drivers from existing prediction
  useEffect(() => {
    if (currentPrediction?.driver_predictions) {
      setSelectedDrivers([...currentPrediction.driver_predictions]);
    }
  }, [currentPrediction]);
  
  // Handle loading and error states
  if (isLoadingRace) {
    return <div className="py-12 text-center">Loading race details...</div>;
  }
  
  if (raceError || !raceId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Race not found</h1>
        <Button 
          variant="link" 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Back to Races
        </Button>
      </div>
    );
  }
  
  if (!race) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Race not found</h1>
        <Button 
          variant="link" 
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Back to Races
        </Button>
      </div>
    );
  }
  
  const isPastRace = isRacePast(race.date);
  
  // Check if picks are locked based on picks_lock_at field
  const arePicksLocked = race?.lock_picks_at ? new Date(race.lock_picks_at) < new Date() : isPastRace;
  
  // Filter available drivers (not selected by current user)
  const availableDrivers = drivers.filter(
    driver => !selectedDrivers.includes(driver.id)
  );
  
  // Calculate max number of drivers user can select
  const maxDriverSelections = draftPosition?.position || 5;
  
  const handleAddDriver = () => {
    if (!currentDriverSelection) {
      toast.error('Please select a driver');
      return;
    }
    
    if (selectedDrivers.length >= maxDriverSelections) {
      toast.error(`You can only select up to ${maxDriverSelections} driver${maxDriverSelections > 1 ? 's' : ''}`);
      return;
    }
    
    setSelectedDrivers([...selectedDrivers, currentDriverSelection]);
    setCurrentDriverSelection('');
  };
  
  const handleRemoveDriver = (driverId: string) => {
    if (selectedDrivers.length > 0) {
      const newDrivers = selectedDrivers.filter(id => id !== driverId);
      setSelectedDrivers(newDrivers);
    }
  };
  
  const handleMoveDriverUp = (index: number) => {
    if (index <= 0) return;
    const newDrivers = [...selectedDrivers];
    const driver1 = selectedDrivers[index]
    const driver2 = selectedDrivers[index - 1]
    if (!driver1 || !driver2) return;
    newDrivers.splice(index - 1, 2, driver1, driver2);
    setSelectedDrivers(newDrivers);
  };
  
  const handleMoveDriverDown = (index: number) => {
    if (index >= selectedDrivers.length - 1) return;
    const newDrivers = [...selectedDrivers];
    const driver1 = selectedDrivers[index]
    const driver2 = selectedDrivers[index + 1]
    if (!driver1 || !driver2) return;
    newDrivers.splice(index, 2, driver2, driver1);
    setSelectedDrivers(newDrivers);
  };
  
  const handlePredictionSubmit = () => {
    if (selectedDrivers.length === 0) {
      toast.error('Please select at least one driver');
      return;
    }
    
    predictionMutation.mutate(selectedDrivers);
  };

  
  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Races
      </Button>
      
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{race.name}</h1>
        <div className="flex items-center space-x-2">
          <RaceStatusBadge race={race} hasResults={raceResults.length > 0 } />
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
            {isPastRace && (
              <div className="mt-6 p-4 bg-f1-black/5 rounded-lg">
                <p className="font-medium text-center mb-2">Race Results</p>
                {raceResults.length > 0 ? (
                  <div className="space-y-2">
                    {raceResults.slice(0, 10).map(result => {
                      const driver = drivers.find(d => d.id === result.driver_id);
                      if (!driver) return null;
                      
                      return (
                        <div key={result.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="w-7 text-center font-bold">{result.position}.</span>

                            <span>{driver.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{driver.team}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No results posted yet</p>
                  </div>
                )}
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
              {arePicksLocked ? <CardDescription>
                Your predictions are locked.
              </CardDescription> : <CardDescription>
                {draftPosition 
                  ? `Select up to ${maxDriverSelections} driver${maxDriverSelections > 1 ? 's' : ''} in order of preference` 
                  : 'Select up to 5 drivers in order of preference'}
              </CardDescription>}
          </CardHeader>
          <CardContent>
            {arePicksLocked ? (
              <div>
                {currentPrediction ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-f1-black/5 rounded-lg">
                      <p className="font-medium text-center mb-3">Your Predictions</p>
                      <div className="space-y-2">
                        {currentPrediction.driver_predictions.map((driverId, index) => {
                          const driver = drivers.find(d => d.id === driverId);
                          const isCorrect = tenthPlaceResult && driverId === tenthPlaceResult.driver_id;
                          
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
                {draftPosition && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                    <p className="font-medium text-yellow-800">Draft Position: {draftPosition.position}</p>
                    <p className="text-yellow-700 mt-1">
                      Based on your previous race result, you can select up to {maxDriverSelections} driver{maxDriverSelections > 1 ? 's' : ''}.
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Select 
                    value={currentDriverSelection} 
                    onValueChange={setCurrentDriverSelection}
                  >
                    <SelectTrigger className="flex-grow">
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
                    onClick={handleAddDriver}
                    disabled={!currentDriverSelection || selectedDrivers.length >= maxDriverSelections}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Selected Drivers ({selectedDrivers.length}/{maxDriverSelections})</h3>
                  <div className="space-y-2">
                    {selectedDrivers.map((driverId, index) => {
                      const driver = drivers.find(d => d.id === driverId);
                      
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDriver(driver.id);
                              }}
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
                  disabled={selectedDrivers.length === 0 || predictionMutation.isPending}
                >
                  {predictionMutation.isPending ? 'Saving...' : 
                   currentPrediction ? 'Update Predictions' : 'Submit Predictions'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Draft Positions section before the Player Predictions table */}
      {draftPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-f1-yellow" />
              Draft Order
            </CardTitle>
            <CardDescription>
              Order in which players will have their driver picks assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="space-y-2">
                {draftPositions.map((draftPos) => {
                  const profile = allProfiles.find(p => p.id === draftPos.user_id);
                  const isCurrentUser = profile?.id === currentProfile?.id;
                  
                  return (
                    <div 
                      key={draftPos.id} 
                      className={`p-2 rounded-md flex items-center justify-between ${
                        isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div>
                          <p className="font-medium text-sm">
                            {profile?.name || 'Unknown'}
                            {isCurrentUser && <span className="text-blue-600 ml-1">(You)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {draftPos.position === 1 ? 'First Pick' : `Pick ${draftPos.position}`}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {draftPositions.length === 0 && (
                <div className="text-center py-2">
                  <p className="text-muted-foreground">No draft order has been established for this race yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-f1-blue" />
            Player Picks
          </CardTitle>
          <CardDescription>
            See which driver each player has been assigned for this race
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Driver Pick</TableHead>
                {isPastRace && <TableHead className="text-right">Position</TableHead>}
                {isPastRace && <TableHead className="text-right">Result</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPastRace 
                ? [...allProfiles]
                    .sort((a, b) => {
                      // Get picks for each profile
                      const pickA = picks.find(p => p.user_id === a.id);
                      const pickB = picks.find(p => p.user_id === b.id);
                      
                      // Get result positions for each pick
                      const resultA = pickA ? raceResults.find(r => r.driver_id === pickA.driver_id)?.position : null;
                      const resultB = pickB ? raceResults.find(r => r.driver_id === pickB.driver_id)?.position : null;
                      
                      // If either doesn't have a result, put them at the end
                      if (resultA === null || resultA === undefined) return 1;
                      if (resultB === null || resultB === undefined) return -1;
                      
                      // Calculate distance from P10
                      const distanceA = Math.abs(resultA - 10);
                      const distanceB = Math.abs(resultB - 10);
                      
                      // Sort by distance first
                      if (distanceA !== distanceB) {
                        return distanceA - distanceB; // Smaller distance first
                      }
                      
                      // Tiebreaker: lower position number (higher finish)
                      return resultA - resultB;
                    })
                    .map(profile => {
                      const pick = picks.find(p => p.user_id === profile.id);
                      const isCorrectPick = isPastRace && pick && tenthPlaceResult && 
                        pick.driver_id === tenthPlaceResult.driver_id;
                      const driver = pick ? drivers.find(d => d.id === pick.driver_id) : null;
                      const position = pick && driver ? raceResults.find(r => r.driver_id === pick.driver_id)?.position : null;
                      
                      return (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="font-medium">{profile.name || 'Unknown Player'}</div>
                          </TableCell>
                          <TableCell>
                            {pick && driver ? (
                              <div className="flex items-center">
                                <span>{driver.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No pick</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {position ? (
                              <span>
                                P{position}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {pick && driver ? (
                              <Badge className={
                                isCorrectPick 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }>
                                {isCorrectPick ? '+10 Points' : position ? `${Math.abs(position - 10)} away` : 'No result'}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No pick</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                : allProfiles.map(profile => {
                    const pick = picks.find(p => p.user_id === profile.id);
                    const driver = pick ? drivers.find(d => d.id === pick.driver_id) : null;
                    
                    return (
                      <TableRow key={profile.id}>
                        <TableCell>
                          <div className="font-medium">{profile.name || 'Unknown Player'}</div>
                        </TableCell>
                        <TableCell>
                          {pick && driver ? (
                            <div className="flex items-center">
                              <span>{driver.name}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-1">
                              {predictions.some(p => p.player_id === profile.id) ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Predictions submitted
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                  No predictions yet
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
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
