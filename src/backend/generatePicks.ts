
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define types for our data
interface Race {
  id: string;
  name: string;
  date: string;
}


const SUPABASE_URL = "https://jagbdwsmqvurpvvmpoap.supabase.co";

export const supabaseAdmin = createClient(
    SUPABASE_URL,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!
  );


export async function generatePicks() {
  const { data:races } = await supabaseAdmin
  .from('races')
  .select('*, picks(*)')
  .lt('lock_picks_at', new Date().toISOString())
  .is('picks', null)


    if (!races || races.length === 0) {
    console.log('No races found needing picks')
    return
    }

    for (const race of races) {
        await generatePicksForRace(supabaseAdmin, race)
    }
}


async function generatePicksForRace(supabaseAdmin: SupabaseClient, race: Race) {
    const { data: draftOrder, } = await supabaseAdmin
    .from('draft_positions')
    .select('*')
    .eq('race_id', race.id)
    .order('position', { ascending: true });
    const pickedDriverIds: string[] = []
    for (const draftPosition of draftOrder || []) {
        const {data: userPredictions} = await supabaseAdmin
        .from('predictions')
        .select('*')
        .eq('player_id', draftPosition.user_id)
        .eq('race_id', race.id)
        .limit(1)
        if (!userPredictions || userPredictions.length === 0) {
            console.log(`No predictions found for user ${draftPosition.user_id}`)
            continue
        }
        const drivers: string[] = userPredictions[0].driver_predictions
        const pickedDriver = drivers.find(driver => !pickedDriverIds.includes(driver))
        if (pickedDriver) {
            pickedDriverIds.push(pickedDriver)
            const {data: pick, error: pickError} = await supabaseAdmin
            .from('picks')
            .insert({
                race_id: race.id,
                user_id: draftPosition.user_id,
                driver_id: pickedDriver
            })
            .select()
            .single()
            console.log(pick, pickError)
        }  
    }
}


// generatePicks()