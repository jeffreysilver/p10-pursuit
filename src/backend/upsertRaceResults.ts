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

/**
 * Finds races that ended in the last 24 hours without results and processes them
 */
export async function processRecentRaces(): Promise<void> {
  console.log('Checking for recent races without results...');
  
  // Get date for 24 hours ago
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  // Find races that ended in the last 24 hours
  const { data: recentRaces, error } = await supabaseAdmin
    .from('races')
    .select('*')
    .lt('date', new Date().toISOString())
    .gte('date', oneDayAgo.toISOString());
  
  if (error) {
    console.error('Error fetching recent races:', error);
    return;
  }
  
  if (!recentRaces || recentRaces.length === 0) {
    console.log('No recent races found in the last 24 hours');
    return;
  }
  
  console.log(`Found ${recentRaces.length} recent races, checking which need results...`);
  
  // Check each race for existing results
  for (const race of recentRaces) {
    // Check if race has results
    const { data: results, error: resultsError } = await supabaseAdmin
      .from('race_results')
      .select('id')
      .eq('race_id', race.id)
      .limit(1);
      
    if (resultsError) {
      console.error(`Error checking results for ${race.name}:`, resultsError);
      continue;
    }
    
    // If no results exist, process this race
    if (!results || results.length === 0) {
      const season = new Date(race.date).getFullYear().toString();
      const round = race.round.toString();
      
      console.log(`Processing ${race.name} (${season} round ${round}) - no results found`);
      
      try {
        await upsertRaceResults(season, round);
      } catch (err) {
        console.error(`Failed to upsert results for ${race.name}:`, err);
      }
    }
  }
}

// Example usage
processRecentRaces(); 