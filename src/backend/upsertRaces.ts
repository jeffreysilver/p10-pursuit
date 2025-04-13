import { supabase } from "@/integrations/supabase/client";

import { supabaseAdmin } from "./generatePicks";

/**
 * Fetches race schedule from the specified Ergast F1 API and upserts them into the database
 * @param season The F1 season year (e.g., 2025)
 */
export async function upsertRaces(season: string): Promise<void> {
    console.log(`Fetching races for ${season}...`);
    
    // 1. Fetch races from API
    const response = await fetch(
      `https://api.jolpi.ca/ergast/f1/${season}/races.json`
    ).then(res => res.json());


    const races = response.MRData.RaceTable.Races;    
    // 2. Process each race
    for (const race of races) {
      const round = race.round;
      const raceName = race.raceName;
      const circuitName = race.Circuit.circuitName;
      const location = `${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`;
      const date = race.date;
      
      // Use qualifying time for lock_picks_at if specified and available
      let lockPicksAt = null;
      if (race.Qualifying) {
        const qualifyingDate = race.Qualifying.date;
        const qualifyingTime = race.Qualifying.time;
        lockPicksAt = `${qualifyingDate}T${qualifyingTime}`;
      }
      
      // Check if race already exists
      const { data: existingRaces } = await supabaseAdmin
        .from('races')
        .select('id')
        .eq('name', raceName)
        .eq('date', date);
      
      if (existingRaces && existingRaces.length > 0) {
        // Update existing race
        const raceId = existingRaces[0].id;
        console.log(`Updating race: ${raceName}`);
        
        await supabaseAdmin
          .from('races')
          .update({
            circuit: circuitName,
            location,
            name: raceName,
            date,
            ...(lockPicksAt && { lock_picks_at: lockPicksAt }),
            updated_at: new Date().toISOString()
          })
          .eq('id', raceId);
      } else {
        // Create new race
        console.log(`Creating new race: ${raceName}`);
        
        const {error} = await supabaseAdmin  
          .from('races')
          .insert({
            circuit: circuitName,
            location,
            name: raceName,
            date,
            ...(lockPicksAt && { lock_picks_at: lockPicksAt }),
          });
          console.log(error)
      }
    }
    
    console.log(`Successfully upserted ${races.length} races for season ${season}`);

}

// upsertRaces("2025")