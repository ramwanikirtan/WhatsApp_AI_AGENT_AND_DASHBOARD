"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useDashboard } from "./DashboardContext";
import MessageBubble from "./MessageBubble";
import { Message } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ThreadView() {
  const { selectedPhone, triggerRefresh } = useDashboard();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!selectedPhone) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/${encodeURIComponent(selectedPhone)}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
          scrollToBottom();
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedPhone]);

  // Real-time subscription (Phase 6 features integrated natively)
  useEffect(() => {
    // We subscribe generally to the messages table to catch both specific patient
    // active thread events and to trigger list refreshes for other patients.
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          
          if (selectedPhone && newMsg.patient_phone === selectedPhone) {
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          }
          
          // Triggers the ConversationList and PatientDetail to update
          triggerRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPhone, triggerRefresh]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    // Hook into outbound message sending here if needed.
    setDraft("");
  };

  if (!selectedPhone) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white text-slate-400">
        <MessageSquare className="h-12 w-12 text-slate-200 mb-4" />
        <p className="text-sm">Select a conversation</p>
      </div>
    );
  }

  const firstContact = messages.length > 0 ? messages[0].created_at : null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Thread Header */}
      <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <h2 className="font-mono font-semibold text-[15px] text-slate-900">
          {selectedPhone}
        </h2>
        <div className="text-[11px] text-slate-500 mt-1">
          {firstContact 
            ? `First contact: ${format(parseISO(firstContact), "dd MMM yyyy")}`
            : "Loading..."}
        </div>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 scroll-smooth bg-white"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-[#6366F1] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 pb-6">
            {messages.map((msg, idx) => {
              // Add extra margin top if previous message was from different sender
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const isDifferentSender = prevMsg && prevMsg.direction !== msg.direction;
              
              return (
                <div key={msg.id} className={isDifferentSender ? "mt-3" : ""}>
                  <MessageBubble 
                    content={msg.content}
                    direction={msg.direction}
                    timestamp={msg.created_at}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-slate-100 bg-white px-4 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#4F46E5] disabled:opacity-60"
            disabled={!draft.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
