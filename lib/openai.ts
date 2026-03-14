import OpenAI from 'openai';
import { getSystemPrompt } from './system-prompt';
import { Intent } from './intents';
import { getBookingLink, checkCalendlyAvailable } from './calendly';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  intent: Intent;
  reply: string;
}

export async function callOpenAI(
  recentMessages: { direction: 'inbound' | 'outbound'; content: string }[],
  newMessage: string
): Promise<AIResponse> {
  try {
    // 1. Prepare system prompt with dynamic Calendly URL
    let systemContent = getSystemPrompt();
    const calendlyAvailable = await checkCalendlyAvailable();
    
    if (calendlyAvailable) {
      systemContent = systemContent.replace(/{CALENDLY_URL}/g, getBookingLink());
    } else {
      // Fallback if Calendly is down
      systemContent = systemContent.replace(
        /{CALENDLY_URL}/g, 
        "Actually, I'm having a bit of trouble connecting to the booking system right now. Please give us a call on +36 70 312 9771 and we'll get you sorted."
      );
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: systemContent }
    ];

    // 2. Add last 6 messages (3 exchanges) for context
    for (const msg of recentMessages) {
      messages.push({
        role: msg.direction === 'inbound' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // 3. Add the new message
    messages.push({ role: 'user', content: newMessage });

    // 4. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 250, // Keep replies short
    });

    const rawReply = completion.choices[0]?.message?.content || "";

    // 5. Parse Intent and Response
    return parseAIResponse(rawReply);

  } catch (error) {
    console.error("OpenAI API Error:", error);
    // Graceful fallback
    return {
      intent: 'general',
      reply: "Sorry, I'm having a quick technical issue. Please call us on +36 70 312 9771 and we'll sort you out straight away."
    };
  }
}

function parseAIResponse(rawReply: string): AIResponse {
  let intent: Intent = 'general';
  let reply = rawReply;

  // The model is instructed to end with:
  // INTENT: [category]
  // RESPONSE: [message]
  
  const intentMatch = rawReply.match(/INTENT:\s*([a-z_]+)/i);
  if (intentMatch && intentMatch[1]) {
    // Validate it's a known intent
    const parsedIntent = intentMatch[1].toLowerCase();
    const validIntents = [
      'booking_request', 'pricing_query', 'treatment_question', 
      'emergency', 'post_treatment_care', 'hours_location', 
      'insurance_payment', 'general'
    ];
    
    if (validIntents.includes(parsedIntent)) {
      intent = parsedIntent as Intent;
    }
  }

  const responseMatch = rawReply.match(/RESPONSE:\s*([\s\S]*)/i);
  if (responseMatch && responseMatch[1]) {
    reply = responseMatch[1].trim();
  } else {
    // If format fails, try to strip the INTENT part and use the rest
    const parts = rawReply.split(/INTENT:/i);
    if (parts[0].trim()) {
      reply = parts[0].trim();
    }
  }

  return { intent, reply };
}
