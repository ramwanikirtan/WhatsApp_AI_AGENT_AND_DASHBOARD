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
        const res = await fetch("/api/patients");
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
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[16px]">Conversations</h2>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            {patients.length}
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by phone number..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-[2px] outline-none focus:border-blue-500 placeholder-gray-400 text-sm transition-colors"
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
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No conversations yet
          </div>
        ) : (
          filteredPatients.map((p) => {
            const isSelected = selectedPhone === p.phone;
            const intentColor = p.lastIntent ? INTENT_COLORS[p.lastIntent] : INTENT_COLORS.general;

            return (
              <button
                key={p.phone}
                onClick={() => setSelectedPhone(p.phone)}
                className={`w-full text-left p-4 border-b border-[#F3F4F6] transition-colors flex items-start gap-3 relative ${
                  isSelected ? "bg-blue-50 border-l-[3px] border-l-blue-600 pl-[13px]" : "hover:bg-gray-50 border-l-[3px] border-l-transparent pl-[13px]"
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0" 
                  style={{ backgroundColor: intentColor }}
                  title={p.lastIntent || "general"}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-[14px] text-gray-900 truncate pr-2">
                      {p.phone}
                    </span>
                    <span className="font-mono text-[11px] text-gray-400 shrink-0">
                      {formatDistanceToNow(parseISO(p.lastMessageTime), { addSuffix: true })
                        .replace('about ', '')
                        .replace(' minutes', 'm')
                        .replace(' hours', 'h')
                        .replace(' days', 'd')}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 truncate leading-snug">
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
