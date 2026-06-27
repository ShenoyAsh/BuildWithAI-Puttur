"use client";

import React from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  GraduationCap, 
  ArrowRight,
  Target
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export function ViewDashboard() {
  const { 
    tasks, 
    habits, 
    journalEntries, 
    goals, 
    placementTopics, 
    setActiveTab 
  } = usePhoenixStore();

  const pendingTasks = tasks.filter(t => t.status !== "COMPLETED").length;
  const activeHabitsCount = habits.length;
  const averagePlacementScore = Math.round(
    placementTopics.reduce((acc, t) => acc + (t.score || 0), 0) / placementTopics.length
  );

  // Mock data for weekly analytics
  const performanceData = [
    { name: "Mon", tasks: 2, habits: 3, focus: 60 },
    { name: "Tue", tasks: 4, habits: 2, focus: 75 },
    { name: "Wed", tasks: 3, habits: 3, focus: 80 },
    { name: "Thu", tasks: 5, habits: 3, focus: 90 },
    { name: "Fri", tasks: 4, habits: 3, focus: 85 },
    { name: "Sat", tasks: 6, habits: 2, focus: 95 },
    { name: "Sun", tasks: 3, habits: 3, focus: 90 },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Glow Effects */}
      <div className="glow-spot top-0 left-0" />
      <div className="glow-spot-emerald bottom-0 right-0" />

      {/* Top Banner Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
          Welcome back, Alex
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          Here is your growth progress and AI coach recommendations for today.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {/* Tasks Card */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pending Tasks</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{pendingTasks}</h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab("tasks")}>
              View manager <ArrowRight size={10} />
            </p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-indigo-600 dark:text-indigo-400">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Habits Card */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Habit Streaks</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {habits[0]?.streak || 0} Days
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Across {activeHabitsCount} active habits</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Flame size={20} />
          </div>
        </div>

        {/* Placement Readiness */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Placement Readiness</p>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{averagePlacementScore}%</h3>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 flex items-center gap-1 cursor-pointer" onClick={() => setActiveTab("placement")}>
              Practice LeetCode <ArrowRight size={10} />
            </p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-violet-600 dark:text-violet-400">
            <GraduationCap size={20} />
          </div>
        </div>

        {/* Goals Progress */}
        <div className="glass-panel p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Goals Completed</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {goals.filter(g => g.completed).length} / {goals.length}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Long-term targets</p>
          </div>
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-amber-600 dark:text-amber-400">
            <Target size={20} />
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Left Column: Weekly Focus Curve & Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly Growth Chart */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Focus & consistency curve</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Calculated based on habit streaks and task completions</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                <TrendingUp size={12} />
                <span>+12% this week</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--tooltip-bg)", 
                      borderColor: "var(--tooltip-border)", 
                      borderRadius: "8px",
                      color: "var(--body-text)"
                    }}
                    labelStyle={{ color: "var(--body-text)", opacity: 0.8 }}
                  />
                  <Area type="monotone" dataKey="focus" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorFocus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Urgent tasks due</h3>
              <button 
                onClick={() => setActiveTab("tasks")}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 transition-colors font-medium"
              >
                Manage all <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status !== "COMPLETED").slice(0, 3).map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === "HIGH" ? "bg-red-500" : task.priority === "MEDIUM" ? "bg-amber-500" : "bg-zinc-500"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{task.title}</p>
                      {task.dueDate && <p className="text-xs text-zinc-500">Due: {task.dueDate}</p>}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {task.status}
                  </span>
                </div>
              ))}
              {tasks.filter(t => t.status !== "COMPLETED").length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No pending tasks. Great job!</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Suggestion box & Achievements */}
        <div className="space-y-6">
          
          {/* AI Suggestion box */}
          <div className="glass-panel p-6 rounded-xl border border-indigo-500/20 bg-gradient-to-b from-indigo-50/50 to-zinc-100/50 dark:from-indigo-950/20 dark:to-zinc-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
              <Sparkles size={16} />
              <span className="text-sm uppercase tracking-wider font-bold">AI Coach briefing</span>
            </div>
            <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
              &quot;Alex, your LeetCode streak is looking strong at 5 days. However, your graph traversal skills still need practice before the mock interview on Wednesday. I suggest spending 20 minutes solving BFS pathfinding questions today.&quot;
            </p>
            <button 
              onClick={() => setActiveTab("coach")}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>Chat with Coach</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Goal tracker card */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Active Goals</h3>
            <div className="space-y-3">
              {goals.slice(0, 2).map((goal) => (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-800 dark:text-zinc-300 font-medium truncate">{goal.title}</span>
                    <span className="text-xs text-zinc-500">{goal.targetDate}</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: goal.completed ? "100%" : "35%" }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent reflections */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent reflection</h3>
            {journalEntries.slice(0, 1).map((entry) => (
              <div key={entry.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    Mood: {entry.mood}
                  </span>
                  <span className="text-xs text-zinc-500" suppressHydrationWarning>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic line-clamp-3">
                  &quot;{entry.content}&quot;
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
