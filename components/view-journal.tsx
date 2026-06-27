"use client";

import React, { useState } from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { analyzeJournalContent } from "@/actions/analyze-journal";
import { 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Loader2,
  Activity
} from "lucide-react";

export function ViewJournal() {
  const { journalEntries, addJournalEntry } = usePhoenixStore();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 10) {
      setError("Please write at least 10 characters before submitting.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      // Call server action for AI evaluation
      const result = await analyzeJournalContent(content);

      // Add to Zustand store
      addJournalEntry({
        content,
        mood: result.mood,
        aiAnalysis: result.analysis,
      });

      setContent("");
    } catch (err) {
      console.error(err);
      setError("Failed to run journal analysis. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="glow-spot top-0 right-0" />

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Reflection Journal
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Write down your daily wins, challenges, and cognitive reflections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column: Form to Write Reflection */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl space-y-4 border border-zinc-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} />
              <span>Today&apos;s Reflection</span>
            </h3>

            <div className="space-y-1">
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you work on today? How did you deal with challenges? How do you feel about your placement preparations?"
                rows={6}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                disabled={isSubmitting}
              />
              <p className="text-[10px] text-zinc-500 text-right">Min 10 characters required for AI analysis.</p>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold">{error}</p>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing Entry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Analyze & Save</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Reflections List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Reflection History</h3>
            {journalEntries.length === 0 ? (
              <div className="text-center py-12 glass-panel rounded-xl">
                <BookOpen size={32} className="mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-400 text-sm">Your reflections will appear here. Write something above!</p>
              </div>
            ) : (
              journalEntries.map((entry) => (
                <div key={entry.id} className="glass-panel p-6 rounded-xl border border-zinc-900 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {entry.mood}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 flex items-center gap-1" suppressHydrationWarning>
                      <Calendar size={12} />
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  {entry.aiAnalysis && (
                    <div className="p-4 bg-zinc-950/60 border border-zinc-900 rounded-lg flex gap-3">
                      <div className="text-indigo-400 mt-0.5 flex-shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-400">AI Cognitive Insight</p>
                        <p className="text-xs text-zinc-300 leading-relaxed">{entry.aiAnalysis}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Insights Stats & Summary */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} />
              <span>Cognitive State Overview</span>
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-400">Total Reflections</p>
                <p className="text-2xl font-bold text-white mt-0.5">{journalEntries.length}</p>
              </div>

              <div>
                <p className="text-xs text-zinc-400">Dominant Mood This Week</p>
                <p className="text-lg font-bold text-indigo-400 mt-0.5">
                  {journalEntries[0]?.mood || "Reflective"}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-900">
                <p className="text-xs font-semibold text-zinc-300">Journaling Guidelines</p>
                <ul className="text-xs text-zinc-400 space-y-2 mt-2 list-disc list-inside leading-relaxed">
                  <li>Try to journal at the same time every day.</li>
                  <li>Mention technical frustrations clearly so the AI can extract graph/DP topics.</li>
                  <li>State your emotional level to track focus depletion.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
