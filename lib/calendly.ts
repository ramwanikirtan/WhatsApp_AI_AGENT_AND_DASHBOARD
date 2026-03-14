export function getBookingLink(): string {
  return process.env.CALENDLY_EVENT_URL || "https://calendly.com/";
}

export async function checkCalendlyAvailable(): Promise<boolean> {
  const token = process.env.CALENDLY_API_KEY;
  if (!token) return false;

  try {
    const response = await fetch("https://api.calendly.com/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (err) {
    console.error("Calendly Health Check Error:", err);
    return false;
  }
}
