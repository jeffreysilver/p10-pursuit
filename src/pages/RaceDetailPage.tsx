import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  restrictToVerticalAxis
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  X,
  Clock,
  Sparkles,
  Gauge
} from 'lucide-react';
import { formatDate, isRacePast } from '@/lib/date-utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
  getPicksByRaceId,
  Race,
  Driver
} from '@/lib/api';
import { RaceStatusBadge } from '@/components/ui/race-status-badge';

const RaceDetailPage = () => {
  const { raceId } = useParams<{ raceId: string }>();

  // Fetch race details
  const { data: race, isLoading } = useQuery({
    queryKey: ['race', raceId],
    queryFn: () => (raceId ? getRaceById(raceId) : null),
    enabled: !!raceId,
  });
  
  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-t-f1-papaya border-r-f1-blue border-b-f1-yellow border-l-f1-gray rounded-full animate-spin"></div>
          <Gauge className="absolute inset-0 m-auto h-8 w-8 text-f1-black animate-pulse" />
        </div>
        <p className="mt-4 text-f1-black/70 animate-pulse">Loading race details...</p>
      </div>
    );
  }
  
  if (!race) {
    return <div className="py-12 text-center text-f1-papaya">Could not load race data</div>;
  }
  
  return <RaceDetailView race={race} />;
}
  
const RaceDetailView= ({race}: {race: Race}) => {
  const raceId = race.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [currentDriverSelection, setCurrentDriverSelection] = useState<string>('');
  const [timeUntilLock, setTimeUntilLock] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  

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



// Check if picks are locked based on picks_lock_at field
const isPastRace = isRacePast(race.date);
const arePicksLocked = race.lock_picks_at ? new Date(race.lock_picks_at) < new Date() : isPastRace;

// Calculate time until picks lock
useEffect(() => {
  if (!race.lock_picks_at || arePicksLocked) {
    setTimeUntilLock(null);
    return;
  }

  const lockTime = new Date(race.lock_picks_at).getTime();
  
  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = lockTime - now;
    
    if (distance <= 0) {
      setTimeUntilLock(null);
      // Refresh the page to update UI
      queryClient.invalidateQueries({ queryKey: ['race', raceId] });
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    setTimeUntilLock({ days, hours, minutes, seconds });
  };
  
  updateCountdown();
  // const interval = setInterval(updateCountdown, 1000);
  
  // return () => clearInterval(interval);
}, [race.lock_picks_at, arePicksLocked, queryClient, raceId]);

// Create or update prediction mutation
const predictionMutation = useMutation({
  mutationFn: (driverIds: string[]) => {
    if (!raceId) throw new Error('Race ID is required');
    return createOrUpdatePrediction(raceId, driverIds);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['predictions'] });
    toast.success('Your preferences have been saved!');
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

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
);

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
  console.log("handleRemoveDriver called with:", driverId);
  // Make sure we're not trying to modify a frozen array
  const updatedDrivers = selectedDrivers.filter(id => id !== driverId);
  console.log("Updated drivers:", updatedDrivers);
  setSelectedDrivers(updatedDrivers);
};

const handleDragStart = (event: { active: { id: string } }) => {
  setActiveId(event.active.id);
};

const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  
  setActiveId(null);
  
  if (active.id !== over?.id) {
    setSelectedDrivers((items) => {
      const oldIndex = items.indexOf(active.id.toString());
      const newIndex = items.indexOf(over?.id.toString() || '');
      
      return arrayMove(items, oldIndex, newIndex);
    });
  }
};

const handleDragCancel = () => {
  setActiveId(null);
};

const handlePredictionSubmit = () => {
  if (selectedDrivers.length === 0) {
    toast.error('Please select at least one driver');
    return;
  }
  
  predictionMutation.mutate(selectedDrivers);
};


