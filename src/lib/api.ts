import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Types
export type Driver = Database['public']['Tables']['drivers']['Row'];
export type Race = Database['public']['Tables']['races']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Prediction = Database['public']['Tables']['predictions']['Row'];
export type RaceResult = Database['public']['Tables']['race_results']['Row'];
export type DraftPosition = Database['public']['Tables']['draft_positions']['Row'];
export type Pick = Database['public']['Tables']['picks']['Row'];

// Drivers API
export const getDrivers = async (): Promise<Driver[]> => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*');
  
  if (error) throw error;
  return data || [];
};

export const getDriverById = async (id: string): Promise<Driver | null> => {
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // PGRST116 is "Results contain 0 rows"
    throw error;
  }
  
  return data;
};

// Races API
export const getRaces = async (): Promise<Race[]> => {
  const { data, error } = await supabase
    .from('races')
    .select('*, race_results(count)')
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getRaceById = async (id: string): Promise<Race | null> => {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
};

// Profiles API
export const getProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('score', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getProfileById = async (id: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
};

export const getCurrentProfile = async (): Promise<Profile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;
  
  return getProfileById(session.user.id);
};

// Predictions API
export const getPredictionsByRaceId = async (raceId: string): Promise<Prediction[]> => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*, player:profiles(*)')
    .eq('race_id', raceId);
  
  if (error) throw error;
  return data || [];
};

export const getPredictionsByPlayerId = async (playerId: string): Promise<Prediction[]> => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*, race:races(*)')
    .eq('player_id', playerId);
  
  if (error) throw error;
  return data || [];
};

export const getPrediction = async (raceId: string, playerId: string): Promise<Prediction | null> => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('race_id', raceId)
    .eq('player_id', playerId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
};

