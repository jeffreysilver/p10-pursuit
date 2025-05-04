// Setup type definitions for built-in Supabase Runtime APIs
import { SupabaseClient } from "@supabase/supabase-js";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';


export const config = {
  auth: false
};
Deno.serve(async (req)=>{
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    await generateNextRaceDraftPositions(supabase);
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({
      message: err?.message ?? err
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});

/**
 * Generates draft positions for the next race based on previous race results
 * @param previousRaceId The ID of the previous race to use for calculating positions
 * @param nextRaceId The ID of the next race to set draft positions for
 */
export async function generateDraftPositions(
  supabaseAdmin: SupabaseClient,
  previousRaceId: string,
  nextRaceId: string
): Promise<void> {
  console.log(`Generating draft positions based on race ${previousRaceId} for race ${nextRaceId}...`);

  // 1. Get all race results for the previous race
  const { data: raceResults, error: raceResultsError } = await supabaseAdmin
    .from('race_results')
    .select('driver_id, position')
    .eq('race_id', previousRaceId)
    .order('position', { ascending: true });

  if (raceResultsError) {
    console.error('Error fetching race results:', raceResultsError);
    return;
  }

  if (!raceResults || raceResults.length === 0) {
    console.error(`No results found for race ${previousRaceId}`);
    return;
  }

  // Build a map of driver_id to position for quick lookups
  const driverPositions = new Map<string, number>();
  raceResults.forEach(result => {
    driverPositions.set(result.driver_id, result.position);
  });

  // 2. Get all user picks for the previous race
  const { data: picks, error: picksError } = await supabaseAdmin
    .from('picks')
    .select('user_id, driver_id')
    .eq('race_id', previousRaceId);

  if (picksError) {
    console.error('Error fetching picks:', picksError);
    return;
  }

  if (!picks || picks.length === 0) {
    console.error(`No picks found for race ${previousRaceId}`);
    return;
  }

  // 3. Group picks by user
  const userPicks = new Map<string, string[]>();
  picks.forEach(pick => {
    if (!userPicks.has(pick.user_id)) {
      userPicks.set(pick.user_id, []);
    }
    userPicks.get(pick.user_id)!.push(pick.driver_id);
  });

  // 4. Calculate distance from P10 for each user's picks
  type UserScore = {
    userId: string;
    distanceFromP10: number;
    bestPosition: number; // For tiebreaking - best actual position among their picks
  };

  const userScores: UserScore[] = [];

  userPicks.forEach((driverIds, userId) => {
    let totalDistance = 0;
    let bestPosition = Number.MAX_SAFE_INTEGER;
    
    // Calculate distance from P10 for each driver picked by this user
    driverIds.forEach(driverId => {
      const position = driverPositions.get(driverId);
      if (position !== undefined) {
        totalDistance += Math.abs(position - 10);
        bestPosition = Math.min(bestPosition, position);
      }
    });
    
    userScores.push({
      userId,
      distanceFromP10: totalDistance,
      bestPosition
    });
  });

  // 5. Sort users by distance from P10 (ascending) and break ties with best position
  userScores.sort((a, b) => {
    if (a.distanceFromP10 !== b.distanceFromP10) {
      return a.distanceFromP10 - b.distanceFromP10;
    }
    return a.bestPosition - b.bestPosition;
  });

  // 6. Clear any existing draft positions for the next race
  await supabaseAdmin
    .from('draft_positions')
    .delete()
    .eq('race_id', nextRaceId);

  // 7. Insert new draft positions
  for (let i = 0; i < userScores.length; i++) {
    const { userId } = userScores[i] || {};
    const position = i + 1; // 1-indexed position
    
    const { error } = await supabaseAdmin
      .from('draft_positions')
      .insert({
        user_id: userId,
        race_id: nextRaceId,
        position,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`Error setting draft position for user ${userId}:`, error);
    }
  }

  console.log(`Successfully generated ${userScores.length} draft positions for race ${nextRaceId}`);
}

/**
 * Helper function to generate draft positions for the next race
 * after results have been added for the current race
 */
export async function generateNextRaceDraftPositions(supabaseAdmin): Promise<void> {
  // 1. Fetch all races ordered by date so we can look at each consecutive pair
  const { data: races, error: racesError } = await supabaseAdmin
    .from('races')
    .select('id, date')
    .order('date', { ascending: true });

  if (racesError) {
    console.error('Error fetching races:', racesError);
    return;
  }

  

  if (!races || races.length < 2) {
    console.log('Not enough races in schedule to determine next races');
    return;
  }

  // 2. Iterate through races and find where current race has results but next race does not
  for (let i = 0; i < races.length - 1; i++) {
    const currentRace = races[i]!;
    const nextRace = races[i + 1]!;

    // Check if current race has results
    const { data: currentResults } = await supabaseAdmin
      .from('race_results')
      .select('id')
      .eq('race_id', currentRace.id)
      .limit(1);

    if (!currentResults || currentResults.length === 0) {
      // Current race has no results – skip
      continue;
    }

    // Check if next race already has results
    const { data: nextResults } = await supabaseAdmin
      .from('draft_positions')
      .select('id')
      .eq('race_id', nextRace.id)
      .limit(1);

    if (nextResults && nextResults.length > 0) {
      // Next race already has results – skip
      continue;
    }

    console.log(`Generating draft positions: current race ${currentRace.id} has results, next race ${nextRace.id} has none.`);

    // Generate draft positions for this pair
    await generateDraftPositions(supabaseAdmin, currentRace.id, nextRace.id);
  }
}
