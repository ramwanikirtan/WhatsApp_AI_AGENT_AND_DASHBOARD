"use client";

import { useEffect, useRef, useState } from "react";
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

  if (!selectedPhone) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <MessageSquare className="h-12 w-12 text-gray-200 mb-4" />
        <p className="text-sm">Select a conversation</p>
      </div>
    );
  }

  const firstContact = messages.length > 0 ? messages[0].created_at : null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Thread Header */}
      <div className="p-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
        <h2 className="font-mono font-bold text-[16px] text-gray-900">
          {selectedPhone}
        </h2>
        <div className="text-[12px] text-gray-500 mt-1">
          {firstContact 
            ? `First contact: ${format(parseISO(firstContact), "dd MMM yyyy")}`
            : "Loading..."}
        </div>
      </div>

      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 pb-4">
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
    </div>
  );
}
