"use client";

import React, { useState } from "react";
import { usePhoenixStore } from "@/hooks/use-phoenix-store";
import { 
  BrainCircuit, 
  Search, 
  Plus, 
  Trash2, 
  Sparkles, 
  Info,
  ShieldCheck,
  Zap,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ViewMemories() {
  const { aiMemories, addMemory, deleteMemory } = usePhoenixStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    
    // Prefix key with category if needed, or keep it clean
    const finalKey = newKey.trim();
    addMemory(finalKey, newValue.trim());
    
    setNewKey("");
    setNewValue("");
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const filteredMemories = aiMemories.filter(memory => 
    memory.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memory.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      {/* Glow Effects */}
      <div className="glow-spot top-0 right-0 bg-indigo-500/10" />
      <div className="glow-spot bottom-10 left-10 bg-violet-500/10" />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <BrainCircuit size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Semantic AI Memory
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Manage the core identity profile, habits, and career patterns learned by the Phoenix OS Coach.
            </p>
          </div>
        </div>
      </div>

      {/* Info & Concept Panel */}
      <div className="glass-panel p-6 rounded-2xl relative z-10 border-indigo-500/20 bg-gradient-to-r from-indigo-950/10 via-zinc-900/50 to-zinc-950">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Zap size={24} />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-white font-medium text-base flex items-center gap-2">
              How Phoenix OS utilizes your profile
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">Active Context</span>
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Every message you exchange with the Coach, your journal entries, and your DSA targets feed this memory graph. The Coach references these data tokens to formulate personalized, context-aware instructions for your daily action plans.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
            <div className="text-center">
              <span className="block text-xl font-bold text-indigo-400">{aiMemories.length}</span>
              <span>Tokens Saved</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-emerald-400">98%</span>
              <span>Sync Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left: List, Right: Teach AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Memory Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950/40 p-1 rounded-xl">
            <h2 className="text-lg font-semibold text-white px-3">Memory Catalog</h2>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredMemories.map((memory) => (
                <motion.div
                  key={memory.key}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-4 rounded-xl flex items-start justify-between gap-4 border border-zinc-900 hover:border-zinc-800 transition-all hover:bg-zinc-900/20 group"
                >
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-indigo-400">
                      <Bookmark size={10} />
                      {memory.key}
                    </span>
                    <p className="text-zinc-200 text-sm font-medium pt-1">
                      {memory.value}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.key)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Memory"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredMemories.length === 0 && (
              <div className="glass-panel p-12 text-center rounded-xl border-dashed">
                <BrainCircuit size={36} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-zinc-400 text-sm">No semantic memories found matching your criteria.</p>
                <p className="text-zinc-600 text-xs mt-1">Try typing another query or adding a new memory on the right.</p>
              </div>
            )}
          </div>
        </div>

        {/* Teach AI Form */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              Teach AI custom behavior
            </h3>
            <p className="text-xs text-zinc-400">
              Provide specific tokens (e.g. key: &quot;Coding Style&quot;, value: &quot;Strict Functional TypeScript&quot;).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Key Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Memory Key / Concept</label>
                <input
                  type="text"
                  placeholder="e.g. Target Industry, Dev Weakness"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                  required
                />
              </div>

              {/* Value Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Memory Value / Details</label>
                <textarea
                  placeholder="e.g. Fintech startups, Dynamic programming optimizations"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/10"
              >
                <Plus size={14} />
                <span>Inject Memory Token</span>
              </button>
            </form>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2"
                >
                  <ShieldCheck size={14} />
                  <span>Memory Token injected successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-zinc-900 flex items-start gap-3">
            <Info size={16} className="text-zinc-500 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              Memories are stored in your client browser session database context. They are only queried by the AI engine locally during sessions, keeping all confidential parameters completely client-controlled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
