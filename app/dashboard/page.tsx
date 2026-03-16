import ConversationList from '@/components/ConversationList';
import ThreadView from '@/components/ThreadView';
import PatientDetail from '@/components/PatientDetail';
import { DashboardProvider } from '@/components/DashboardContext';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="min-h-screen w-full bg-slate-900 px-3 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-6xl rounded-2xl bg-white text-gray-900 text-sm shadow-2xl overflow-hidden">
          {/* Left Column: List */}
          <div className="w-[320px] shrink-0 bg-[#111827] flex flex-col h-full">
            <ConversationList />
          </div>

          {/* Middle Column: Thread */}
          <div className="flex-1 flex flex-col h-full bg-[#F7F8FA]">
            <ThreadView />
          </div>

          {/* Right Column: Detail */}
          <div className="w-[300px] shrink-0 border-l border-[#E5E7EB] bg-white flex flex-col h-full">
            <PatientDetail />
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
