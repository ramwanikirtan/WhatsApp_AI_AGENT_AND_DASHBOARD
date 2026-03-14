import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params;
    
    // Decode phone number as it might be URL encoded (e.g. +36... -> %2B36...)
    const decodedPhone = decodeURIComponent(phone);

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('patient_phone', decodedPhone)
      .order('created_at', { ascending: true }); // Chronological order for thread view

    if (error) {
      throw error;
    }

    // Get unique intents across the history
    const intents = Array.from(new Set((messages || []).map(m => m.intent).filter(Boolean)));

    return NextResponse.json({
      messages: messages || [],
      intents
    });
  } catch (err) {
    console.error(`GET /api/messages/[phone] Error:`, err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
