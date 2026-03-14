"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "./DashboardContext";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { Intent, INTENT_COLORS } from "@/lib/intents";
import { Copy, Calendar } from "lucide-react";
import { Message } from "@/lib/supabase";

interface PatientStats {
  phone: string;
  totalMessages: number;
  firstContact: string;
  lastActive: string;
  intents: Intent[];
}

export default function PatientDetail() {
  const { selectedPhone, refreshTrigger } = useDashboard();
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [sending, setSending] = useState(false);
  const [, setNow] = useState(new Date());

  // Force re-render periodically to update relative times
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedPhone) {
      setStats(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/messages/${encodeURIComponent(selectedPhone)}`);
        if (res.ok) {
          const data = await res.json();
          const messages = data.messages as Message[];
          
          if (messages.length > 0) {
            setStats({
              phone: selectedPhone,
              totalMessages: messages.length,
              firstContact: messages[0].created_at,
              lastActive: messages[messages.length - 1].created_at,
              intents: data.intents.filter(Boolean),
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch patient details:", err);
      }
    };

    fetchDetails();
  }, [selectedPhone, refreshTrigger]);

  const handleCopy = () => {
    if (selectedPhone) {
      navigator.clipboard.writeText(selectedPhone);
    }
  };

  const handleSendBooking = async () => {
    if (!selectedPhone) return;
    setSending(true);
    try {
      const res = await fetch("/api/send-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: selectedPhone }),
      });
      // The real-time thread subscription will automatically catch the inserted message
      if (!res.ok) {
        alert("Failed to send booking link.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending booking link");
    } finally {
      setSending(false);
    }
  };

  if (!selectedPhone || !stats) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 p-4text-center">
        <p className="text-sm">Select a patient to view details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-[#E5E7EB]">
        <h2 className="font-bold text-[14px] uppercase tracking-wide text-gray-900">
          Patient Details
        </h2>
      </div>

      <div className="p-4 flex flex-col gap-6 overflow-y-auto">
        {/* Phone */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[16px] text-gray-900">
              {stats.phone}
            </span>
            <button 
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-bold text-[18px] text-gray-900">
              {stats.totalMessages}
            </div>
            <div className="text-[12px] text-gray-500">
              messages
            </div>
          </div>
          <div>
            <div className="font-mono text-[13px] text-gray-900 mt-1 truncate">
              {formatDistanceToNow(parseISO(stats.lastActive), { addSuffix: true })}
            </div>
            <div className="text-[12px] text-gray-500">
              last active
            </div>
          </div>
        </div>

        <div>
          <div className="font-mono text-[13px] text-gray-900">
            {format(parseISO(stats.firstContact), "dd MMMM yyyy, HH:mm")}
          </div>
          <div className="text-[12px] text-gray-500">
            first contact
          </div>
        </div>

        {/* Intents */}
        {stats.intents.length > 0 && (
          <div>
            <div className="text-[12px] text-gray-500 mb-2">
              INTENTS SEEN
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.intents.map((intent) => {
                const color = INTENT_COLORS[intent] || INTENT_COLORS.general;
                return (
                  <span 
                    key={intent}
                    className="text-[11px] px-2 py-1 rounded-[4px] border uppercase"
                    style={{ borderColor: color, color: color }}
                  >
                    {intent.replace('_', ' ')}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <button
            onClick={handleSendBooking}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2 px-4 rounded-[4px] font-medium text-[13px] transition-colors disabled:opacity-70"
          >
            <Calendar className="h-4 w-4" />
            {sending ? "Sending..." : "Send booking link"}
          </button>
        </div>
      </div>
    </div>
  );
}
