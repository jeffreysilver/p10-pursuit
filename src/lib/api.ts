import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Types
export type Driver = Database['public']['Tables']['drivers']['Row'];
export type Race = Database['public']['Tables']['races']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Prediction = Database['public']['Tables']['predictions']['Row'];
export type RaceResult = Database['public']['Tables']['race_results']['Row'];
export type DraftPosition = Database['public']['Tables']['draft_positions']['Row'];

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
    .select('*')
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
    .select('*, user:profiles(*)')
    .eq('race_id', raceId)
    .order('position', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

// Auth helper functions
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
};
