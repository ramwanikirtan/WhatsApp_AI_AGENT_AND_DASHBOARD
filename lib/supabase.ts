import { createClient } from '@supabase/supabase-js';
import { Intent } from './intents';

// detect environment
const isServer = typeof window === 'undefined';

// Ensure we have the required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = isServer 
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

if (!supabaseUrl || !supabaseKey) {
  if (isServer) {
    console.warn("Supabase credentials missing. Check .env.local");
  }
}

// We use the service role key (on server) to bypass RLS for server-side webhook processing
// On client, we use the anon key for real-time subscriptions
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Message {
  id: string;
  patient_phone: string;
  direction: "inbound" | "outbound";
  content: string;
  intent: Intent | null;
  created_at: string;
}

/**
 * Ensures the messages table exists in the database.
 * We attempt a lightweight query. If it fails with a relation error, we run the setup.
 */
export async function ensureMessagesTable() {
  try {
    const { error } = await supabase.from('messages').select('id').limit(1);
    
    // Postgres error code 42P01 is undefined_table
    if (error && error.code === '42P01') {
      console.log("Messages table not found. Creating it...");
      
      // Execute raw SQL to create the table using RPC
      // Note: This requires an RPC function named 'execute_sql' to exist.
      // Alternatively, we can use the Supabase JS client to insert data if RLS is off,
      // but creating tables requires SQL access. If RPC isn't configured,
      // you would normally run this SQL directly in the Supabase SQL editor:
      /*
        CREATE TABLE messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          patient_phone TEXT NOT NULL,
          direction TEXT NOT NULL,
          content TEXT NOT NULL,
          intent TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      */
      
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
        console.error("Failed to auto-create table. Please run the SQL manually in Supabase.", rpcError);
        console.log(`Run this SQL:\nCREATE TABLE messages (\nid UUID PRIMARY KEY DEFAULT gen_random_uuid(),\npatient_phone TEXT NOT NULL,\ndirection TEXT NOT NULL,\ncontent TEXT NOT NULL,\nintent TEXT,\ncreated_at TIMESTAMPTZ DEFAULT NOW()\n);`);
      } else {
        console.log("Messages table created successfully.");
      }
    }
  } catch (err) {
    console.error("Error checking/creating messages table:", err);
  }
}
