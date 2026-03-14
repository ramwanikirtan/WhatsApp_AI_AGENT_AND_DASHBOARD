import ConversationList from '@/components/ConversationList';
import ThreadView from '@/components/ThreadView';
import PatientDetail from '@/components/PatientDetail';
import { DashboardProvider } from '@/components/DashboardContext';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <>
      {/* Mobile Error State */}
      <div className="flex xl:hidden lg:hidden items-center justify-center h-screen w-full p-4 text-center">
        <p className="text-gray-500 text-sm">Dashboard is optimised for desktop. Please use a screen wider than 1024px.</p>
      </div>

      {/* Desktop Layout */}
      <DashboardProvider>
        <div className="hidden lg:flex h-screen w-full bg-white text-gray-900 text-sm overflow-hidden">
          {/* Left Column: List */}
          <div className="w-[320px] shrink-0 border-r border-[#E5E7EB] bg-[#F9FAFB] flex flex-col h-full">
            <ConversationList />
          </div>

          {/* Middle Column: Thread */}
          <div className="flex-1 flex flex-col h-full bg-white relative">
            <ThreadView />
          </div>

          {/* Right Column: Detail */}
          <div className="w-[300px] shrink-0 border-l border-[#E5E7EB] bg-white flex flex-col h-full">
            <PatientDetail />
          </div>
        </div>
      </DashboardProvider>
    </>
  );
}
