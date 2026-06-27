"use client";

import React from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { Sidebar } from "@/components/sidebar";
import { ViewDashboard } from "@/components/view-dashboard";
import { ViewTasks } from "@/components/view-tasks";
import { ViewHabits } from "@/components/view-habits";
import { ViewJournal } from "@/components/view-journal";
import { ViewCoach } from "@/components/view-coach";
import { ViewPlacement } from "@/components/view-placement";
import { ViewCommCoach } from "@/components/view-comm-coach";
import { ViewMemories } from "@/components/view-memories";

export default function Home() {
  const { activeTab } = usePhoenixStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <ViewDashboard />;
      case "tasks":
        return <ViewTasks />;
      case "habits":
        return <ViewHabits />;
      case "journal":
        return <ViewJournal />;
      case "coach":
        return <ViewCoach />;
      case "placement":
        return <ViewPlacement />;
      case "comm-coach":
        return <ViewCommCoach />;
      case "memories":
        return <ViewMemories />;
      default:
        return <ViewDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto px-6 md:px-12 py-8 bg-zinc-100/40 dark:bg-zinc-950/60 relative scroll-smooth">
        {renderActiveView()}
      </main>
    </div>
  );
}
