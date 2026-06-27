"use client";

import React from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { useUser, SignInButton, SignUpButton } from "@/providers/auth-provider";
import { Sidebar } from "@/components/sidebar";
import { ViewDashboard } from "@/components/view-dashboard";
import { ViewTasks } from "@/components/view-tasks";
import { ViewHabits } from "@/components/view-habits";
import { ViewJournal } from "@/components/view-journal";
import { ViewCoach } from "@/components/view-coach";
import { ViewPlacement } from "@/components/view-placement";
import { ViewCommCoach } from "@/components/view-comm-coach";
import { ViewMemories } from "@/components/view-memories";
import { 
  Sparkles, 
  Flame, 
  GraduationCap, 
  CheckSquare, 
  ArrowRight,
  Fingerprint
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { activeTab } = usePhoenixStore();
  const { isSignedIn, isLoaded } = useUser();

  // If auth is still loading, show a dark premium loading spinner
  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-zinc-500 text-sm font-medium tracking-wide">BOOTING PHOENIX OS...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, render a premium glassmorphic landing / login screen
  if (!isSignedIn) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
        {/* Ambient Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
          {/* Logo & Headline */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-indigo-400" />
              <span>Personal Growth Operating System</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              🔥 PHOENIX OS
            </h1>
            <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Accelerate your habits, optimize speaking pacing, master software engineering interviews, and structure thoughts using intelligent AI cognitive loops.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto"
          >
            <div className="glass-panel p-5 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 w-fit mb-3">
                <CheckSquare size={16} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Smart Task Manager</h3>
              <p className="text-xs text-zinc-500 mt-1">Weighted priority models and AI action recommendation cards.</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit mb-3">
                <Flame size={16} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Habits & Reflection</h3>
              <p className="text-xs text-zinc-500 mt-1">AI-driven streak tracking paired with reflection journal analyzers.</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all">
              <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 w-fit mb-3">
                <GraduationCap size={16} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Placement Copilot</h3>
              <p className="text-xs text-zinc-500 mt-1">DSA syllabus tracking, speech analyzers, and verbal pitch critiques.</p>
            </div>
          </motion.div>

          {/* Login Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto"
          >
            <SignInButton mode="modal">
              <span className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold text-sm transition-all hover:bg-zinc-200 active:scale-[0.98] cursor-pointer shadow-md">
                <Fingerprint size={16} />
                Enter the OS
              </span>
            </SignInButton>
            <SignUpButton mode="modal">
              <span className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold text-sm transition-all hover:bg-zinc-800 active:scale-[0.98] cursor-pointer">
                Create Account
                <ArrowRight size={14} />
              </span>
            </SignUpButton>
          </motion.div>
        </div>
      </div>
    );
  }

  // Render active view component
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
