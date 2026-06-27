"use client";

import React from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { useUser, UserButton } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Volume2,
  BrainCircuit,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activeTab, setActiveTab } = usePhoenixStore();
  const { user } = useUser();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Task Manager", icon: CheckSquare },
    { id: "habits", label: "Habit Tracker", icon: Flame },
    { id: "journal", label: "Reflection Journal", icon: BookOpen },
    { id: "coach", label: "AI Coach", icon: MessageSquare },
    { id: "placement", label: "Placement Copilot", icon: GraduationCap },
    { id: "comm-coach", label: "Comm Coach", icon: Volume2 },
    { id: "memories", label: "AI Memory", icon: BrainCircuit },
  ];

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-all duration-300 z-30",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Header Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-900">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
            <span className="text-xl">🔥</span>
            <span>PHOENIX OS</span>
          </div>
        ) : (
          <span className="text-xl mx-auto">🔥</span>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-inner border-l-2 border-indigo-500"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white"
                )}
              />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-16 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md border border-zinc-200 dark:border-zinc-800">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Switcher */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-900">
        <ThemeToggle minimal={!sidebarOpen} />
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">LOGGED IN AS</p>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {user?.fullName || "Phoenix User"}
              </p>
            </div>
            <UserButton />
          </div>
        ) : (
          <div className="mx-auto">
            <UserButton />
          </div>
        )}
      </div>
    </aside>
  );
}