return (
  <div className="space-y-6 relative">
    
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-4 hover:scale-105 transition-transform"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Races
      </Button>
    </motion.div>
    
    <motion.div 
      className="flex flex-col space-y-2"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-f1-papaya to-f1-blue bg-clip-text text-transparent">{race.name}</h1>
      <div className="flex items-center space-x-2">
        <RaceStatusBadge race={race} hasResults={raceResults.length > 0 } />
        {timeUntilLock && (
          <Badge variant="outline" className="ml-2 bg-amber-50 border-amber-200 text-amber-800 animate-pulse">
            <Clock className="mr-1 h-3 w-3" />
            Picks lock in: {timeUntilLock.days > 0 ? `${timeUntilLock.days}d ` : ''}
            {String(timeUntilLock.hours).padStart(2, '0')}:{String(timeUntilLock.minutes).padStart(2, '0')}:{String(timeUntilLock.seconds).padStart(2, '0')}
          </Badge>
        )}
      </div>
    </motion.div>
    
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-2 border-f1-gray/20 hover:border-f1-papaya/30 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-f1-black/5 to-transparent">
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-f1-papaya" />
              Race Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center group">
              <MapPin className="mr-2 h-5 w-5 text-f1-blue group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-f1-blue transition-colors">{race.circuit}, {race.location}</span>
            </div>
            <div className="flex items-center group">
              <Calendar className="mr-2 h-5 w-5 text-f1-papaya group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-f1-papaya transition-colors">{formatDate(race.date)}</span>
            </div>
            {isPastRace && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-4 bg-gradient-to-br from-f1-black/10 to-f1-black/5 rounded-lg"
              >
                <p className="font-medium text-center mb-2 flex items-center justify-center">
                  <Trophy className="mr-2 h-4 w-4 text-f1-yellow" />
                  Race Results
                </p>
                {raceResults.length > 0 ? (
                  <div className="space-y-2">
                    {raceResults.slice(0, 10).map((result, index) => {
                      const driver = drivers.find(d => d.id === result.driver_id);
                      if (!driver) return null;
                      
                      const podium = result.position <= 3;
                      
                      return (
                        <motion.div 
                          key={result.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`flex items-center justify-between p-2 rounded hover:bg-white/70 transition-colors ${
                            podium ? 'border-l-4 pl-2 ' : ''
                          } ${
                            result.position === 1 ? 'border-l-yellow-400' : 
                            result.position === 2 ? 'border-l-gray-300' :
                            result.position === 3 ? 'border-l-amber-700' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <span className={`w-7 text-center font-bold ${
                              result.position === 1 ? 'text-yellow-500' :
                              result.position === 2 ? 'text-gray-500' :
                              result.position === 3 ? 'text-amber-700' : ''
                            }`}>{result.position}.</span>

                            <span>{driver.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{driver.team}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-2">No results posted yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="overflow-hidden border-2 border-f1-gray/20 hover:border-f1-yellow/30 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-f1-black/5 to-transparent">
            <CardTitle className="flex items-center">
              <Flag className="mr-2 h-5 w-5 text-f1-papaya animate-pulse" />
              Your Driver Preferences
            </CardTitle>
              {arePicksLocked ? <CardDescription>
                <span className="text-f1-papaya/80">Your pick is locked.</span>
              </CardDescription> : (
                <CardDescription>
                  {draftPosition 
                    ? `Select up to ${maxDriverSelections} driver${maxDriverSelections > 1 ? 's' : ''} in order of preference` 
                    : 'Select up to 5 drivers in order of preference'}
                  {timeUntilLock && (
                    <div className="mt-1 font-medium text-amber-700">
                      <Clock className="inline-block mr-1 h-3 w-3 animate-pulse" />
                      Picks lock in: {timeUntilLock.days > 0 ? `${timeUntilLock.days}d ` : ''}
                      {String(timeUntilLock.hours).padStart(2, '0')}:{String(timeUntilLock.minutes).padStart(2, '0')}:{String(timeUntilLock.seconds).padStart(2, '0')}
                    </div>
                  )}
                </CardDescription>
              )}
          </CardHeader>
          <CardContent>
            {arePicksLocked ? (
              <div>
                {currentPrediction ? (
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="p-4 bg-gradient-to-br from-f1-blue/10 to-f1-black/5 rounded-lg"
                    >
                      <p className="font-medium text-center mb-3 flex items-center justify-center">
                        <Sparkles className="mr-2 h-4 w-4 text-f1-yellow" />
                        Your Predictions
                      </p>
                      <div className="space-y-2">
                        {currentPrediction.driver_predictions.map((driverId, index) => {
                          const driver = drivers.find(d => d.id === driverId);
                          const isCorrect = tenthPlaceResult && driverId === tenthPlaceResult.driver_id;
                          
                          return driver ? (
                            <motion.div 
                              key={driver.id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-center justify-between p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <div className="flex items-center">
                                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                                  isCorrect ? 'bg-green-500 animate-pulse' : 'bg-gradient-to-br from-f1-papaya to-f1-blue'
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
                                  isCorrect 
                                    ? 'bg-green-100 text-green-800 border border-green-200 animate-pulse' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {isCorrect ? '+10 Points' : 'Incorrect'}
                                </Badge>
                                <div className="w-6 h-6 rounded-full bg-f1-black/10 flex items-center justify-center">
                                  {index + 1}
                                </div>
                              </div>
                            </motion.div>
                          ) : null;
                        })}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">You did not submit picks for this race via P10 Pursuit.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {draftPosition && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-md text-sm"
                  >
                    <p className="font-medium text-yellow-800 flex items-center">
                      <Trophy className="mr-2 h-4 w-4 text-yellow-600" />
                      Draft Position: {draftPosition.position}
                    </p>
                    <p className="text-yellow-700 mt-1">
                      Based on your previous race result, you can select up to {maxDriverSelections} driver{maxDriverSelections > 1 ? 's' : ''}.
                    </p>
                  </motion.div>
                )}
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex gap-2"
                >
                  <Select 
                    value={currentDriverSelection} 
                    onValueChange={setCurrentDriverSelection}
                  >
                    <SelectTrigger className="flex-grow transition-colors hover:border-f1-papaya/50 focus:border-f1-papaya">
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
                    className="bg-f1-blue hover:bg-f1-blue/90 transition-all duration-300 hover:scale-105"
                  >
                    Add
                  </Button>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-4"
                >
                  <h3 className="font-medium mb-2 flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-f1-yellow" />
                    Selected Drivers ({selectedDrivers.length}/{maxDriverSelections})
                  </h3>
                  <div className="space-y-2">
                    {selectedDrivers.length === 0 ? (
                      <div className="text-center py-4 border border-dashed rounded-lg border-f1-gray/40 bg-f1-black/5">
                        <p className="text-muted-foreground">No drivers selected</p>
                      </div>
                    ) : (
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                        modifiers={[restrictToVerticalAxis]}
                      >
                        <SortableContext 
                          items={selectedDrivers}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            <AnimatePresence>
                              {selectedDrivers.map((driverId, index) => {
                                const driver = drivers.find(d => d.id === driverId);
                                return driver ? (
                                  <SortableItem 
                                    key={driver.id} 
                                    id={driver.id}
                                    driver={driver} 
                                    index={index}
                                    onRemove={handleRemoveDriver}
                                  />
                                ) : null;
                              })}
                            </AnimatePresence>
                          </div>
                        </SortableContext>
                        <DragOverlay>
                          {activeId ? (
                            <div className="p-2 rounded-lg bg-white shadow-lg border-2 border-f1-papaya">
                              {drivers.find(d => d.id === activeId)?.name}
                            </div>
                          ) : null}
                        </DragOverlay>
                      </DndContext>
                    )}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-f1-papaya to-f1-papaya/80 hover:from-f1-papaya/90 hover:to-f1-papaya shadow-md hover:shadow-lg mt-4 transition-all duration-300 hover:scale-[1.02]"
                    onClick={handlePredictionSubmit}
                    disabled={selectedDrivers.length === 0 || predictionMutation.isPending}
                  >
                    {predictionMutation.isPending ? 'Saving...' : 
                    currentPrediction ? 'Update Predictions' : 'Submit Predictions'}
                  </Button>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
    
    {/* Add Draft Positions section before the Player Predictions table */}
    {draftPositions.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="overflow-hidden border-2 border-f1-gray/20 hover:border-f1-yellow/30 transition-all duration-300 shadow-lg hover:shadow-xl">
          <CardHeader className="bg-gradient-to-r from-f1-yellow/10 to-transparent">
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
                {draftPositions.map((draftPos, index) => {
                  const profile = allProfiles.find(p => p.id === draftPos.user_id);
                  const isCurrentUser = profile?.id === currentProfile?.id;
                  
                  return (
                    <motion.div 
                      key={draftPos.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-2 rounded-md flex items-center justify-between ${
                        isCurrentUser ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                      } transition-colors duration-300`}
                    >
                      <div className="flex items-center">
                        <div>
                          <p className="font-medium text-sm">
                            {profile?.name || 'Unknown'}
                            {isCurrentUser && <span className="text-blue-600 ml-1">(You)</span>}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center ${draftPos.position === 1 ? 'text-f1-yellow' : 'text-muted-foreground'}`}>
                        {draftPos.position === 1 ? (
                          <div className="flex items-center">
                            <Trophy className="h-3 w-3 mr-1 text-f1-yellow animate-pulse" />
                            <span className="text-xs font-semibold">First Pick</span>
                          </div>
                        ) : (
                          <span className="text-xs">Pick {draftPos.position}</span>
                        )}
                      </div>
                    </motion.div>
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
      </motion.div>
    )}
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card className="overflow-hidden border-2 border-f1-gray/20 hover:border-f1-blue/30 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="bg-gradient-to-r from-f1-blue/10 to-transparent">
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
              <TableRow className="hover:bg-f1-black/5">
                <TableHead className="text-f1-blue">Player</TableHead>
                <TableHead className="text-f1-blue">Driver Pick</TableHead>
                {isPastRace && <TableHead className="text-right text-f1-blue">Position</TableHead>}
                {isPastRace && <TableHead className="text-right text-f1-blue">Result</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
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
                      .map((profile, index) => {
                        const pick = picks.find(p => p.user_id === profile.id);
                        const isCorrectPick = isPastRace && pick && tenthPlaceResult && 
                          pick.driver_id === tenthPlaceResult.driver_id;
                        const driver = pick ? drivers.find(d => d.id === pick.driver_id) : null;
                        const position = pick && driver ? raceResults.find(r => r.driver_id === pick.driver_id)?.position : null;
                        
                        return (
                          <motion.tr 
                            key={profile.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`${isCorrectPick ? 'bg-green-50' : ''} hover:bg-f1-black/5 transition-colors`}
                          >
                            <TableCell>
                              <div className="font-medium">{profile.name || 'Unknown Player'}</div>
                            </TableCell>
                            <TableCell>
                              {pick && driver ? (
                                <div className="flex items-center">
                                  <span className="font-semibold text-f1-blue">{driver.name}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">No pick</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {position ? (
                                <span className={position <= 3 ? 'font-bold text-f1-yellow' : ''}>
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
                                    ? 'bg-green-100 text-green-800 animate-pulse' 
                                    : 'bg-red-100 text-red-800'
                                }>
                                  {isCorrectPick ? '+10 Points' : position ? `${Math.abs(position - 10)} away` : 'No result'}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">No pick</span>
                              )}
                            </TableCell>
                          </motion.tr>
                        );
                      })
                  : allProfiles.map((profile, index) => {
                      const pick = picks.find(p => p.user_id === profile.id);
                      const driver = pick ? drivers.find(d => d.id === pick.driver_id) : null;
                      
                      return (
                        <motion.tr 
                          key={profile.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-f1-black/5 transition-colors"
                        >
                          <TableCell>
                            <div className="font-medium">{profile.name || 'Unknown Player'}</div>
                          </TableCell>
                          <TableCell>
                            {pick && driver ? (
                              <div className="flex items-center">
                                <span className="font-semibold text-f1-blue">{driver.name}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col space-y-1">
                                {predictions.some(p => p.player_id === profile.id) ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Predictions submitted
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                                    No predictions yet
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);
};

// Add SortableItem component for drag-and-drop functionality
interface SortableItemProps {
  id: string;
  driver: Driver;
  index: number;
  onRemove: (id: string) => void;
}

function SortableItem({ id, driver, index, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  console.log("in sortable item", index);
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };
  
  // Create a separate handler for the remove button
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Attempting to remove driver:", driver.id);
    onRemove(driver.id);
  };
  
  return (
    <motion.div 
      ref={setNodeRef} 
      style={style} 
      className={`relative flex items-center justify-between p-2 rounded-lg 
        bg-gradient-to-r from-white to-f1-black/5 hover:from-f1-papaya/5 hover:to-white
        shadow-md hover:shadow-lg
        ${isDragging ? 'opacity-50 shadow-xl ring-2 ring-f1-papaya/20' : 'opacity-100'}
        transition-all duration-300`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="flex items-center cursor-grab flex-1"
        {...attributes}
        {...listeners}
      >
        <div className={`flex items-center justify-center h-8 w-8 rounded-full 
          bg-gradient-to-br from-f1-papaya to-f1-blue 
          text-white font-bold mr-3 shadow-md
          ${isDragging ? 'scale-110' : ''}
          transition-all duration-300`}
        >
          {driver.code}
        </div>
        <div>
          <p className="font-semibold">{driver.name}</p>
          <p className="text-xs text-muted-foreground">{driver.team}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <div className={`w-6 h-6 rounded-full 
          ${index === 0 ? 'bg-f1-yellow text-black' : 'bg-f1-black/10'} 
          flex items-center justify-center
          transition-all duration-300`}
        >
          {index + 1}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRemove}
          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-all duration-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {isDragging && (
        <div className="absolute inset-0 bg-f1-papaya/5 rounded-lg border-2 border-dashed border-f1-papaya/30" />
      )}
    </motion.div>
  );
}

export default RaceDetailPage;
