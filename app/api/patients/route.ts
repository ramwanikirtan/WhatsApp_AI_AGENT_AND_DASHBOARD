import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // In PostgreSQL, DISTINCT ON is supported via Supabase RPC or custom queries.
    // However, Supabase JS doesn't natively support DISTINCT ON elegantly via standard select.
    // We can fetch all recent messages and deduplicate in JS, or create a view.
    // For this build, if the patient volume is low, we fetch messages ordered by created_at DESC 
    // and deduplicate by phone number in JS to construct the recent conversations list.
    
    // In a massive production system, we would use a SQL View or RPC.
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      // fetching up to 1000 latest messages to construct the patient list
      .limit(1000);

    if (error) {
      throw error;
    }

    // Deduplicate by patient_phone to get unique patients and their latest message
    const patientMap = new Map();
    const patients = [];

    for (const msg of (messages || [])) {
      if (!patientMap.has(msg.patient_phone)) {
        patientMap.set(msg.patient_phone, {
          phone: msg.patient_phone,
          lastMessageId: msg.id,
          lastMessageContent: msg.content,
          lastMessageTime: msg.created_at,
          lastIntent: msg.intent,
          totalMessages: 1,
          firstContact: msg.created_at,
        });
        patients.push(patientMap.get(msg.patient_phone));
      } else {
        const p = patientMap.get(msg.patient_phone);
        p.totalMessages += 1;
        // Since we iterate from newest to oldest, the first one seen is the lastMessage Time
        // The last one seen will be the oldest (firstContact)
        p.firstContact = msg.created_at; 
      }
    }

    return NextResponse.json({ patients });
  } catch (err) {
    console.error("GET /api/patients Error:", err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
