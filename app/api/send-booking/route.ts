import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { getBookingLink } from '@/lib/calendly';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return new NextResponse('Phone number is required', { status: 400 });
    }

    const bookingText = `We've got availability this week. Here's the link to grab a slot — it only takes a minute: ${getBookingLink()}. Once you've booked, you'll get a confirmation by email.`;

    // 1. Log outbound message
    await supabase.from('messages').insert({
      patient_phone: phone,
      direction: 'outbound',
      content: bookingText,
      intent: 'booking_request',
    });

    // 2. Send via WhatsApp
    const success = await sendWhatsAppMessage(phone, bookingText);

    if (!success) {
      return new NextResponse('Failed to send WhatsApp message', { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/send-booking Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
