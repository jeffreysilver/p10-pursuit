import { createClient } from "@supabase/supabase-js";



console.log("invoked")
const SUPABASE_URL = "https://jagbdwsmqvurpvvmpoap.supabase.co";

export const supabaseAdmin = createClient(
    SUPABASE_URL,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!
);
