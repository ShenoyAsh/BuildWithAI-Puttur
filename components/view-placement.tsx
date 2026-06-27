"use client";

import React, { useState } from "react";
import { usePhoenixStore, PlacementTopic, Project } from "@/hooks/use-phoenix-store";
import { 
  Sparkles, 
  Terminal, 
  FolderGit, 
  Plus, 
  HelpCircle,
} from "lucide-react";

export function ViewPlacement() {
  const { 
    placementTopics, 
    updatePlacementTopic, 
    projects, 
    addProject, 
    updateProject 
  } = usePhoenixStore();

  const [activeSubTab, setActiveSubTab] = useState<"DSA" | "PROJECTS">("DSA");
  const [mockQuestions, setMockQuestions] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // New Project Form
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectStatus, setProjectStatus] = useState<"IDEATION" | "DEVELOPMENT" | "COMPLETED">("IDEATION");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    addProject({
      name: projectName.trim(),
      description: projectDesc.trim() || undefined,
      status: projectStatus,
    });

    setProjectName("");
    setProjectDesc("");
    setProjectStatus("IDEATION");
    setShowAddProject(false);
  };

  const generateMockQuestions = (topic: PlacementTopic) => {
    setSelectedTopic(topic.topic);
    if (topic.topic.includes("Arrays")) {
      setMockQuestions([
        "Explain sliding window approach. When does it work, and what is the time complexity difference compared to brute force?",
        "Given an array of integers, how do you find all unique triplets that sum up to zero? Design an O(N^2) solution.",
        "How do you implement an LRU Cache? What data structures are involved and what is their time complexity?"
      ]);
    } else if (topic.topic.includes("Trees") || topic.topic.includes("Graphs")) {
      setMockQuestions([
        "Write the iterative and recursive implementations of post-order tree traversal.",
        "Explain Dijkstra's algorithm. How does it handle negative weight cycles? What is its time complexity using min-heaps?",
        "Given a directed graph, how would you determine if a cycle exists using DFS and topological sorting?"
      ]);
    } else if (topic.topic.includes("Dynamic")) {
      setMockQuestions([
        "Explain the difference between memoization (top-down) and tabulation (bottom-up) dynamic programming.",
        "How do you solve the Longest Common Subsequence (LCS) problem? Draw the state transition matrix.",
        "Solve the 0-1 Knapsack problem. What is its space complexity optimization using a 1D array?"
      ]);
    } else if (topic.topic.includes("System")) {
      setMockQuestions([
        "How would you design a rate limiter like Cloudflare? What algorithms can you use (Leaky Bucket, Token Bucket)?",
        "Explain CDN replication strategies. How do we invalidate cached data across nodes globally?",
        "How do you scale a database horizontally? Explain sharding and partitioning strategies."
      ]);
    } else {
      setMockQuestions([
        "Introduce yourself and highlight your principal tech stack.",
        "Walk me through your most complex project architecture. What technical decisions did you make, and how did you resolve roadblocks?",
        "Why are you interested in our engineering team? How do your growth metrics in Phoenix align with our technical culture?"
      ]);
    }
  };

  const handleStatusChange = (id: string, newStatus: PlacementTopic["status"]) => {
    updatePlacementTopic(id, { status: newStatus });
  };

  const handleScoreChange = (id: string, newScore: number) => {
    updatePlacementTopic(id, { score: newScore });
  };

  return (
    <div className="space-y-6 relative">
      <div className="glow-spot top-0 right-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Placement Copilot
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Track DSA readiness, organize portfolio projects, and generate mock interview briefs.
          </p>
        </div>
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 self-start">
          <button
            onClick={() => setActiveSubTab("DSA")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === "DSA" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            DSA Mastery
          </button>
          <button
            onClick={() => setActiveSubTab("PROJECTS")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === "PROJECTS" ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Portfolio Projects
          </button>
        </div>
      </div>

      {activeSubTab === "DSA" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* DSA Topics Tracker */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">DSA Curriculum</h3>
            <div className="space-y-3">
              {placementTopics.map((topic) => (
                <div 
                  key={topic.id}
                  className="glass-panel p-4 rounded-xl border border-zinc-900/60 hover:border-zinc-800/80 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">{topic.topic}</h4>
                      {topic.notes && <p className="text-xs text-zinc-400 mt-1">{topic.notes}</p>}
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={topic.status}
                        onChange={(e) => handleStatusChange(topic.id, e.target.value as PlacementTopic["status"])}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[10px] font-bold text-zinc-300 focus:outline-none"
                      >
                        <option value="NOT_STARTED">Not Started</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="READY">Ready</option>
                      </select>

                      <button
                        onClick={() => generateMockQuestions(topic)}
                        className="p-1 rounded bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 text-[10px] font-bold px-2 py-1 flex items-center gap-1 transition-all"
                      >
                        <Sparkles size={10} />
                        <span>Mock Qs</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 font-bold whitespace-nowrap">Self Score: {topic.score || 0}%</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={topic.score || 0}
                      onChange={(e) => handleScoreChange(topic.id, parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Mock Panel */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">AI Mock Board</h3>
            <div className="glass-panel p-6 rounded-xl border border-indigo-500/20 bg-indigo-950/5 space-y-4">
              {selectedTopic ? (
                <>
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <Terminal size={14} />
                    <span className="text-xs uppercase tracking-wider">Mock Context: {selectedTopic}</span>
                  </div>
                  <div className="space-y-3">
                    {mockQuestions.map((q, idx) => (
                      <div key={idx} className="p-3 bg-zinc-900/60 border border-zinc-900 rounded-lg text-xs leading-relaxed text-zinc-200">
                        <span className="font-bold text-indigo-400 mr-1">Q{idx + 1}:</span>
                        {q}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                    Tip: Copy one of these questions and paste it into the AI Coach tab to do a fully interactive mock technical interview!
                  </p>
                </>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle size={32} className="mx-auto text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-400">Click &quot;Mock Qs&quot; on any topic to generate technical interview challenges.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === "PROJECTS" && (
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Portfolio Project Trackers</h3>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="px-3 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              <span>Track Project</span>
            </button>
          </div>

          {showAddProject && (
            <form onSubmit={handleCreateProject} className="glass-panel p-6 rounded-xl space-y-4 border border-zinc-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Portfolio Project</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., CivicAgent AI Portal"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Status</label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value as Project["status"])}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IDEATION">Ideation</option>
                    <option value="DEVELOPMENT">Development</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Description</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Outline technology, purpose, and system architecture..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-3 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white rounded text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-500 transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="glass-panel p-5 rounded-xl border border-zinc-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderGit size={16} className="text-indigo-400" />
                      <h4 className="text-sm font-semibold text-zinc-100">{project.name}</h4>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      project.status === "COMPLETED" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : project.status === "DEVELOPMENT" 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <div className="flex gap-2">
                    <select
                      value={project.status}
                      onChange={(e) => updateProject(project.id, { status: e.target.value as Project["status"] })}
                      className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[9px] font-bold text-zinc-400"
                    >
                      <option value="IDEATION">Ideation</option>
                      <option value="DEVELOPMENT">Development</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-zinc-500">Phoenix OS Portfolio Project</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
