
import { supabaseAdmin } from "./generatePicks";

/**
 * Upserts results for a specific F1 race into the database
 * @param season The F1 season year (e.g., 2025)
 * @param round The race round number
 */
export async function upsertRaceResults(season: string, round: string): Promise<void> {
  console.log(`Fetching results for ${season} round ${round}...`);
  
  // 1. Fetch race results from API
  const response = await fetch(
    `https://api.jolpi.ca/ergast/f1/${season}/${round}/results.json`
  ).then(res => res.json());

  // Get the race data
  const raceData = response.MRData.RaceTable.Races[0];
  console.log(raceData)
  if (!raceData) {
    console.error(`No race found for ${season} round ${round}`);
    return;
  }

  const raceName = raceData.raceName;
  const date = raceData.date;
  const results = raceData.Results;

  // 2. Get the race ID from the database
  const { data: raceData2 } = await supabaseAdmin
    .from('races')
    .select('id')
    .eq('name', raceName)
    .single();

  if (!raceData2) {
    console.error(`Race not found in database: ${raceName} on ${date}`);
    return;
  }

  const raceId = raceData2.id;

  // 3. Delete existing results for this race (if any)
  await supabaseAdmin
    .from('race_results')
    .delete()
    .eq('race_id', raceId);

  // 4. Insert new results
  for (const result of results) {
    const position = parseInt(result.position);
    
    // Find driver ID by name
    const { data: driverData } = await supabaseAdmin
      .from('drivers')
      .select('id')
      .eq('code', result.Driver.code)
      .single();
      
    if (!driverData) {
      console.error(`Driver not found in database: ${result.Driver.code}`);
      continue;
    }
    
    const { error } = await supabaseAdmin
      .from('race_results')
      .insert({
        race_id: raceId,
        driver_id: driverData.id,
        position,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error(`Error inserting result for ${result.Driver.code}:`, error);
    }
  }
  
  // 5. Update the race to mark results as available
  await supabaseAdmin
    .from('races')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', raceId);

  console.log(`Successfully upserted results for ${raceName}`);
}

// Example usage
upsertRaceResults("2025", "3"); 