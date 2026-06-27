"use client";

import React, { useState } from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { 
  Flame, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  Sparkles
} from "lucide-react";

export function ViewHabits() {
  const { habits, addHabit, toggleHabit, deleteHabit } = usePhoenixStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY">("DAILY");
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name,
      description: description.trim() || undefined,
      frequency,
    });

    setName("");
    setDescription("");
    setFrequency("DAILY");
    setShowAddForm(false);
  };

  const getAiHabitInsight = () => {
    const sorted = [...habits].sort((a, b) => b.streak - a.streak);
    if (sorted.length > 0 && sorted[0].streak >= 5) {
      setAiInsight(`Outstanding consistency! Your streak on "${sorted[0].name}" is ${sorted[0].streak} days. Neurological pathways for this routine are solidifying. Keep going!`);
    } else if (habits.length > 0) {
      setAiInsight("Consistency beats intensity. Try to toggle your habits early in the morning. Starting with a small habit like 'Mock Pitch Speaking' builds momentum for the harder tasks.");
    } else {
      setAiInsight("You haven't defined any habits yet. Start with something simple and specific, such as 'LeetCode Daily Challenge (1 Medium)' or 'Night reflection journal (250 words)' to build long-term discipline.");
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="glow-spot-emerald top-0 left-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Maintain daily consistency to unlock neural-rewiring achievements.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={getAiHabitInsight}
            className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:bg-emerald-600/30"
          >
            <Sparkles size={16} />
            <span>AI Habit Insights</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-white text-black hover:bg-zinc-200 active:scale-[0.98] rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* AI Habit Insight */}
      {aiInsight && (
        <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex gap-3 relative z-10">
          <div className="text-emerald-400 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-300">Habit Coach</p>
            <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{aiInsight}</p>
          </div>
          <button onClick={() => setAiInsight(null)} className="text-zinc-500 hover:text-zinc-300 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Create Habit Form */}
      {showAddForm && (
        <form onSubmit={handleCreateHabit} className="glass-panel p-6 rounded-xl space-y-4 relative z-10 border border-zinc-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create New Habit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Habit Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., LeetCode Daily Challenge"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as "DAILY" | "WEEKLY")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Solve 1 Medium or Hard question to keep skills sharp..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-colors"
            >
              Add Habit
            </button>
          </div>
        </form>
      )}

      {/* Habit List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {habits.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel rounded-xl">
            <Flame size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-400 text-sm">No habits defined yet. Build your first routine now!</p>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompletedToday = habit.history.includes(todayStr);

            return (
              <div
                key={habit.id}
                className="glass-panel p-5 rounded-xl border border-zinc-900 flex flex-col justify-between hover:border-zinc-800 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{habit.name}</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wider">{habit.frequency}</p>
                    </div>
                    <button
                      onClick={() => toggleHabit(habit.id, todayStr)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                        isCompletedToday
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                          : "border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-white"
                      }`}
                    >
                      <Check size={16} />
                    </button>
                  </div>
                  {habit.description && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {habit.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Flame size={16} className={habit.streak > 0 ? "animate-pulse" : ""} />
                    <span className="text-xs font-bold">{habit.streak} Day Streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {habit.history.length} completions
                    </span>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-zinc-600 hover:text-red-400 p-1.5 rounded-md hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
