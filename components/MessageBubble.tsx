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
      <div className={`flex ${isInbound ? "items-end gap-2" : ""}`}>
        {isInbound && (
          <div className="h-8 w-8 shrink-0 rounded-full bg-[#0D9488] text-white text-[11px] font-semibold flex items-center justify-center">
            PT
          </div>
        )}
        <div className={`flex flex-col max-w-[70%] ${isInbound ? "items-start" : "items-end"}`}>
          <div
            className={`px-3 py-2 whitespace-pre-wrap text-[13px] leading-relaxed ${
              isInbound
                ? "bg-white text-slate-900 shadow-sm rounded-[18px] rounded-bl-[4px]"
                : "bg-[#0D9488] text-white rounded-[18px] rounded-br-[4px]"
            }`}
          >
            {content}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {timeString}
          </span>
        </div>
      </div>
    </div>
  );
}
