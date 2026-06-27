"use client";

import React, { useState } from "react";
import { 
  Volume2, 
  Sparkles, 
  Clock, 
  RefreshCw, 
  BookOpenCheck,
  AlertCircle
} from "lucide-react";
import { analyzePitchContent } from "@/actions/analyze-pitch";
import { motion, AnimatePresence } from "framer-motion";

export function ViewCommCoach() {
  const [draft, setDraft] = useState("");
  const [wpm, setWpm] = useState(130); // speaking WPM default
  const [critique, setCritique] = useState<{
    score: number;
    structure: string;
    vocabulary: { simple: string; polished: string[] }[];
    pacing: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Vocabulary Expander replacements lookup
  const vocabReplacements = [
    { simple: "use", polished: ["leveraged", "implemented", "harnessed", "utilized"] },
    { simple: "make", polished: ["orchestrated", "engineered", "constructed", "pioneered"] },
    { simple: "build", polished: ["developed", "architected", "formulated", "established"] },
    { simple: "improve", polished: ["optimized", "enhanced", "refined", "accelerated"] },
    { simple: "run", polished: ["executed", "spearheaded", "administered", "directed"] },
  ];

  // Speaking templates formulas
  const templates = [
    {
      name: "The Problem-Solution Hook",
      text: "Every single day, engineering teams lose hours to manual context switching. I architected Phoenix OS, a glassmorphic AI-driven workspace that unifies habits, tasks, and placement preparation. During testing, it optimized focus efficiency by 24% and helped peers master tree pathfinding concepts."
    },
    {
      name: "The Before-After-Bridge",
      text: "I used to solve LeetCode problems blindly without matching them to real system designs. That's why I designed a placement readiness portal. Now, instead of memorizing code, I can generate contextual mock sessions instantly and benchmark my performance curves."
    },
    {
      name: "The Origin Story Pitch",
      text: "As an aspiring software engineer, I noticed that productivity tools lacked career context. I built Phoenix OS to combine technical habit tracking with real-time AI feedback. It acts as both a task manager and a personalized career coach."
    }
  ];

  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const timeInSeconds = Math.round((words / wpm) * 60);
    return {
      wordCount: words,
      seconds: timeInSeconds
    };
  };

  const { wordCount, seconds } = calculateReadingTime(draft);

  const handleApplyTemplate = (text: string) => {
    setDraft(text);
    setCritique(null);
  };

  const handleAnalyzePitch = async () => {
    if (!draft.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await analyzePitchContent(draft, wpm);
      setCritique(res);
    } catch (err) {
      console.error(err);
      setCritique({
        score: 60,
        structure: "Failed to connect to the Gemini AI Analysis Service.",
        vocabulary: [],
        pacing: "Could not evaluate pace due to a connection issue."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="glow-spot top-0 left-0" />

      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Communication Coach
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Optimize your speaking pace, sharpen elevator pitches, and expand your vocabulary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Pitch Input & Analysis */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-xl space-y-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Volume2 size={16} />
                <span>Pitch Draft Simulator</span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{seconds}s duration</span>
                </span>
                <span>{wordCount} words</span>
              </div>
            </div>

            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setCritique(null);
              }}
              placeholder="Draft your pitch here, or select a narrative template below to load a sample..."
              rows={6}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />

            {/* Speaking Pace WPM Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-zinc-900">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span>Speaking Rate:</span>
                <span className="font-bold text-white">{wpm} WPM</span>
                <span className="text-[10px] text-zinc-500">({wpm < 120 ? "Slow/Clear" : wpm > 150 ? "Excited/Fast" : "Confident/Conversational"})</span>
              </div>
              <input 
                type="range"
                min="90"
                max="180"
                value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value))}
                className="w-full sm:w-48 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleAnalyzePitch}
                disabled={isAnalyzing || !draft.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Critiquing Speech...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Evaluate Pitch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Templates selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Formulaic Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templates.map((tpl, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleApplyTemplate(tpl.text)}
                  className="glass-panel p-4 rounded-xl border border-zinc-900 hover:border-indigo-500/30 cursor-pointer transition-all space-y-2 group"
                >
                  <h4 className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">{tpl.name}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed">{tpl.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Pitch Evaluation Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">AI Speech Critique</h3>
          <AnimatePresence mode="wait">
            {critique ? (
              <motion.div
                key="critique-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="glass-panel p-6 rounded-xl border border-indigo-500/20 bg-indigo-950/5 space-y-5"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Impact Rating</span>
                  <span className="text-2xl font-black text-indigo-400">{critique.score}%</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BookOpenCheck size={14} className="text-emerald-400" />
                    <span>Structure Feedback</span>
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{critique.structure}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-amber-400" />
                    <span>Speaking Pace</span>
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{critique.pacing}</p>
                </div>

                {critique.vocabulary.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-indigo-400" />
                      <span>Vocabulary Replacements Found</span>
                    </p>
                    <div className="space-y-2">
                      {critique.vocabulary.map((item, index) => (
                        <div key={index} className="p-2 bg-zinc-900/60 border border-zinc-900 rounded text-[11px] leading-relaxed">
                          Replace simple verb <code className="text-amber-400 font-bold font-mono">&quot;{item.simple}&quot;</code> with:
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.polished.map((p, idx) => (
                              <span key={idx} className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[10px]">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="critique-empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="glass-panel p-6 rounded-xl border border-zinc-900 text-center py-12"
              >
                <Volume2 size={32} className="mx-auto text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-400">Type or apply a pitch template and click &quot;Evaluate Pitch&quot; to review scores.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
