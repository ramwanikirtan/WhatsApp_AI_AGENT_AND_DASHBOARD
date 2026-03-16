import ConversationList from '@/components/ConversationList';
import ThreadView from '@/components/ThreadView';
import PatientDetail from '@/components/PatientDetail';
import { DashboardProvider } from '@/components/DashboardContext';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen w-full bg-slate-950 px-3 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-6xl rounded-2xl bg-white/95 text-gray-900 text-sm shadow-xl ring-1 ring-slate-900/10 overflow-hidden backdrop-blur">
          {/* Left Column: List */}
          <div className="w-[320px] shrink-0 border-r border-slate-900/40 bg-[#0F172A] flex flex-col h-full">
            <ConversationList />
          </div>

          {/* Middle Column: Thread */}
          <div className="flex-1 flex flex-col h-full bg-white">
            <ThreadView />
          </div>

          {/* Right Column: Detail */}
          <div className="w-[300px] shrink-0 border-l border-slate-100 bg-slate-50 flex flex-col h-full">
            <PatientDetail />
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
