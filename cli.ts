#!/usr/bin/env bun
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createClient } from "@supabase/supabase-js";
import { generatePicks } from './supabase/functions/generate-picks/impl.ts';
import { generateNextRaceDraftPositions } from './supabase/functions/generate-draft-positions/impl.ts';
import { processRecentRaces } from './supabase/functions/process-recent-race-results/impl.ts';
const SUPABASE_URL = "https://jagbdwsmqvurpvvmpoap.supabase.co";

// Initialize Supabase client
const supabaseAdmin = createClient(
    SUPABASE_URL,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

async function handleGeneratePicks() {
    await generatePicks(supabaseAdmin);
}

async function handleGenerateDraftPositions() {
    await generateNextRaceDraftPositions(supabaseAdmin);
}

async function handleProcessRecentRaceResults() {
    await processRecentRaces(supabaseAdmin);
}

// Create CLI with yargs
yargs(hideBin(process.argv))
  .scriptName('checkered-flag-cli')
  .version('1.0.0')
  .usage('Usage: $0 <command> [options]')
  .command('generate-picks', 'Generate picks', handleGeneratePicks)
  .command('generate-draft-positions', 'Generate draft positions', handleGenerateDraftPositions)
  .command('process-recent-race-results', 'Process recent race results', handleProcessRecentRaceResults)
  .demandCommand(1, 'You need to specify a command')
  .help('h')
  .alias('h', 'help')
  .epilogue('For more information, check out the documentation')
  .parse(); 