export const createOrUpdatePrediction = async (
  raceId: string, 
  driverPredictions: string[]
): Promise<Prediction> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('User not authenticated');
  
  const playerId = session.user.id;
  
  // Check if a prediction already exists
  const existing = await getPrediction(raceId, playerId);
  
  if (existing) {
    // Update existing prediction
    const { data, error } = await supabase
      .from('predictions')
      .update({ driver_predictions: driverPredictions, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new prediction
    const { data, error } = await supabase
      .from('predictions')
      .insert({ 
        race_id: raceId, 
        player_id: playerId, 
        driver_predictions: driverPredictions 
      })
      .select()
      .single();
    
      console.log(error)
    if (error) throw error;
    return data;
  }
};

// Race Results API
export const getRaceResultsByRaceId = async (raceId: string): Promise<RaceResult[]> => {
  const { data, error } = await supabase
    .from('race_results')
    .select('*, driver:drivers(*)')
    .eq('race_id', raceId)
    .order('position', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getDriverRaceResult = async (raceId: string, driverId: string): Promise<RaceResult | null> => {
  const { data, error } = await supabase
    .from('race_results')
    .select('*')
    .eq('race_id', raceId)
    .eq('driver_id', driverId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
};

export const createOrUpdateRaceResult = async (
  raceId: string,
  driverId: string,
  position: number
): Promise<RaceResult> => {
  // Check if a result already exists
  const existing = await getDriverRaceResult(raceId, driverId);
  
  if (existing) {
    // Update existing result
    const { data, error } = await supabase
      .from('race_results')
      .update({ position, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new result
    const { data, error } = await supabase
      .from('race_results')
      .insert({ 
        race_id: raceId,
        driver_id: driverId,
        position
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Draft Positions API
export const getDraftPosition = async (raceId: string, userId?: string): Promise<DraftPosition | null> => {
  // If no userId is provided, get the current user
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;
    userId = session.user.id;
  }
  
  const { data, error } = await supabase
    .from('draft_positions')
    .select('*')
    .eq('race_id', raceId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
};

export const getDraftPositionsByRaceId = async (raceId: string): Promise<DraftPosition[]> => {
  const { data, error } = await supabase
    .from('draft_positions')
    .select('*')
    .eq('race_id', raceId)
    .order('position', { ascending: true });

  console.log(data, error)
  
  if (error) throw error;
  
  // Manually fetch the profile information for each draft position
  const enhancedData = await Promise.all((data || []).map(async (draftPosition) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', draftPosition.user_id)
      .single();
      
    return {
      ...draftPosition,
      user: profile
    };
  }));
  
  return enhancedData;
};

export const createOrUpdateDraftPosition = async (
  raceId: string,
  userId: string, 
  position: number
): Promise<DraftPosition> => {
  // Check if a draft position already exists
  const { data: existing, error: existingError } = await supabase
    .from('draft_positions')
    .select('*')
    .eq('race_id', raceId)
    .eq('user_id', userId)
    .single();
  
  if (existingError && existingError.code !== 'PGRST116') throw existingError;
  
  if (existing) {
    // Update existing draft position
    const { data, error } = await supabase
      .from('draft_positions')
      .update({ position, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new draft position
    const { data, error } = await supabase
      .from('draft_positions')
      .insert({ 
        race_id: raceId,
        user_id: userId,
        position
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

/**
 * Calculate draft positions for the next race based on current race results
 * Players closest to P10 get higher priority (lower position number)
 */
export const calculateDraftPositionsFromRaceResults = async (
  currentRaceId: string,
  nextRaceId: string
): Promise<void> => {
  // Get all race results for the current race
  const raceResults = await getRaceResultsByRaceId(currentRaceId);
  
  // Get the driver who finished P10
  const p10Result = raceResults.find(result => result.position === 10);
  if (!p10Result) {
    throw new Error('Cannot calculate draft positions: P10 result not found');
  }
  
  // Get all predictions for this race
  const predictions = await getPredictionsByRaceId(currentRaceId);
  
  // Get all profiles
  const profiles = await getProfiles();
  
  // Calculate proximity to P10 for each player
  const playerProximities = profiles.map(profile => {
    const prediction = predictions.find(p => p.player_id === profile.id);
    
    // If player didn't predict, they get lowest priority
    if (!prediction || prediction.driver_predictions.length === 0) {
      return {
        playerId: profile.id,
        proximity: Number.MAX_SAFE_INTEGER,
        closestPosition: null
      };
    }
    
    // If player correctly predicted P10, they get highest priority
    if (prediction.driver_predictions.includes(p10Result.driver_id)) {
      return {
        playerId: profile.id,
        proximity: 0,
        closestPosition: 10
      };
    }
    
    // Find the closest driver the player predicted to P10
    let closestProximity = Number.MAX_SAFE_INTEGER;
    let closestPosition = null;
    
    for (const driverId of prediction.driver_predictions) {
      const driverResult = raceResults.find(result => result.driver_id === driverId);
      if (driverResult) {
        const proximity = Math.abs(driverResult.position - 10);
        if (proximity < closestProximity) {
          closestProximity = proximity;
          closestPosition = driverResult.position;
        }
      }
    }
    
    return {
      playerId: profile.id,
      proximity: closestProximity,
      closestPosition
    };
  });
  
  // Sort players by proximity (ascending)
  playerProximities.sort((a, b) => {
    // First by proximity
    if (a.proximity !== b.proximity) {
      return a.proximity - b.proximity;
    }
    
    // If same proximity, prefer the player who predicted lower position
    // (This handles tiebreakers like P9 vs P11, where P9 is closer to the front)
    if (a.closestPosition !== null && b.closestPosition !== null) {
      return a.closestPosition - b.closestPosition;
    }
    
    // If one has no position and the other does, the one with position is prioritized
    if (a.closestPosition === null && b.closestPosition !== null) return 1;
    if (a.closestPosition !== null && b.closestPosition === null) return -1;
    
    // Otherwise they're equal
    return 0;
  });
  
  // Create draft positions for the next race
  const batches = [];
  for (let i = 0; i < playerProximities.length; i++) {
    // Position is 1-indexed (1 is highest priority)
    const position = i + 1;
    batches.push(
      createOrUpdateDraftPosition(nextRaceId, playerProximities[i].playerId, position)
    );
  }
  
  // Wait for all draft positions to be created/updated
  await Promise.all(batches);
};

// Picks API
export const getPicksByRaceId = async (raceId: string): Promise<Pick[]> => {
  const { data, error } = await supabase
    .from('picks')
    .select('*, driver:driver_id(*)')
    .eq('race_id', raceId);
  
  if (error) throw error;
  
  // Manually fetch the profile information for each pick
  const enhancedData = await Promise.all((data || []).map(async (pick) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', pick.user_id)
      .single();
      
    return {
      ...pick,
      user: profile
    };
  }));
  
  return enhancedData;
};

export const getUserPickForRace = async (raceId: string, userId?: string): Promise<Pick | null> => {
  // If no userId is provided, get the current user
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;
    userId = session.user.id;
  }
  
  const { data, error } = await supabase
    .from('picks')
    .select('*, driver:driver_id(*)')
    .eq('race_id', raceId)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
};

export const createOrUpdatePick = async (
  raceId: string,
  driverId: string,
  userId?: string
): Promise<Pick> => {
  // If no userId is provided, get the current user
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error('User not authenticated');
    userId = session.user.id;
  }
  
  // Check if a pick already exists
  const { data: existing, error: existingError } = await supabase
    .from('picks')
    .select('*')
    .eq('race_id', raceId)
    .eq('user_id', userId)
    .single();
  
  if (existingError && existingError.code !== 'PGRST116') throw existingError;
  
  if (existing) {
    // Update existing pick
    const { data, error } = await supabase
      .from('picks')
      .update({ 
        driver_id: driverId, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', existing.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new pick
    const { data, error } = await supabase
      .from('picks')
      .insert({ 
        race_id: raceId,
        user_id: userId,
        driver_id: driverId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};


// Auth helper functions
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
};
