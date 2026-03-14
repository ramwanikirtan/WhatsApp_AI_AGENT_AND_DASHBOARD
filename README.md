# Forest & Ray Dental Clinic — WhatsApp AI Agent & Dashboard

A production-ready solution featuring an AI-driven WhatsApp receptionist and a real-time provider dashboard. Built for Forest & Ray Dental Clinic to automate patient inquiries, triage emergencies, and manage appointment bookings.

## 🚀 Key Features

- **24/7 AI Receptionist**: Powered by OpenAI `gpt-4o` with specialized dental knowledge.
- **WhatsApp Integration**: Bi-directional communication using the Meta WhatsApp Cloud API.
- **Smart Triage**: Automated emergency categorization (P1 to P4) for instant patient guidance.
- **Real-Time Dashboard**: A high-performance 3-column UI for staff to monitor and supervise conversations.
- **Patient Management**: Automatic intent classification (Booking, Pricing, Emergency, etc.) for every patient.
- **Calendly Booking**: Seamless integration with scheduling services.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: Supabase (PostgreSQL + Realtime)
- **AI**: OpenAI API (`gpt-4o`)
- **Styling**: Tailwind CSS
- **Design System**: IBM Plex Fonts, minimal border-radius, premium medical aesthetic.

## ⚙️ Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory and populate it with the following keys:

```bash
# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_secret_token

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Public keys for client-side hydration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Calendly
CALENDLY_API_KEY=your_calendly_api_key
CALENDLY_EVENT_URL=your_booking_url
```

### 2. Database Schema
Run the following SQL in your Supabase SQL Editor to initialize the message persistence and enable real-time updates:

```sql
-- Create the messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_phone TEXT NOT NULL,
  direction TEXT NOT NULL,
  content TEXT NOT NULL,
  intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for the dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

The dashboard will be available at `http://localhost:3000/dashboard`.

## 📈 Triage & Intent Mapping

The AI automatically classifies messages into the following intents to help clinic staff prioritize:
- `emergency`: Immediate attention required.
- `booking_request`: Patient seeking an appointment.
- `pricing_query`: Questions regarding treatment costs.
- `post_care`: Questions after a procedure.
- `insurance`: Coverage and payment inquiries.
- `general`: Standard greeting or clinic information.

## 🔒 Security & Performance

- **Service Role Bypass**: The backend uses Supabase Service Role keys to manage data securely without complex RLS for webhooks.
- **Hydration Resilience**: Client-side components are protected against browser extension injection (Bitdefender, Grammerly, etc.) using suppression headers for a stable UI.
- **Atomic Components**: Pure Vanilla CSS implementation within Tailwind for exact spec adherence.

---
*Developed for Forest & Ray Dental Clinic.*
