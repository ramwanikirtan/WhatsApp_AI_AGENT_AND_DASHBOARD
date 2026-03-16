"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "./DashboardContext";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { Intent } from "@/lib/intents";
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
      <div className="h-full flex items-center justify-center text-slate-400 px-4 text-center">
        <p className="text-sm">Select a patient on the left to see details here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 bg-white shadow-sm">
        <h2 className="font-heading font-semibold text-[16px] tracking-tight text-slate-900">
          Patient Details
        </h2>
      </div>

      <div className="p-4 flex flex-col gap-6 overflow-y-auto">
        {/* Phone */}
        <div>
          <div className="text-[11px] font-medium text-slate-500 mb-1 uppercase tracking-wide">
            WhatsApp number
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <span className="text-[13px] font-semibold text-slate-900">
              {stats.phone}
            </span>
            <button 
              onClick={handleCopy}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500 hover:text-slate-700 transition-colors duration-150 ease-in-out"
              title="Copy to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 px-3 py-3 shadow-sm">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">
              Messages
            </div>
            <div className="text-[20px] font-semibold text-slate-900">
              {stats.totalMessages}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-3 shadow-sm">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">
              Last active
            </div>
            <div className="text-[13px] font-semibold text-slate-900 truncate">
              {formatDistanceToNow(parseISO(stats.lastActive), { addSuffix: true })}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">
            First contact
          </div>
          <div className="text-[13px] font-semibold text-slate-900">
            {format(parseISO(stats.firstContact), "dd MMMM yyyy, HH:mm")}
          </div>
        </div>

        {/* Intents */}
        {stats.intents.length > 0 && (
          <div>
            <div className="text-[11px] text-slate-500 mb-2 font-medium tracking-wide">
              Intents seen
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.intents.map((intent) => {
                const isBooking = intent === "booking_request";
                const color = isBooking ? "#0D9488" : "#9CA3AF";
                return (
                  <span 
                    key={intent}
                    className="text-[10px] px-2.5 py-1 rounded-full uppercase font-semibold"
                    style={{
                      color: color,
                      backgroundColor: isBooking ? "#0D948820" : "#9CA3AF20",
                    }}
                  >
                    {intent.replace("_", " ")}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <button
            onClick={handleSendBooking}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white py-2.5 px-4 rounded-[10px] font-medium text-[13px] transition-all duration-150 ease-in-out disabled:opacity-70 shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            {sending ? "Sending..." : "Send booking link"}
          </button>
        </div>
      </div>
    </div>
  );
}
