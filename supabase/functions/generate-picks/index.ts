import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req)=>{
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    await generatePicks(supabase);
    return new Response(JSON.stringify({
      ok: true
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

export async function generatePicks(supabaseAdmin) {
  const { data: races } = await supabaseAdmin.from('races').select('*, picks(*)').lt('lock_picks_at', new Date().toISOString()).is('picks', null);
  if (!races || races.length === 0) {
    console.log('No races found needing picks', races);
    return;
  }
  for (const race of races){
    await generatePicksForRace(supabaseAdmin, race);
  }
}

async function generatePicksForRace(supabaseAdmin, race) {
  const { data: draftOrder } = await supabaseAdmin.from('draft_positions').select('*').eq('race_id', race.id).order('position', {
    ascending: true
  });
  const pickedDriverIds = [];
  for (const draftPosition of draftOrder || []){
    const { data: userPredictions } = await supabaseAdmin.from('predictions').select('*').eq('player_id', draftPosition.user_id).eq('race_id', race.id).limit(1);
    if (!userPredictions || userPredictions.length === 0) {
      console.log(`No predictions found for user ${draftPosition.user_id}`);
      continue;
    }
    const drivers = userPredictions[0].driver_predictions;
    const pickedDriver = drivers.find((driver)=>!pickedDriverIds.includes(driver));
    if (pickedDriver) {
      pickedDriverIds.push(pickedDriver);
      const { data: pick, error: pickError } = await supabaseAdmin.from('picks').insert({
        race_id: race.id,
        user_id: draftPosition.user_id,
        driver_id: pickedDriver
      }).select().single();
      console.log(pick, pickError);
    }
  }
}
