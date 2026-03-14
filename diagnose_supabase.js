const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing connection to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  try {
    const { data, error } = await supabase.from('messages').select('id').limit(1);
    if (error) {
      console.log('Query error:', error);
      if (error.code === '42P01') {
        console.log('Table messages does not exist. Attempting creation...');
        const { error: rpcError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS messages (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              patient_phone TEXT NOT NULL,
              direction TEXT NOT NULL,
              content TEXT NOT NULL,
              intent TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        });
        if (rpcError) {
          console.error('RPC creation failed (execute_sql not found?):', rpcError);
          console.log('Manual SQL required in Supabase Dashboard.');
        } else {
          console.log('Table created successfully via RPC.');
        }
      }
    } else {
      console.log('Successfully queried messages table:', data);
    }
  } catch (err) {
    console.error('Diagnostic failed:', err);
  }
}

diagnose();
