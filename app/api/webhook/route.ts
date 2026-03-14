import { NextResponse } from 'next/server';
import { supabase, ensureMessagesTable } from '@/lib/supabase';
import { extractMessageFromPayload, markAsRead, sendWhatsAppMessage } from '@/lib/whatsapp';
import { callOpenAI } from '@/lib/openai';

// The WhatsApp verification token
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

/**
 * Handle Webhook Verification (GET request)
 * WhatsApp sends a GET request to verify the webhook URL.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified correctly');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

/**
 * Handle Incoming Messages (POST request)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract the message details safely
    const extracted = extractMessageFromPayload(body);
    
    if (!extracted) {
      // Not a text message or invalid payload, acknowledge immediately
      return new NextResponse('OK', { status: 200 });
    }

    const { from, text, messageId } = extracted;

    // Acknowledge immediately to avoid WhatsApp retries (must be < 3 seconds)
    // We process the rest asynchronously. In Next.js App Router API routes on some platforms,
    // background processing after response requires specific handling (like waitUntil on Vercel),
    // but standard promises work locally.

    // Background processing task
    const processMessage = async () => {
      try {
        // Ensure table exists on first run
        await ensureMessagesTable();

        // 1. Deduplication check
        const { data: existingMsg } = await supabase
          .from('messages')
          .select('id')
          .eq('patient_phone', from)
          .eq('direction', 'inbound')
          // we use the WhatsApp message ID as part of unique logic if we added it,
          // but for now we just verify we haven't seen this exact text extremely recently.
          // Since WhatsApp sends retries if webhook takes too long, we can check for recent identical messages.
          .eq('content', text)
          .gte('created_at', new Date(Date.now() - 60000).toISOString())
          .limit(1);

        if (existingMsg && existingMsg.length > 0) {
          console.log(`Duplicate message detected from ${from}, ignoring.`);
          return;
        }

        // 2. Log Inbound Message
        await supabase.from('messages').insert({
          patient_phone: from,
          direction: 'inbound',
          content: text,
          intent: 'general', // initial state before AI processes
        });

        // 3. Fetch context (last 6 messages)
        const { data: recentMsgs } = await supabase
          .from('messages')
          .select('direction, content')
          .eq('patient_phone', from)
          .order('created_at', { ascending: false })
          .limit(6);
          
        const context = (recentMsgs || []).reverse() as { direction: 'inbound'|'outbound'; content: string }[];

        // 4. Call OpenAI
        const aiResponse = await callOpenAI(context, text);
        
        // 5. Log Outbound Message
        await supabase.from('messages').insert({
          patient_phone: from,
          direction: 'outbound',
          content: aiResponse.reply,
          intent: aiResponse.intent,
        });

        // 6. Send WhatsApp Reply
        await sendWhatsAppMessage(from, aiResponse.reply);

        // 7. Update the inbound message intent (optional, since we already saved it as general)
        // For simplicity, we just leave it or overwrite it if needed. 
        // We will update it so the dashboard shows the detected intent for the inbound query.
        await supabase
          .from('messages')
          .update({ intent: aiResponse.intent })
          .eq('patient_phone', from)
          .eq('direction', 'inbound')
          .order('created_at', { ascending: false })
          .limit(1);

        // 8. Mark original message as read
        await markAsRead(messageId);

      } catch (err) {
        console.error("Error in background message processing:", err);
      }
    };

    // Start background processing without awaiting
    processMessage();

    // Return 200 OK immediately
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error("Webhook POST Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
