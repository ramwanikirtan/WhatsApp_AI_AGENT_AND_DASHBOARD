"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "./DashboardContext";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Intent, INTENT_COLORS } from "@/lib/intents";
import { Search } from "lucide-react";

interface PatientSummary {
  phone: string;
  lastMessageId: string;
  lastMessageContent: string;
  lastMessageTime: string;
  lastIntent: Intent | null;
  totalMessages: number;
  firstContact: string;
}

export default function ConversationList() {
  const { selectedPhone, setSelectedPhone, refreshTrigger } = useDashboard();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const endpoint = process.env.NEXT_PUBLIC_PATIENTS_API_URL || "/api/patients";
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setPatients(data.patients);
        }
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [refreshTrigger]);

  const filteredPatients = patients.filter((p) =>
    p.phone.includes(search)
  );

  return (
    <div className="flex flex-col h-full text-slate-100">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm tracking-tight text-slate-50">Conversations</h2>
          <span className="bg-white/10 text-slate-100 text-[11px] px-2 py-1 rounded-full">
            {patients.length}
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by phone number..."
            className="w-full pl-10 pr-3 py-2.5 bg-slate-900/40 border border-white/10 rounded-full outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent placeholder:text-slate-400 text-xs text-slate-100 transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No conversations yet
          </div>
        ) : (
          filteredPatients.map((p) => {
            const isSelected = selectedPhone === p.phone;
            const intentColor = p.lastIntent ? INTENT_COLORS[p.lastIntent] : INTENT_COLORS.general;
            const initials = p.phone.replace('+', '').slice(-2) || "PT";

            return (
              <button
                key={p.phone}
                onClick={() => setSelectedPhone(p.phone)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors flex items-start gap-3 relative ${
                  isSelected
                    ? "bg-white/5 border-l-[3px] border-l-[#6366F1]"
                    : "hover:bg-white/5 border-l-[3px] border-l-transparent"
                }`}
              >
                <div className="relative shrink-0 mt-0.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[11px] font-medium text-slate-50">
                    {initials}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#0F172A]"
                    style={{ backgroundColor: intentColor }}
                    title={p.lastIntent || "general"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-[13px] font-semibold text-slate-50 truncate pr-2">
                      {p.phone}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 shrink-0">
                      {formatDistanceToNow(parseISO(p.lastMessageTime), { addSuffix: true })
                        .replace('about ', '')
                        .replace(' minutes', 'm')
                        .replace(' hours', 'h')
                        .replace(' days', 'd')}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-300 truncate leading-snug">
                    {p.lastMessageContent}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
