import { format, parseISO, isSameDay } from "date-fns";

interface MessageBubbleProps {
  content: string;
  direction: "inbound" | "outbound";
  timestamp: string;
}

export default function MessageBubble({ content, direction, timestamp }: MessageBubbleProps) {
  const date = parseISO(timestamp);
  const now = new Date();
  
  // Format: "14:32" if today, "12 Jan 14:32" if earlier
  const timeString = isSameDay(date, now) 
    ? format(date, "HH:mm") 
    : format(date, "d MMM HH:mm");

  const isInbound = direction === "inbound";

  return (
    <div className={`flex w-full ${isInbound ? "justify-start" : "justify-end"} mb-2`}>
      <div className={`flex flex-col max-w-[70%] ${isInbound ? "items-start" : "items-end"}`}>
        <div
          className={`px-[12px] py-[8px] rounded-[4px] whitespace-pre-wrap ${
            isInbound
              ? "bg-[#F3F4F6] text-[#111827]"
              : "bg-agentBlue text-white"
          }`}
        >
          {content}
        </div>
        <span className="text-[11px] font-mono text-[#9CA3AF] mt-1 px-1">
          {timeString}
        </span>
      </div>
    </div>
  );
}
