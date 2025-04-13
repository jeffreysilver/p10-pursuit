import { supabaseAdmin } from "./generatePicks";

/**
 * Generates draft positions for the next race based on previous race results
 * @param previousRaceId The ID of the previous race to use for calculating positions
 * @param nextRaceId The ID of the next race to set draft positions for
 */
export async function generateDraftPositions(
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
export async function generateNextRaceDraftPositions(currentRaceId: string): Promise<void> {
  // Find the next race in sequence
  const { data: currentRace } = await supabaseAdmin
    .from('races')
    .select('date')
    .eq('id', currentRaceId)
    .single();
  
  if (!currentRace) {
    console.error(`Race not found with ID: ${currentRaceId}`);
    return;
  }
  
  // Find the next race after the current one
  const { data: nextRace } = await supabaseAdmin
    .from('races')
    .select('id')
    .gt('date', currentRace.date)
    .order('date', { ascending: true })
    .limit(1)
    .single();
  
  if (!nextRace) {
    console.log('No next race found in the schedule');
    return;
  }
  
  // Generate draft positions for the next race based on current race results
  await generateDraftPositions(currentRaceId, nextRace.id);
}


generateNextRaceDraftPositions('a74f6734-5e55-4acd-845f-606226494ee7')