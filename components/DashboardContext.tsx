"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  selectedPhone: string | null;
  setSelectedPhone: (phone: string | null) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <DashboardContext.Provider value={{ selectedPhone, setSelectedPhone, refreshTrigger, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
