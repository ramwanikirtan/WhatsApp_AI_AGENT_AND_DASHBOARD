export interface WhatsAppMessagePayload {
  messaging_product: string;
  recipient_type: string;
  to: string;
  type: string;
  text: {
    preview_url: boolean;
    body: string;
  };
}

export async function sendWhatsAppMessage(to: string, text: string, retryCount = 0): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.error("WhatsApp credentials missing");
    return false;
  }

  const payload: WhatsAppMessagePayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: {
      preview_url: false,
      body: text,
    },
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WhatsApp Send API Error (${response.status}):`, errorText);
      
      // Retry once on failure
      if (retryCount === 0) {
        console.log("Retrying WhatsApp message send after 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return sendWhatsAppMessage(to, text, 1);
      }
      return false;
    }

    return true;
  } catch (error) {
    console.error("WhatsApp Request Error:", error);
    if (retryCount === 0) {
      console.log("Retrying WhatsApp message send after 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return sendWhatsAppMessage(to, text, 1);
    }
    return false;
  }
}

export async function markAsRead(messageId: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error marking message as read:", error);
    return false;
  }
}

// Helper to extract message from the webhook payload safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractMessageFromPayload(body: any): { from: string; text: string; messageId: string } | null {
  try {
    if (body.object === 'whatsapp_business_account' && body.entry && body.entry.length > 0) {
      for (const entry of body.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            const value = change.value;
            // We only process incoming text messages, ignore status updates
            if (value && value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              if (message.type === 'text' && message.text && message.text.body) {
                return {
                  from: message.from,
                  text: message.text.body,
                  messageId: message.id
                };
              }
            }
          }
        }
      }
    }
    return null;
  } catch (e) {
    console.error("Error extracting message:", e);
    return null;
  }
}
